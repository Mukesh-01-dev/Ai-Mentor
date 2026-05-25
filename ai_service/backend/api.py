import os
import datetime
import re
import time
import traceback
import asyncio
import cloudinary
import cloudinary.uploader
from fastapi import FastAPI, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from google import genai
from openai import OpenAI  # DeepSeek uses OpenAI-compatible API
from elevenlabs.client import ElevenLabs
from elevenlabs import VoiceSettings
from config import (
    GROQ_API_KEY,
    GEMINI_API_KEY,
    DEEPSEEK_API_KEY,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    ELEVENLABS_AUDIO_API_KEY,
    ELEVENLABS_VOICE_MODI,
    ELEVENLABS_VOICE_SALMAN,
    ELEVENLABS_VOICE_SRK,
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
# Job status store
# --------------------------
job_status = {}


# --------------------------
# LLM Clients Setup
# --------------------------

# Groq
groq_client = None
if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("✅ Groq client initialized")
    except Exception as e:
        print(f"⚠️  Groq init failed: {e}")

# Gemini
gemini_client = None
if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
        print("✅ Gemini client initialized")
    except Exception as e:
        print(f"⚠️  Gemini init failed: {e}")

# DeepSeek (OpenAI-compatible)
deepseek_client = None
if DEEPSEEK_API_KEY:
    try:
        deepseek_client = OpenAI(
            api_key=DEEPSEEK_API_KEY,
            base_url="https://api.deepseek.com/v1",
        )
        print("✅ DeepSeek client initialized")
    except Exception as e:
        print(f"⚠️  DeepSeek init failed: {e}")

# ElevenLabs
elevenlabs_client = ElevenLabs(api_key=ELEVENLABS_AUDIO_API_KEY)

# Summary
print("\n🧠 LLM Provider Status:")
print(f"   Groq     : {'✅ Ready' if groq_client else '❌ Not available'}")
print(f"   DeepSeek : {'✅ Ready' if deepseek_client else '❌ Not available'}")
print(f"   Gemini   : {'✅ Ready' if gemini_client else '❌ Not available'}")
print(f"   Priority : Groq → DeepSeek Flash → DeepSeek Pro → Gemini\n")


# --------------------------
# Request Model
# --------------------------
class LessonRequest(BaseModel):
    course: str
    topic: str
    celebrity: str
    preferences: dict | None = None


# --------------------------
# Helpers
# --------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SYSTEM_PROMPT = (
    "You are an educational content creator. "
    "Create concise, clear, and engaging educational explanations."
)


# ── Individual provider functions ──────────────────────────────────────────────

async def _try_groq(prompt: str) -> str:
    print("🔄 Trying Groq (llama-3.1-8b-instant)...")
    start = time.time()
    completion = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        model="llama-3.1-8b-instant",
        temperature=0.7,
        max_tokens=200,
        top_p=1,
    )
    text = completion.choices[0].message.content.strip()
    elapsed = round(time.time() - start, 2)
    print(f"✅ [Groq | llama-3.1-8b-instant] Generated in {elapsed}s → {text[:80]}...")
    return text


async def _try_deepseek_flash(prompt: str) -> str:
    print("🔄 Trying DeepSeek (deepseek-v4-flash)...")
    start = time.time()
    completion = deepseek_client.chat.completions.create(
        model="deepseek-v4-flash",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=200,
    )
    text = completion.choices[0].message.content.strip()
    elapsed = round(time.time() - start, 2)
    print(f"✅ [DeepSeek | deepseek-v4-flash] Generated in {elapsed}s → {text[:80]}...")
    return text


async def _try_deepseek_pro(prompt: str) -> str:
    print("🔄 Trying DeepSeek (deepseek-v4-pro)...")
    start = time.time()
    completion = deepseek_client.chat.completions.create(
        model="deepseek-v4-pro",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=200,
    )
    text = completion.choices[0].message.content.strip()
    elapsed = round(time.time() - start, 2)
    print(f"✅ [DeepSeek | deepseek-v4-pro] Generated in {elapsed}s → {text[:80]}...")
    return text


async def _try_gemini(prompt: str) -> str:
    print("🔄 Trying Gemini (gemini-2.0-flash-exp)...")
    start = time.time()
    response = gemini_client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents=prompt,
    )
    text = response.text.strip().replace("\n", " ")
    elapsed = round(time.time() - start, 2)
    print(f"✅ [Gemini | gemini-2.0-flash-exp] Generated in {elapsed}s → {text[:80]}...")
    return text


