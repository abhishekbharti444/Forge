#!/usr/bin/env python3
"""
Generate Kannada audio for learn_kannada.json using AI4Bharat IndicF5.

Usage:
  conda activate indicf5
  python scripts/generate-audio.py [--dry-run] [--task TASK_ID] [--mps]

Reads learn_kannada.json, extracts all audio_text fields, generates MP3s,
and writes audio_url back into the JSON. Idempotent — skips existing audio.
"""

import json
import os
import sys
import time
import argparse
import subprocess
import numpy as np
import soundfile as sf

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(SCRIPT_DIR)
DATA_FILE = os.path.join(APP_DIR, 'data', 'learn_kannada.json')
AUDIO_DIR = os.path.join(APP_DIR, 'public', 'audio', 'kn')
HF_BASE = os.path.expanduser('~/.cache/huggingface/hub/models--ai4bharat--IndicF5/snapshots/ba85abedf18dc479a447eaa0eccbd76ab78a47d5')
REF_AUDIO = os.path.join(HF_BASE, 'prompts', 'PAN_F_HAPPY_00001.wav')
VOCAB_PATH = os.path.join(HF_BASE, 'checkpoints', 'vocab.txt')
WEIGHTS_PATH = os.path.join(HF_BASE, 'model.safetensors')


def extract_audio_segments(tasks):
    """Extract all (task_id, index, audio_text, json_path) tuples from tasks."""
    segments = []
    for task in tasks:
        tid = task['id']
        ref = task.get('reference', {})
        if not isinstance(ref, dict):
            continue
        rt = ref.get('type', '')

        if rt == 'narration':
            for i, seg in enumerate(ref.get('segments', [])):
                txt = seg.get('audio_text', '')
                if txt and 'audio_url' not in seg:
                    segments.append((tid, i, txt, ('reference', 'segments', i)))
        elif rt == 'graduated_recall':
            for i, p in enumerate(ref.get('prompts', [])):
                txt = p.get('answer_audio', '')
                if txt and 'audio_url' not in p:
                    segments.append((tid, i, txt, ('reference', 'prompts', i)))
        elif rt == 'circling':
            for i, p in enumerate(ref.get('prompts', [])):
                txt = p.get('audio_text', '')
                if txt and 'audio_url' not in p:
                    segments.append((tid, i, txt, ('reference', 'prompts', i)))
        elif rt == 'shadowing':
            idx = 0
            for i, p in enumerate(ref.get('phrases', [])):
                for speed in ['audio_slow', 'audio_normal', 'audio_fast']:
                    txt = p.get(speed, '')
                    if txt and f'{speed}_url' not in p:
                        segments.append((tid, idx, txt, ('reference', 'phrases', i, speed)))
                        idx += 1
        elif rt == 'context_guess':
            for i, item in enumerate(ref.get('items', [])):
                txt = item.get('audio_text', '')
                if txt and 'audio_url' not in item:
                    segments.append((tid, i, txt, ('reference', 'items', i)))
        elif rt == 'dialogue':
            for i, line in enumerate(ref.get('lines', [])):
                txt = line.get('audio_text', '')
                if txt and 'audio_url' not in line:
                    segments.append((tid, i, txt, ('reference', 'lines', i)))
        elif rt == 'sound_exercise':
            idx = 0
            for key in ['pairs', 'examples']:
                for i, item in enumerate(ref.get(key, [])):
                    if isinstance(item, dict):
                        for subkey, subval in item.items():
                            if isinstance(subval, dict) and 'audio_text' in subval and 'audio_url' not in subval:
                                segments.append((tid, idx, subval['audio_text'], ('reference', key, i, subkey)))
                                idx += 1
    return segments


def load_model(device):
    """Load IndicF5 model and vocoder."""
    from f5_tts.infer.utils_infer import load_model as f5_load, load_vocoder, preprocess_ref_audio_text
    from f5_tts.model import DiT
    from safetensors.torch import load_file

    print('Loading vocoder...')
    vocoder = load_vocoder(vocoder_name='vocos', is_local=False, device=device)

    print('Loading model...')
    model = f5_load(
        DiT,
        dict(dim=1024, depth=22, heads=16, ff_mult=2, text_dim=512, conv_layers=4),
        mel_spec_type='vocos',
        vocab_file=VOCAB_PATH,
        device=device
    )

    print('Loading weights...')
    sd = load_file(WEIGHTS_PATH, device=device)
    prefix = 'ema_model._orig_mod.'
    cleaned = {k[len(prefix):]: v for k, v in sd.items() if k.startswith(prefix)}
    model.load_state_dict(cleaned, strict=True)
    model.eval()

    print('Preprocessing reference audio...')
    ref_audio, ref_text = preprocess_ref_audio_text(REF_AUDIO, '')

    return model, vocoder, ref_audio, ref_text


