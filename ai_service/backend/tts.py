import asyncio
import edge_tts
import re

# Male Indian voice
VOICE = "en-IN-PrabhatNeural"


def clean_text(text: str) -> str:
    """
    Removes markdown and special symbols that TTS reads aloud.
    """
    # Remove **, *, _, `
    text = re.sub(r"[*_`]", "", text)

    # Remove extra spaces created after cleaning
    text = re.sub(r"\s+", " ", text)

    return text.strip()


async def _generate(text: str, output_file: str):
    cleaned_text = clean_text(text)

    communicate = edge_tts.Communicate(
        text=cleaned_text,
        voice=VOICE
    )

    await communicate.save(output_file)


def text_to_speech(text: str, output_file: str):
    asyncio.run(_generate(text, output_file))
    print(f"Male voice audio saved to {output_file}")
