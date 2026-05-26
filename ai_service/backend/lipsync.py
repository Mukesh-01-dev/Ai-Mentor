import os
import subprocess
import uuid

from config import (
    BASE_DIR,
    WAVLIP_DIR,
    WAVLIP_CHECKPOINT,
    CELEBRITY_DIR,
    VIDEO_OUTPUT_DIR,
    TEMP_DIR,
)

# GET CELEBRITY VIDEO
def get_celebrity_video(celebrity_name: str):

    celebrity_name = celebrity_name.lower().strip()

    celebrity_video = os.path.join(
        CELEBRITY_DIR,
        celebrity_name,
        "base.mp4"
    )

    if os.path.exists(celebrity_video):
        print(f"🎬 Using celebrity video: {celebrity_video}")
        return celebrity_video

    # fallback
    fallback_video = os.path.join(
        CELEBRITY_DIR,
        "modi",
        "base.mp4"
    )

    print(f"⚠️ Celebrity not found. Using fallback: {fallback_video}")
    return fallback_video


# CONVERT AUDIO TO WAV
def convert_audio_to_wav(input_audio: str, output_wav: str):

    command = [
        "ffmpeg",
        "-y",
        "-i",
        input_audio,
        output_wav
    ]

    subprocess.run(command, check=True)


# RUN WAV2LIP
def run_wav2lip(
    celebrity_video: str,
    input_audio: str,
    output_video: str
):

    # temp wav file
    temp_wav = os.path.join(
        TEMP_DIR,
        f"{uuid.uuid4().hex}.wav"
    )

    # convert mp3 -> wav
    convert_audio_to_wav(input_audio, temp_wav)

    print("🎵 Audio converted to wav")

    # move into Wav2Lip directory
    current_dir = os.getcwd()

    os.chdir(WAVLIP_DIR)

    try:

        command = [
            "python",
            "inference.py",
            "--checkpoint_path",
            WAVLIP_CHECKPOINT,
            "--face",
            celebrity_video,
            "--audio",
            temp_wav,
            "--outfile",
            output_video,
            "--resize_factor",
            "2"
        ]

        print("\n🚀 Running Wav2Lip...")
        print(" ".join(command))

        result = subprocess.run(
            command,
            capture_output=True,
            text=True
        )

        print(result.stdout)

        if result.returncode != 0:
            print(result.stderr)
            raise Exception("❌ Wav2Lip generation failed")

        print("✅ Wav2Lip video generated")

    finally:

        os.chdir(current_dir)

        # cleanup wav
        if os.path.exists(temp_wav):
            os.remove(temp_wav)


# GENERATE LIPSYNC VIDEO
def generate_lipsync_video(
    celebrity_name: str,
    input_audio: str,
    output_filename: str
):

    celebrity_video = get_celebrity_video(celebrity_name)

    final_output = os.path.join(
        VIDEO_OUTPUT_DIR,
        output_filename
    )

    run_wav2lip(
        celebrity_video=celebrity_video,
        input_audio=input_audio,
        output_video=final_output
    )

    return final_output