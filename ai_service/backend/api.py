import os
import datetime
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from google.genai import Client
import pyttsx3

# ----------------------------
# Load Environment Variables
# ----------------------------
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")

client = Client(api_key=GEMINI_API_KEY)

# ----------------------------
# FastAPI App
# ----------------------------
app = FastAPI()

class VideoRequest(BaseModel):
    course: str
    topic: str
    celebrity: str


@app.post("/generate")
def generate_video(data: VideoRequest):

    # ----------------------------
    # 1️⃣ Generate SHORT AI Text (~30 sec)
    # ----------------------------
    prompt = f"""
    Generate a clear and engaging explanation 
    of around 50 words about the topic '{data.topic}' 
    in the subject '{data.course}'.

    Keep it between 45 to 60 words only.
    Explain in simple language.
    Make it natural for spoken narration.
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    text = response.text.strip()

    # ----------------------------
    # 2️⃣ Create Output Folder
    # ----------------------------
    os.makedirs("output", exist_ok=True)

    topic_clean = data.topic.replace(" ", "_")
    course_clean = data.course.replace(" ", "_")
    celebrity_clean = data.celebrity.replace(" ", "_")

    filename = f"{topic_clean}_{celebrity_clean}_{course_clean}"

    text_path = f"output/{filename}.txt"
    audio_path = f"output/{filename}.mp3"
    final_video = f"output/{filename}.mp4"

    # ----------------------------
    # 3️⃣ Save Text to File
    # ----------------------------
    with open(text_path, "w", encoding="utf-8") as f:
        f.write(text)

    # ----------------------------
    # 4️⃣ Convert Text to Speech
    # ----------------------------
    engine = pyttsx3.init()
    engine.setProperty("rate", 165)  # Faster speech for ~30 sec
    engine.save_to_file(text, audio_path)
    engine.runAndWait()

    # ----------------------------
    # 5️⃣ Loop Video Until Audio Ends
    # ----------------------------
    input_video = "input/modi.mp4"

    if not os.path.exists(input_video):
        return {"error": "input/modi.mp4 file not found"}

    ffmpeg_command = (
        f'ffmpeg -y -stream_loop -1 -i "{input_video}" '
        f'-i "{audio_path}" '
        f'-map 0:v:0 -map 1:a:0 '
        f'-c:v copy -c:a aac -shortest "{final_video}"'
    )

    os.system(ffmpeg_command)

    # ----------------------------
    # 6️⃣ Return Response
    # ----------------------------
    return {
        "message": "Video generated successfully",
        "generated_text": text,
        "text_file": text_path,
        "audio_file": audio_path,
        "video_file": final_video
    }
