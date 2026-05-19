# backend/api.py

import os
import datetime
import re
import traceback
import asyncio
import edge_tts
import cloudinary
import cloudinary.uploader
from fastapi import FastAPI, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from elevenlabs.client import ElevenLabs
from config import (
    GEMINI_API_KEY,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    ELEVENLABS_API_KEY,
)

# --------------------------
# Cloudinary Config
# --------------------------
cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
    secure=True,
)

# --------------------------
# FastAPI App
# --------------------------
app = FastAPI(title="AI Lesson Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Gemini & ElevenLabs Clients
# --------------------------
client = genai.Client(api_key=GEMINI_API_KEY)
eleven_client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
# --------------------------
# Request Model
# --------------------------
class LessonRequest(BaseModel):
    course: str
    topic: str
    celebrity: str
    preferences: dict | None = None

# --------------------------
# Helpers & Paths
# --------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

async def generate_tts(text: str, output_file: str, celebrity: str):
    print(f"🎙️ Generating voice for: {celebrity}")
    
    # Check if the requested character is Hrithik or contains 'owl'
    if celebrity.lower() == "hrithik" or "owl" in celebrity.lower():
        env_var = "HRITHIK_VOICE_ID" if celebrity.lower() == "hrithik" else "OWL_VOICE_ID"
        voice_id = os.getenv(env_var)
        
        # Call ElevenLabs text-to-speech API
        audio = eleven_client.text_to_speech.convert(
            voice_id=voice_id,
            model_id="eleven_multilingual_v2",
            text=text
        )
        # Save stream data directly into the mp3 file
        with open(output_file, "wb") as f:
            for chunk in audio:
                if chunk:
                    f.write(chunk)
    else:
        # Fallback to standard Edge TTS for India-focused accents
        communicate = edge_tts.Communicate(
            text=text,
            voice="en-IN-PrabhatNeural" 
        )
        await communicate.save(output_file)

def get_celebrity_video(celebrity_name: str):
    input_video_dir = os.path.join(BASE_DIR, "backend", "input")
    celebrity_video = os.path.join(input_video_dir, f"{celebrity_name.lower()}.mp4")
    
    if os.path.exists(celebrity_video):
        return celebrity_video
    else:
        # Fallback video if the celebrity mp4 doesn't exist yet
        return os.path.join(input_video_dir, "modi.mp4")

# --------------------------
# Serve Files & Routes
# --------------------------
base_output_path = os.path.join(BASE_DIR, "outputs")
video_output_path = os.path.join(base_output_path, "video")
text_output_path = os.path.join(base_output_path, "text")

os.makedirs(video_output_path, exist_ok=True)
os.makedirs(text_output_path, exist_ok=True)

app.mount("/video-stream", StaticFiles(directory=video_output_path), name="video-stream")
app.mount("/transcript-stream", StaticFiles(directory=text_output_path), name="transcript-stream")

job_status = {}

@app.get("/")
def home():
    return {"message": "AI Lesson Generator Backend Running"}

@app.get("/status/{job_id}")
def get_status(job_id: str):
    return job_status.get(job_id, {"status": "not_found"})

@app.post("/generate")
def generate_lesson(data: LessonRequest, background_tasks: BackgroundTasks):
    topic_clean = re.sub(r'[^\w\s-]', '', data.topic).strip().replace(" ", "_")
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    base_filename = f"{topic_clean}_{timestamp}"
    
    job_status[base_filename] = {"status": "processing"}
    background_tasks.add_task(process_lesson, data, base_filename)
    
    return {"jobId": base_filename}

# --------------------------
# Background Task Logic
# --------------------------
def process_lesson(data: LessonRequest, base_filename: str):
    try:
        # 1️⃣ Build Prompt & Generate Script
        pref = data.preferences or {}
        pref_text = f"Goal: {pref.get('learning_goal')}, Level: {pref.get('experience_level')}, Style: {pref.get('learning_style')}"
        
        prompt = f"Explain '{data.topic}' for '{data.course}' in 50 words. Tone: {data.celebrity}. Preferences: {pref_text}."
        
        response = client.models.generate_content(model="gemini-3.1-flash-lite", contents=prompt)
        script = response.text.strip().replace("\n", " ")

        # 2️⃣ Define Paths
        audio_path = os.path.join(base_output_path, "audio", f"{base_filename}.mp3")
        text_path = os.path.join(text_output_path, f"{base_filename}.txt")
        final_video = os.path.join(video_output_path, f"{base_filename}.mp4")
        os.makedirs(os.path.dirname(audio_path), exist_ok=True)

        if data.preferences:
            preferences_text = f"""
        User Preferences:
        - Learning Goal: {data.preferences.get("learning_goal", "Not specified")}
        - Interested Topics: {", ".join(data.preferences.get("interested_topics", [])) if isinstance(data.preferences.get("interested_topics"), list) else data.preferences.get("interested_topics", "Not specified")}
        - Experience Level: {data.preferences.get("experience_level", "Not specified")}
        - Weekly Commitment: {data.preferences.get("weekly_commitment", "Not specified")}
        - Learning Style: {data.preferences.get("learning_style", "Not specified")}
        """
        else:
            preferences_text = "User Preferences: Not provided"

        # 🎯 Final Prompt
        prompt = f"""
        Create a 50 word educational explanation about '{data.topic}' in the subject '{data.course}'.

        Rules:
        - 100% English only
        - No Hindi
        - No Hinglish
        - Simple classroom teaching tone
        - Between 45 and 60 words

        Narration style inspired by the celebrity {data.celebrity}.

        {preferences_text}

        Instructions:
        - Adapt explanation based on user's experience level
        - Adjust depth based on learning goal
        - Match explanation style with preferred learning style
        """
        print("\n📊 USER PREFERENCES:\n")
        print(data.preferences if data.preferences else "No preferences provided")

        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            script = response.text.strip().replace("\n", " ")
            print(f"📝 Generated text: {script}")
        except Exception as e:
            print(f"❌ Gemini Error: {e}")
            return

        # 2️⃣ Create Output Folders

        base_output_dir = os.path.join(BASE_DIR, "outputs")
        text_dir = os.path.join(base_output_dir, "text")
        audio_dir = os.path.join(base_output_dir, "audio")
        video_dir = os.path.join(base_output_dir, "video")

        os.makedirs(text_dir, exist_ok=True)
        os.makedirs(audio_dir, exist_ok=True)
        os.makedirs(video_dir, exist_ok=True)

        text_path = os.path.join(text_dir, f"{base_filename}.txt")
        audio_path = os.path.join(audio_dir, f"{base_filename}.mp3")
        final_video = os.path.join(video_dir, f"{base_filename}.mp4")

        # 3️⃣ Save Text to File
        with open(text_path, "w", encoding="utf-8") as f:
            f.write(script)
        
        asyncio.run(generate_tts(script, audio_path, data.celebrity))

        # 4️⃣ Select Input Video
        input_video = get_celebrity_video(data.celebrity)

        # 5️⃣ Fast FFmpeg Merge for Everything
        print(f"🎬 Merging background video and audio using FFmpeg for: {data.celebrity}")
        ffmpeg_command = (
            f'ffmpeg -y -stream_loop -1 -i "{input_video}" '
            f'-i "{audio_path}" -map 0:v:0 -map 1:a:0 '
            f'-c:v copy -c:a aac -shortest "{final_video}"'
        )
        os.system(ffmpeg_command)

        # 6️⃣ Cloudinary Upload
        cloudinary_url = None
        try:
            print("☁️ Uploading final video to Cloudinary...")
            upload_result = cloudinary.uploader.upload(
                final_video, resource_type="video", folder="ai_mentor/videos", public_id=base_filename
            )
            cloudinary_url = upload_result.get("secure_url")
        except Exception as e:
            print(f"⚠️ Cloudinary failed: {e}")

        job_status[base_filename] = {"status": "ready", "cloudinary_url": cloudinary_url}

    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()
        job_status[base_filename] = {"status": "failed", "error": str(e)}