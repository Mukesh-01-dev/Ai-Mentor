# AI Service Setup Guide

This service handles the generation of AI-powered lesson videos using Gemini for script generation, Edge-TTS for audio, and Wav2Lip for lip-syncing.

## 🚀 Prerequisites


Before you begin, make sure that you have copied and pasted the `checkpoints` folder from the `.zip` file provided.

Here is the link to the `.zip` file: https://drive.google.com/file/d/1bK-NgU7y5IahY7cecUacBaAF-IhMd76j/view?usp=drive_link.

Before you begin, ensure you have the following installed on your system:

1.  **Python 3.10+**: Recommended for compatibility with all dependencies.
2.  **FFmpeg**: Essential for Wav2Lip to process audio and video.
    *   **Windows (winget)**: Run `winget install ffmpeg` in CMD/PowerShell.
    *   **Windows (Chocolatey)**: If you have [Chocolatey](https://chocolatey.org/) installed, run `choco install ffmpeg`.
    *   **Manual**: Download from [ffmpeg.org](https://ffmpeg.org/download.html), extract, and add the `bin` folder to your System PATH.
    *   **Verify**: Run `ffmpeg -version` in your terminal.

## 📥 Installation

Follow these steps to set up the environment:

### 1. Create a Virtual Environment
Navigate to the `ai_service` directory and create a virtual environment:

```bash
cd ai_service
python -m venv venv
```

**Optional (Force any Python 3.10+ version if multiple versions are installed):**
```bash
py -3.10 -m venv venv
```

**Verify Version:**
After creating the environment, check for the python version currently in use:
```bash
python --version
```

### 2. Activate the Virtual Environment
*   **Windows**:
    ```bash
    .\venv\Scripts\activate
    ```
*   **Linux/Mac**:
    ```bash
    source venv/bin/activate
    ```

### 3. Install Backend Dependencies


Navigate to the `backend` folder and install the required Python packages:

```bash
cd backend
pip install fastapi uvicorn requests python-dotenv edge-tts pydantic
```

### 4. Install Wav2Lip Dependencies
Navigate to the `Wav2Lip` directory and install its requirements:

```bash
cd ../Wav2Lip
pip install -r requirements.txt
```

> **Note**: If you have an NVIDIA GPU and want faster generation, you may want to install the CUDA-enabled version of `torch` and `torchvision`.

## ⚙️ Configuration

### 1. Environment Variables
Create a `.env` file inside the `ai_service/backend` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Wav2Lip Checkpoints
Ensure the pre-trained model is present in the checkpoints folder:
*   File path: `ai_service/Wav2Lip/checkpoints/wav2lip_gan.pth`
*   If missing, download it from the official [Wav2Lip repository](https://github.com/Rudrabha/Wav2Lip#model-checkpoints).

### 3. Assets
Place celebrity images in `ai_service/assets/celebrities/`. 
The files should be named in lowercase (e.g., `salman.jpg`, `modi.jpg`, `srk.jpg`).

## 🏃 Running the Service

Start the FastAPI server:

```bash
cd ai_service/backend
uvicorn api.py:app --reload --port 8000
```

The service will be available at `http://localhost:8000`.

## 📂 Project Structure

*   `backend/`: FastAPI application and logic.
*   `Wav2Lip/`: Wav2Lip model and inference scripts.
*   `assets/celebrities/`: Input images for the AI avatars.
*   `outputs/`: Stores generated audio and video files.
    *   `outputs/audio/`: Generated `.wav` scripts.
    *   `outputs/video/`: Final synchronized `.mp4` lessons.

## 🛠 Troubleshooting

*   **FFmpeg Error**: Ensure FFmpeg is in your system PATH.
*   **ModuleNotFoundError**: Double-check that your virtual environment is active and all requirements are installed.
*   **GPU Memory**: If you run out of memory, Wav2Lip might fail. Ensure you have enough VRAM or use the CPU version of torch.
