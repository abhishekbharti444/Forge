#!/usr/bin/env python3
"""Generate Kokoro audio for comprehension questions across all 5 stories."""
import json, os, subprocess, tempfile
import numpy as np
from kokoro_onnx import Kokoro

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
STORIES_DIR = os.path.join(SCRIPT_DIR, '..', 'data', 'stories')
AUDIO_DIR = os.path.join(SCRIPT_DIR, '..', 'public', 'audio', 'stories')
MODEL = os.path.join(SCRIPT_DIR, 'kokoro-v1.0.onnx')
VOICES = os.path.join(SCRIPT_DIR, 'voices-v1.0.bin')

STORY_FILES = [
    ('thirsty-crow.json', 'kn-story-001'),
    ('fox-and-grapes.json', 'kn-story-002'),
    ('monkey-and-crocodile.json', 'kn-story-003'),
    ('ant-and-grasshopper.json', 'kn-story-004'),
    ('lion-and-mouse.json', 'kn-story-005'),
]

def save_mp3(samples, sr, out_path):
    """Save numpy audio to normalized MP3 via ffmpeg."""
    tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
    try:
        import soundfile as sf
        sf.write(tmp.name, samples, sr)
        tmp.close()
        subprocess.run([
            'ffmpeg', '-y', '-i', tmp.name,
            '-af', 'loudnorm=I=-23:TP=-1.5:LRA=11',
            '-ar', '48000', '-ac', '1', '-b:a', '64k',
            out_path
        ], capture_output=True, check=True)
    finally:
        os.unlink(tmp.name)

def main():
    print("Loading Kokoro model...")
    kokoro = Kokoro(MODEL, VOICES)
    voices = kokoro.get_voices()
    # Pick a clear narrator voice
    voice = 'af_heart' if 'af_heart' in voices else voices[0]
    print(f"Using voice: {voice}")

    total = 0
    for filename, story_id in STORY_FILES:
        path = os.path.join(STORIES_DIR, filename)
        with open(path) as f:
            story = json.load(f)

        out_dir = os.path.join(AUDIO_DIR, story_id)
        os.makedirs(out_dir, exist_ok=True)

        for i, comp in enumerate(story.get('comprehension', [])):
            question = comp['question']
            out_path = os.path.join(out_dir, f'comp_{i}.mp3')
            print(f"  [{story_id}] comp_{i}: {question[:50]}...")
            samples, sr = kokoro.create(question, voice=voice, speed=0.9, lang='en-us')
            save_mp3(samples, sr, out_path)
            total += 1

    print(f"\nDone! Generated {total} comprehension audio files.")

if __name__ == '__main__':
    main()
