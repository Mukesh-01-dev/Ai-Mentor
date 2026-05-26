import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# BASE DIRECTORY
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Get Gemini API key from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found. Check your .env file.")

# Cloudinary credentials
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

if not all([CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET]):
    raise ValueError("❌ Cloudinary credentials missing. Check your .env file (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).")

# PATHS
# Wav2Lip
WAVLIP_DIR = os.path.join(BASE_DIR, "backend", "Wav2Lip")
WAVLIP_CHECKPOINT = os.path.join(
    WAVLIP_DIR,
    "checkpoints",
    "wav2lip_gan.pth"
)

# Assets
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
CELEBRITY_DIR = os.path.join(ASSETS_DIR, "celebrities")

# Input / Temp / Output
INPUT_DIR = os.path.join(BASE_DIR, "backend", "input")
TEMP_DIR = os.path.join(BASE_DIR, "backend", "temp")

OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
VIDEO_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "video")
AUDIO_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "audio")
TEXT_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "text")

# DEFAULTS

DEFAULT_CELEBRITY_VIDEO = os.path.join(
    INPUT_DIR,
    "modi.mp4"
)

# CREATE DIRECTORIES

os.makedirs(INPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(VIDEO_OUTPUT_DIR, exist_ok=True)
os.makedirs(AUDIO_OUTPUT_DIR, exist_ok=True)
os.makedirs(TEXT_OUTPUT_DIR, exist_ok=True)