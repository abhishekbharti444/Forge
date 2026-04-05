#!/usr/bin/env node
// Generates philosophy.json task bank
// Run: node scripts/gen-philosophy.mjs

import { writeFileSync } from 'fs'

const tasks = []
let id = 1
const pid = () => `ph-${String(id++).padStart(3,'0')}`

// Helper: structured_list task (teach)
function teach(skill, level, concepts, action, context, constraint, example, items) {
  return {
    id: pid(), description: action, type: 'learning', difficulty: level === 1 ? 'easy' : level === 2 ? 'medium' : 'stretch',
    time_minutes: 5, skill_area: skill, level, concepts,
    action, context, constraint_note: constraint, example,
    reference: { type: 'structured_list', items }, tools: ['reveal_hide']
  }
}

// Helper: fill_blank task (test)
function fillBlank(skill, level, concepts, action, context, constraint, items) {
  return {
    id: pid(), description: action, type: 'retrieval', difficulty: level === 1 ? 'easy' : level === 2 ? 'medium' : 'stretch',
    time_minutes: 5, skill_area: skill, level, concepts,
    action, context, constraint_note: constraint,
    reference: { type: 'fill_blank', items }
  }
}

// Helper: text_input task (apply/reflect)
function textTask(skill, level, concepts, action, context, constraint, example, mins = 5) {
  return {
    id: pid(), description: action, type: 'practice', difficulty: level === 1 ? 'easy' : level === 2 ? 'medium' : 'stretch',
    time_minutes: mins, skill_area: skill, level, concepts,
    action, context, constraint_note: constraint, example,
    tools: ['text_input'], completion: 'text_submitted'
  }
}

// Helper: steps task (argument walkthrough)
function stepsTask(skill, level, concepts, action, context, constraint, example, steps) {
  return {
    id: pid(), description: action, type: 'learning', difficulty: level === 1 ? 'easy' : level === 2 ? 'medium' : 'stretch',
    time_minutes: 5, skill_area: skill, level, concepts,
    action, context, constraint_note: constraint, example,
    reference: { type: 'steps', steps }
  }
}

// Helper: pairs task (compare)
function pairsTask(skill, level, concepts, action, context, constraint, pairs) {
  return {
    id: pid(), description: action, type: 'learning', difficulty: level === 1 ? 'easy' : level === 2 ? 'medium' : 'stretch',
    time_minutes: 5, skill_area: skill, level, concepts,
    action, context, constraint_note: constraint,
    reference: { type: 'pairs', pairs }
  }
}

// ============================================================
// PHILOSOPHICAL LITERACY (30 tasks)
// ============================================================

// L1: Learn key thinkers, schools, terms
tasks.push(teach('philosophical_literacy', 1, ['epistemology','ethics','metaphysics'],
  'Learn the 3 core branches of philosophy and what questions each one asks.',
  'Philosophy isn\'t one subject — it\'s a family of questions. Knowing the branches helps you categorize any philosophical question you encounter.',
  'Read through the branches, then test yourself: given a question, which branch does it belong to?',
  '"Is the death penalty moral?" → Ethics. "Do we have free will?" → Metaphysics. "How do we know anything is real?" → Epistemology.',
  [
    {primary:'Epistemology', secondary:'Theory of Knowledge', reveal:'What can we know? How do we know it? What counts as justified belief?'},
    {primary:'Ethics', secondary:'Moral Philosophy', reveal:'What is right and wrong? How should we live? What do we owe each other?'},
    {primary:'Metaphysics', secondary:'Nature of Reality', reveal:'What exists? Do we have free will? What is consciousness?'}
  ]
))

tasks.push(teach('philosophical_literacy', 1, ['socrates','plato','aristotle','descartes','kant','nietzsche'],
  'Learn 6 foundational philosophers and the one idea each is most known for.',
  'These 6 thinkers shaped how the Western world thinks. Knowing their core idea gives you anchors for everything else.',
  'Study the list, then switch to quiz mode. Can you match each philosopher to their idea?',
  null,
  [
    {primary:'Socrates', secondary:'470–399 BC', reveal:'The unexamined life is not worth living. Invented the Socratic method — learning through questions.'},
    {primary:'Plato', secondary:'428–348 BC', reveal:'Reality is divided into Forms (perfect ideals) and the physical world (imperfect copies).'},
    {primary:'Aristotle', secondary:'384–322 BC', reveal:'Virtue is the mean between extremes. Courage is between cowardice and recklessness.'},
    {primary:'René Descartes', secondary:'1596–1650', reveal:'I think, therefore I am. Doubted everything until he found one undeniable truth.'},
    {primary:'Immanuel Kant', secondary:'1724–1804', reveal:'Act only by rules you\'d want everyone to follow (Categorical Imperative).'},
    {primary:'Friedrich Nietzsche', secondary:'1844–1900', reveal:'God is dead — we must create our own meaning. Challenged all inherited moral systems.'}
  ]
))

tasks.push(teach('philosophical_literacy', 1, ['thought_experiment','trolley_problem','brain_in_a_vat','ship_of_theseus','chinese_room'],
  'Learn 4 famous thought experiments and what philosophical question each one targets.',
  'Thought experiments are philosophy\'s lab equipment. They strip away real-world noise to isolate one specific question.',
  'For each, understand both the scenario AND the question it\'s asking.',
  null,
  [
    {primary:'Trolley Problem', secondary:'Philippa Foot, 1967', reveal:'Is it moral to sacrifice one to save five? Tests: do consequences justify actions?'},
    {primary:'Brain in a Vat', secondary:'Hilary Putnam, 1981', reveal:'How do you know you\'re not a brain being fed fake experiences? Tests: can we trust our senses?'},
    {primary:'Ship of Theseus', secondary:'Ancient Greek', reveal:'If you replace every plank of a ship, is it the same ship? Tests: what makes identity persist?'},
    {primary:'Chinese Room', secondary:'John Searle, 1980', reveal:'Following rules to produce Chinese without understanding it — is that thinking? Tests: can machines think?'}
  ]
))

tasks.push(teach('philosophical_literacy', 1, ['stoicism','epicureanism','existentialism','pragmatism','absurdism'],
  'Learn 5 major schools of thought and their core claim about how to live.',
  'Each school offers a different answer to "what makes a good life?" Knowing them gives you a menu of life philosophies to draw from.',
  'Focus on the one-sentence core claim. That\'s what distinguishes each school.',
  null,
  [
    {primary:'Stoicism', secondary:'Epictetus, Marcus Aurelius', reveal:'Focus only on what you can control. Accept what you can\'t. Virtue is the only true good.'},
    {primary:'Epicureanism', secondary:'Epicurus', reveal:'Pleasure is the highest good — but true pleasure is simple: friendship, freedom, thought. Not hedonism.'},
    {primary:'Existentialism', secondary:'Sartre, de Beauvoir', reveal:'Existence precedes essence. You\'re not born with a purpose — you must create your own meaning.'},
    {primary:'Pragmatism', secondary:'James, Dewey', reveal:'Truth is what works. An idea is true if it produces useful, practical consequences.'},
    {primary:'Absurdism', secondary:'Camus', reveal:'Life has no inherent meaning, but we must live fully anyway. "One must imagine Sisyphus happy."'}
  ]
))

tasks.push(fillBlank('philosophical_literacy', 1, ['socrates','plato','descartes','kant'],
  'Test your knowledge of key philosophers. Complete each statement from memory.',
  'Active recall is how knowledge sticks. If you get one wrong, that\'s the most valuable learning moment.',
  'Try to answer from memory before revealing.',
  [
    {prompt:'Socrates\' method of teaching through questions is called the ___ method.', answer:'Socratic', hint:'Named after him'},
    {prompt:'Plato believed the physical world is an imperfect copy of perfect ___.', answer:'Forms (or Ideas)', hint:'His theory of reality'},
    {prompt:'Descartes\' famous statement "I think, therefore I ___" proved his own existence.', answer:'am (Cogito ergo sum)', hint:'The one thing he couldn\'t doubt'},
    {prompt:'Kant\'s ___ Imperative says: act only by rules you\'d want everyone to follow.', answer:'Categorical', hint:'Not hypothetical — unconditional'}
  ]
))

tasks.push(teach('philosophical_literacy', 1, ['logic','deduction','induction','premise','conclusion'],
  'Learn the basic building blocks of philosophical arguments: premises, conclusions, deduction, and induction.',
  'Every philosophical argument has the same structure: premises that lead to a conclusion. Understanding this structure lets you evaluate any argument.',
  'Focus on the difference between deduction (certain) and induction (probable).',
  'Deduction: "All humans are mortal. Socrates is human. Therefore Socrates is mortal." — the conclusion MUST follow. Induction: "The sun rose every day so far, so it will rise tomorrow." — probable but not certain.',
  [
    {primary:'Premise', secondary:'Building block', reveal:'A statement assumed to be true that supports the conclusion. Arguments have one or more premises.'},
    {primary:'Conclusion', secondary:'The claim', reveal:'The statement the argument is trying to prove. It should follow logically from the premises.'},
    {primary:'Deduction', secondary:'Certain', reveal:'If premises are true, conclusion MUST be true. Goes from general rules to specific cases.'},
    {primary:'Induction', secondary:'Probable', reveal:'Premises make conclusion LIKELY but not certain. Goes from specific observations to general rules.'}
  ]
))

tasks.push(teach('philosophical_literacy', 1, ['determinism','free_will','compatibilism'],
  'Learn the 3 positions on free will: determinism, libertarian free will, and compatibilism.',
  'The free will debate is one of philosophy\'s oldest. Your position on it affects how you think about responsibility, punishment, and praise.',
  'Each position answers: "Could you have done otherwise?" differently.',
  null,
  [
    {primary:'Hard Determinism', secondary:'No free will', reveal:'Every event is caused by prior events. Your "choices" are the inevitable result of physics + history. Free will is an illusion.'},
    {primary:'Libertarian Free Will', secondary:'Full free will', reveal:'Humans have genuine ability to choose otherwise. Something about consciousness escapes causal chains.'},
    {primary:'Compatibilism', secondary:'Both', reveal:'Free will and determinism are compatible. You\'re "free" if you act on your own desires, even if those desires were determined.'}
  ]
))

tasks.push(fillBlank('philosophical_literacy', 1, ['stoicism','epicureanism','existentialism','absurdism'],
  'Test your knowledge of philosophical schools. Fill in the blanks.',
  'Can you recall the core claim of each school without looking?',
  'Answer from memory first.',
  [
    {prompt:'Stoicism teaches: focus only on what you can ___.', answer:'control', hint:'Epictetus\'s core teaching'},
    {prompt:'Existentialism says: ___ precedes essence.', answer:'existence', hint:'Sartre\'s famous claim — you exist first, then define yourself'},
    {prompt:'Camus said "One must imagine ___ happy" to illustrate absurdism.', answer:'Sisyphus', hint:'The Greek figure who pushes a boulder uphill forever'},
    {prompt:'Epicurus taught that true pleasure comes from simple things: friendship, freedom, and ___.', answer:'thought (or contemplation)', hint:'Not hedonism — intellectual pleasure'}
  ]
))

tasks.push(teach('philosophical_literacy', 1, ['empiricism','rationalism','a_priori','a_posteriori'],
  'Learn the debate between Empiricism and Rationalism — where does knowledge come from?',
  'This is epistemology\'s central question. Every time you argue about evidence vs. logic, you\'re replaying this debate.',
  'The key question: can you know things WITHOUT experience, or does all knowledge require it?',
  null,
  [
    {primary:'Empiricism', secondary:'Locke, Hume', reveal:'All knowledge comes from sensory experience. The mind starts as a blank slate (tabula rasa).'},
    {primary:'Rationalism', secondary:'Descartes, Leibniz', reveal:'Some knowledge is innate or discoverable through reason alone, without needing experience.'},
    {primary:'A priori', secondary:'Before experience', reveal:'Knowledge that doesn\'t require experience. Example: 2+2=4. You don\'t need to observe this.'},
    {primary:'A posteriori', secondary:'After experience', reveal:'Knowledge that requires experience. Example: "Water boils at 100°C." You must observe this.'}
  ]
))

tasks.push(teach('philosophical_literacy', 1, ['social_contract','hobbes','locke','rousseau'],
  'Learn the Social Contract theory: why do we have governments? Three thinkers, three answers.',
  'Every political argument about rights, laws, and government power traces back to social contract theory.',
  'Each thinker starts from a different view of human nature, which leads to a different conclusion about government.',
  null,
  [
    {primary:'Hobbes', secondary:'Leviathan, 1651', reveal:'Without government, life is "nasty, brutish, and short." We need a strong ruler to prevent chaos.'},
    {primary:'Locke', secondary:'Two Treatises, 1689', reveal:'People have natural rights (life, liberty, property). Government exists to protect them — and can be overthrown if it fails.'},
    {primary:'Rousseau', secondary:'Social Contract, 1762', reveal:'Humans are naturally good but corrupted by society. Government should express the "general will" of the people.'}
  ]
))

