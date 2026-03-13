# AI Mentor — AI Service Backend (Python / FastAPI)

The Python microservice behind the AI Mentor platform's "AI Lesson" feature. Given a course, topic, and a celebrity name, it:

1. 📝 **Generates** a short educational script using **Google Gemini**.
2. 🎙️ **Converts** the script to speech using **pyttsx3** (offline TTS).
3. 🎥 **Merges** the audio with a looped celebrity video using **FFmpeg**.
4. ☁️ **Uploads** the final video to **Cloudinary** for CDN delivery.

The service exposes a **FastAPI** HTTP API that the Node.js backend calls as a proxy.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI + Uvicorn |
| AI / LLM | Google Gemini (`gemini-2.5-flash`) via `google-genai` |
| Text-to-Speech | pyttsx3 (offline, no API required) |
| Video Processing | FFmpeg (must be installed separately) |
| Cloud Storage | Cloudinary |
| Config | python-dotenv |

---

## 📁 Project Structure

```
ai_service/
├── backend/
│   ├── api.py             # Main FastAPI application (all routes & logic)
│   ├── config.py          # Loads and validates env variables
│   ├── requirements.txt   # Python dependencies
│   ├── input/             # 📂 Place your source celebrity videos here
│   │   └── modi.mp4       # Default/fallback celebrity video (REQUIRED)
│   └── .env.example       # Environment variable template
└── outputs/               # Auto-created: generated outputs
    ├── video/             # Final merged .mp4 lesson videos
    ├── audio/             # Intermediate TTS .mp3 files
    └── text/              # Generated lesson scripts (.txt)
```

---

## ✅ Prerequisites

### 1. Python 3.10+
```bash
python --version
```
> During Windows installation, ensure **"Add Python to PATH"** is checked.

### 2. FFmpeg
FFmpeg is **required** for merging audio and video.

**Windows (via winget — recommended):**
```powershell
winget install ffmpeg
```

**Manual install:** Download from [ffmpeg.org](https://ffmpeg.org/download.html), extract the archive, and add the `bin/` folder to your System `PATH`.

**Verify installation:**
```bash
ffmpeg -version
```

---

## 📥 Installation

> Run all commands from the `ai_service/` directory.

### 1. Create a virtual environment

```bash
# From the ai_service/ directory
python -m venv venv
```

### 2. Activate the virtual environment

```bash
# Windows (Command Prompt)
.\venv\Scripts\activate

# Windows (PowerShell) — if activation fails, first run:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate
```

### 3. Install Python dependencies

```bash
pip install -r backend/requirements.txt
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file inside `ai_service/backend/`:

```bash
cp backend/.env.example backend/.env
```

Then edit `backend/.env`:

```env
# Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary credentials (for cloud video hosting)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> **Get a Gemini API key:** [Google AI Studio](https://aistudio.google.com/app/apikey) — free tier available.
>
> **Get Cloudinary credentials:** [Cloudinary Console](https://cloudinary.com/console) — free tier available.

### Input Videos (Celebrity Sources)

Place source video files in `ai_service/backend/input/`:

- File names must match the celebrity name (lowercase): e.g., `modi.mp4`, `elon.mp4`
- **`modi.mp4` is required** — it is used as the default fallback if a requested celebrity video is not found.

The video is looped silently and merged with the TTS audio.

---

## 🏃 Running the Service

```bash
# Activate your virtual environment first (see above)

# From the ai_service/ directory:
cd backend
uvicorn api:app --reload --port 8000
```

The service will be available at **http://localhost:8000**.

> ⚠️ The Node.js backend must be configured with `AI_SERVICE_URL=http://127.0.0.1:8000` to communicate with this service.

---

## 📡 API Reference

### `GET /`
Health check.

**Response:**
```json
{ "message": "AI Lesson Generator Backend Running" }
```

---

### `POST /generate`
Generates an AI lesson video **asynchronously** (runs in background).

**Request Body:**
```json
{
  "course": "ReactJS",
  "topic": "Introduction to Components",
  "celebrity": "modi"
}
```

**Response (immediately):**
```json
{
  "status": "Processing",
  "filename": "Introduction_to_Components_20240101_120000.mp4",
  "text_file": "Introduction_to_Components_20240101_120000.txt",
  "audio_file": "Introduction_to_Components_20240101_120000.mp3",
  "jobId": "Introduction_to_Components_20240101_120000"
}
```

Use the `jobId` to poll `/status/:jobId` for completion.

---

### `GET /status/{job_id}`
Polls the status of a generation job.

**Response (while processing):**
```json
{ "status": "processing" }
```

**Response (on completion):**
```json
{
  "status": "ready",
  "cloudinary_url": "https://res.cloudinary.com/..."
}
```

**Response (on failure):**
```json
{ "status": "failed" }
```

---

### `GET /transcript/{filename}`
Returns the text content of a generated lesson script.

**Response:**
```json
{ "content": "Welcome students! Today we will learn about..." }
```

---

### Static File Mounts

| Mount Path | Directory Served | Description |
|---|---|---|
| `/video-stream/{filename}` | `outputs/video/` | Serves generated `.mp4` videos |
| `/transcript-stream/{filename}` | `outputs/text/` | Serves raw transcript `.txt` files |

---

## 🔄 Generation Pipeline

```
POST /generate
     │
     ├─ 1. Gemini API → generates 50-word lesson script
     │
     ├─ 2. pyttsx3 → converts script to .mp3 audio
     │
     ├─ 3. FFmpeg → loops celebrity .mp4 + merges .mp3 audio → final .mp4
     │
     └─ 4. Cloudinary → uploads final .mp4 → stores secure_url in job_status
```

Jobs run in FastAPI **BackgroundTasks**, so `/generate` returns immediately while processing happens in the background.

---

## 🧪 Testing with Swagger

FastAPI auto-generates interactive API documentation:

1. Start the server (see above).
2. Open **[http://localhost:8000/docs](http://localhost:8000/docs)** in your browser.
3. Click **POST /generate → Try it out**, enter a request body, and click **Execute**.

---

## 🛠 Troubleshooting

| Problem | Solution |
|---|---|
| `FFmpeg not found` | Install FFmpeg and ensure its `bin/` folder is in your system PATH. Restart your terminal after adding it. |
| `GEMINI_API_KEY not found` | Ensure `backend/.env` exists with a valid `GEMINI_API_KEY`. |
| `Cloudinary credentials missing` | All three Cloudinary vars (`CLOUD_NAME`, `API_KEY`, `API_SECRET`) must be set in `backend/.env`. |
| PowerShell activation error | Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` then try `.\venv\Scripts\Activate.ps1` again. |
| Video status stays `processing` | Check the terminal for FFmpeg or TTS errors. Ensure the input celebrity video exists in `backend/input/`. |
