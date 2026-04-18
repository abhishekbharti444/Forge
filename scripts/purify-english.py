#!/usr/bin/env python3
"""
Purify English narrator text: remove all Kannada words from English audio fields.
- Graduated recall: "X is Y. Say it." → "How do you say X?"
- Questions: "What does 'angadi' mean?" → "What does this word mean?" + kn audio ref
- Answers: "The answer is: Dhanyavada" → "The answer is: thank you"
- Narrator_after: fix 4 lines with embedded Kannada
"""
import json
import re
import os

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'learn_kannada.json')

# Common Kannada romanized words
KN_WORDS = set('namaskara angadi mane kaapi bisi sakkare beku haal swalpa haudu dhanyavada tumba chennagi chennagide eshtu kodi ondu eradu mooru dosa idli oota darshini enu mattu rupaayi hogi yelli hattira jaasti kammi sari nillisi illi bala edakke nere mundhe hesaru nanna nimma ooru inda gottha paravagilla hegiddira chennagiddini kelsa amma appa akka raatri naale saanje beligge ivattu tarkari aalugadde irulli hasiru kempu hannu mosaru anna saaru huli palya neeru beda mazhe gaali tanna bisilu hava dodda khushi sundhara nidhaana hogona aushadhi kshamisi doora ide pakka gottu barthini maadi aagutte bantu kalithukollthira snana nalku aidu aaru yelu entu ombattu hattu ippattu mooru-vattu nalavattu aivatthu nooru yaru hege yavaga dayavittu banni kudi tinnu maadu nanage angadige barthini barthale barthare hegiddiya tinde aayitu nilluththe embattu'.split())

def has_kannada(text):
    words = re.findall(r"[A-Za-z'-]+", text)
    return any(w.lower().rstrip('.!?,;:') in KN_WORDS for w in words)

def rewrite_graduated_recall(tasks):
    """Rewrite graduated recall prompts to pure English questions."""
    count = 0
    for t in tasks:
        ref = t.get('reference', {})
        if ref.get('type') != 'graduated_recall':
            continue
        for p in ref.get('prompts', []):
            old = p['prompt']
            if not has_kannada(old):
                continue
            
            new = purify_recall_prompt(old)
            if new != old:
                p['narrator_before'] = new
                # Delete old URL so it gets regenerated
                p.pop('narrator_before_url', None)
                count += 1
    return count

def purify_recall_prompt(text):
    """Convert "X is Y. Say it." patterns to pure English questions."""
    # Pattern: "X in Kannada is Y. Say it: Y." → "How do you say X?"
    m = re.match(r"(.+?)\s+(?:in Kannada\s+)?is\s+\w+.*?(?:Say\s+(?:it)?[:.]\s*\w+\.?)?$", text, re.IGNORECASE)
    if m:
        meaning = m.group(1).strip().rstrip('.')
        return f"How do you say: {meaning}?"
    
    # Pattern: "X is Y. Z is W. Say: x, z." → "How do you say: X, Z?"
    pairs = re.findall(r"(\w[\w\s/']+?)\s+is\s+[A-Z]\w+", text)
    if pairs:
        meanings = [p.strip() for p in pairs]
        return f"How do you say: {', '.join(meanings)}?"
    
    # Pattern: "Y is Kn. How do you say: X?" → keep "How do you say: X?"
    m2 = re.search(r"(How do you (?:say|ask)[^?]*\?)", text, re.IGNORECASE)
    if m2:
        return m2.group(1)
    
    # Pattern: "Someone says X to you. How do you respond?" → keep as is if no KN
    # Fallback: strip "Say it: X" and Kannada words
    clean = re.sub(r"\s*Say\s+(?:it)?[:.]\s*[\w\s,]+\.?$", "?", text, flags=re.IGNORECASE)
    clean = re.sub(r"\s+is\s+[A-Z][a-z]+(?:[-a-z]*)\.?", ".", clean)
    return clean.strip()