// L2: Compare, connect, deeper understanding
tasks.push(pairsTask('philosophical_literacy', 2, ['empiricism','rationalism'],
  'Compare Empiricism vs Rationalism side by side. What does each say about the source of knowledge?',
  'These two traditions defined modern philosophy. Most thinkers fall somewhere on this spectrum.',
  'For each pair, think about which side you lean toward and why.',
  [
    {left:'Empiricism: Mind starts as blank slate', right:'Rationalism: Mind has innate ideas'},
    {left:'Knowledge comes FROM experience', right:'Knowledge comes THROUGH reason'},
    {left:'Science is the model: observe, test', right:'Mathematics is the model: deduce, prove'},
    {left:'Weakness: can\'t prove universal laws from observations', right:'Weakness: reason alone can lead to unfounded conclusions'}
  ]
))

tasks.push(pairsTask('philosophical_literacy', 2, ['plato','aristotle'],
  'Compare Plato vs Aristotle — teacher and student who disagreed on almost everything.',
  'This is the foundational split in Western philosophy. Plato looks up (to ideals), Aristotle looks around (at the world).',
  'Notice how their disagreement echoes in modern debates: theory vs practice, idealism vs realism.',
  [
    {left:'Plato: True reality is the world of Forms', right:'Aristotle: True reality is the physical world we observe'},
    {left:'Knowledge through reason and contemplation', right:'Knowledge through observation and classification'},
    {left:'The ideal state is ruled by philosopher-kings', right:'The best state balances different forms of government'},
    {left:'Art is a dangerous imitation of imitations', right:'Art is valuable — it lets us experience catharsis'}
  ]
))

tasks.push(textTask('philosophical_literacy', 2, ['socratic_method'],
  'Practice the Socratic method. Pick any belief you hold and ask yourself 5 "why" questions in sequence.',
  'Socrates never told people what to think — he asked questions until they discovered contradictions in their own beliefs. This is the most powerful thinking tool in philosophy.',
  'Write your belief, then 5 why-questions and your honest answers. Don\'t defend — explore.',
  'Belief: "Hard work leads to success." Why? → Because effort produces results. Why do you believe that? → I\'ve seen it in my life. Is that always true? → No, some people work hard and fail. So what else matters? → Luck, connections, timing. Then is your original belief accurate? → It\'s incomplete...'
))

tasks.push(fillBlank('philosophical_literacy', 2, ['social_contract','hobbes','locke','rousseau'],
  'Test your understanding of social contract theory. Who said what?',
  'These three thinkers gave very different answers to "why government?" based on different views of human nature.',
  'Think about each thinker\'s view of human nature to derive the answer.',
  [
    {prompt:'___ believed life without government would be "nasty, brutish, and short."', answer:'Hobbes', hint:'The pessimist about human nature'},
    {prompt:'___ argued people have natural rights to life, liberty, and property.', answer:'Locke', hint:'Influenced the American Declaration of Independence'},
    {prompt:'___ believed humans are naturally good but corrupted by ___.', answer:'Rousseau, society', hint:'The romantic — civilization is the problem'},
    {prompt:'The idea that government authority comes from the consent of the governed is called ___ theory.', answer:'social contract', hint:'All three thinkers contributed to this idea'}
  ]
))

tasks.push(textTask('philosophical_literacy', 2, ['determinism','free_will','compatibilism'],
  'The free will question: write your current position in 3-4 sentences. Are your choices truly free?',
  'This isn\'t about getting the "right" answer — philosophers have debated this for millennia. It\'s about articulating YOUR position clearly.',
  'State your position, give one reason for it, and acknowledge the strongest objection against it.',
  'Example: "I lean toward compatibilism. My choices feel free because they come from my own desires, even if those desires were shaped by genetics and environment. The strongest objection is that this redefines \'free\' to mean something weaker than what most people mean by it."'
))

tasks.push(teach('philosophical_literacy', 2, ['phenomenology','husserl','heidegger','consciousness'],
  'Learn Phenomenology — the philosophy of conscious experience. What is it like to BE you?',
  'Phenomenology asks: before we theorize about the world, what is the raw experience of being conscious? It\'s the foundation of modern philosophy of mind.',
  'The key insight: we never experience "raw reality" — we always experience reality AS something (as threatening, as beautiful, as boring).',
  null,
  [
    {primary:'Phenomenology', secondary:'Study of experience', reveal:'Philosophy of how things appear to consciousness. Not what IS real, but how we EXPERIENCE reality.'},
    {primary:'Husserl', secondary:'Founder', reveal:'Proposed "bracketing" — setting aside assumptions about whether things are real to study pure experience.'},
    {primary:'Heidegger', secondary:'Being-in-the-world', reveal:'We don\'t observe the world from outside — we\'re always already embedded in it. Understanding comes from living, not theorizing.'},
    {primary:'Intentionality', secondary:'Key concept', reveal:'Consciousness is always consciousness OF something. You can\'t just "be aware" — you\'re always aware of something specific.'}
  ]
))

tasks.push(stepsTask('philosophical_literacy', 2, ['dialectic','hegel','thesis_antithesis_synthesis'],
  'Learn Hegel\'s Dialectic — how ideas evolve through contradiction and resolution.',
  'The dialectic explains how human thought progresses: every idea generates its opposite, and the tension produces something new. It\'s how science, politics, and culture actually evolve.',
  'Follow the steps, then try to apply the pattern to a real example.',
  'Example: Thesis: "Individual freedom is the highest value." Antithesis: "But unlimited freedom leads to exploitation." Synthesis: "Regulated freedom — rights with responsibilities."',
  [
    'Start with a THESIS — an idea or position that seems true.',
    'Identify the ANTITHESIS — the contradiction or opposite that the thesis generates.',
    'The tension between thesis and antithesis produces a SYNTHESIS — a new idea that incorporates both.',
    'The synthesis then becomes a new thesis, and the cycle continues.',
    'This is how Hegel believed all of history progresses — through contradiction and resolution.'
  ]
))

// L3: Synthesize, critique, original thinking
tasks.push(textTask('philosophical_literacy', 3, ['eastern_western_philosophy'],
  'Compare Eastern and Western philosophical traditions. What does each prioritize? Write 4-5 sentences.',
  'Most philosophy education is Western-centric. Recognizing the Eastern tradition reveals blind spots in how you think about self, reality, and ethics.',
  'Don\'t just list differences — identify what each tradition ASSUMES that the other questions.',
  'Western philosophy tends to assume a separate self that reasons about an external world. Eastern traditions (Buddhism, Taoism, Hinduism) often question whether the self is real at all, and whether separation from the world is an illusion.'
))

tasks.push(textTask('philosophical_literacy', 3, ['philosophy_of_mind','consciousness','hard_problem'],
  'The Hard Problem of Consciousness: why does it FEEL like something to be you? Write your take in 3-4 sentences.',
  'David Chalmers distinguished the "easy problems" (how the brain processes information) from the "hard problem" (why there\'s subjective experience at all). Science can explain brain activity but not why it feels like something.',
  'State whether you think science will eventually explain consciousness, and why or why not.',
  null
))

tasks.push(textTask('philosophical_literacy', 3, ['meaning_of_life','existentialism','absurdism','nihilism'],
  'Three responses to "life has no inherent meaning": nihilism, existentialism, absurdism. Which do you find most compelling? Argue for it in 4-5 sentences.',
  'This is philosophy\'s biggest question. Nihilism says: there\'s no meaning, period. Existentialism says: create your own. Absurdism says: there\'s no meaning, but live fully anyway.',
  'Don\'t just state your preference — argue for it. Why is your chosen response better than the other two?',
  null
))


// ============================================================
// ETHICS (30 tasks)
// ============================================================

// L1: Learn ethical frameworks and key concepts
tasks.push(teach('ethics', 1, ['utilitarianism','deontology','virtue_ethics'],
  'Learn the 3 major ethical frameworks and how each one decides what\'s "right."',
  'Most moral disagreements come down to people using different frameworks without realizing it.',
  'Focus on the core question each framework asks. That\'s the key difference.',
  null,
  [
    {primary:'Utilitarianism', secondary:'Mill, Bentham', reveal:'Judge actions by outcomes. The right action produces the most happiness for the most people.'},
    {primary:'Deontology', secondary:'Kant', reveal:'Judge actions by rules/duties. Some actions are wrong regardless of outcomes (e.g., lying is always wrong).'},
    {primary:'Virtue Ethics', secondary:'Aristotle', reveal:'Judge actions by character. A good person acts with courage, honesty, compassion — not by calculating.'}
  ]
))

tasks.push(fillBlank('ethics', 1, ['utilitarianism','deontology','virtue_ethics'],
  'Test your knowledge of ethical frameworks. Complete each statement.',
  'Active recall is how knowledge sticks.',
  'Try to answer from memory before revealing.',
  [
    {prompt:'A utilitarian asks: "Which action produces the greatest ___?"', answer:'happiness (or well-being/utility)', hint:'Think: outcomes for the most people'},
    {prompt:'A deontologist asks: "Does this action follow a universal ___?"', answer:'rule (or duty/law)', hint:'Kant\'s categorical imperative'},
    {prompt:'A virtue ethicist asks: "What would a ___ person do?"', answer:'virtuous (or good/wise)', hint:'Think: character, not consequences'},
    {prompt:'Lying to save a life is justified by ___ but condemned by ___.', answer:'utilitarianism, deontology', hint:'One cares about outcomes, the other about rules'}
  ]
))

tasks.push(teach('ethics', 1, ['categorical_imperative','kant','universalizability'],
  'Learn Kant\'s Categorical Imperative — the most famous rule-based ethical test.',
  'Kant wanted a single test that could determine if ANY action is moral. The Categorical Imperative is his answer.',
  'The key question: "What if everyone did this?" If the answer leads to contradiction, the action is wrong.',
  '"Should I lie to get out of trouble?" → If everyone lied, trust would collapse and lying would become pointless. Contradiction. Therefore lying is always wrong.',
  [
    {primary:'Formula of Universal Law', secondary:'First formulation', reveal:'Act only according to rules you could will to be universal laws. "What if everyone did this?"'},
    {primary:'Formula of Humanity', secondary:'Second formulation', reveal:'Never treat people merely as means to an end. Always also treat them as ends in themselves.'},
    {primary:'Kingdom of Ends', secondary:'Third formulation', reveal:'Act as if you\'re making laws for a community where everyone is both ruler and subject.'}
  ]
))

tasks.push(teach('ethics', 1, ['trolley_problem','moral_intuition','consequentialism'],
  'Study the Trolley Problem and its variants. What do your intuitions reveal about your ethics?',
  'The trolley problem isn\'t about trolleys — it\'s about whether you judge morality by outcomes or by actions.',
  'Notice how your intuition CHANGES between variants. That inconsistency is the whole point.',
  null,
  [
    {primary:'Classic Trolley', secondary:'Pull the lever', reveal:'Trolley heading toward 5 people. Pull lever to divert to track with 1 person. Most people say: pull it.'},
    {primary:'Footbridge', secondary:'Push the man', reveal:'Push a large man off a bridge to stop the trolley and save 5. Same math (1 vs 5). Most people say: don\'t push.'},
    {primary:'The Puzzle', secondary:'Why the difference?', reveal:'If outcomes are all that matter, both cases are identical. But most people feel pushing is worse. This suggests we care about more than consequences.'},
    {primary:'What It Reveals', secondary:'Your framework', reveal:'If you\'d pull but not push: you\'re not a pure utilitarian. You have deontological intuitions about using people as means.'}
  ]
))

tasks.push(teach('ethics', 1, ['moral_relativism','moral_objectivism','cultural_relativism'],
  'Learn the debate: is morality objective (universal) or relative (cultural)?',
  'This is the first question in ethics. Your answer shapes everything else — if morality is relative, there\'s no basis to criticize any culture\'s practices.',
  'Consider: if morality is purely cultural, can we say slavery was wrong even when a culture accepted it?',
  null,
  [
    {primary:'Moral Objectivism', secondary:'Universal morals', reveal:'Some moral truths hold regardless of culture or opinion. Murder is wrong everywhere, not just where people think so.'},
    {primary:'Moral Relativism', secondary:'Culture-dependent', reveal:'Morality is determined by cultural norms. What\'s "right" in one society may be "wrong" in another. No universal standard.'},
    {primary:'Cultural Relativism', secondary:'Descriptive', reveal:'Different cultures DO have different moral beliefs (factual observation). Doesn\'t necessarily mean all are equally valid.'}
  ]
))

tasks.push(teach('ethics', 1, ['rights','positive_rights','negative_rights','natural_rights'],
  'Learn the concept of rights: negative rights (freedoms FROM) vs positive rights (entitlements TO).',
  'Every political debate about healthcare, education, or gun control is really a debate about what kind of rights people have.',
  'The key distinction: negative rights require others to leave you alone; positive rights require others to provide something.',
  null,
  [
    {primary:'Negative Rights', secondary:'Freedom from', reveal:'Right to be left alone. Free speech, freedom from assault, property rights. Others must NOT interfere.'},
    {primary:'Positive Rights', secondary:'Entitlement to', reveal:'Right to receive something. Healthcare, education, housing. Others (or government) MUST provide.'},
    {primary:'Natural Rights', secondary:'Locke', reveal:'Rights you have simply by being human — life, liberty, property. Not granted by government, only protected by it.'}
  ]
))

