# AI Lesson Generator Service

This service generates AI-powered short video lessons using:
- **Google Gemini** for script generation.
- **XTTS (Coqui TTS)** for celebrity voice cloning.
- **FFmpeg** for video processing and looping.
- **FastAPI** for the backend API.
- **Cloudinary** for hosting generated lesson videos.

The service converts a topic or prompt into a short AI teaching video narrated in a celebrity-style voice.

---

## 🚀 Prerequisites

Ensure you have the following installed:

### 1. Python 3.10+
- **Check Installation**: Open your terminal and run:
  ```bash
  python --version
  ```
- **Note**: During installation, make sure to check **"Add Python to PATH"**.

### 2. FFmpeg
FFmpeg is essential for video and audio processing.

- **Windows (winget)**:
  ```bash
  winget install ffmpeg
  ```

- **Manual**: Download from [ffmpeg.org](https://ffmpeg.org/download.html), extract, and add the `bin` folder to your System PATH.

- **Verify Installation**:
  ```bash
  ffmpeg -version
  ```

### 3. Visual Studio Build Tools (Windows Only)

Required for some Python dependencies.

Install:

```
Desktop development with C++
```

---

## 📥 Installation

### 1. Create and Activate Virtual Environment

Navigate to the `ai_service` directory:

```bash
cd ai_service
python -m venv venv
```

**Activate the environment**

Windows:

```bash
.\venv\Scripts\activate
```

Linux / Mac:

```bash
source venv/bin/activate
```

---

### 2. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

---

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env` file inside the `ai_service/backend` directory:

```env
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> [!TIP]  
> Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

---

### 2. Input Videos

Place your source videos in:

```
ai_service/backend/input/
```

The service looks for videos matching the celebrity name.

Example:

```
input/
├── modi.mp4
└── salman.mp4
```

**Mandatory**: Ensure `modi.mp4` exists as a fallback video.

---

### 3. Voice Samples

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

These samples are used by **XTTS for voice cloning**.

---

## 🏃 Running the Service

Start the FastAPI server:

```bash
cd backend
uvicorn api:app --reload --port 8000
```

---

## 🧪 Testing the API (using Swagger)

FastAPI comes with built-in documentation (Swagger) that makes testing very easy.

1. **Open Swagger**

```
http://localhost:8000/docs
```

2. **Try it out**

- Click **POST `/generate`**
- Click **Try it out**
- Enter parameters:

```json
{
  "course": "ReactJS",
  "topic": "Introduction to ReactJS",
  "celebrity": "modi"
}
```

Or using a custom prompt:

```json
{
  "prompt": "Explain artificial intelligence in simple terms",
  "celebrity": "salman"
}
```

Click **Execute**.

---

## 📂 Project Structure

```
ai_service/
├── backend/
│   ├── api.py                # Main FastAPI application
│   ├── voice_service.py      # XTTS voice generation
│   ├── config.py             # Environment configuration
│   ├── requirements.txt      # Python dependencies
│   ├── input/                # Source videos
│   ├── voices/               # Celebrity voice samples
│   └── outputs/              # Generated files
│       ├── video/
│       ├── audio/
│       └── text/
```

---

## 🛠 Troubleshooting

### FFmpeg Error

Ensure FFmpeg is added to your system PATH.

Check:

```bash
ffmpeg -version
```

---

### Gemini API Error

Check your API key inside `.env` and ensure internet access.

---

### XTTS Voice Error

Ensure voice files exist:

```
voices/modi.wav
voices/salman.wav
```

---


### Activation Error

If `.\venv\Scripts\activate` fails on PowerShell:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try activating the environment again.

---

## 📜 License

MIT