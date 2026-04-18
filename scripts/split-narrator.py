#!/usr/bin/env python3
"""
Split interleaved English/Kannada text into clean narrator segments.
Adds narrator_before and narrator_after fields for English TTS generation.
"""
import json
import re

with open('data/learn_kannada.json') as f:
    tasks = json.load(f)

def split_narration_segment(seg):
    text = seg['text']
    
    # Pattern 1: "X says/asks: [Kannada phrase]. That means/That's: [meaning]. [breakdowns]."
    m = re.match(
        r'(.+?)\s+(?:says?|asks?|replies?)\s*:\s*'  # before "says:"
        r'(.+?)\.\s*'                                  # Kannada phrase
        r'(?:That\s+means?\s*:?\s*|That\'s\s+(?:how\s+you\s+say\s+)?)'  # meaning marker
        r'(.+?)(?:\.\s*\w+\s+(?:is|means?)\s+|$)',    # meaning (stop at word breakdowns)
        text, re.IGNORECASE
    )
    if m:
        setup = m.group(1).strip().rstrip('.')
        meaning = m.group(3).strip().rstrip('.')
        seg['narrator_before'] = setup + '.'
        seg['narrator_after'] = meaning + '.'
        return
    
    # Pattern 2: "X says/asks: [phrase]. [English meaning without 'That means']"
    m2 = re.match(
        r'(.+?)\s+(?:says?|asks?|replies?)\s*:\s*'
        r'(.+?)\.\s*'
        r'(.+)',
        text, re.IGNORECASE
    )
    if m2:
        setup = m2.group(1).strip().rstrip('.')
        rest = m2.group(3).strip()
        # First sentence of the rest is likely the meaning
        first_sent = re.split(r'(?<=[.!?])\s+', rest)[0]
        seg['narrator_before'] = setup + '.'
        seg['narrator_after'] = first_sent
        return
    
    # Pattern 3: Em-dash definitions "the angadi — the small shop — near his mane, his house"
    # Replace "word — definition —" with just the definition
    clean = re.sub(r'\b\w+\s*—\s*([^—]+?)\s*—', r'\1', text)
    # Replace "word — definition" (no closing dash) at end
    clean = re.sub(r'\b\w+\s*—\s*(.+?)(?:\.|,)', r'\1.', clean)
    # Remove standalone Kannada-looking exclamations (capitalized non-English words followed by !)
    clean = re.sub(r'\b[A-Z][a-z]+(?:\s+[a-z]+){0,3}!\s*', '', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    
    seg['narrator_before'] = clean if clean else text
    seg['narrator_after'] = ''

def split_circling_prompt(prompt):
    text = prompt['text']
    sentences = re.split(r'(?<=[.!?])\s+', text)
    prompt['narrator_before'] = sentences[0] if len(sentences) >= 2 else text
    prompt['narrator_after'] = ''

def split_dialogue_line(line):
    line['narrator_before'] = f"{line['speaker']} says:"
    line['narrator_after'] = line.get('translation', '')

def split_context_guess_item(item):
    item['narrator_before'] = item.get('hint', '')
    item['narrator_after'] = f"{item['unknown_word']} means {item['answer']}"

def split_graduated_recall_prompt(prompt):
    text = prompt['prompt']
    clean = re.sub(r'\s*Say\s*(it)?:?\s*\w+\.?$', '', text, flags=re.IGNORECASE).strip()
    prompt['narrator_before'] = clean
    prompt['narrator_after'] = ''

def split_shadowing_phrase(phrase):
    phrase['narrator_before'] = phrase.get('meaning', '')
    phrase['narrator_after'] = ''

# Process
stats = {}
for task in tasks:
    ref = task.get('reference')
    if not ref:
        continue
    rtype = ref.get('type', '')
    
    handlers = {
        'narration': ('segments', split_narration_segment),
        'circling': ('prompts', split_circling_prompt),
        'dialogue': ('lines', split_dialogue_line),
        'context_guess': ('items', split_context_guess_item),
        'graduated_recall': ('prompts', split_graduated_recall_prompt),
        'shadowing': ('phrases', split_shadowing_phrase),
    }
    
    if rtype in handlers:
        key, fn = handlers[rtype]
        for item in ref.get(key, []):
            fn(item)
            stats[rtype] = stats.get(rtype, 0) + 1
    
    if rtype == 'narration':
        for q in ref.get('questions', []):
            q['narrator_before'] = q['prompt']
            q['narrator_after'] = f"The answer is: {q['answer']}"
    
    task['narrator_action'] = task.get('action', task.get('description', ''))

with open('data/learn_kannada.json', 'w') as f:
    json.dump(tasks, f, indent=2, ensure_ascii=False)

print('Split complete:')
for k, v in sorted(stats.items()):
    print(f'  {k}: {v}')
print(f'  Total: {sum(stats.values())}')