tasks.push(fillBlank('ethics', 1, ['categorical_imperative','trolley_problem','moral_relativism'],
  'Test your ethics knowledge. Fill in the blanks.',
  'These are foundational concepts — make sure you can recall them without prompts.',
  'Answer from memory first.',
  [
    {prompt:'Kant\'s test for morality: "What if ___ did this?"', answer:'everyone', hint:'Universalizability'},
    {prompt:'The trolley problem tests whether you judge morality by ___ or by ___.', answer:'outcomes (consequences), actions (rules/duties)', hint:'Consequentialism vs deontology'},
    {prompt:'Moral ___ says there are no universal moral truths — morality depends on culture.', answer:'relativism', hint:'The opposite of objectivism'},
    {prompt:'___ rights require others to leave you alone; ___ rights require others to provide something.', answer:'Negative, positive', hint:'Freedom FROM vs entitlement TO'}
  ]
))

tasks.push(stepsTask('ethics', 1, ['utilitarianism','hedonic_calculus','bentham'],
  'Learn how a utilitarian actually calculates the "right" action using Bentham\'s method.',
  'Utilitarianism sounds simple ("maximize happiness") but applying it requires a systematic approach.',
  'Follow the steps, then think about the limitations of this approach.',
  null,
  [
    'Identify all available actions you could take.',
    'For each action, list everyone who would be affected.',
    'Estimate the pleasure and pain each person would experience (intensity, duration, certainty).',
    'Sum up total pleasure minus total pain for each action.',
    'Choose the action with the highest net happiness.',
    'Problem: can you really quantify happiness? Can you predict all consequences? This is utilitarianism\'s biggest weakness.'
  ]
))

tasks.push(teach('ethics', 1, ['virtue_ethics','aristotle','eudaimonia','golden_mean'],
  'Learn Aristotle\'s Virtue Ethics in depth: eudaimonia, the golden mean, and the virtues.',
  'Virtue ethics doesn\'t ask "what should I do?" but "what kind of person should I be?" It\'s about character, not rules or calculations.',
  'The golden mean is the key insight: every virtue is a balance between two extremes.',
  'Courage is the mean between cowardice (too little) and recklessness (too much). Generosity is between stinginess and wastefulness.',
  [
    {primary:'Eudaimonia', secondary:'The goal', reveal:'Often translated as "happiness" but really means "flourishing" — living well and doing well over a whole life.'},
    {primary:'Golden Mean', secondary:'The method', reveal:'Every virtue is the balance point between two vices: one of excess, one of deficiency.'},
    {primary:'Practical Wisdom', secondary:'Phronesis', reveal:'The master virtue — knowing HOW to find the mean in each specific situation. Can\'t be taught by rules, only by experience.'},
    {primary:'Habituation', secondary:'How you get virtues', reveal:'You become courageous by practicing courage. Virtues are habits, not decisions. Character is built through repeated action.'}
  ]
))

// L2: Apply frameworks, analyze dilemmas
tasks.push(textTask('ethics', 2, ['trolley_problem','utilitarianism','deontology'],
  'Apply all 3 ethical frameworks to the trolley problem. What does each say, and which do you agree with?',
  'This forces you to think FROM each framework, not just ABOUT them. That\'s the difference between knowing philosophy and doing philosophy.',
  'Write 1-2 sentences per framework, then state your own position with a reason.',
  'Utilitarian: pull the lever — 5 lives saved outweigh 1. Deontologist: don\'t pull — you\'d be using the 1 person as a means. Virtue ethicist: what would a compassionate, courageous person do in this moment?'
))

tasks.push(textTask('ethics', 2, ['moral_dilemma','lying','deontology','utilitarianism'],
  'Dilemma: Your friend asks if their terrible business idea is good. Honest feedback would crush them. What do you do? Analyze using 2 frameworks.',
  'Real moral dilemmas rarely have clean answers. The value is in seeing how different frameworks pull you in different directions.',
  'Apply utilitarianism AND deontology. Show how they give different advice. Then state what you\'d actually do.',
  null
))

tasks.push(textTask('ethics', 2, ['justice','rawls','veil_of_ignorance'],
  'Rawls\' Veil of Ignorance: if you didn\'t know your position in society (rich/poor, race, gender), what rules would you create? Write 3 rules.',
  'Rawls argued that fair rules are ones you\'d choose if you didn\'t know where you\'d end up. This removes self-interest from moral reasoning.',
  'Imagine you could be ANYONE in the society you\'re designing. What 3 rules would protect you no matter where you landed?',
  null
))

tasks.push(textTask('ethics', 2, ['moral_luck','responsibility','fairness'],
  'Moral luck: two drunk drivers take the same risk. One gets home safe, the other kills a pedestrian. Should they be punished differently? Write your argument.',
  'Thomas Nagel identified "moral luck" — we judge people differently based on outcomes they didn\'t control. This challenges our entire concept of moral responsibility.',
  'State your position clearly, give your strongest reason, and address the best counterargument.',
  null
))

tasks.push(fillBlank('ethics', 2, ['rawls','veil_of_ignorance','justice','virtue_ethics'],
  'Test your deeper ethics knowledge.',
  'These concepts require understanding, not just memorization.',
  'Think through each answer carefully.',
  [
    {prompt:'Rawls\' ___ of ___ asks you to design society without knowing your position in it.', answer:'Veil of Ignorance', hint:'A thought experiment about fairness'},
    {prompt:'Aristotle called the goal of a good life ___, meaning "flourishing" not just "happiness."', answer:'eudaimonia', hint:'Greek word, often mistranslated'},
    {prompt:'The ___ ___ says every virtue is a balance between two extremes.', answer:'golden mean', hint:'Courage is between cowardice and recklessness'},
    {prompt:'___ wisdom (phronesis) is knowing how to apply virtues in specific situations.', answer:'practical', hint:'Can\'t be taught by rules — only by experience'}
  ]
))

tasks.push(pairsTask('ethics', 2, ['utilitarianism','deontology'],
  'Compare Utilitarianism vs Deontology on 4 key dimensions.',
  'Understanding the strengths and weaknesses of each framework helps you use them as tools rather than dogma.',
  'For each pair, think about which side handles that dimension better.',
  [
    {left:'Utilitarianism: Flexible — adapts to context', right:'Deontology: Rigid — same rules regardless of context'},
    {left:'Strength: accounts for real-world consequences', right:'Strength: protects individual rights absolutely'},
    {left:'Weakness: could justify harming minorities for majority benefit', right:'Weakness: can\'t handle cases where rules conflict'},
    {left:'Example: lie to save a life (good outcome)', right:'Example: never lie, even to a murderer (duty)'}
  ]
))

tasks.push(textTask('ethics', 2, ['peter_singer','effective_altruism','moral_obligation'],
  'Peter Singer argues: if you can prevent suffering without sacrificing anything of comparable moral importance, you ought to do it. Do you agree? Why or why not?',
  'Singer\'s argument implies you\'re morally obligated to donate most of your income to save lives in extreme poverty. It\'s logically simple but the conclusion is radical.',
  'Engage with the logic. If you disagree, show where the argument breaks down — not just that the conclusion feels extreme.',
  null
))

tasks.push(textTask('ethics', 2, ['privacy','surveillance','rights','security'],
  'Dilemma: A government surveillance program prevents terrorist attacks but monitors all citizens\' communications. Is it justified? Argue both sides.',
  'This is a live ethical debate with no consensus. The tension is between collective security and individual privacy.',
  'Write 2-3 sentences FOR surveillance, then 2-3 AGAINST. Then state which argument you find stronger.',
  null
))

tasks.push(stepsTask('ethics', 2, ['moral_reasoning','ethical_analysis'],
  'Learn a 5-step framework for analyzing any ethical dilemma systematically.',
  'Most people react to dilemmas with gut feelings. This framework forces structured thinking before reaching a conclusion.',
  'Memorize these steps. You\'ll use them in future tasks.',
  null,
  [
    'Step 1: State the dilemma clearly. What are the competing values or obligations?',
    'Step 2: Identify all stakeholders. Who is affected and how?',
    'Step 3: Apply at least 2 ethical frameworks. What does each recommend?',
    'Step 4: Consider the strongest objection to your initial instinct.',
    'Step 5: State your conclusion with reasons. Acknowledge what you\'re sacrificing.'
  ]
))

// L3: Defend positions, handle edge cases
tasks.push(textTask('ethics', 3, ['animal_rights','speciesism','singer','moral_status'],
  'Do animals have moral rights? If yes, which ones and why? If no, what makes humans special? Argue your position in 4-5 sentences.',
  'Peter Singer coined "speciesism" — discrimination based on species. If suffering matters morally, why does the species of the sufferer matter?',
  'Address the strongest counterargument to your position. If you say yes to animal rights, where do you draw the line (insects? bacteria?)? If no, justify the distinction.',
  null, 10
))

tasks.push(textTask('ethics', 3, ['moral_dilemma','self_driving_cars','trolley_problem','technology_ethics'],
  'A self-driving car must choose: swerve to save passengers (killing a pedestrian) or protect the pedestrian (killing passengers). How should it be programmed? Who decides?',
  'This is the trolley problem made real by technology. Unlike the thought experiment, someone must actually write the code.',
  'Address: Should the car be utilitarian? Should owners choose? Should governments mandate? What about liability?',
  null, 10
))

tasks.push(textTask('ethics', 3, ['moral_progress','cultural_relativism','slavery','moral_objectivism'],
  'Was slavery always wrong, even when entire civilizations accepted it? Or can we only judge by the standards of the time? Defend your answer.',
  'This question tests whether you believe in moral progress — the idea that humanity can be morally wrong about something and later recognize it.',
  'If you say "always wrong": how do you know which of YOUR current beliefs future generations will condemn? If "judge by the time": does that mean the Holocaust wasn\'t wrong in Nazi Germany?',
  null, 10
))


// ============================================================
// ARGUMENTATION (30 tasks)
// ============================================================

// L1: Learn argument structure, fallacies
tasks.push(teach('argumentation', 1, ['argument_structure','premise','conclusion','validity','soundness'],
  'Learn the anatomy of an argument: premises, conclusions, validity, and soundness.',
  'Every argument in philosophy, law, science, and daily life has the same structure. Recognizing it lets you evaluate any claim.',
  'Validity = structure is correct. Soundness = structure is correct AND premises are true. A valid argument can have false premises.',
  '"All cats can fly. Socrates is a cat. Therefore Socrates can fly." — VALID (structure works) but NOT SOUND (premises are false).',
  [
    {primary:'Premise', secondary:'Input', reveal:'A statement assumed true that supports the conclusion. Arguments need at least one.'},
    {primary:'Conclusion', secondary:'Output', reveal:'The claim the argument tries to prove. Should follow logically from premises.'},
    {primary:'Valid', secondary:'Structure', reveal:'The conclusion follows logically from the premises. Even if premises are false, the LOGIC works.'},
    {primary:'Sound', secondary:'Structure + Truth', reveal:'The argument is valid AND all premises are actually true. This is what you want.'}
  ]
))

tasks.push(teach('argumentation', 1, ['ad_hominem','straw_man','appeal_to_authority','red_herring','false_dilemma'],
  'Learn 5 common logical fallacies — errors in reasoning that make arguments invalid.',
  'Fallacies are everywhere: politics, advertising, social media, family arguments. Spotting them is a superpower.',
  'For each fallacy, learn the pattern. Once you see it, you can\'t unsee it.',
  null,
  [
    {primary:'Ad Hominem', secondary:'Attack the person', reveal:'"You\'re wrong because you\'re young/biased/uneducated." Attacks the arguer instead of the argument.'},
    {primary:'Straw Man', secondary:'Distort the argument', reveal:'Misrepresenting someone\'s position to make it easier to attack. "You want gun control? So you want to ban ALL guns?"'},
    {primary:'Appeal to Authority', secondary:'Wrong expert', reveal:'"A famous actor says this diet works." The authority isn\'t an expert in the relevant field.'},
    {primary:'Red Herring', secondary:'Change the subject', reveal:'Introducing an irrelevant topic to distract. "Why worry about climate change when there are homeless people?"'},
    {primary:'False Dilemma', secondary:'Only two options', reveal:'"You\'re either with us or against us." Presents only 2 options when more exist.'}
  ]
))

tasks.push(teach('argumentation', 1, ['slippery_slope','circular_reasoning','appeal_to_emotion','bandwagon','hasty_generalization'],
  'Learn 5 more logical fallacies. These are subtler and harder to spot.',
  'These fallacies are especially common in persuasive writing and political speech.',
  'For each one, think of a real example you\'ve encountered recently.',
  null,
  [
    {primary:'Slippery Slope', secondary:'Chain reaction', reveal:'"If we allow X, then Y will happen, then Z." Assumes a chain of consequences without evidence for each link.'},
    {primary:'Circular Reasoning', secondary:'Begging the question', reveal:'"God exists because the Bible says so, and the Bible is true because it\'s God\'s word." The conclusion is hidden in the premise.'},
    {primary:'Appeal to Emotion', secondary:'Feelings over logic', reveal:'Using fear, pity, or anger instead of evidence. "Think of the children!" without showing actual harm.'},
    {primary:'Bandwagon', secondary:'Everyone does it', reveal:'"Everyone believes this, so it must be true." Popularity doesn\'t equal truth.'},
    {primary:'Hasty Generalization', secondary:'Too few examples', reveal:'"I met two rude people from that city, so everyone there is rude." Drawing broad conclusions from limited data.'}
  ]
))

