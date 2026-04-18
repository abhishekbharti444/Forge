#!/usr/bin/env python3
"""Apply purified English narrations to learn_kannada.json for Phase 2 story tasks."""
import json

with open('scripts/phase2-purified-narrations.json') as f:
    rewrites = json.load(f)

with open('data/learn_kannada.json') as f:
    tasks = json.load(f)

changed = 0
for t in tasks:
    tid = t.get('id', '')
    if tid not in rewrites:
        continue
    segs = t.get('reference', {}).get('segments', [])
    new_narrations = rewrites[tid]
    if len(segs) != len(new_narrations):
        print(f'WARNING: {tid} has {len(segs)} segments but {len(new_narrations)} narrations')
        continue
    for i, seg in enumerate(segs):
        old = seg.get('narrator_before', '')
        seg['narrator_before'] = new_narrations[i]
        if old != new_narrations[i]:
            changed += 1

with open('data/learn_kannada.json', 'w') as f:
    json.dump(tasks, f, indent=2, ensure_ascii=False)

print(f'Updated {changed} narrator_before fields across {len(rewrites)} tasks')
