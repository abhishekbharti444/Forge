#!/usr/bin/env python3
"""
Regenerate Kannada vocabulary audio for all 5 stories using IndicF5.

The original vocab audio was truncated (0.16-0.70s) because IndicF5 needs
more context than a single word. This script uses a carrier phrase approach:
generate "ಈ ಪದ, <word>" and trim to extract just the word portion.

Usage:
  conda activate indicf5
  python scripts/regen-vocab-audio.py
"""
import json, os, sys, time, subprocess
import numpy as np, soundfile as sf

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(SCRIPT_DIR)
AUDIO_BASE = os.path.join(APP_DIR, 'public', 'audio', 'stories')
STORIES_DIR = os.path.join(APP_DIR, 'data', 'stories')

# IndicF5 paths
HF_BASE = os.path.expanduser('~/.cache/huggingface/hub/models--ai4bharat--IndicF5/snapshots/ba85abedf18dc479a447eaa0eccbd76ab78a47d5')
REF_AUDIO = os.path.join(HF_BASE, 'prompts', 'PAN_F_HAPPY_00001.wav')
VOCAB_PATH = os.path.join(HF_BASE, 'checkpoints', 'vocab.txt')
WEIGHTS_PATH = os.path.join(HF_BASE, 'model.safetensors')

STORY_FILES = [
    ('thirsty-crow.json', 'kn-story-001'),
    ('fox-and-grapes.json', 'kn-story-002'),
    ('monkey-and-crocodile.json', 'kn-story-003'),
    ('ant-and-grasshopper.json', 'kn-story-004'),
    ('lion-and-mouse.json', 'kn-story-005'),
]

# Use a sentence-like carrier to get natural-length audio
# "This word: <word>. <word>." — repeat the word so at least one instance is clear
def make_prompt(word):
    return f'{word}. {word}.'


def wav_to_mp3(wav_path, mp3_path):
    subprocess.run([
        'ffmpeg', '-y', '-i', wav_path,
        '-af', 'loudnorm=I=-23:TP=-1.5:LRA=11',
        '-ar', '48000', '-ac', '1', '-b:a', '64k',
        mp3_path
    ], capture_output=True, check=True)
    os.remove(wav_path)


def trim_carrier(audio, sr, carrier_text, full_text):
    """Estimate where the carrier phrase ends and trim to just the word.
    
    Heuristic: carrier is ~40% of the total text length, so trim first ~35% of audio
    to be safe (leaving a small lead-in for natural onset).
    """
    carrier_ratio = len(carrier_text) / len(full_text)
    # Trim slightly less than the carrier ratio to keep natural word onset
    trim_point = int(sr * (len(audio) / sr) * (carrier_ratio * 0.85))
    return audio[trim_point:]


def main():
    print("Loading IndicF5 model...")
    from f5_tts.infer.utils_infer import load_model as f5_load, load_vocoder, preprocess_ref_audio_text, infer_process
    from f5_tts.model import DiT
    from safetensors.torch import load_file

    device = 'cpu'
    vocoder = load_vocoder(vocoder_name='vocos', is_local=False, device=device)
    model = f5_load(
        DiT,
        dict(dim=1024, depth=22, heads=16, ff_mult=2, text_dim=512, conv_layers=4),
        mel_spec_type='vocos', vocab_file=VOCAB_PATH, device=device
    )
    sd = load_file(WEIGHTS_PATH, device=device)
    prefix = 'ema_model._orig_mod.'
    cleaned = {k[len(prefix):]: v for k, v in sd.items() if k.startswith(prefix)}
    model.load_state_dict(cleaned, strict=True)
    model.eval()
    ref_audio_data, ref_text_data = preprocess_ref_audio_text(REF_AUDIO, '')

    total = 0
    for filename, story_id in STORY_FILES:
        story_path = os.path.join(STORIES_DIR, filename)
        with open(story_path) as f:
            story = json.load(f)

        out_dir = os.path.join(AUDIO_BASE, story_id)
        os.makedirs(out_dir, exist_ok=True)

        vocab = story.get('vocabulary', [])
        print(f'\n=== {story["title"]} ({story_id}) — {len(vocab)} vocab words ===')

        for i, v in enumerate(vocab):
            word = v['kn']
            full_text = make_prompt(word)
            mp3_path = os.path.join(out_dir, f'vocab_kn_{i}.mp3')
            wav_path = mp3_path.replace('.mp3', '.wav')

            start = time.time()
            audio, sr = infer_process(
                ref_audio_data, ref_text_data, full_text, model, vocoder,
                mel_spec_type='vocos', device=device
            )[:2]

            sf.write(wav_path, audio, sr)
            wav_to_mp3(wav_path, mp3_path)

            dur = len(audio) / sr
            print(f'  vocab_kn_{i}: {word} ({v["en"]}) — {dur:.2f}s [{time.time()-start:.1f}s gen]')
            total += 1

    print(f'\nDone! Regenerated {total} vocabulary audio files.')


if __name__ == '__main__':
    main()
