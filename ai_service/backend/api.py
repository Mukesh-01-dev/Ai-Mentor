# backend/api.py

import os
import datetime
import re
import pyttsx3
from fastapi import FastAPI, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from config import GEMINI_API_KEY

# ----------------------------
# Load Environment Variables
# ----------------------------
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")

client = Client(api_key=GEMINI_API_KEY)

#---------------------------
# text to vtt converter
#----------------------------
def text_to_vtt(text, vtt_path):
    sentences = text.split(". ")

    vtt_content = "WEBVTT\n\n"
    start = 0

    for line in sentences:
        if not line.strip():
            continue

        end = start + 5  

        start_time = f"00:00:{start:02d}.000"
        end_time = f"00:00:{end:02d}.000"

        vtt_content += (
            f"{start_time} --> {end_time}\n"
            f"{line.strip()}.\n\n"
        )

        start = end

    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write(vtt_content)

# ----------------------------
# Initialize TTS Engine
# ----------------------------

engine = pyttsx3.init()
engine.setProperty("rate", 160)

voices = engine.getProperty("voices")
engine.setProperty("voice", voices[0].id)

# ----------------------------
# FastAPI App
# ----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Gemini Client
# --------------------------
client = genai.Client(api_key=GEMINI_API_KEY)

# --------------------------
# Request Model
# --------------------------
class LessonRequest(BaseModel):
    course: str
    topic: str
    celebrity: str

# --------------------------
# Helpers
# --------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def get_tts_engine():
    engine = pyttsx3.init()
    engine.setProperty("rate", 150)
    voices = engine.getProperty("voices")
    if voices:
        engine.setProperty("voice", voices[0].id)
    return engine

def get_celebrity_video(celebrity_name: str):
    input_video_dir = os.path.join(BASE_DIR, "backend", "input")
    celebrity_video = os.path.join(input_video_dir, f"{celebrity_name.lower()}.mp4")
    
    if os.path.exists(celebrity_video):
        print(f"🎬 Using celebrity video: {celebrity_video}")
        return celebrity_video
    else:
        # Fallback to default video (modi.mp4)
        input_video = os.path.join(input_video_dir, "modi.mp4")
        print(f"🎬 Using default video: {input_video}")
        return input_video

# --------------------------
# Serve Files
# --------------------------

base_output_path = os.path.join(BASE_DIR, "outputs")
video_output_path = os.path.join(base_output_path, "video")
text_output_path = os.path.join(base_output_path, "text")

os.makedirs(video_output_path, exist_ok=True)
os.makedirs(text_output_path, exist_ok=True)

app.mount("/video-stream", StaticFiles(directory=video_output_path), name="video-stream")
app.mount("/transcript-stream", StaticFiles(directory=text_output_path), name="transcript-stream")

# --------------------------
# Root Route
# --------------------------
@app.get("/")
def home():
    return {"message": "AI Lesson Generator Backend Running"}

@app.get("/transcript/{filename}")
def get_transcript(filename: str):
    file_path = os.path.join(BASE_DIR, "outputs", "text", filename)
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"content": content}
    return {"error": "Transcript not found"}

@app.get("/status/{job_id}")
def get_status(job_id: str):
    status = job_status.get(job_id, "not_found")
    return {"status": status}

# --------------------------
# Generate Lesson Endpoint
# --------------------------

job_status = {}

@app.post("/generate")
def generate_lesson(data: LessonRequest, background_tasks: BackgroundTasks):
    # Generate filename here so we can return it immediately
    topic_clean = re.sub(r'[^\w\s-]', '', data.topic).strip().replace(" ", "_")
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    base_filename = f"{topic_clean}_{timestamp}"
    
    job_status[base_filename] = "processing"

    # Run as a background task to avoid timeout issues
    background_tasks.add_task(process_lesson, data, base_filename)
    
    return {
        "status": "Processing",
        "filename": f"{base_filename}.mp4",
        "text_file": f"{base_filename}.txt",
        "audio_file": f"{base_filename}.mp3",
        "jobId": base_filename
    }

# --------------------------
# Background Task Logic
# --------------------------
def process_lesson(data: LessonRequest, base_filename: str):
    try:
        print(f"\n🚀 Starting generation for: {data.topic} ({data.celebrity})")

        # 1️⃣ Generate Text with detailed prompt
        prompt = f"""
        Create a 50 word educational explanation about '{data.topic}' in the subject '{data.course}'.

        Rules:
        - 100% English only
        - No Hindi
        - No Hinglish
        - Simple classroom teaching tone
        - Between 45 and 60 words

        Narration style inspired by the celebrity {data.celebrity}.
        """
        
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
        print(f"💾 Saved text to: {text_path}")

        # 4️⃣ Convert Text to Speech (pyttsx3)
        print("🎵 Starting TTS generation...")
        try:
            engine = get_tts_engine()
            if os.path.exists(audio_path):
                os.remove(audio_path)

            engine.save_to_file(script, audio_path)
            engine.runAndWait()
            engine.stop()
            print(f"✅ Audio saved: {audio_path}")
        except Exception as e:
            print(f"❌ TTS Error: {e}")
            return

        # 5️⃣ Select Video
        input_video = get_celebrity_video(data.celebrity)
        if not os.path.exists(input_video):
            print(f"❌ Error: Video file not found at {input_video}")
            return

        # 6️⃣ Merge Video + Audio (FFmpeg)
        ffmpeg_command = (
            f'ffmpeg -y -stream_loop -1 -i "{input_video}" '
            f'-i "{audio_path}" '
            f'-map 0:v:0 -map 1:a:0 '
            f'-c:v copy -c:a aac -shortest "{final_video}"'
        )

        print(f"🎥 Running ffmpeg command...")
        os.system(ffmpeg_command)

        job_status[base_filename] = "ready"  # 👈 only set AFTER ffmpeg finishes
        print(f"✅ Lesson ready!")
        print(f"   Video: {final_video}")

    except Exception as e:
        job_status[base_filename] = "failed"  # 👈 mark failed on error
        print(f"❌ Error generating lesson: {e}")
        traceback.print_exc()