tasks.push(fillBlank('argumentation', 1, ['ad_hominem','straw_man','slippery_slope','false_dilemma','circular_reasoning'],
  'Identify the fallacy in each example. Name it.',
  'Spotting fallacies in the wild is the real skill. These examples mimic real arguments.',
  'Read each example carefully and name the specific fallacy.',
  [
    {prompt:'"You can\'t trust his opinion on economics — he\'s a college dropout." This is an ___ fallacy.', answer:'ad hominem', hint:'Attacking the person, not the argument'},
    {prompt:'"If we legalize marijuana, next it\'ll be cocaine, then heroin." This is a ___ fallacy.', answer:'slippery slope', hint:'Assumed chain reaction without evidence'},
    {prompt:'"You either support this policy or you hate freedom." This is a ___ fallacy.', answer:'false dilemma (or false dichotomy)', hint:'Only two options presented'},
    {prompt:'"This is true because it\'s obviously correct." This is ___ reasoning.', answer:'circular', hint:'The conclusion is hidden in the premise'}
  ]
))

tasks.push(stepsTask('argumentation', 1, ['argument_construction','logic'],
  'Learn how to construct a valid argument in 4 steps.',
  'Most people state opinions without structure. Learning to build arguments makes your thinking — and your communication — dramatically clearer.',
  'Follow these steps next time you want to convince someone of anything.',
  null,
  [
    'Step 1: State your CONCLUSION clearly. What are you trying to prove?',
    'Step 2: Identify your PREMISES. What facts or principles support your conclusion?',
    'Step 3: Check VALIDITY. Does the conclusion actually follow from the premises? Or is there a logical gap?',
    'Step 4: Check SOUNDNESS. Are your premises actually true? Can you provide evidence for each one?'
  ]
))

tasks.push(fillBlank('argumentation', 1, ['validity','soundness','deduction','induction'],
  'Test your understanding of argument fundamentals.',
  'These distinctions are the foundation of all logical thinking.',
  'Think carefully — these are tricky.',
  [
    {prompt:'An argument is ___ if the conclusion follows logically from the premises, even if the premises are false.', answer:'valid', hint:'About structure, not truth'},
    {prompt:'An argument is ___ if it is valid AND all premises are true.', answer:'sound', hint:'Valid + true premises'},
    {prompt:'___ goes from general rules to specific cases and gives certain conclusions.', answer:'Deduction', hint:'All humans are mortal → Socrates is mortal'},
    {prompt:'___ goes from specific observations to general rules and gives probable conclusions.', answer:'Induction', hint:'The sun rose every day so far → it will rise tomorrow'}
  ]
))

// L2: Spot fallacies in real arguments, construct arguments
tasks.push(textTask('argumentation', 2, ['fallacy_detection','critical_analysis'],
  'Find the fallacy: "We should ban violent video games. Since they became popular, youth violence has increased. Clearly, the games cause violence." Name the fallacy and explain why it\'s wrong.',
  'Real-world fallacies are harder to spot than textbook examples because they\'re embedded in plausible-sounding arguments.',
  'Name the specific fallacy, explain why the reasoning is flawed, and suggest what evidence would actually be needed.',
  null
))

tasks.push(textTask('argumentation', 2, ['argument_construction','persuasion'],
  'Construct a valid argument for this conclusion: "Social media does more harm than good." Write 2-3 premises and check if your argument is sound.',
  'Building arguments is harder than critiquing them. You need premises that are both true AND logically lead to the conclusion.',
  'Write your premises, then honestly evaluate: are they true? Does the conclusion necessarily follow?',
  null
))

tasks.push(textTask('argumentation', 2, ['counterargument','steel_man'],
  'Steel-man exercise: take a position you DISAGREE with and argue FOR it as strongly as possible. Pick any controversial topic. Write 3-4 sentences.',
  'A "steel man" is the opposite of a straw man — you make the opposing argument as STRONG as possible. This is the most important skill in honest thinking.',
  'Choose something you genuinely disagree with. Argue for it so well that someone reading it would think you believe it.',
  null
))

tasks.push(textTask('argumentation', 2, ['socratic_questioning','assumptions'],
  'Pick a common belief: "Hard work always pays off." Use Socratic questioning to examine it. Write 4-5 questions that expose hidden assumptions.',
  'Socratic questioning doesn\'t attack a belief — it explores it until the person discovers its limits themselves.',
  'Each question should dig deeper than the last. Don\'t ask rhetorical questions — ask genuine ones.',
  'Example sequence: "What counts as hard work?" → "Pays off how — money, satisfaction, skill?" → "Can you think of someone who worked hard and didn\'t succeed?" → "What else besides hard work contributed to successes you\'ve seen?"'
))

tasks.push(pairsTask('argumentation', 2, ['deduction','induction'],
  'Compare deductive vs inductive arguments with real examples.',
  'Knowing which type of argument you\'re making (or hearing) tells you how much confidence the conclusion deserves.',
  'Notice: deduction gives certainty but is limited; induction is flexible but never certain.',
  [
    {left:'Deductive: All mammals breathe air. Whales are mammals. Therefore whales breathe air.', right:'Inductive: Every whale we\'ve observed breathes air. Therefore all whales probably breathe air.'},
    {left:'Certainty: if premises are true, conclusion MUST be true', right:'Probability: conclusion is LIKELY but could be wrong'},
    {left:'Risk: premises might be wrong or too narrow', right:'Risk: new evidence could overturn the conclusion'},
    {left:'Used in: math, logic, law', right:'Used in: science, everyday reasoning, predictions'}
  ]
))

tasks.push(fillBlank('argumentation', 2, ['fallacy_detection','bandwagon','appeal_to_emotion','hasty_generalization','red_herring'],
  'Identify the fallacy in each real-world example.',
  'These are modeled on actual arguments you\'d encounter in news, social media, and conversations.',
  'Name the specific fallacy for each.',
  [
    {prompt:'"90% of people surveyed agree this product is the best." This is a ___ fallacy.', answer:'bandwagon (or appeal to popularity)', hint:'Popularity ≠ truth'},
    {prompt:'"How can you worry about animal rights when children are starving?" This is a ___.', answer:'red herring', hint:'Changing the subject to something irrelevant'},
    {prompt:'"My friend went to Paris and got robbed. Paris is dangerous." This is a ___.', answer:'hasty generalization', hint:'One example → broad conclusion'},
    {prompt:'"Look at this photo of a suffering child. You MUST support our cause." This is an ___.', answer:'appeal to emotion', hint:'Feelings instead of evidence'}
  ]
))

tasks.push(textTask('argumentation', 2, ['argument_mapping','logic'],
  'Argument mapping: take this claim and break it into premises. "Democracy is the best form of government." Write 3 premises that would support this, then identify the weakest one.',
  'Argument mapping makes invisible reasoning visible. Most people hold conclusions without knowing what premises they\'re relying on.',
  'Write 3 premises, label each as strong or weak, and explain why the weakest one is vulnerable.',
  null
))

// L3: Deconstruct complex arguments, handle paradoxes
tasks.push(textTask('argumentation', 3, ['paradox','liar_paradox','logic'],
  'The Liar Paradox: "This statement is false." If it\'s true, then it\'s false. If it\'s false, then it\'s true. Is this a real problem for logic, or just a word game? Argue your position.',
  'Paradoxes aren\'t just puzzles — they reveal limits in our logical systems. The Liar Paradox contributed to Gödel\'s incompleteness theorems.',
  'Don\'t just describe the paradox — take a position on whether it matters and why.',
  null, 10
))

tasks.push(textTask('argumentation', 3, ['argument_analysis','real_world'],
  'Deconstruct this argument: "AI will take all jobs → mass unemployment → social collapse. Therefore we must ban AI development." Identify every logical gap.',
  'Complex real-world arguments often chain multiple claims together. Each link in the chain needs separate evaluation.',
  'For each step in the chain, ask: is this necessarily true? What evidence would you need? What alternatives exist?',
  null, 10
))

tasks.push(textTask('argumentation', 3, ['rhetoric','persuasion','ethics_of_argument'],
  'Is it ethical to use emotional persuasion (rhetoric) when you believe your cause is just? Or should arguments always be purely logical? Defend your position.',
  'This is a meta-question about argumentation itself. Plato condemned rhetoric as manipulation. Aristotle saw it as a legitimate tool.',
  'Consider: if logic alone can\'t motivate action, is emotional persuasion necessary for justice? Or does it open the door to manipulation?',
  null, 10
))


// ============================================================
// CRITICAL THINKING (30 tasks)
// ============================================================

// L1: Identify assumptions, fact vs opinion
tasks.push(teach('critical_thinking', 1, ['assumption','implicit_assumption','explicit_assumption'],
  'Learn to identify assumptions — the hidden beliefs that arguments depend on.',
  'Every argument rests on assumptions. Most are never stated. Finding them is the fastest way to evaluate any claim.',
  'An assumption is something the arguer takes for granted without proving it.',
  '"We should invest in space exploration because humanity\'s future depends on it." Assumption: humanity\'s future DOES depend on space. That\'s not proven — it\'s assumed.',
  [
    {primary:'Explicit Assumption', secondary:'Stated', reveal:'An assumption the arguer openly acknowledges. "Assuming the economy stays stable, we should invest."'},
    {primary:'Implicit Assumption', secondary:'Hidden', reveal:'An unstated belief the argument depends on. Often the arguer doesn\'t realize they\'re making it.'},
    {primary:'How to Find Them', secondary:'Method', reveal:'Ask: "What must be true for this conclusion to follow?" The gap between premises and conclusion = assumptions.'}
  ]
))

tasks.push(teach('critical_thinking', 1, ['fact','opinion','claim','evidence'],
  'Learn to distinguish facts, opinions, and claims. Most arguments mix all three.',
  'In an era of information overload, the ability to separate facts from opinions is essential.',
  'A fact can be verified. An opinion is a judgment. A claim is a statement that needs evidence.',
  null,
  [
    {primary:'Fact', secondary:'Verifiable', reveal:'"Water boils at 100°C at sea level." Can be tested and confirmed independently.'},
    {primary:'Opinion', secondary:'Judgment', reveal:'"Coffee tastes better than tea." A personal preference — can\'t be proven true or false.'},
    {primary:'Claim', secondary:'Needs evidence', reveal:'"Exercise reduces depression." Sounds factual but needs evidence. Could be true or false.'},
    {primary:'Informed Opinion', secondary:'Evidence-based judgment', reveal:'"Based on the data, this policy will likely reduce crime." A judgment supported by evidence — stronger than pure opinion.'}
  ]
))

tasks.push(teach('critical_thinking', 1, ['cognitive_bias','confirmation_bias','anchoring','dunning_kruger','availability_heuristic'],
  'Learn 4 cognitive biases that distort your thinking without you noticing.',
  'Cognitive biases are systematic errors in thinking. Everyone has them. Knowing them doesn\'t eliminate them, but it helps you catch yourself.',
  'For each bias, think of a time it might have affected YOUR thinking.',
  null,
  [
    {primary:'Confirmation Bias', secondary:'Most common', reveal:'You seek out information that confirms what you already believe and ignore contradicting evidence.'},
    {primary:'Anchoring', secondary:'First number wins', reveal:'The first piece of information you hear disproportionately influences your judgment. "Was Gandhi older or younger than 140 when he died?"'},
    {primary:'Dunning-Kruger', secondary:'Confidence gap', reveal:'Beginners overestimate their ability; experts underestimate theirs. The less you know, the more confident you feel.'},
    {primary:'Availability Heuristic', secondary:'Easy = likely', reveal:'You judge probability by how easily examples come to mind. Plane crashes feel common because they\'re memorable, not because they\'re frequent.'}
  ]
))

tasks.push(fillBlank('critical_thinking', 1, ['cognitive_bias','confirmation_bias','anchoring','dunning_kruger'],
  'Test your knowledge of cognitive biases.',
  'Naming the bias is the first step to catching it in yourself.',
  'Identify which bias each example demonstrates.',
  [
    {prompt:'You Google "is coffee healthy?" instead of "effects of coffee on health." This is ___ bias.', answer:'confirmation', hint:'You\'re seeking evidence for what you already believe'},
    {prompt:'A car salesman shows you the $80,000 model first, making the $40,000 model seem cheap. This is ___.', answer:'anchoring', hint:'The first number sets the reference point'},
    {prompt:'After taking one coding class, you feel confident you could build any app. This might be the ___-___ effect.', answer:'Dunning-Kruger', hint:'Beginners overestimate their ability'},
    {prompt:'You think shark attacks are common because you saw one on the news. This is the ___ heuristic.', answer:'availability', hint:'Easy to recall = seems more likely'}
  ]
))

