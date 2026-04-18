#!/usr/bin/env python3
"""Purify remaining 63 English narrator fields that contain Kannada words."""
import json, re, os

with open('data/learn_kannada.json') as f:
    tasks = json.load(f)

task_map = {t['id']: t for t in tasks}

# Manual rewrites: (task_id, collection_key, index, field) -> new_text
rewrites = {
    # === questions.narrator_before: "What does X mean?" → "What does this word mean?" ===
    ('kn-211', 'questions', 0, 'narrator_before'): "What does this word mean?",
    ('kn-211', 'questions', 2, 'narrator_before'): "What does this word mean?",
    ('kn-211', 'questions', 3, 'narrator_before'): "What does this word mean?",
    ('kn-212', 'questions', 2, 'narrator_before'): "What does this phrase mean?",
    ('kn-212', 'questions', 3, 'narrator_before'): "What does this word mean?",
    ('kn-212', 'questions', 4, 'narrator_before'): "What number is this?",
    ('kn-213', 'questions', 1, 'narrator_before'): "What does this word mean?",
    ('kn-214', 'questions', 4, 'narrator_before'): "What does this phrase mean?",
    ('kn-215', 'questions', 1, 'narrator_before'): "What does this phrase mean?",
    ('kn-215', 'questions', 2, 'narrator_before'): "What do these two words mean?",
    ('kn-241', 'questions', 1, 'narrator_before'): "What does this word mean?",
    ('kn-241', 'questions', 2, 'narrator_before'): "What does this phrase mean?",
    ('kn-241', 'questions', 3, 'narrator_before'): "What does this phrase mean?",
    ('kn-242', 'questions', 0, 'narrator_before'): "What does this word mean?",
    ('kn-243', 'questions', 0, 'narrator_before'): "What does this word mean?",
    ('kn-243', 'questions', 2, 'narrator_before'): "What does this word mean?",
    ('kn-243', 'questions', 3, 'narrator_before'): "What does this word mean?",
    ('kn-151', 'questions', 0, 'narrator_before'): "What does this word mean?",
    ('kn-151', 'questions', 3, 'narrator_before'): "What does this word mean?",
    ('kn-151', 'questions', 4, 'narrator_before'): "What does this phrase mean?",
    ('kn-152', 'questions', 1, 'narrator_before'): "What does this phrase mean?",
    ('kn-152', 'questions', 3, 'narrator_before'): "What does this phrase mean?",
    ('kn-152', 'questions', 4, 'narrator_before'): "What does this phrase mean?",
    ('kn-154', 'questions', 3, 'narrator_before'): "What does this word mean?",
    ('kn-154', 'questions', 4, 'narrator_before'): "What does this word mean?",
    ('kn-155', 'questions', 0, 'narrator_before'): "What does this phrase mean?",
    ('kn-155', 'questions', 1, 'narrator_before'): "What does this phrase really mean?",
    ('kn-156', 'questions', 3, 'narrator_before'): "What does this phrase mean?",
    ('kn-156', 'questions', 4, 'narrator_before'): "What does this word mean?",
    ('kn-157', 'questions', 0, 'narrator_before'): "What does this word mean?",
    ('kn-157', 'questions', 1, 'narrator_before'): "What does this word mean?",
    ('kn-157', 'questions', 3, 'narrator_before'): "What does this word mean?",
    ('kn-158', 'questions', 0, 'narrator_before'): "What does this phrase mean?",
    ('kn-158', 'questions', 3, 'narrator_before'): "What does this word mean?",
    ('kn-159', 'questions', 0, 'narrator_before'): "Which word signals past tense in this phrase?",
    ('kn-160', 'questions', 0, 'narrator_before'): "What is this celebration?",
    ('kn-160', 'questions', 1, 'narrator_before'): "What does this combination symbolize?",
    ('kn-160', 'questions', 2, 'narrator_before'): "What does this decoration mean?",
    ('kn-160', 'questions', 3, 'narrator_before'): "How do you say happy new year?",
    ('kn-160', 'questions', 4, 'narrator_before'): "What does this word mean?",

    # === questions.narrator_after: answers with Kannada ===
    ('kn-244', 'questions', 3, 'narrator_after'): "The answer is: no, or don't want.",
    ('kn-152', 'questions', 0, 'narrator_after'): "The answer is: I need to go to a place.",
    ('kn-154', 'questions', 2, 'narrator_after'): "The answer is: it's used with tomorrow — future context.",
    ('kn-156', 'questions', 0, 'narrator_after'): "The answer is: I'm not well.",
    ('kn-159', 'questions', 2, 'narrator_after'): "The answer is: tomorrow plus will go — future tense.",
    ('kn-160', 'questions', 1, 'narrator_after'): "The answer is: life's bitter and sweet moments — neem and jaggery.",
    ('kn-160', 'questions', 3, 'narrator_after'): "The answer is: the new year greeting!",

    # === prompts.narrator_before: graduated recall with embedded Kannada ===
    ('kn-251', 'prompts', 4, 'narrator_before'): "How do you say bread? And how do you say upma?",
    ('kn-252', 'prompts', 0, 'narrator_before'): "How do you say: I need to go?",
    ('kn-256', 'prompts', 6, 'narrator_before'): "How do you say new? And how do you say old?",
    ('kn-254', 'prompts', 5, 'narrator_before'): "How do you say children? And how do you say family?",
    ('kn-257', 'prompts', 1, 'narrator_before'): "How do you say he, she, and they?",
    ('kn-257', 'prompts', 2, 'narrator_before'): "How do you say we?",
    ('kn-332', 'prompts', 0, 'narrator_before'): "Someone says something. What does it mean?",
    ('kn-332', 'prompts', 1, 'narrator_before'): "Someone says something. What does it mean?",
    ('kn-332', 'prompts', 2, 'narrator_before'): "Someone says something. What does it mean?",
    ('kn-332', 'prompts', 4, 'narrator_before'): "Someone says something. What does it mean?",
    ('kn-332', 'prompts', 5, 'narrator_before'): "Someone says something. What does it mean?",
    ('kn-332', 'prompts', 7, 'narrator_before'): "Someone says something. What does it mean?",

    # === items (context_guess) ===
    ('kn-271', 'items', 1, 'narrator_before'): "The food is made and she's calling him to eat. What is the food?",
    ('kn-273', 'items', 1, 'narrator_after'): "It means door.",

    # === segments ===
    ('kn-242', 'segments', 5, 'narrator_before'): "Lakshmi picks up green chillies and red fruit.",
    ('kn-242', 'segments', 5, 'narrator_after'): "Green chillies. Red fruit.",
}

applied = 0
for (tid, key, idx, field), new_text in rewrites.items():
    t = task_map.get(tid)
    if not t:
        print(f'WARNING: task {tid} not found')
        continue
    ref = t.get('reference', {})
    items = ref.get(key, [])
    if idx >= len(items):
        print(f'WARNING: {tid} {key}[{idx}] out of range')
        continue
    old = items[idx].get(field, '')
    items[idx][field] = new_text
    # Delete old audio file so it gets regenerated
    url_key = f'{field}_url'
    url = items[idx].get(url_key, '')
    if url and old != new_text:
        path = os.path.join('public', url.lstrip('/'))
        if os.path.exists(path):
            os.remove(path)
        del items[idx][url_key]
    applied += 1

with open('data/learn_kannada.json', 'w') as f:
    json.dump(tasks, f, indent=2, ensure_ascii=False)

print(f'Applied {applied} rewrites')