def rewrite_questions(tasks):
    """Rewrite question prompts and answers to pure English."""
    prompt_count = 0
    answer_count = 0
    
    for t in tasks:
        ref = t.get('reference', {})
        if ref.get('type') != 'narration':
            continue
        
        for q in ref.get('questions', []):
            # Fix prompts: "What does 'angadi' mean?" → "What does this word mean?"
            prompt = q.get('narrator_before', q['prompt'])
            if has_kannada(prompt):
                new_prompt = purify_question_prompt(prompt, q['prompt'])
                q['narrator_before'] = new_prompt
                q.pop('narrator_before_url', None)
                # Store the Kannada word for audio generation
                kn_word = extract_kannada_word(q['prompt'])
                if kn_word:
                    q['question_kn_word'] = kn_word
                prompt_count += 1
            
            # Fix answers: "The answer is: Dhanyavada" → "The answer is: thank you"
            answer = q.get('narrator_after', '')
            if has_kannada(answer):
                new_answer = purify_question_answer(answer, q['answer'])
                q['narrator_after'] = new_answer
                q.pop('narrator_after_url', None)
                answer_count += 1
    
    return prompt_count, answer_count

def purify_question_prompt(narrator_text, original_prompt):
    """Convert question with Kannada word to pure English."""
    # "What does 'X' mean?" → "What does this word mean?"
    if re.search(r"What does\s+'?\w+'?\s+mean", narrator_text, re.IGNORECASE):
        return "What does this word mean?"
    # "How do you say 'X' in Kannada?" → "How do you say this in Kannada?"
    if re.search(r"How do you say\s+'[^']+'\s+in Kannada", narrator_text, re.IGNORECASE):
        # Extract the English meaning from the quoted part
        m = re.search(r"How do you say\s+'([^']+)'", narrator_text)
        if m:
            return f"How do you say '{m.group(1)}' in Kannada?"
    # "What is a darshini?" → keep if the word is being defined
    # "What number is 'mooru'?" → "What number is this?"
    cleaned = re.sub(r"'[A-Z][a-z]+(?:\s+[a-z]+)*'", "'this'", narrator_text)
    if cleaned != narrator_text and not has_kannada(cleaned):
        return cleaned
    # Fallback
    return "What does this mean?"

def purify_question_answer(answer_text, original_answer):
    """Convert answer with Kannada to pure English."""
    # "The answer is: Dhanyavada" → "The answer is: thank you"
    # "The answer is: Ondu bisi kaapi" → "The answer is: one hot coffee"
    # Use the original answer field which has the English meaning
    if original_answer and not has_kannada(original_answer):
        return f"The answer is: {original_answer}"
    # If original answer also has Kannada, try to extract English part
    english_part = re.sub(r'\b(' + '|'.join(KN_WORDS) + r')\b', '', original_answer, flags=re.IGNORECASE)
    english_part = re.sub(r'\s+', ' ', english_part).strip(' /=-')
    if english_part:
        return f"The answer is: {english_part}"
    return answer_text  # give up

def extract_kannada_word(prompt):
    """Extract the Kannada word being asked about from a question."""
    # "What does 'angadi' mean?" → "angadi"
    m = re.search(r"'(\w+(?:\s+\w+)*)'", prompt)
    if m:
        word = m.group(1)
        if any(w.lower() in KN_WORDS for w in word.split()):
            return word
    # "What does 'enu beku' mean?" → "enu beku"
    return None

def fix_narrator_after(tasks):
    """Fix the 4 narrator_after lines with embedded Kannada."""
    fixes = {
        ('kn-211', 0): "The first word means shop. The second means house.",
        ('kn-212', 3): "And one dosa.",  # "dosa" is an English loanword, acceptable
        ('kn-241', 3): "Are you eating properly? Yes! This morning I had breakfast.",
        ('kn-271', 0): "That word means: bathe, or take a bath.",
    }
    count = 0
    for t in tasks:
        ref = t.get('reference', {})
        rt = ref.get('type', '')
        items_key = {'narration': 'segments', 'context_guess': 'items'}.get(rt)
        if not items_key:
            continue
        for i, item in enumerate(ref.get(items_key, [])):
            key = (t['id'], i)
            if key in fixes:
                item['narrator_after'] = fixes[key]
                item.pop('narrator_after_url', None)
                count += 1
    return count

def main():
    with open(DATA_FILE) as f:
        tasks = json.load(f)
    
    n1 = rewrite_graduated_recall(tasks)
    n2, n3 = rewrite_questions(tasks)
    n4 = fix_narrator_after(tasks)
    
    with open(DATA_FILE, 'w') as f:
        json.dump(tasks, f, indent=2, ensure_ascii=False)
    
    print(f'Rewritten:')
    print(f'  Graduated recall prompts: {n1}')
    print(f'  Question prompts: {n2}')
    print(f'  Question answers: {n3}')
    print(f'  Narrator_after fixes: {n4}')
    print(f'  Total: {n1 + n2 + n3 + n4}')

if __name__ == '__main__':
    main()