tasks.push(teach('critical_thinking', 1, ['source_evaluation','credibility','bias_detection'],
  'Learn how to evaluate the credibility of a source in 4 dimensions.',
  'Not all sources are equal. A peer-reviewed study, a blog post, and a tweet all make claims — but their credibility differs enormously.',
  'Apply these 4 checks to the next article or claim you encounter.',
  null,
  [
    {primary:'Expertise', secondary:'Who\'s saying it?', reveal:'Is the author qualified in this specific field? A physicist isn\'t an authority on nutrition.'},
    {primary:'Evidence', secondary:'What supports it?', reveal:'Does the claim cite data, studies, or examples? Or is it just assertion?'},
    {primary:'Bias', secondary:'What\'s the motive?', reveal:'Does the source have a financial, political, or personal interest in you believing this?'},
    {primary:'Consensus', secondary:'What do others say?', reveal:'Does this claim align with expert consensus? Outlier claims need stronger evidence.'}
  ]
))

tasks.push(stepsTask('critical_thinking', 1, ['critical_reading','analysis'],
  'Learn a 4-step method for critically reading any article or argument.',
  'Most people read passively — absorbing claims without evaluating them. Critical reading is active: you interrogate the text.',
  'Practice this on the next article you read.',
  null,
  [
    'Step 1: What is the MAIN CLAIM? State it in one sentence.',
    'Step 2: What EVIDENCE is provided? List the specific facts, data, or examples cited.',
    'Step 3: What ASSUMPTIONS are being made? What must be true for the argument to work?',
    'Step 4: What\'s MISSING? What counterevidence or alternative explanations are not mentioned?'
  ]
))

// L2: Evaluate evidence, recognize bias, analyze media
tasks.push(textTask('critical_thinking', 2, ['assumption_detection','analysis'],
  'Find the hidden assumptions: "We should teach coding in all schools because technology jobs are the future." List at least 3 assumptions this argument makes.',
  'This is a common argument that sounds obvious — which makes its assumptions harder to spot.',
  'For each assumption, explain why it might not be true.',
  'Possible assumptions: (1) Technology jobs will remain dominant, (2) Coding is the best way to prepare for tech jobs, (3) Schools are the right place to teach coding, (4) Current curriculum has room for coding...'
))

tasks.push(textTask('critical_thinking', 2, ['media_literacy','bias_detection'],
  'Take any recent news headline you remember. Identify: what framing choices were made? What alternative framing could tell a different story?',
  'Headlines are never neutral — word choice, emphasis, and what\'s omitted all shape perception.',
  'Write the headline, identify 2 framing choices, and rewrite it with a different frame.',
  '"Protesters clash with police" vs "Police use force against protesters" — same event, different framing. Who\'s the agent? Who\'s the subject?'
))

tasks.push(textTask('critical_thinking', 2, ['correlation_causation','statistics','evidence'],
  '"Countries with more ice cream sales have higher crime rates." Does ice cream cause crime? Explain why correlation ≠ causation and identify the likely real explanation.',
  'Confusing correlation with causation is one of the most common reasoning errors, especially when statistics are involved.',
  'Explain the error, identify the confounding variable, and give another example of a spurious correlation.',
  null
))

tasks.push(textTask('critical_thinking', 2, ['cognitive_bias','self_awareness'],
  'Think of a strong opinion you hold. Now honestly ask: what evidence would change your mind? If the answer is "nothing," that\'s a red flag. Write 3-4 sentences.',
  'Karl Popper argued that a belief that can\'t be falsified isn\'t a real belief — it\'s a dogma. Knowing what would change your mind is a sign of intellectual honesty.',
  'Name the opinion, state what evidence would change it, and honestly assess whether you\'d actually update if you saw that evidence.',
  null
))

tasks.push(fillBlank('critical_thinking', 2, ['correlation_causation','source_evaluation','cognitive_bias'],
  'Test your critical thinking skills with these scenarios.',
  'These require application, not just recall.',
  'Think through each scenario carefully.',
  [
    {prompt:'Two things happening together doesn\'t mean one causes the other. This error is called confusing ___ with ___.', answer:'correlation, causation', hint:'Ice cream sales and crime both rise in summer'},
    {prompt:'A study funded by a soda company finds that sugar isn\'t harmful. The main concern is ___.', answer:'bias (or conflict of interest)', hint:'Who paid for the research?'},
    {prompt:'You remember your correct predictions but forget your wrong ones. This is ___ bias.', answer:'confirmation', hint:'You selectively remember evidence that supports your beliefs'},
    {prompt:'Karl Popper said a claim that can\'t be proven wrong isn\'t scientific — it\'s not ___.', answer:'falsifiable', hint:'The criterion for scientific claims'}
  ]
))

tasks.push(textTask('critical_thinking', 2, ['thought_experiment','moral_reasoning'],
  'The Experience Machine: a machine can give you any experience you want — you\'d believe it\'s real. Would you plug in permanently? Why or why not?',
  'Robert Nozick designed this to test whether happiness is all that matters. If you wouldn\'t plug in, something besides pleasure matters to you.',
  'State your choice and explain what it reveals about your values. What matters to you beyond feeling good?',
  null
))

tasks.push(textTask('critical_thinking', 2, ['systems_thinking','second_order_effects'],
  'Second-order thinking: "A city bans all cars from downtown." What happens first? Then what happens as a result of THAT? Trace 3 levels of consequences.',
  'First-order thinking asks "what happens?" Second-order asks "and then what?" Most bad decisions come from stopping at the first order.',
  'Level 1: immediate effect. Level 2: what that causes. Level 3: what THAT causes. Include both positive and negative consequences.',
  null
))

// L3: Synthesize perspectives, meta-cognition
tasks.push(textTask('critical_thinking', 3, ['epistemic_humility','knowledge_limits'],
  'What is something you\'re confident about that you might be wrong about? How would you know if you were wrong? Write 4-5 sentences exploring this honestly.',
  'Epistemic humility — knowing the limits of your knowledge — is the hardest intellectual virtue. It requires admitting uncertainty about things you feel certain about.',
  'Pick something you\'re genuinely confident about (not a trivial example). Explore how you could be wrong.',
  null, 10
))

tasks.push(textTask('critical_thinking', 3, ['meta_cognition','thinking_about_thinking'],
  'Meta-cognition exercise: describe HOW you make decisions. When you face a choice, what\'s your actual process? Is it rational, emotional, habitual? Write 4-5 sentences.',
  'Most people have never examined their own decision-making process. Understanding it is the first step to improving it.',
  'Be honest, not aspirational. Describe how you ACTUALLY decide, not how you think you should.',
  null, 10
))

tasks.push(textTask('critical_thinking', 3, ['perspective_taking','empathy','reasoning'],
  'Pick a political or social issue you feel strongly about. Write the strongest possible argument for the OTHER side — so strong that someone on that side would nod along.',
  'This is the ultimate critical thinking exercise. If you can\'t articulate the opposing view charitably, you don\'t fully understand the issue.',
  'Write 4-5 sentences. The test: would someone who holds this view say "yes, that\'s exactly my position"?',
  null, 10
))


// ============================================================
// APPLIED PHILOSOPHY (30 tasks)
// ============================================================

// L1: Practical philosophy basics — Stoicism, Existentialism, mindfulness
tasks.push(teach('applied_philosophy', 1, ['stoicism','dichotomy_of_control','epictetus','marcus_aurelius'],
  'Learn the Stoic Dichotomy of Control — the most practical idea in all of philosophy.',
  'Stoicism isn\'t about suppressing emotions. It\'s about focusing energy on what you can actually change and accepting what you can\'t.',
  'For each item, think about how it applies to something stressing you RIGHT NOW.',
  null,
  [
    {primary:'What You Control', secondary:'Focus here', reveal:'Your opinions, desires, actions, responses. Your effort, attitude, and choices.'},
    {primary:'What You Don\'t Control', secondary:'Accept this', reveal:'Other people\'s actions, the weather, the economy, the past, your reputation, outcomes.'},
    {primary:'The Practice', secondary:'Daily', reveal:'When stressed, ask: "Is this within my control?" If yes → act. If no → accept and redirect energy.'},
    {primary:'Marcus Aurelius', secondary:'Emperor + Stoic', reveal:'"You have power over your mind, not outside events. Realize this, and you will find strength."'}
  ]
))

tasks.push(teach('applied_philosophy', 1, ['existentialism','authenticity','bad_faith','sartre'],
  'Learn Existentialist authenticity — are you living YOUR life or the life others expect?',
  'Sartre argued most people live in "bad faith" — pretending they have no choice when they actually do. Authenticity means owning your freedom.',
  'Think about areas of your life where you say "I have to" when you really mean "I choose to" (or "I\'m afraid to choose otherwise").',
  null,
  [
    {primary:'Authenticity', secondary:'Core concept', reveal:'Living according to your own values and choices, not conforming to external expectations or social roles.'},
    {primary:'Bad Faith', secondary:'Self-deception', reveal:'Pretending you have no choice. "I have to stay in this job" when you mean "I\'m afraid to leave."'},
    {primary:'Radical Freedom', secondary:'Sartre', reveal:'You are always free to choose. Even not choosing is a choice. This freedom is both liberating and terrifying.'},
    {primary:'Responsibility', secondary:'The cost', reveal:'If you\'re free, you\'re responsible. You can\'t blame circumstances, upbringing, or society. Your life is your project.'}
  ]
))

tasks.push(teach('applied_philosophy', 1, ['memento_mori','death','seneca','epicurus_death'],
  'Learn how philosophers think about death — and why it\'s the key to living well.',
  'Every major philosophical tradition addresses death. Not morbidly — as a tool for clarity about what matters.',
  'This isn\'t depressing — it\'s clarifying. "Memento mori" (remember you will die) is meant to sharpen your priorities.',
  null,
  [
    {primary:'Memento Mori', secondary:'Stoic practice', reveal:'"Remember you will die." Not morbid — it\'s a daily reminder to not waste time on things that don\'t matter.'},
    {primary:'Seneca', secondary:'On time', reveal:'"It is not that we have a short time to live, but that we waste a great deal of it." Life is long enough if you use it well.'},
    {primary:'Epicurus', secondary:'No fear', reveal:'"Death is nothing to us. When we exist, death is not. When death exists, we are not." There\'s nothing to fear.'},
    {primary:'Heidegger', secondary:'Being-toward-death', reveal:'Awareness of death is what makes life meaningful. Without finitude, nothing would matter or feel urgent.'}
  ]
))

tasks.push(fillBlank('applied_philosophy', 1, ['stoicism','existentialism','memento_mori'],
  'Test your knowledge of practical philosophy concepts.',
  'These ideas are only useful if you can recall them when you need them.',
  'Answer from memory.',
  [
    {prompt:'The Stoic Dichotomy of Control says: focus on what you can ___, accept what you ___.', answer:'control, can\'t (control)', hint:'Epictetus\'s core teaching'},
    {prompt:'Sartre called it "___ faith" when people pretend they have no choice.', answer:'bad', hint:'Self-deception about freedom'},
    {prompt:'"___ mori" is the Stoic practice of remembering you will die.', answer:'Memento', hint:'Latin phrase — "remember death"'},
    {prompt:'Epicurus argued death is nothing to fear because when death exists, ___ are not.', answer:'we', hint:'You can\'t experience non-existence'}
  ]
))

tasks.push(teach('applied_philosophy', 1, ['amor_fati','nietzsche','eternal_recurrence','affirmation'],
  'Learn Nietzsche\'s Amor Fati and Eternal Recurrence — loving your fate, including the suffering.',
  'Nietzsche didn\'t just accept suffering — he argued you should LOVE it, because it\'s inseparable from everything good in your life.',
  'The eternal recurrence is a thought experiment: would you live your exact life again, infinitely? If not, what would you change?',
  null,
  [
    {primary:'Amor Fati', secondary:'Love of fate', reveal:'"My formula for greatness: amor fati — not merely bear what is necessary, but love it." Embrace everything that happens.'},
    {primary:'Eternal Recurrence', secondary:'Thought experiment', reveal:'Imagine living your exact life — every joy and every pain — infinitely on repeat. Can you say YES to that?'},
    {primary:'The Test', secondary:'How to use it', reveal:'If you wouldn\'t want to relive a moment forever, it reveals what you\'d change. It\'s a compass for authentic living.'},
    {primary:'Will to Power', secondary:'Misunderstood', reveal:'Not domination over others — it\'s the drive to overcome yourself, to grow, to become who you are.'}
  ]
))

tasks.push(teach('applied_philosophy', 1, ['buddhism','four_noble_truths','attachment','mindfulness'],
  'Learn the Buddhist Four Noble Truths — a philosophical framework for understanding suffering.',
  'Buddhism is as much philosophy as religion. The Four Noble Truths are a logical argument: diagnosis, cause, prognosis, treatment.',
  'You don\'t need to be Buddhist to find this framework useful. It\'s a practical analysis of why we suffer and what to do about it.',
  null,
  [
    {primary:'1. Dukkha', secondary:'Life involves suffering', reveal:'Suffering, dissatisfaction, and impermanence are inherent in life. Even good things end.'},
    {primary:'2. Samudaya', secondary:'Cause of suffering', reveal:'Suffering arises from attachment — craving things to be different from how they are.'},
    {primary:'3. Nirodha', secondary:'End of suffering', reveal:'Suffering can end. By releasing attachment, you find peace — not by getting what you want, but by changing your relationship to wanting.'},
    {primary:'4. Magga', secondary:'The path', reveal:'The Eightfold Path: right understanding, intention, speech, action, livelihood, effort, mindfulness, concentration.'}
  ]
))

