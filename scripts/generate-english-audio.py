#!/usr/bin/env python3
"""
Generate English narrator audio for learn_kannada.json using Kokoro-ONNX.

Usage:
  python scripts/generate-english-audio.py [--dry-run] [--task TASK_ID]

Reads narrator_before/narrator_after fields, generates MP3s via Kokoro,
and writes narrator_before_url/narrator_after_url back into JSON.
Idempotent — skips segments with existing URLs.
"""

import json
import os
import sys
import time
import argparse
import subprocess
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(SCRIPT_DIR)
DATA_FILE = os.path.join(APP_DIR, 'data', 'learn_kannada.json')
AUDIO_DIR = os.path.join(APP_DIR, 'public', 'audio', 'kn')
MODEL_PATH = os.path.join(SCRIPT_DIR, 'kokoro-v1.0.onnx')
VOICES_PATH = os.path.join(SCRIPT_DIR, 'voices-v1.0.bin')
VOICE = 'af_bella'


def extract_english_segments(tasks):
    """Extract all (task_id, field, index, text) tuples needing English audio."""
    segments = []
    for task in tasks:
        tid = task['id']
        ref = task.get('reference', {})
        if not isinstance(ref, dict):
            continue
        rt = ref.get('type', '')

        # Task-level narrator_action
        action = task.get('narrator_action', '')
        if action and 'narrator_action_url' not in task:
            segments.append((tid, 'action', 0, action, ('task',)))

        items_key_map = {
            'narration': 'segments',
            'graduated_recall': 'prompts',
            'circling': 'prompts',
            'dialogue': 'lines',
            'context_guess': 'items',
            'shadowing': 'phrases',
        }
        items_key = items_key_map.get(rt)
        if not items_key:
            continue

        for i, item in enumerate(ref.get(items_key, [])):
            for field in ['narrator_before', 'narrator_after']:
                text = item.get(field, '')
                url_key = f'{field}_url'
                if text and text.strip() and url_key not in item:
                    segments.append((tid, field, i, text, ('reference', items_key, i)))

        # Narration questions
        if rt == 'narration':
            for i, q in enumerate(ref.get('questions', [])):
                for field in ['narrator_before', 'narrator_after']:
                    text = q.get(field, '')
                    url_key = f'{field}_url'
                    if text and text.strip() and url_key not in q:
                        segments.append((tid, field, len(ref.get('segments', [])) + i, text, ('reference', 'questions', i)))

    return segments


def main():
    parser = argparse.ArgumentParser(description='Generate English narrator audio')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--task', type=str)
    args = parser.parse_args()

    with open(DATA_FILE) as f:
        tasks = json.load(f)

    task_map = {t['id']: t for t in tasks}
    segments = extract_english_segments(tasks)

    if args.task:
        segments = [s for s in segments if s[0] == args.task]

    print(f'Found {len(segments)} English segments to generate')

    if args.dry_run:
        for tid, field, idx, text, _ in segments[:30]:
            print(f'  {tid}/{field}/{idx}: "{text[:60]}"')
        if len(segments) > 30:
            print(f'  ... and {len(segments) - 30} more')
        return

    if not segments:
        print('Nothing to generate.')
        return

    # Load Kokoro
    from kokoro_onnx import Kokoro
    import soundfile as sf
    print(f'Loading Kokoro model (voice: {VOICE})...')
    kokoro = Kokoro(MODEL_PATH, VOICES_PATH)

    os.makedirs(AUDIO_DIR, exist_ok=True)
    total_start = time.time()
    generated = 0
    total_audio_sec = 0

    for tid, field, idx, text, json_path in segments:
        task_dir = os.path.join(AUDIO_DIR, tid)
        os.makedirs(task_dir, exist_ok=True)

        # Naming: en_{field}_{idx}.mp3 to avoid collision with Kannada files
        suffix = 'b' if field == 'narrator_before' else ('a' if field == 'narrator_after' else 'act')
        mp3_name = f'en_{idx}_{suffix}.mp3'
        mp3_path = os.path.join(task_dir, mp3_name)
        url = f'/audio/kn/{tid}/{mp3_name}'

        if os.path.exists(mp3_path):
            # Set URL even if file exists
            _set_url(task_map[tid], json_path, field, url)
            generated += 1
            continue

        try:
            start = time.time()
            samples, sr = kokoro.create(text, voice=VOICE, speed=1.0)
            elapsed = time.time() - start
            duration = len(samples) / sr
            total_audio_sec += duration

            # Write WAV then convert to MP3
            wav_path = mp3_path.replace('.mp3', '.wav')
            sf.write(wav_path, samples, sr)
            subprocess.run(
                ['ffmpeg', '-y', '-i', wav_path, '-b:a', '64k', '-ac', '1', mp3_path],
                capture_output=True, check=True
            )
            os.remove(wav_path)

            _set_url(task_map[tid], json_path, field, url)
            generated += 1

            if generated % 50 == 0:
                # Save progress periodically
                with open(DATA_FILE, 'w') as f:
                    json.dump(tasks, f, indent=2, ensure_ascii=False)

            print(f'  [{generated}/{len(segments)}] {tid}/{mp3_name} ({duration:.1f}s audio, {elapsed:.1f}s gen)')

        except Exception as e:
            print(f'  ERROR {tid}/{field}/{idx}: {e}')

    # Final save
    with open(DATA_FILE, 'w') as f:
        json.dump(tasks, f, indent=2, ensure_ascii=False)

    elapsed_total = time.time() - total_start
    print(f'\nDone: {generated} files, {total_audio_sec:.0f}s audio, {elapsed_total:.0f}s elapsed')


def _set_url(task, json_path, field, url):
    """Set the narrator URL in the task."""
    if json_path[0] == 'task':
        task['narrator_action_url'] = url
        return
    obj = task
    for key in json_path:
        obj = obj[key]
    obj[f'{field}_url'] = url


if __name__ == '__main__':
    main()
