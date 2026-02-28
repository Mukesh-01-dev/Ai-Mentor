# AI Lesson Generator Service

This service generates AI-powered short video lessons using:
- **Google Gemini** for script generation.
- **pyttsx3** for offline Text-to-Speech (TTS).
- **FFmpeg** for video processing and looping.
- **FastAPI** for the backend API.

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
- **Windows (winget)**: Run this in PowerShell:
  ```bash
  winget install ffmpeg
  ```
- **Manual**: Download from [ffmpeg.org](https://ffmpeg.org/download.html), extract, and add the `bin` folder to your System PATH.
- **Verify**: Run `ffmpeg -version` in your terminal.

---

## 📥 Installation

### 1. Create and Activate Virtual Environment
Navigate to the `ai_service` directory:
```bash
cd ai_service
python -m venv venv
```

*   **Activate**:
    ```bash
    .\venv\Scripts\activate
    ```

### 2. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

---

## ⚙️ Configuration

### 1. Environment Variables
Create a `.env` file inside the `ai_service/backend` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> [!TIP]
> Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Input Videos
Place your source videos in `ai_service/backend/input/`.
The service looks for videos matching the celebrity name (e.g., `modi.mp4`, `elon.mp4`).
*   **Mandatory**: Ensure `modi.mp4` exists as a fallback.

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

1.  **Open Swagger**: Go to [http://localhost:8000/docs](http://localhost:8000/docs) (or [http://localhost:8000/generate](http://localhost:8000/docs) if you are testing the endpoint documentation).
2.  **Try it out**:
    - Click on the **POST `/generate`** block.
    - Click the **"Try it out"** button.
    - Enter the parameters:
      ```json
      {
        "course": "ReactJS",
        "topic": "Introduction to ReactJS",
        "celebrity": "modi"
      }
      ```
    - Click **Execute**.

---

## 📂 Project Structure

*   `backend/`:
    *   `api.py`: Main FastAPI application.
    *   `config.py`: Environment configuration.
    *   `input/`: Source video files for looping.
    *   `requirements.txt`: Project dependencies.
*   `outputs/`: Generated files (auto-created).
    *   `video/`: Final `.mp4` lessons.
    *   `audio/`: Generated voiceover.
    *   `text/`: Generated scripts.

---

## 🛠 Troubleshooting

*   **FFmpeg Error**: Ensure FFmpeg is added to your system PATH and restart your terminal.
*   **Gemini Error**: Check your API key in `.env` and ensure internet access.
*   **Activation Error**: If `.\venv\Scripts\activate` fails on PowerShell, try `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` and try again.