tasks.push(stepsTask('applied_philosophy', 1, ['stoic_journaling','evening_review','self_examination'],
  'Learn the Stoic Evening Review — a 5-minute daily practice used by Marcus Aurelius and Seneca.',
  'Seneca reviewed his day every evening: "What bad habit did I cure today? What temptation did I resist? In what way am I better?" This is philosophy as daily practice.',
  'Try this tonight before bed.',
  null,
  [
    'At the end of the day, sit quietly for 5 minutes.',
    'Ask: "What did I do well today?" — acknowledge your good actions without ego.',
    'Ask: "Where did I fall short?" — not to punish yourself, but to learn.',
    'Ask: "What was outside my control that I wasted energy on?"',
    'Ask: "What will I do differently tomorrow?"',
    'Write brief answers. Over weeks, patterns emerge that reveal your character.'
  ]
))

// L2: Apply philosophy to real situations
tasks.push(textTask('applied_philosophy', 2, ['stoicism','dichotomy_of_control'],
  'Think of something stressing you right now. Apply the Stoic Dichotomy of Control: what can you control about this situation? What can\'t you control? Write it out.',
  'This isn\'t abstract philosophy — it\'s a practical tool. Separating controllables from uncontrollables immediately reduces anxiety.',
  'Be specific. Name the actual situation, list what\'s in your control, and list what isn\'t. Then: where should you focus your energy?',
  null
))

tasks.push(textTask('applied_philosophy', 2, ['existentialism','authenticity','bad_faith'],
  'Identify one area of your life where you might be living in "bad faith" — telling yourself you have no choice when you actually do. Write 3-4 sentences.',
  'This is uncomfortable but valuable. Bad faith is invisible until you look for it.',
  'Be honest. The point isn\'t to judge yourself — it\'s to see where you\'re giving away your freedom unnecessarily.',
  null
))

tasks.push(textTask('applied_philosophy', 2, ['eternal_recurrence','nietzsche','life_audit'],
  'Nietzsche\'s test: if you had to live this exact week on infinite repeat — every moment, every feeling — would you say yes? What would you change? Write 3-4 sentences.',
  'This thought experiment cuts through rationalization. It reveals what you actually value vs. what you tolerate.',
  'Be specific about what you\'d keep and what you\'d change. The changes reveal your real priorities.',
  null
))

tasks.push(textTask('applied_philosophy', 2, ['buddhism','attachment','suffering'],
  'Think of something you\'re currently wanting or craving. Apply the Buddhist lens: is the suffering coming from the situation itself, or from your attachment to a specific outcome? Write 3-4 sentences.',
  'Buddhism doesn\'t say "don\'t want things." It says: notice how attachment to outcomes creates suffering, and practice holding desires more lightly.',
  'Name the craving, identify the attachment, and explore what changes if you release the attachment to the specific outcome.',
  null
))

tasks.push(textTask('applied_philosophy', 2, ['virtue_ethics','character','daily_practice'],
  'Pick one Aristotelian virtue (courage, temperance, justice, wisdom, generosity, honesty). How did you practice it today — or fail to? Write 3-4 sentences.',
  'Aristotle said virtues are habits, not decisions. You become courageous by practicing courage. This task builds the habit of noticing.',
  'Be specific. Don\'t say "I was honest." Say "When my colleague asked about the project, I admitted we were behind instead of deflecting."',
  null
))

tasks.push(textTask('applied_philosophy', 2, ['memento_mori','priorities','seneca'],
  'Memento mori exercise: if you had exactly one year left, what would you stop doing? What would you start? Write 3-4 sentences.',
  'This isn\'t morbid — it\'s clarifying. The gap between how you\'d live with one year left and how you\'re living now reveals your real priorities.',
  'Be honest about what you\'d drop. Those things might not deserve the time you\'re giving them now.',
  null
))

tasks.push(fillBlank('applied_philosophy', 2, ['stoicism','buddhism','existentialism','nietzsche'],
  'Test your ability to apply philosophical concepts to real situations.',
  'These require understanding, not just recall.',
  'Think through each scenario.',
  [
    {prompt:'When stuck in traffic and getting angry, a Stoic would ask: "Is this within my ___?"', answer:'control', hint:'Dichotomy of control — traffic isn\'t'},
    {prompt:'A Buddhist would say your frustration comes not from the traffic but from your ___ to arriving on time.', answer:'attachment', hint:'The craving for a specific outcome'},
    {prompt:'An existentialist would say you ___ to drive this route at this time — own that choice.', answer:'chose (or choose)', hint:'Radical freedom — even "I have to" is a choice'},
    {prompt:'Nietzsche\'s amor fati would say: don\'t just tolerate the traffic — ___ it as part of your life.', answer:'love (or embrace)', hint:'Love of fate — all of it'}
  ]
))

tasks.push(pairsTask('applied_philosophy', 2, ['stoicism','buddhism'],
  'Compare Stoicism and Buddhism — two traditions that arrived at remarkably similar conclusions independently.',
  'Stoicism (Greek, 300 BC) and Buddhism (Indian, 500 BC) developed without contact but share deep similarities.',
  'Notice both the overlaps and the differences.',
  [
    {left:'Stoicism: Suffering comes from judging things as good or bad', right:'Buddhism: Suffering comes from attachment to outcomes'},
    {left:'Focus on what you can control, accept the rest', right:'Release attachment to all outcomes, find peace'},
    {left:'Goal: Virtue and rational living (eudaimonia)', right:'Goal: End of suffering and awakening (nirvana)'},
    {left:'Method: Reason, journaling, self-examination', right:'Method: Meditation, mindfulness, the Eightfold Path'}
  ]
))

tasks.push(textTask('applied_philosophy', 2, ['philosophy_of_work','meaning','alienation','marx'],
  'Is your work meaningful? Apply philosophy: Marx said alienation comes from disconnection between worker and product. Do you feel connected to what you produce? Write 3-4 sentences.',
  'Philosophy of work asks: why do we work? For money, meaning, identity, contribution? Most people never examine this.',
  'Be honest about whether your work feels meaningful and why or why not. What would need to change?',
  null
))

// L3: Build personal philosophy, complex life situations
tasks.push(textTask('applied_philosophy', 3, ['personal_philosophy','values','principles'],
  'Write your personal philosophy of life in 5-6 sentences. What do you believe about how to live well? What principles guide your decisions?',
  'Most people have never articulated their philosophy of life. Writing it forces clarity — and reveals contradictions.',
  'Don\'t write what sounds good. Write what you actually believe and practice. Include at least one principle you struggle to follow.',
  null, 10
))

tasks.push(textTask('applied_philosophy', 3, ['moral_dilemma','applied_ethics','real_life'],
  'A close friend confides they\'re cheating on their partner — someone you also know and care about. What do you do? Apply at least 2 philosophical frameworks to analyze this.',
  'Real moral dilemmas don\'t come with clean answers. The value is in thinking through competing obligations systematically.',
  'Consider: loyalty to friend, honesty, harm prevention, autonomy. What does each framework recommend? What would you actually do?',
  null, 10
))

tasks.push(textTask('applied_philosophy', 3, ['technology_ethics','ai','philosophy_of_mind'],
  'Should AI systems have rights? At what point (if ever) would an artificial system deserve moral consideration? Argue your position in 5-6 sentences.',
  'This combines philosophy of mind (what is consciousness?), ethics (what deserves moral status?), and applied philosophy (how do we treat AI?).',
  'Address: what criterion determines moral status — consciousness, suffering, intelligence, something else? Apply it consistently.',
  null, 10
))

tasks.push(textTask('applied_philosophy', 3, ['death','meaning','legacy','philosophy_of_life'],
  'You\'re 80 years old, looking back on your life. What would make you say "I lived well"? Write 4-5 sentences from that future perspective.',
  'This is the ultimate applied philosophy exercise. It connects abstract questions about meaning to your actual life.',
  'Write as your 80-year-old self. What mattered? What didn\'t? What do you wish you\'d done differently?',
  null, 10
))

// ============================================================
// Write the file
// ============================================================

// ============================================================
// ADDITIONAL TASKS — filling to 150
// ============================================================

// --- More Philosophical Literacy ---
tasks.push(teach('philosophical_literacy', 1, ['aesthetics','philosophy_of_art','beauty'],
  'Learn Aesthetics — the philosophy of beauty, art, and taste. What makes something beautiful?',
  'Aesthetics is the often-forgotten fourth branch of philosophy. It asks questions that matter every time you experience art, music, or nature.',
  'Is beauty objective (in the object) or subjective (in the observer)? This is the central question.',
  null,
  [
    {primary:'Aesthetics', secondary:'Branch of philosophy', reveal:'The study of beauty, art, and taste. What makes something beautiful? Is beauty objective or subjective?'},
    {primary:'Kant on Beauty', secondary:'Subjective universality', reveal:'Beauty is subjective (a feeling) but we expect others to agree — "this sunset IS beautiful, not just to me."'},
    {primary:'Tolstoy on Art', secondary:'Communication of feeling', reveal:'Art is good when it transmits genuine emotion from artist to audience. Technique without feeling isn\'t art.'}
  ]
))

tasks.push(teach('philosophical_literacy', 1, ['philosophy_of_language','wittgenstein','meaning'],
  'Learn the basics of Philosophy of Language — how do words mean things?',
  'Wittgenstein argued that the meaning of a word is its USE in language, not some abstract definition. This changed everything.',
  'Think about the word "game." Can you define it? Wittgenstein showed you can\'t — games share "family resemblances" but no single definition.',
  null,
  [
    {primary:'Wittgenstein', secondary:'Language games', reveal:'Words get meaning from how they\'re used in context ("language games"), not from pointing at things.'},
    {primary:'Sapir-Whorf', secondary:'Language shapes thought', reveal:'The language you speak influences how you think. Different languages carve up reality differently.'},
    {primary:'Performative Speech', secondary:'Austin', reveal:'Some sentences DO things rather than describe things. "I promise" creates an obligation. "I do" (at a wedding) changes your legal status.'}
  ]
))

tasks.push(fillBlank('philosophical_literacy', 2, ['phenomenology','existentialism','heidegger','husserl'],
  'Test your knowledge of phenomenology and existentialism.',
  'These movements shaped 20th century thought.',
  'Answer from memory.',
  [
    {prompt:'Husserl\'s method of "___" means setting aside assumptions to study pure experience.', answer:'bracketing (or epoché)', hint:'Suspending judgment about whether things are real'},
    {prompt:'Heidegger said we don\'t observe the world from outside — we\'re always already ___ in it.', answer:'embedded (or thrown/immersed)', hint:'Being-in-the-world'},
    {prompt:'Sartre\'s famous claim: "___ precedes essence" means you exist first, then define yourself.', answer:'existence', hint:'You\'re not born with a purpose'},
    {prompt:'___ is the concept that consciousness is always consciousness OF something.', answer:'Intentionality', hint:'You can\'t just "be aware" — awareness is always directed'}
  ]
))

tasks.push(textTask('philosophical_literacy', 2, ['philosophy_of_science','kuhn','paradigm_shift'],
  'Thomas Kuhn argued science doesn\'t progress smoothly — it has "paradigm shifts" where the whole framework changes. Give an example and explain why this matters.',
  'Kuhn\'s insight: scientists don\'t just add facts — sometimes the entire way of seeing the world changes (Newtonian → Einsteinian physics).',
  'Name a paradigm shift (in science or another field), explain what changed, and why gradual progress couldn\'t have gotten there.',
  null
))

tasks.push(textTask('philosophical_literacy', 3, ['postmodernism','truth','relativism','foucault','derrida'],
  'Postmodernism claims there are no objective "grand narratives" — all knowledge is shaped by power. Is this liberating or dangerous? Argue your position.',
  'Postmodernism (Foucault, Derrida, Lyotard) challenged the idea that science, history, or philosophy can give us objective truth.',
  'Address both sides: how is questioning grand narratives valuable? And what are the risks of saying "there\'s no objective truth"?',
  null, 10
))

// --- More Ethics ---
tasks.push(teach('ethics', 1, ['consent','autonomy','paternalism'],
  'Learn the concept of autonomy and consent — when is it okay to override someone\'s choices "for their own good"?',
  'The tension between autonomy (your right to choose) and paternalism (others overriding your choice for your benefit) is everywhere: seatbelt laws, drug policy, medical decisions.',
  'Think about where YOU draw the line between respecting autonomy and protecting people from themselves.',
  null,
  [
    {primary:'Autonomy', secondary:'Self-governance', reveal:'The right to make your own decisions about your own life, even bad ones.'},
    {primary:'Paternalism', secondary:'Override for your good', reveal:'Restricting someone\'s freedom for their own benefit. Seatbelt laws, banning drugs, involuntary psychiatric holds.'},
    {primary:'Informed Consent', secondary:'Medical ethics', reveal:'You can only agree to something if you understand the risks. Doctors must explain before you can consent to treatment.'}
  ]
))

