#!/usr/bin/env python3
"""
Generate audio for a bilingual story JSON file.
  - Kannada sentences via IndicF5 (conda activate indicf5)
  - English sentences via Kokoro

Usage:
  conda activate indicf5
  python scripts/generate-story-audio.py data/stories/thirsty-crow.json
"""
import json, os, sys, time, subprocess
import numpy as np, soundfile as sf

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.dirname(SCRIPT_DIR)
AUDIO_BASE = os.path.join(APP_DIR, 'public', 'audio', 'stories')

# IndicF5 paths
HF_BASE = os.path.expanduser('~/.cache/huggingface/hub/models--ai4bharat--IndicF5/snapshots/ba85abedf18dc479a447eaa0eccbd76ab78a47d5')
REF_AUDIO = os.path.join(HF_BASE, 'prompts', 'PAN_F_HAPPY_00001.wav')
VOCAB_PATH = os.path.join(HF_BASE, 'checkpoints', 'vocab.txt')
WEIGHTS_PATH = os.path.join(HF_BASE, 'model.safetensors')

# Kokoro paths
KOKORO_MODEL = os.path.join(SCRIPT_DIR, 'kokoro-v1.0.onnx')
KOKORO_VOICES = os.path.join(SCRIPT_DIR, 'voices-v1.0.bin')
KOKORO_VOICE = 'af_bella'


def wav_to_mp3(wav_path, mp3_path):
    subprocess.run(['ffmpeg', '-y', '-i', wav_path, '-b:a', '64k', '-ac', '1', mp3_path],
                   capture_output=True, check=True)
    os.remove(wav_path)


def main():
    story_path = sys.argv[1]
    with open(story_path) as f:
        story = json.load(f)

    story_id = story['id']
    out_dir = os.path.join(AUDIO_BASE, story_id)
    os.makedirs(out_dir, exist_ok=True)

    sentences = story['sentences']
    print(f'Story: {story["title"]} ({len(sentences)} sentences)')

    # --- Kannada via IndicF5 ---
    kn_needed = [i for i, s in enumerate(sentences) if not s.get('kn_audio_url')]
    if kn_needed:
        print(f'\nGenerating {len(kn_needed)} Kannada clips via IndicF5...')
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

        for i in kn_needed:
            s = sentences[i]
            mp3_path = os.path.join(out_dir, f'kn_{i}.mp3')
            wav_path = mp3_path.replace('.mp3', '.wav')
            url = f'/audio/kn/{story_id}/kn_{i}.mp3'

            start = time.time()
            audio, sr = infer_process(
                ref_audio_data, ref_text_data, s['kn'], model, vocoder,
                mel_spec_type='vocos', device=device
            )[:2]
            sf.write(wav_path, audio, sr)
            wav_to_mp3(wav_path, mp3_path)
            dur = len(audio) / sr
            print(f'  [{i+1}/{len(sentences)}] kn_{i}.mp3 ({dur:.1f}s audio, {time.time()-start:.1f}s gen)')
            s['kn_audio_url'] = url
    else:
        print('Kannada audio: all exist, skipping.')

    # --- English via Kokoro ---
    en_needed = [i for i, s in enumerate(sentences) if not s.get('en_audio_url')]
    if en_needed:
        print(f'\nGenerating {len(en_needed)} English clips via Kokoro...')
        from kokoro_onnx import Kokoro
        kokoro = Kokoro(KOKORO_MODEL, KOKORO_VOICES)

        for i in en_needed:
            s = sentences[i]
            mp3_path = os.path.join(out_dir, f'en_{i}.mp3')
            wav_path = mp3_path.replace('.mp3', '.wav')
            url = f'/audio/kn/{story_id}/en_{i}.mp3'

            start = time.time()
            samples, sr = kokoro.create(s['en'], voice=KOKORO_VOICE, speed=1.0)
            sf.write(wav_path, samples, sr)
            wav_to_mp3(wav_path, mp3_path)
            dur = len(samples) / sr
            print(f'  [{i+1}/{len(sentences)}] en_{i}.mp3 ({dur:.1f}s audio, {time.time()-start:.1f}s gen)')
            s['en_audio_url'] = url
    else:
        print('English audio: all exist, skipping.')

    # Save back
    with open(story_path, 'w') as f:
        json.dump(story, f, indent=2, ensure_ascii=False)
    print(f'\nDone! Audio in {out_dir}')


if __name__ == '__main__':
    main()
