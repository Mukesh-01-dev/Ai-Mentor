import sys
import os
import subprocess

# Use the current Python interpreter
PYTHON_EXE = sys.executable

def generate_video(face_path: str, audio_path: str, output_path: str):
    """
    Runs Wav2Lip inference in STATIC IMAGE mode
    (Required when input is a .jpg image)
    """

    wav2lip_dir = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "Wav2Lip")
    )

    inference_script = os.path.join(wav2lip_dir, "inference.py")
    checkpoint_path = os.path.join(wav2lip_dir, "checkpoints", "wav2lip_gan.pth")

    command = [
        PYTHON_EXE,
        inference_script,
        "--checkpoint_path", checkpoint_path,
        "--face", face_path,
        "--audio", audio_path,
        "--outfile", output_path,
        "--static", "True"   # ✅ FIXED (arg value added)
    ]

    print("\n🔥 WAV2LIP COMMAND:")
    print(" ".join(command))

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    print("\n📤 WAV2LIP STDOUT:")
    print(result.stdout)

    print("\n📥 WAV2LIP STDERR:")
    print(result.stderr)

    if result.returncode != 0:
        raise RuntimeError("❌ Wav2Lip failed. See error above.")

    print("✅ Wav2Lip video generated successfully")