tasks.push(textTask('ethics', 2, ['distributive_justice','equality','equity','fairness'],
  'Equality vs Equity: giving everyone the same thing vs giving everyone what they need. Which is more just? Argue your position with an example.',
  'This distinction drives debates about taxation, education funding, healthcare, and affirmative action.',
  'Use a specific example (not the famous fence/boxes image). Show why your preferred approach is more just.',
  null
))

tasks.push(textTask('ethics', 2, ['environmental_ethics','future_generations','climate'],
  'Do we have moral obligations to people who don\'t exist yet (future generations)? If yes, how strong? If no, why not? Write 3-4 sentences.',
  'Climate change forces this question: should we sacrifice now for people who won\'t be born for decades? Can you have obligations to someone who doesn\'t exist?',
  'Address: can non-existent people have rights? How do you weigh present suffering against future suffering?',
  null
))

tasks.push(textTask('ethics', 3, ['trolley_problem','moral_intuition','ethics_methodology'],
  'Should we trust our moral intuitions? The trolley problem shows our intuitions are inconsistent (pull lever yes, push person no). Does that mean intuitions are unreliable, or that the situations are genuinely different?',
  'This is a meta-ethical question: what\'s the relationship between moral theories and moral intuitions? When they conflict, which should win?',
  'Argue either: (a) intuitions should be revised to match theory, or (b) theories should be revised to match intuitions. Give reasons.',
  null, 10
))

// --- More Argumentation ---
tasks.push(teach('argumentation', 1, ['modus_ponens','modus_tollens','formal_logic'],
  'Learn 2 fundamental argument forms: Modus Ponens and Modus Tollens.',
  'These are the two most basic valid argument structures. Every complex argument is built from combinations of these.',
  'Once you see these patterns, you\'ll recognize them everywhere.',
  null,
  [
    {primary:'Modus Ponens', secondary:'Affirming the antecedent', reveal:'If P then Q. P is true. Therefore Q. Example: "If it rains, the ground is wet. It\'s raining. Therefore the ground is wet."'},
    {primary:'Modus Tollens', secondary:'Denying the consequent', reveal:'If P then Q. Q is false. Therefore P is false. Example: "If it rained, the ground would be wet. The ground is dry. Therefore it didn\'t rain."'},
    {primary:'Invalid: Affirming Consequent', secondary:'Common error', reveal:'"If it rains, ground is wet. Ground is wet. Therefore it rained." WRONG — sprinklers could have caused it.'}
  ]
))

tasks.push(fillBlank('argumentation', 1, ['modus_ponens','modus_tollens','formal_logic'],
  'Test your understanding of basic argument forms.',
  'These patterns are the building blocks of all logical reasoning.',
  'Identify the argument form in each example.',
  [
    {prompt:'"If you study, you\'ll pass. You studied. Therefore you\'ll pass." This is modus ___.', answer:'ponens', hint:'Affirming the "if" part'},
    {prompt:'"If it\'s a mammal, it\'s warm-blooded. It\'s not warm-blooded. Therefore it\'s not a mammal." This is modus ___.', answer:'tollens', hint:'Denying the "then" part'},
    {prompt:'"If it\'s raining, the ground is wet. The ground is wet. Therefore it\'s raining." This is ___ (valid/invalid).', answer:'invalid (affirming the consequent)', hint:'The ground could be wet for other reasons'}
  ]
))

tasks.push(textTask('argumentation', 2, ['devil_advocate','argument_strength'],
  'Play devil\'s advocate: "University education is overrated and not worth the cost." Build the strongest possible case for this claim in 4-5 sentences.',
  'Arguing for positions you disagree with strengthens your reasoning. You can\'t refute what you can\'t articulate.',
  'Use real evidence and logic, not straw-man arguments. Make it genuinely persuasive.',
  null
))

tasks.push(textTask('argumentation', 2, ['argument_analysis','hidden_premises'],
  'Find the hidden premise: "She\'s a doctor, so she must be smart." What unstated assumption connects "doctor" to "smart"? Then evaluate: is the hidden premise true?',
  'Most real-world arguments skip premises that seem "obvious." Finding them reveals where arguments are weakest.',
  'State the hidden premise explicitly, then evaluate whether it\'s always true, sometimes true, or false.',
  null
))

tasks.push(textTask('argumentation', 3, ['paradox','sorites','vagueness'],
  'The Sorites Paradox: if you remove one grain from a heap of sand, it\'s still a heap. Keep removing grains — when does it stop being a heap? Is this a real problem or just vague language?',
  'This paradox challenges the idea that our concepts have sharp boundaries. It applies to: when does a person become "old"? When is someone "bald"? When is a fetus a "person"?',
  'Take a position: is vagueness a problem with language, with reality, or with our thinking? Why does it matter?',
  null, 10
))

// --- More Critical Thinking ---
tasks.push(teach('critical_thinking', 1, ['sunk_cost','decision_making','rationality'],
  'Learn the Sunk Cost Fallacy — why "I\'ve already invested so much" is terrible reasoning.',
  'The sunk cost fallacy makes people stay in bad jobs, finish bad movies, and continue losing investments. It\'s one of the most expensive cognitive errors.',
  'The rule: past costs are irrelevant to future decisions. Only future costs and benefits matter.',
  null,
  [
    {primary:'Sunk Cost Fallacy', secondary:'Definition', reveal:'Continuing something because of past investment (time, money, effort) rather than future value. "I\'ve read 200 pages, I should finish the book."'},
    {primary:'Why It Happens', secondary:'Loss aversion', reveal:'We hate "wasting" past investment more than we value future gains. Quitting feels like admitting the past was wasted.'},
    {primary:'The Fix', secondary:'Ask the right question', reveal:'Don\'t ask "how much have I invested?" Ask "knowing what I know now, would I START this today?" If no, stop.'}
  ]
))

tasks.push(textTask('critical_thinking', 2, ['sunk_cost','decision_making'],
  'Think of something you\'re continuing mainly because you\'ve already invested time/money/effort in it. Apply the sunk cost test: if you were starting fresh today, would you begin this? Write 3-4 sentences.',
  'This is one of the most practically useful exercises in critical thinking. Most people have at least one sunk cost trap in their life.',
  'Be honest. Name the thing, acknowledge the sunk cost, and evaluate whether the FUTURE value justifies continuing.',
  null
))

tasks.push(textTask('critical_thinking', 2, ['steelman','charitable_interpretation'],
  'Principle of Charity: take the worst argument you\'ve seen on social media recently. Restate it in the strongest, most reasonable form possible.',
  'The Principle of Charity says: always interpret arguments in their strongest form before critiquing them. This prevents attacking straw men.',
  'Find the kernel of truth or legitimate concern in the bad argument. Restate it so the original person would say "yes, that\'s what I meant."',
  null
))

tasks.push(fillBlank('critical_thinking', 2, ['sunk_cost','confirmation_bias','dunning_kruger','anchoring'],
  'Match the cognitive bias to the real-world scenario.',
  'Recognizing biases in context is the real skill.',
  'Name the specific bias.',
  [
    {prompt:'You keep watching a terrible movie because you paid $15 for the ticket. This is the ___ ___ fallacy.', answer:'sunk cost', hint:'Past investment shouldn\'t affect future decisions'},
    {prompt:'After seeing a house listed at $500K, a $350K house seems like a bargain (even if it\'s overpriced). This is ___.', answer:'anchoring', hint:'The first number sets your reference point'},
    {prompt:'You read 10 articles supporting your view and ignore 3 that challenge it. This is ___ bias.', answer:'confirmation', hint:'Seeking evidence that agrees with you'},
    {prompt:'After one week of guitar lessons, you think you could perform at an open mic. This might be ___-___.', answer:'Dunning-Kruger', hint:'Beginners overestimate their skill'}
  ]
))

tasks.push(textTask('critical_thinking', 3, ['intellectual_virtues','wisdom','humility'],
  'What\'s the difference between being smart and being wise? Define wisdom in your own words, then give an example of someone who is smart but not wise, and someone who is wise but not conventionally smart.',
  'Philosophy has always distinguished knowledge (knowing facts) from wisdom (knowing how to live). Our culture rewards the former but needs the latter.',
  'Your definition should be specific enough to distinguish wisdom from intelligence, education, and experience.',
  null, 10
))

// --- More Applied Philosophy ---
tasks.push(textTask('applied_philosophy', 1, ['stoicism','negative_visualization','premeditatio_malorum'],
  'Stoic exercise — Negative Visualization: imagine losing something you value (health, a relationship, your job). How does this change your appreciation for it right now? Write 3-4 sentences.',
  'The Stoics practiced "premeditatio malorum" — imagining bad outcomes not to worry, but to appreciate what you have and prepare for loss.',
  'Pick something specific you take for granted. Imagine it\'s gone. Notice how your feelings about it change.',
  null
))

tasks.push(textTask('applied_philosophy', 1, ['examined_life','socrates','self_knowledge'],
  'Socrates said "The unexamined life is not worth living." Do you agree? What does "examining your life" actually look like in practice? Write 3-4 sentences.',
  'This is philosophy\'s most famous claim about how to live. But what does it mean concretely? Journaling? Therapy? Meditation? Conversation?',
  'Define what "examining your life" means to YOU, and whether you currently do it.',
  null
))

tasks.push(textTask('applied_philosophy', 2, ['absurdism','camus','meaning','sisyphus'],
  'Camus said we must imagine Sisyphus happy — pushing a boulder uphill forever, knowing it will roll back down. What in your life feels Sisyphean? Can you find meaning in it anyway? Write 3-4 sentences.',
  'Absurdism doesn\'t say "give up." It says: the universe doesn\'t provide meaning, but you can create it through how you engage with even meaningless tasks.',
  'Name something repetitive or seemingly pointless in your life. Apply Camus\'s lens: can you find meaning in the doing, not the outcome?',
  null
))

tasks.push(textTask('applied_philosophy', 2, ['philosophy_of_happiness','hedonic_treadmill','eudaimonia'],
  'The hedonic treadmill: we adapt to good things and return to baseline happiness. If this is true, what\'s the point of pursuing more? How should we pursue happiness instead?',
  'Research confirms the hedonic treadmill — lottery winners return to baseline happiness within months. This challenges the "more = happier" assumption.',
  'If more stuff/success/pleasure doesn\'t create lasting happiness, what does? Draw on any philosophical tradition.',
  null
))

tasks.push(textTask('applied_philosophy', 3, ['philosophy_of_technology','attention','freedom'],
  'Social media is designed to capture your attention. Is this a threat to your autonomy and freedom? Apply philosophical concepts to analyze your own relationship with technology.',
  'This connects existentialist freedom (are you choosing to scroll, or is the algorithm choosing for you?), Stoic control (is your attention within your control?), and ethics (is attention manipulation moral?).',
  'Be specific about YOUR usage. Don\'t write an abstract essay — examine your actual behavior through a philosophical lens.',
  null, 10
))

tasks.push(textTask('applied_philosophy', 3, ['ethics_of_care','relationships','feminist_ethics'],
  'The Ethics of Care (Gilligan, Noddings) argues morality isn\'t about abstract rules but about maintaining caring relationships. How does this change how you think about a moral dilemma you\'ve faced?',
  'Care ethics challenges the dominant frameworks (utilitarianism, deontology) by centering relationships and context over universal principles.',
  'Pick a real moral situation from your life. How would care ethics analyze it differently than "what\'s the rule?" or "what produces the best outcome?"',
  null, 10
))

// ============================================================
// ADDITIONAL TASKS — filling to 150
// ============================================================

tasks.push(teach('philosophical_literacy', 1, ['utilitarianism','bentham','mill','greatest_happiness'],
  'Learn the two versions of Utilitarianism: Bentham\'s (quantity) vs Mill\'s (quality of pleasure).',
  'Bentham said all pleasures are equal. Mill disagreed: "It is better to be Socrates dissatisfied than a fool satisfied."',
  'Is reading poetry genuinely BETTER than playing video games, or just different?', null,
  [
    {primary:'Bentham', secondary:'Quantitative', reveal:'All pleasure is equal. Calculate total amount. Pushpin is as good as poetry if it produces equal pleasure.'},
    {primary:'Mill', secondary:'Qualitative', reveal:'Higher pleasures (intellectual, moral) are superior to lower pleasures (bodily). Quality matters, not just quantity.'},
    {primary:'The Test', secondary:'Competent judges', reveal:'Mill said: ask someone who has experienced BOTH. They\'ll always prefer the higher one.'}
  ]
))

tasks.push(teach('philosophical_literacy', 2, ['political_philosophy','liberty','harm_principle'],
  'Learn Mill\'s Harm Principle — the foundation of liberal political philosophy.',
  'Mill asked: when can society restrict individual freedom? His answer shaped modern democracy.',
  'The principle sounds simple but the hard cases are where it gets interesting.', null,
  [
    {primary:'Harm Principle', secondary:'Core idea', reveal:'The only reason to restrict freedom is to prevent harm to OTHERS. Self-harm is not sufficient reason.'},
    {primary:'Implication', secondary:'Drug use', reveal:'If drugs only harm the user, Mill would say: legalize them. Society can educate but not prohibit.'},
    {primary:'Hard Case', secondary:'Offense vs harm', reveal:'Is being offended "harm"? Mill says no — offense alone doesn\'t justify restricting speech.'}
  ]
))

