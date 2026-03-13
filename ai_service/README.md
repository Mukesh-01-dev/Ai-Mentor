# AI Mentor — AI Service Backend (Python / FastAPI)

This service generates AI-powered short video lessons using:

- **Google Gemini** for script generation
- **XTTS (Coqui TTS)** for celebrity voice cloning
- **FFmpeg** for video processing and merging
- **FastAPI** for the backend API
- **Cloudinary** for hosting generated lesson videos

The Python microservice powers the **AI Lesson feature** of the AI Mentor platform.

Given a **course, topic, or prompt** and a **celebrity voice**, the service:

1. 📝 Generates a short educational script using **Google Gemini**
2. 🎙️ Clones the selected celebrity voice using **XTTS**
3. 🎥 Merges generated audio with a celebrity video using **FFmpeg**
4. ☁️ Uploads the final lesson video to **Cloudinary**

The Node.js backend calls this FastAPI service to generate AI teaching videos.

---

# 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI + Uvicorn |
| AI Model | Google Gemini (`gemini-2.5-flash`) |
| Voice Cloning | XTTS (Coqui TTS) |
| Video Processing | FFmpeg |
| Cloud Storage | Cloudinary |
| Config | python-dotenv |

---

# 📁 Project Structure

```
ai_service/
├── backend/
│   ├── api.py
│   ├── voice_service.py
│   ├── config.py
│   ├── requirements.txt
│   ├── input/
│   │   ├── modi.mp4
│   │   └── salman.mp4
│   ├── voices/
│   │   ├── modi.wav
│   │   └── salman.wav
│   └── .env.example
│
└── outputs/
    ├── video/
    ├── audio/
    └── text/
```

Generated lesson files are automatically saved in the **outputs folder**.

---

# ✅ Prerequisites

### 1. Python 3.10+

Check installation:

```bash
python --version
```

When installing Python on Windows, ensure **"Add Python to PATH"** is enabled.

---

### 2. FFmpeg

FFmpeg is required for merging audio and video.

Install using winget:

```powershell
winget install ffmpeg
```

Or download manually:

https://ffmpeg.org/download.html

Verify installation:

```bash
ffmpeg -version
```

---

### 3. Visual Studio Build Tools (Windows Only)

Required for compiling some Python dependencies.

Download:

https://visualstudio.microsoft.com/downloads/

Install workload:

```
Desktop development with C++
```

---

# 📥 Installation

Navigate to the AI service folder:

```bash
cd ai_service
```

---

### 1️⃣ Create Virtual Environment

```bash
python -m venv venv
```

---

### 2️⃣ Activate Environment

Windows:

```bash
.\venv\Scripts\activate
```

Mac / Linux:

```bash
source venv/bin/activate
```

---

### 3️⃣ Install Dependencies

```bash
pip install -r backend/requirements.txt
```

---

# ⚙️ Configuration

Create a `.env` file inside:

```
ai_service/backend/
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get a Gemini API key from:

https://aistudio.google.com/app/apikey

Get Cloudinary credentials from:

https://cloudinary.com/console

---

# 🎥 Input Videos

Place celebrity source videos in:

```
ai_service/backend/input/
```

Example:

```
input/
├── modi.mp4
└── salman.mp4
```

Important:

```
modi.mp4 must exist as fallback video
```

---

# 🎙 Voice Samples

Place celebrity voice samples in:

```
ai_service/backend/voices/
```

Example:

```
voices/
├── modi.wav
└── salman.wav
```

These audio samples are used by **XTTS for voice cloning**.

---

# 🚀 Running the Service

Activate the virtual environment first.

Then run:

```bash
cd backend
uvicorn api:app --reload --port 8000
```

The API will start at:

```
http://localhost:8000
```

Swagger documentation:

```
http://localhost:8000/docs
```

---

# 📡 API Reference

## GET /

Health check

Response:

```json
{
  "message": "AI Lesson Generator Backend Running"
}
```

---

## POST /generate

Generate a lesson video.

Example request:

```json
{
  "course": "ReactJS",
  "topic": "Introduction to Components",
  "celebrity": "modi"
}
```

Response:

```json
{
  "status": "Processing",
  "filename": "lesson_video.mp4",
  "jobId": "lesson_20240101"
}
```

---

## GET /status/{job_id}

Check job progress.

Processing:

```json
{ "status": "processing" }
```

Completed:

```json
{
  "status": "ready",
  "cloudinary_url": "https://res.cloudinary.com/..."
}
```

Failed:

```json
{
  "status": "failed"
}
```

---

## GET /transcript/{filename}

Returns generated lesson text.

Example response:

```json
{
  "content": "Today we will learn about..."
}
```

---

# 🔄 Generation Pipeline

```
User Request
     │
     ▼
FastAPI API
     │
     ▼
Gemini → generates lesson script
     │
     ▼
XTTS → clones celebrity voice
     │
     ▼
FFmpeg → merges voice + video
     │
     ▼
Cloudinary → uploads final video
     │
     ▼
Video URL returned to client
```

---

# 🧪 Testing

Open Swagger UI:

```
http://localhost:8000/docs
```

Test the **POST /generate** endpoint.

Example request:

```json
{
  "course": "Physics",
  "topic": "Newton Laws",
  "celebrity": "modi"
}
```

---

# 🛠 Troubleshooting

| Problem | Solution |
|---|---|
| FFmpeg not found | Ensure FFmpeg is installed and added to system PATH |
| GEMINI_API_KEY missing | Check `.env` file |
| Cloudinary upload fails | Verify API credentials |
| Voice generation fails | Ensure `voices/modi.wav` exists |
| Server does not start | Activate virtual environment first |

---

# 📜 License

MIT