import os
from dotenv import load_dotenv

load_dotenv()

# Groq API (New - replacing Gemini)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("⚠️ GROQ_API_KEY not found. Will try Gemini as fallback.")
    # Gemini as backup
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        raise ValueError("❌ Neither GROQ_API_KEY nor GEMINI_API_KEY found. Check your .env file.")
else:
    GEMINI_API_KEY = None  # Groq prefer karenge

# DeepSeek (OpenAI-compatible)
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

# Cloudinary
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

if not all([
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET
]):
    raise ValueError(
        "❌ Cloudinary credentials missing. "
        "Check your .env file."
    )

# ElevenLabs
ELEVENLABS_AUDIO_API_KEY = os.getenv("ELEVENLABS_AUDIO_API_KEY")
if not ELEVENLABS_AUDIO_API_KEY:
    raise ValueError(
        "❌ ELEVENLABS_AUDIO_API_KEY missing."
    )

# Voice IDs
ELEVENLABS_VOICE_MODI = os.getenv("ELEVENLABS_VOICE_MODI")
ELEVENLABS_VOICE_SALMAN = os.getenv("ELEVENLABS_VOICE_SALMAN")
ELEVENLABS_VOICE_SRK = os.getenv("ELEVENLABS_VOICE_SRK")
