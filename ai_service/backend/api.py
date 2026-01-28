# backend/api.py

from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from gemini_api import generate_text
from tts import text_to_speech
from wave2lip import generate_video
import os

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
# Request Model
# --------------------------
class LessonRequest(BaseModel):
    course: str
    topic: str
    celebrity: str

# --------------------------
# Root Route
# --------------------------
@app.get("/")
def home():
    return {"message": "AI Lesson Generator Backend Running"}

# --------------------------
# Generate Lesson Endpoint
# --------------------------
@app.post("/generate")
def generate_lesson(data: LessonRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_lesson, data)
    return {"status": "Processing started"}

# --------------------------
# Background Task
# --------------------------
def process_lesson(data: LessonRequest):
    try:
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        # 1️⃣ Generate text
        prompt = f"Explain {data.topic} in 50 words."
        script = generate_text(prompt)

        # Ensure output folders
        audio_dir = os.path.join(BASE_DIR, "outputs", "audio")
        video_dir = os.path.join(BASE_DIR, "outputs", "video")
        os.makedirs(audio_dir, exist_ok=True)
        os.makedirs(video_dir, exist_ok=True)

        # Save script
        safe_topic = data.topic.replace(' ', '_')
        script_path = os.path.join(audio_dir, f"{safe_topic}.txt")
        with open(script_path, "w", encoding="utf-8") as f:
            f.write(script)

        # 2️⃣ Text-to-Speech
        audio_path = os.path.join(audio_dir, f"{safe_topic}.wav")
        text_to_speech(script, audio_path)

        # 3️⃣ Celebrity image
        celeb_image = os.path.join(
            BASE_DIR,
            "assets",
            "celebrities",
            f"{data.celebrity.lower()}.jpg"
        )

        print("Looking for celebrity image at:", celeb_image)
        print("Image exists?", os.path.exists(celeb_image))

        # 4️⃣ Generate video using Wav2Lip

        video_filename = f"{safe_topic}_{data.celebrity}_{data.course.replace(' ', '_')}.mp4"
        video_path = os.path.join(video_dir, video_filename)
        generate_video(celeb_image, audio_path, video_path)


        print(f"✅ Lesson ready: {video_path}")


    except Exception as e:
        print(f"❌ Error generating lesson: {e}")