# ── Smart Fallback Chain ───────────────────────────────────────────────────────
# Priority: Groq → DeepSeek Flash → DeepSeek Pro → Gemini
# First provider that responds without error wins.
# Every attempt (success or failure) is printed to terminal with model name + time.

async def generate_text(prompt: str) -> str:
    providers = []

    if groq_client:
        providers.append(("Groq / llama-3.1-8b-instant", _try_groq))
    if deepseek_client:
        providers.append(("DeepSeek / deepseek-v4-flash", _try_deepseek_flash))
        providers.append(("DeepSeek / deepseek-v4-pro", _try_deepseek_pro))
    if gemini_client:
        providers.append(("Gemini / gemini-2.0-flash-exp", _try_gemini))

    if not providers:
        raise Exception("❌ No LLM providers configured. Check API keys in config.py.")

    last_error = None
    for name, fn in providers:
        try:
            result = await fn(prompt)
            print(f"\n🏆 Model used successfully: {name}\n")
            return result
        except Exception as err:
            last_error = err
            print(f"⚠️  [{name}] failed: {err}")
            print(f"   ↳ Trying next provider...\n")

    raise Exception(f"All LLM providers failed. Last error: {last_error}")


def get_celebrity_voice(celebrity: str) -> str:
    voices = {
        "modi": ELEVENLABS_VOICE_MODI,
        "salman": ELEVENLABS_VOICE_SALMAN,
        "srk": ELEVENLABS_VOICE_SRK,
    }
    return voices.get(celebrity.lower(), ELEVENLABS_VOICE_MODI)


def get_celebrity_video(celebrity_name: str) -> str:
    input_video_dir = os.path.join(BASE_DIR, "backend", "input")
    celebrity_video = os.path.join(input_video_dir, f"{celebrity_name.lower()}.mp4")
    if os.path.exists(celebrity_video):
        print(f"🎬 Using celebrity video: {celebrity_video}")
        return celebrity_video
    default = os.path.join(input_video_dir, "modi.mp4")
    print(f"🎬 Celebrity video not found, using default: {default}")
    return default



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
# Root & Utility Routes
# --------------------------
@app.get("/")
def home():
    available = []
    if groq_client:
        available.append("Groq (llama-3.1-8b-instant)")
    if deepseek_client:
        available.append("DeepSeek (deepseek-v4-flash, deepseek-v4-pro)")
    if gemini_client:
        available.append("Gemini (gemini-2.0-flash-exp)")

    return {
        "message": "AI Lesson Generator Backend Running",
        "llm_providers_available": available,
        "llm_priority": "Groq → DeepSeek Flash → DeepSeek Pro → Gemini",
    }



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
    status_data = job_status.get(job_id, {"status": "not_found"})
    if isinstance(status_data, str):
        return {"status": status_data}
    return status_data


# --------------------------
# Generate Lesson Endpoint
# --------------------------
@app.post("/generate")
async def generate_lesson(data: LessonRequest, background_tasks: BackgroundTasks):
    topic_clean = re.sub(r"[^\w\s-]", "", data.topic).strip().replace(" ", "_")
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    base_filename = f"{topic_clean}_{timestamp}"

    job_status[base_filename] = {"status": "processing"}
    background_tasks.add_task(process_lesson, data, base_filename)

    return {
        "status": "Processing",
        "filename": f"{base_filename}.mp4",
        "text_file": f"{base_filename}.txt",
        "audio_file": f"{base_filename}.mp3",
        "jobId": base_filename,
    }


