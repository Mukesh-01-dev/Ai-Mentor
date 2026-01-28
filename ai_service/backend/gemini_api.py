import requests
from config import GEMINI_API_KEY

GEMINI_MODEL = "gemini-2.5-flash"

def generate_text(prompt: str) -> str:
    """
    Call Gemini API to generate text.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        print("Gemini API error:", response.status_code, response.text)
        return ""

    data = response.json()
    try:
        # Extract generated text
        text_output = data["candidates"][0]["content"]["parts"][0]["text"]
        return text_output.strip()
    except (KeyError, IndexError):
        print("Unexpected Gemini response:", data)
        return ""