tasks.push(fillBlank('philosophical_literacy', 1, ['logic','deduction','induction','premise'],
  'Test your understanding of basic logic concepts.', 'Building blocks of all philosophical reasoning.', 'Answer from memory.',
  [
    {prompt:'A ___ is a statement assumed true that supports the conclusion.', answer:'premise', hint:'The input to an argument'},
    {prompt:'___ reasoning goes from general rules to specific cases with certain conclusions.', answer:'Deductive', hint:'All humans are mortal → Socrates is mortal'},
    {prompt:'___ reasoning goes from specific observations to general rules with probable conclusions.', answer:'Inductive', hint:'Every swan I\'ve seen is white → all swans are white'},
    {prompt:'An argument where the conclusion follows from the premises is called ___.', answer:'valid', hint:'About structure, not truth'}
  ]
))

tasks.push(textTask('ethics', 1, ['golden_rule','reciprocity'],
  'The Golden Rule: "Treat others as you want to be treated." Is this a good moral principle? Can you think of a case where it fails? Write 3-4 sentences.',
  'The Golden Rule is intuitive but has problems. What if a masochist follows it? What if your preferences differ from others\'?',
  'Give one strength and one weakness of the Golden Rule as a moral guide.', null
))

tasks.push(textTask('ethics', 2, ['whistleblowing','loyalty','duty'],
  'You discover your company is doing something legal but unethical. Do you blow the whistle? Apply 2 ethical frameworks.',
  'This tests loyalty vs duty, personal risk vs moral obligation.',
  'What do you owe your employer? What do you owe the public? What would a virtuous person do?', null
))

tasks.push(textTask('ethics', 2, ['forgiveness','justice','mercy'],
  'Is forgiveness always virtuous? Or are there wrongs that shouldn\'t be forgiven? Argue your position.',
  'Some say forgiveness frees you from resentment. Others say some wrongs demand ongoing moral anger.',
  'Does forgiveness require repentance? Can you forgive without condoning?', null
))

tasks.push(textTask('argumentation', 1, ['argument_identification','daily_life'],
  'Find an argument in your daily life — a news article, conversation, or ad. What\'s the conclusion? What are the premises? Is it valid?',
  'Arguments are everywhere but we rarely notice them. This trains you to see logical structure behind everyday claims.',
  'Quote or paraphrase the argument, identify premises and conclusion, evaluate the logic.', null
))

tasks.push(teach('argumentation', 2, ['toulmin_model','warrant','claim','evidence'],
  'Learn the Toulmin Model — a practical framework for analyzing real-world arguments.',
  'Unlike formal logic, Toulmin handles messy arguments people actually make. Used in law, debate, and academic writing.',
  'The key addition is the WARRANT — the unstated principle connecting evidence to claim.', null,
  [
    {primary:'Claim', secondary:'What you argue', reveal:'The conclusion you want accepted. "We should raise the minimum wage."'},
    {primary:'Evidence', secondary:'Data/facts', reveal:'Facts supporting your claim. "Workers earning minimum wage can\'t afford rent in any US state."'},
    {primary:'Warrant', secondary:'The bridge', reveal:'Principle connecting evidence to claim. "Society should ensure workers can afford basic needs." Often unstated.'},
    {primary:'Qualifier', secondary:'Strength', reveal:'How strong is the claim? "Probably," "in most cases." Honest arguments include qualifiers.'}
  ]
))

tasks.push(textTask('argumentation', 2, ['reductio_ad_absurdum','logic'],
  'Practice Reductio ad Absurdum: take "privacy doesn\'t matter if you have nothing to hide" and follow it to its logical extreme.',
  'Assume the claim is true, then show it leads to an absurd conclusion the claimant wouldn\'t accept.',
  'Start with the claim, follow it logically, show where it leads to something unacceptable.', null
))

tasks.push(textTask('argumentation', 3, ['is_ought','hume'],
  'Hume\'s Guillotine: you can\'t derive "ought" from "is." Find a real example and explain the error.',
  'People constantly jump from facts to morals without justification. "Humans are naturally competitive" → "competition is good."',
  'Show the factual claim, the moral conclusion, and the missing justification.', null, 10
))

tasks.push(teach('critical_thinking', 1, ['occams_razor','parsimony'],
  'Learn Occam\'s Razor — the simplest explanation is usually the best.',
  'Don\'t multiply entities beyond necessity. If two explanations fit the evidence, prefer the simpler one.',
  'Simplicity doesn\'t mean always right — but complexity needs justification.', null,
  [
    {primary:'Occam\'s Razor', secondary:'Principle', reveal:'Among competing explanations, prefer the one with fewest assumptions.'},
    {primary:'Example', secondary:'Application', reveal:'Keys missing. A: you misplaced them. B: someone broke in, took only keys, left. Prefer A.'},
    {primary:'Limitation', secondary:'Not absolute', reveal:'Sometimes reality IS complex. Simple isn\'t always right — but it\'s the best starting point.'}
  ]
))

tasks.push(textTask('critical_thinking', 1, ['fact_opinion','claim_evaluation'],
  'Classify: fact, opinion, or claim needing evidence. (1) "Water boils at 100°C" (2) "Democracy is best" (3) "Exercise reduces anxiety" (4) "Pizza is delicious." Explain each.',
  'Many people struggle with boundaries between opinions and evidence-based claims.',
  'For each, explain WHY it\'s a fact, opinion, or claim. Reasoning matters more than the label.', null
))

tasks.push(textTask('critical_thinking', 2, ['base_rate_neglect','probability'],
  'A test for a rare disease is 99% accurate. You test positive. Probability you have it? (NOT 99%.) Explain why.',
  'Base rate neglect is dangerous in medicine and criminal justice.',
  'If 1 in 10,000 have it: test 10,000 → 1 true positive + ~100 false positives. Only ~1% chance you\'re sick.',
  null
))

tasks.push(textTask('critical_thinking', 3, ['unknown_unknowns','epistemology'],
  '"Unknown unknowns" — things we don\'t know we don\'t know. How do you prepare for risks you can\'t imagine? Write 4-5 sentences.',
  'Connects to epistemology, risk management, and intellectual humility.',
  'Propose a practical approach to handling unknown unknowns in your own decisions.', null, 10
))

tasks.push(textTask('applied_philosophy', 1, ['stoicism','morning_routine','marcus_aurelius'],
  'Stoic Morning Practice: Marcus Aurelius reminded himself he\'d encounter difficult people. Write a 3-sentence morning intention using Stoic principles.',
  '"The people I deal with today will be meddling, ungrateful, arrogant. But I cannot be angry, because we are made for cooperation." — Marcus Aurelius',
  'Write YOUR version adapted to your actual day.', null
))

tasks.push(textTask('applied_philosophy', 2, ['philosophy_of_friendship','aristotle'],
  'Aristotle\'s 3 types of friendship: utility, pleasure, virtue. Categorize 3 of your friendships. Which type is most valuable?',
  'Only virtue friendships are "complete" — the others dissolve when benefit or pleasure ends.',
  'Be honest. Nothing wrong with utility or pleasure friendships — but notice which are deepest.', null
))

tasks.push(textTask('applied_philosophy', 2, ['ikigai','purpose','meaning_of_life'],
  'Ikigai: intersection of what you love, what you\'re good at, what the world needs, what you can be paid for. Map yours. Where are the gaps?',
  'Operationalizes "what should I do with my life?" into 4 practical dimensions.',
  'List something for each dimension, identify overlaps and gaps.', null
))

tasks.push(textTask('applied_philosophy', 3, ['philosophy_of_education','socrates'],
  'Is education designed to create thinkers or workers? Critique how you were educated using philosophical concepts.',
  'Socrates taught through questions. Modern education teaches through answers. Freire called it "banking" — depositing info into passive students.',
  'What did your education teach you to DO vs THINK? What approach would improve it?', null, 10
))

// --- Final batch to reach ~150 ---
tasks.push(textTask('philosophical_literacy', 2, ['philosophy_of_time','presentism','eternalism'],
  'Does the past still exist? Does the future already exist? Presentism says only now is real. Eternalism says past, present, and future all exist. Which makes more sense to you?',
  'Einstein\'s relativity suggests eternalism might be correct — "now" is relative, not absolute. But our experience screams presentism.',
  'State your position and address the strongest objection.', null
))

tasks.push(textTask('ethics', 1, ['moral_responsibility','free_will','blame'],
  'If someone was raised in a terrible environment and commits a crime, are they fully morally responsible? How much does upbringing excuse? Write 3-4 sentences.',
  'This connects free will to ethics. If our choices are shaped by circumstances we didn\'t choose, how much blame is fair?',
  'Consider both extremes: full responsibility (ignores context) vs no responsibility (removes agency). Where do you land?', null
))

tasks.push(fillBlank('ethics', 1, ['consent','autonomy','paternalism'],
  'Test your understanding of autonomy and paternalism.',
  'These concepts come up in every debate about personal freedom vs protection.',
  'Answer from memory.',
  [
    {prompt:'___ is the right to make your own decisions about your own life.', answer:'Autonomy', hint:'Self-governance'},
    {prompt:'___ means restricting someone\'s freedom for their own benefit.', answer:'Paternalism', hint:'Like a parent deciding for a child'},
    {prompt:'___ consent means you can only agree to something if you understand the risks.', answer:'Informed', hint:'Required in medical ethics'}
  ]
))

tasks.push(textTask('argumentation', 1, ['burden_of_proof','logic'],
  'Who has the burden of proof? "Aliens exist" vs "Aliens don\'t exist." Which side needs to provide evidence? Why? Write 3-4 sentences.',
  'The burden of proof is on the person making the positive claim. You can\'t prove a negative. This principle prevents unfalsifiable claims.',
  'Apply this to another example: "This supplement cures cancer" — who needs to prove what?', null
))

tasks.push(textTask('argumentation', 2, ['analogy','argument_by_analogy'],
  'Evaluate this analogy: "Banning guns is like banning cars — both can kill people, but we don\'t ban cars." Is this a good analogy? Where does it break down? Write 3-4 sentences.',
  'Arguments by analogy are powerful but fragile. They work only if the two things are similar in RELEVANT ways.',
  'Identify what\'s similar, what\'s different, and whether the differences matter for the argument.', null
))

tasks.push(textTask('critical_thinking', 2, ['survivorship_bias','statistics'],
  'Survivorship bias: we study successful people and copy their habits, ignoring the thousands who did the same things and failed. Give an example and explain why this is misleading.',
  '"Bill Gates dropped out of college and became a billionaire" ignores millions of dropouts who didn\'t. We only see the survivors.',
  'Name a specific example of survivorship bias and explain what we\'re missing by only looking at successes.', null
))

tasks.push(textTask('critical_thinking', 1, ['burden_of_proof','skepticism','critical_evaluation'],
  'Someone claims a new supplement boosts memory by 50%. What 3 questions would you ask before believing this claim?',
  'Healthy skepticism isn\'t cynicism — it\'s asking the right questions before accepting claims.',
  'Think about: who funded the study? How was it measured? Has it been replicated? What\'s the sample size?', null
))

tasks.push(textTask('applied_philosophy', 1, ['gratitude','stoicism','epicurus'],
  'Both Stoics and Epicureans practiced gratitude — but for different reasons. Write 3 things you\'re grateful for right now, then reflect: WHY does gratitude matter philosophically?',
  'Stoics practiced gratitude to prepare for loss (negative visualization). Epicureans practiced it because appreciating simple pleasures IS the good life.',
  'Don\'t just list — reflect on why noticing what you have changes your experience.', null
))

tasks.push(textTask('applied_philosophy', 2, ['philosophy_of_money','wealth','enough'],
  'How much money is "enough"? Seneca was one of Rome\'s richest men but preached simplicity. Is this hypocritical, or can you be wealthy and philosophical? Write 3-4 sentences.',
  'Philosophy has always had a complicated relationship with wealth. Epicurus lived simply. Seneca was rich. Both claimed to be happy.',
  'Define YOUR "enough" and explain what philosophical principle guides that number.', null
))

tasks.push(textTask('applied_philosophy', 1, ['philosophy_of_failure','resilience','growth'],
  'The Stoics saw obstacles as opportunities. Nietzsche said "what doesn\'t kill me makes me stronger." Think of a recent failure or setback. What did it teach you? Write 3-4 sentences.',
  'Philosophy reframes failure from "something went wrong" to "something revealed itself." Every failure contains information.',
  'Be specific about the failure and specific about the lesson. Vague answers like "I grew" don\'t count.', null
))

console.log(`Generated ${tasks.length} philosophy tasks`)
console.log(`Skill areas: ${[...new Set(tasks.map(t => t.skill_area))].join(', ')}`)
console.log(`Levels: ${JSON.stringify([1,2,3].map(l => `L${l}: ${tasks.filter(t => t.level === l).length}`))}`)

writeFileSync(new URL('../data/philosophy.json', import.meta.url), JSON.stringify(tasks, null, 2), 'utf-8')
console.log('Written to data/philosophy.json')