# --------------------------
# Background Task Logic
# --------------------------
async def process_lesson(data: LessonRequest, base_filename: str):
    print("\n" + "=" * 60)
    print(f"📥 NEW JOB : {base_filename}")
    print(f"   Course   : {data.course}")
    print(f"   Topic    : {data.topic}")
    print(f"   Celebrity: {data.celebrity}")
    print("=" * 60)

    try:
        # ── 1. Build Preferences Context ──────────────────────────────────────
        if data.preferences:
            interested_topics = data.preferences.get("interested_topics", [])
            if isinstance(interested_topics, list):
                interested_topics = ", ".join(interested_topics)

            preferences_text = f"""
        User Preferences:
        - Learning Goal: {data.preferences.get("learning_goal", "Not specified")}
        - Interested Topics: {interested_topics or "Not specified"}
        - Experience Level: {data.preferences.get("experience_level", "Not specified")}
        - Weekly Commitment: {data.preferences.get("weekly_commitment", "Not specified")}
        - Learning Style: {data.preferences.get("learning_style", "Not specified")}
        """
        else:
            preferences_text = "User Preferences: Not provided"

        # ── 2. Generate Text ───────────────────────────────────────────────────
        job_status[base_filename] = {"status": "generating_text"}

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

        try:
            script = await generate_text(prompt)
            print(f"📝 Final script:\n{script}\n")
        except Exception as e:
            print(f"❌ All LLM providers failed: {e}")
            job_status[base_filename] = {"status": "failed", "error": str(e)}
            return

        # ── 3. Create Output Folders ───────────────────────────────────────────
        base_output_dir = os.path.join(BASE_DIR, "outputs")
        text_dir  = os.path.join(base_output_dir, "text")
        audio_dir = os.path.join(base_output_dir, "audio")
        video_dir = os.path.join(base_output_dir, "video")

        os.makedirs(text_dir,  exist_ok=True)
        os.makedirs(audio_dir, exist_ok=True)
        os.makedirs(video_dir, exist_ok=True)

        text_path   = os.path.join(text_dir,  f"{base_filename}.txt")
        audio_path  = os.path.join(audio_dir, f"{base_filename}.mp3")
        final_video = os.path.join(video_dir, f"{base_filename}.mp4")

        # ── 4. Save Text ───────────────────────────────────────────────────────
        with open(text_path, "w", encoding="utf-8") as f:
            f.write(script)
        print(f"💾 Saved text: {text_path}")

        # ── 5. Generate Audio ──────────────────────────────────────────────────
        job_status[base_filename] = {"status": "generating_audio"}
        print("🎵 Generating audio with ElevenLabs...")
        voice_id = get_celebrity_voice(data.celebrity)

        try:
            audio_generator = elevenlabs_client.text_to_speech.convert(
                voice_id=voice_id,
                output_format="mp3_44100_128",
                text=script,
                model_id="eleven_multilingual_v2",
                voice_settings=VoiceSettings(
                    stability=0.5,
                    similarity_boost=0.75,
                    style=0.0,
                    use_speaker_boost=True,
                ),
            )
            with open(audio_path, "wb") as f:
                for chunk in audio_generator:
                    if chunk:
                        f.write(chunk)
            print(f"✅ Audio saved: {audio_path}")
        except Exception as tts_err:
            print(f"❌ ElevenLabs TTS error: {tts_err}")
            job_status[base_filename] = {"status": "failed", "error": str(tts_err)}
            return

        # ── 6. Select Input Video ──────────────────────────────────────────────
        job_status[base_filename] = {"status": "generating_video"}
        input_video = get_celebrity_video(data.celebrity)
        if not os.path.exists(input_video):
            job_status[base_filename] = {"status": "failed", "error": "Video file not found"}
            return

        # ── 7. Merge Video + Audio (FFmpeg) ────────────────────────────────────
        ffmpeg_command = (
            f'ffmpeg -y -stream_loop -1 -i "{input_video}" '
            f'-i "{audio_path}" '
            f'-map 0:v:0 -map 1:a:0 '
            f'-c:v copy -c:a aac -shortest "{final_video}"'
        )
        print(f"🎥 FFmpeg: {ffmpeg_command}")
        os.system(ffmpeg_command)

        if not os.path.exists(final_video):
            job_status[base_filename] = {"status": "failed", "error": "FFmpeg video generation failed"}
            return

        # ── 8. Upload to Cloudinary ────────────────────────────────────────────
        job_status[base_filename] = {"status": "uploading"}
        cloudinary_url = None
        try:
            print("☁️  Uploading to Cloudinary...")
            upload_result = cloudinary.uploader.upload(
                final_video,
                resource_type="video",
                folder="ai_mentor/videos",
                public_id=base_filename,
                overwrite=True,
                chunk_size=6000000,
            )
            cloudinary_url = upload_result.get("secure_url")
            print(f"✅ Cloudinary URL: {cloudinary_url}")
        except Exception as cloud_err:
            print(f"⚠️  Cloudinary upload failed (local fallback): {cloud_err}")

        # ── 9. Done — transcript + video URL bundled together ─────────────────
        job_status[base_filename] = {
            "status": "ready",
            "cloudinary_url": cloudinary_url,
            "transcript": script,
            "llm_used": (
                "Groq" if groq_client else
                "DeepSeek" if deepseek_client else
                "Gemini"
            ),
        }

        print("\n" + "=" * 60)
        print(f"✅ LESSON READY: {base_filename}")
        print(f"   Video     : {final_video}")
        if cloudinary_url:
            print(f"   Cloud URL : {cloudinary_url}")
        print("=" * 60 + "\n")

    except Exception as e:
        job_status[base_filename] = {"status": "failed", "error": str(e)}
        print(f"❌ Unexpected error: {e}")
        traceback.print_exc()