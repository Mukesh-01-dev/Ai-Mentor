import os
import datetime
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from google.genai import Client
import pyttsx3
import re

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

class VideoRequest(BaseModel):
    course: str
    topic: str
    celebrity: str

# ----------------------------
# Celebrity Video Selector
# ----------------------------
def get_celebrity_video(name: str):
    name = name.lower()

    if name == "salman":
        return "input/salman.mp4"
    elif name == "modi":
        return "input/modi.mp4"
    else:
        return "input/salman.mp4"

def clean_filename(name: str):
    name = name.lower()
    name = re.sub(r'[<>:"/\\|?*]', '', name)  # remove invalid chars
    name = re.sub(r'\s+', '_', name)          # spaces → underscore
    return name


@app.post("/generate")
def generate_video(data: VideoRequest):

    # ----------------------------
    # 1️⃣ Generate SHORT AI Text (~30 sec)
    # ----------------------------
    prompt = f"""
Create a 50 word educational explanation about '{data.topic}' in the subject '{data.course}'.

Rules:
- 100% English only
- No Hindi
- No Hinglish
- Simple classroom teaching tone
- Between 45 and 60 words

Narration style inspired by {data.celebrity}.
"""

    response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt
)


    text = response.text.strip().replace("\n", " ")

    # ----------------------------
    # 2️⃣ Create Output Folder
    # ----------------------------
    os.makedirs("output", exist_ok=True)

    topic_clean = clean_filename(data.topic)
    course_clean = clean_filename(data.course)
    celebrity_clean = clean_filename(data.celebrity)


    filename = f"{topic_clean}_{celebrity_clean}_{course_clean}"

    text_path = f"output/{filename}.txt"
    audio_path = f"output/{filename}.mp3"
    final_video = f"output/{filename}.mp4"
    vtt_path = f"output/{filename}.vtt"

    # ----------------------------
    # 3️⃣ Save Text to File
    # ----------------------------
    with open(text_path, "w", encoding="utf-8") as f:
        f.write(text)

    # Create vtt subtitles
    text_to_vtt(text, vtt_path) 
    
    # ----------------------------
    # 4️⃣ Generate Normal Audio
    # ----------------------------
    engine.stop()

    if os.path.exists(audio_path):
        os.remove(audio_path)

    engine.save_to_file(text, audio_path)
    engine.runAndWait()
    engine.stop()    

    # ----------------------------
    # 4️⃣ Loop Video Until Audio Ends
    # ----------------------------
    input_video = get_celebrity_video(data.celebrity)

    if not os.path.exists(input_video):
        return {"error": f"{input_video} not found"}

    ffmpeg_command = (
        f'ffmpeg -y -stream_loop -1 -i "{input_video}" '
        f'-i "{audio_path}" '
        f'-map 0:v:0 -map 1:a:0 '
        f'-c:v copy -c:a aac -shortest "{final_video}"'
    )

    os.system(ffmpeg_command)

    # ----------------------------
    # 5️⃣ Return Response
    # ----------------------------
    return {
        "message": "Video generated successfully",
        "generated_text": text,
        "text_file": text_path,
        "audio_file": audio_path,
        "video_file": final_video
    }