def generate_wav(text, model, vocoder, ref_audio, ref_text, device):
    """Generate WAV audio for a Kannada text segment."""
    from f5_tts.infer.utils_infer import infer_process
    audio, sr, _ = infer_process(
        ref_audio, ref_text, text, model, vocoder,
        mel_spec_type='vocos', device=device
    )
    return audio, sr


def wav_to_mp3(wav_path, mp3_path):
    """Convert WAV to MP3 at 64kbps using ffmpeg."""
    subprocess.run(
        ['ffmpeg', '-y', '-i', wav_path, '-b:a', '64k', '-ac', '1', mp3_path],
        capture_output=True, check=True
    )
    os.remove(wav_path)


def set_audio_url(task, json_path, url):
    """Set audio_url in the task at the given JSON path."""
    obj = task
    for key in json_path[:-1]:
        obj = obj[key]
    last = json_path[-1]

    if isinstance(last, str) and last.startswith('audio_'):
        # For shadowing: audio_slow → audio_slow_url
        obj[f'{last}_url'] = url
    else:
        obj[last]['audio_url'] = url


def main():
    parser = argparse.ArgumentParser(description='Generate Kannada audio')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be generated')
    parser.add_argument('--task', type=str, help='Generate for a specific task ID only')
    parser.add_argument('--mps', action='store_true', help='Use MPS (Metal GPU) for inference')
    args = parser.parse_args()

    device = 'mps' if args.mps else 'cpu'

    with open(DATA_FILE) as f:
        tasks = json.load(f)

    task_map = {t['id']: t for t in tasks}
    segments = extract_audio_segments(tasks)

    if args.task:
        segments = [(tid, idx, txt, path) for tid, idx, txt, path in segments if tid == args.task]

    print(f'Found {len(segments)} audio segments to generate')

    if args.dry_run:
        for tid, idx, txt, _ in segments[:20]:
            print(f'  {tid}/{idx}: {txt[:60]}')
        if len(segments) > 20:
            print(f'  ... and {len(segments) - 20} more')
        return

    if not segments:
        print('Nothing to generate — all audio_url fields already set.')
        return

    model, vocoder, ref_audio, ref_text = load_model(device)

    os.makedirs(AUDIO_DIR, exist_ok=True)
    total_start = time.time()
    generated = 0
    total_audio_sec = 0

    for tid, idx, txt, json_path in segments:
        task_dir = os.path.join(AUDIO_DIR, tid)
        os.makedirs(task_dir, exist_ok=True)

        mp3_path = os.path.join(task_dir, f'{idx}.mp3')
        url = f'/audio/kn/{tid}/{idx}.mp3'

        if os.path.exists(mp3_path):
            set_audio_url(task_map[tid], json_path, url)
            continue

        print(f'  [{generated+1}/{len(segments)}] {tid}/{idx}: {txt[:50]}...', end=' ', flush=True)
        start = time.time()

        wav_path = os.path.join(task_dir, f'{idx}.wav')
        audio, sr = generate_wav(txt, model, vocoder, ref_audio, ref_text, device)
        sf.write(wav_path, audio, sr)
        wav_to_mp3(wav_path, mp3_path)

        duration = len(audio) / sr
        elapsed = time.time() - start
        total_audio_sec += duration
        generated += 1
        print(f'{duration:.1f}s audio in {elapsed:.0f}s')

        set_audio_url(task_map[tid], json_path, url)

        if generated % 50 == 0:
            with open(DATA_FILE, 'w') as f:
                json.dump(tasks, f, indent=2, ensure_ascii=False)
            print(f'  [checkpoint] Saved JSON at {generated} segments')

    # Save updated JSON with audio_url fields
    with open(DATA_FILE, 'w') as f:
        json.dump(tasks, f, indent=2, ensure_ascii=False)

    total_elapsed = time.time() - total_start
    total_size = sum(
        os.path.getsize(os.path.join(dp, f))
        for dp, _, fns in os.walk(AUDIO_DIR)
        for f in fns if f.endswith('.mp3')
    )

    print(f'\n=== DONE ===')
    print(f'Generated: {generated} files')
    print(f'Total audio: {total_audio_sec:.0f}s ({total_audio_sec/60:.1f} min)')
    print(f'Total size: {total_size/1024/1024:.1f} MB')
    print(f'Time taken: {total_elapsed:.0f}s ({total_elapsed/60:.1f} min)')
    print(f'Updated: {DATA_FILE}')


if __name__ == '__main__':
    main()
