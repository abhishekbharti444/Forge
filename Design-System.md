# Forge — Design System

## Design Principles

Based on research across Duolingo, Headspace, Finch, FocusRoom, and habit formation UX literature.

### 1. Warmth Is the Quiet Multiplier
The app should feel like a thoughtful friend, not a task database. Warm colors, conversational copy, micro-interactions that feel alive. The task card should feel like a note from someone who cares about your progress.

### 2. One Action Per Screen, Always
Every screen has exactly one primary action. No navigation bars, no menus during the core loop. Secondary actions (skip, one more) are visually quiet — almost invisible until needed.

### 3. Progressive Discovery
Day 1 feels almost empty — just the question, then one task. Momentum indicator appears after the user has something to show. History link appears after completions exist. The app reveals itself as you use it.

### 4. Purposeful Delight
Every animation serves the habit loop:
- Task appears: subtle fade-in, like a message arriving
- "Let's go" tap: satisfying haptic + card expanding into focused view
- "I'm done" tap: warm pulse or glow (not confetti — too much)
- Reflection saved: text gently fades into history
- "Done for today": screen feels like exhaling — calm, warm, restful

### 5. Identity Building
Momentum framing builds identity: "You've shown up 3 days this week" (you're someone who shows up). Occasional messages like "That's 10 creative writing exercises this month. You're building something."

### 6. Immediate Payoff
The completion state is the most important screen. It needs to feel genuinely rewarding — warm visual moment, count of what you've done, reflection as invitation not demand.

### 7. No Shame, Ever
If a user returns after a gap: "Welcome back. Ready for one?" — as if no time passed. Momentum resets weekly by design. Every Monday is a fresh start.

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `bg-primary` | `#171412` | Main background — warm dark, not pure black |
| `bg-surface` | `#262220` | Cards, inputs, elevated surfaces |
| `text-primary` | `#f5f0eb` | Headings, task descriptions, primary content |
| `text-secondary` | `#9a918a` | Subtitles, hints, secondary actions |
| `accent-amber` | `#e8a849` | CTA buttons, highlights, active states |
| `accent-green` | `#7ec89b` | Success, completion, rest state |
| `border` | `#3a3530` | Subtle borders on inputs and cards |

### Why These Colors
- **Warm dark background** (not pure black): reduces eye strain, feels sophisticated and focused. Dark mode is psychologically associated with concentration.
- **Amber accent**: Headspace uses orange/yellow for warmth and optimism. Amber sits in that zone — energizing without being aggressive.
- **Sage green**: signals completion and rest. Used sparingly on the "Done for Today" screen.
- **Warm whites and greys**: pure white (#fff) feels clinical on dark backgrounds. Warm tints (#f5f0eb) feel human.

---

## Typography

| Element | Size | Weight | Line Height | Notes |
|---|---|---|---|---|
| App title | 30px | Bold | 1.2 | "Forge" on auth screen |
| Task description | 18-20px | Regular | 1.7 | The most important text — should feel like reading a book |
| Section heading | 24px | Semibold | 1.3 | "What do you want to get better at?", "Nice work." |
| Body/subtitle | 14px | Regular | 1.5 | Hints, secondary text |
| Button text | 16px | Semibold | 1 | CTA labels |
| Micro text | 12-13px | Regular | 1.4 | Momentum indicator, timestamps |

### Font Choice
System font stack for performance: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. Consider adding a serif font (like `Georgia` or `Lora`) for task descriptions to enhance the "reading a book" feel.

---

## Layout

- **Mobile-first**: designed for 375px width, responsive up
- **Centered content**: all content vertically and horizontally centered
- **Generous whitespace**: minimum 24px horizontal padding, content floats with breathing room
- **No persistent navigation**: no nav bars, tabs, or hamburger menus during the core loop
- **One primary action per screen**: single CTA button, secondary actions are text links
- **Rounded corners**: 12px on buttons and inputs, 16px on cards

---

## Screen Designs

### Screen 1: Auth (Google Sign-in)
```
┌─────────────────────────┐
│                         │
│                         │
│                         │
│         Forge           │  ← 30px, bold, warm white
│   Small actions, real   │  ← 14px, warm grey
│       progress.         │
│                         │
│                         │
│  ┌───────────────────┐  │
│  │ G  Continue with   │  │  ← White bg, dark text, Google icon
│  │    Google          │  │
│  └───────────────────┘  │
│                         │
│                         │
│                         │
└─────────────────────────┘
Background: #171412
```

### Screen 2: Intent Capture
```
┌─────────────────────────┐
│                         │
│                         │
│   What do you want to   │  ← 24px, semibold, warm white
│   get better at?        │
│                         │
│   Type anything — we'll │  ← 14px, warm grey
│   find the right tasks  │
│   for you.              │
│                         │
│  ┌───────────────────┐  │
│  │ creative writing.. │  │  ← Input: #262220 bg, subtle border
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │    Let's go        │  │  ← Amber button
│  └───────────────────┘  │
│                         │
│                         │
└─────────────────────────┘
```

### Screen 3: Suggestion (Main Screen — 90% of usage)
```
┌─────────────────────────┐
│     🔥 2 tasks today    │  ← 12px, warm grey, very subtle
│                         │
│                         │
│                         │
│   Write exactly 6       │  ← 18-20px, warm white
│   sentences describing  │     line-height: 1.7
│   the room you're in    │     feels like reading a book
│   right now. Each       │
│   sentence must use a   │
│   different sense.      │
│                         │
│                         │
│                         │
│  ┌───────────────────┐  │
│  │    Let's go        │  │  ← Amber button
│  └───────────────────┘  │
│                         │
│   Not the right moment  │  ← 13px, warm grey, subtle
│                         │
└─────────────────────────┘
```

### Screen 4: Focused (Task in Progress)
```
┌─────────────────────────┐
│                         │
│  This usually takes     │  ← 13px, warm grey
│  about 10 minutes       │
│                         │
│                         │
│                         │
│   Write exactly 6       │  ← 18-20px, warm white
│   sentences describing  │     same book-like typography
│   the room you're in    │
│   right now. Each       │
│   sentence must use a   │
│   different sense.      │
│                         │
│                         │
│                         │
│                         │
│  ┌───────────────────┐  │
│  │    I'm done        │  │  ← Amber button
│  └───────────────────┘  │
│                         │
└─────────────────────────┘
Maximum whitespace. Quiet room feeling.
```

### Screen 5: Completion (Reflection)
```
┌─────────────────────────┐
│                         │
│                         │
│                         │
│       Nice work.        │  ← 24px, semibold, warm white
│                         │
│    What did you notice? │  ← 14px, warm grey
│                         │
│  ┌───────────────────┐  │
│  │                   │  │  ← Textarea: #262220 bg
│  │ Optional — jot a  │  │     placeholder in warm grey
│  │ quick thought...  │  │
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │  Save & continue   │  │  ← Amber button
│  └───────────────────┘  │
│                         │
│                         │
└─────────────────────────┘
```

### Screen 6: Done for Today
```
┌─────────────────────────┐
│                         │
│                         │
│                         │
│                         │
│   You've done 3 tasks   │  ← 24px, semibold, warm white
│        today.           │
│                         │
│   That's real progress. │  ← 14px, warm grey
│   Come back tomorrow.   │
│                         │
│         ● ● ●          │  ← 3 sage green dots — visual completion
│                         │
│                         │
│                         │
│       One more          │  ← 13px, warm grey, very subtle
│                         │
│                         │
└─────────────────────────┘
Background subtly warmer. Exhale feeling.
```

---

## Additional Screens (Added April 7, 2026)

### GoalHome (Dashboard)
```
┌─────────────────────────┐
│                         │
│  Good morning.          │  ← time-based greeting
│                         │
│  🔥 3 days this week    │  ← weekly momentum from localStorage
│  ✅ 2 tasks today       │
│                         │
│  ┌───────────────────┐  │  ← active goal cards
│  │ ✍️ Creative Writing │  │     tap to practice
│  │    175 tasks       │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 🇮🇳 Learn Kannada  │  │
│  │    160 tasks       │  │
│  └───────────────────┘  │
│                         │
│  History    Edit goals  │  ← subtle links
└─────────────────────────┘
```

### Coach (Smart Recommendation)
```
┌─────────────────────────┐
│  ← Home                 │
│                         │
│  Creative Writing       │  ← category label
│                         │
│  Next up:               │
│                         │
│  ┌───────────────────┐  │  ← recommended task card
│  │ [skill_area · 5m] │  │     different skill area from last
│  │                   │  │
│  │ Task description  │  │
│  │                   │  │
│  │ 📱  🗣  🎧        │  │  ← mode selector
│  └───────────────────┘  │
│                         │
│  Browse all tasks       │  ← link to full catalog
└─────────────────────────┘
```

### WhatsNext (Post-Completion)
```
┌─────────────────────────┐
│                         │
│  Nice work! ✅          │
│  3 tasks today          │
│                         │
│  How about:             │
│                         │
│  ┌───────────────────┐  │  ← next task suggestion
│  │ [different skill]  │  │     different skill area
│  │ Task description  │  │
│  │ 📱  🗣  🎧        │  │
│  └───────────────────┘  │
│                         │
│  Done for now           │  ← returns to GoalHome
└─────────────────────────┘
```

### AudioPlayerScreen
```
┌─────────────────────────┐
│  ← Home    vocab · 🗣   │  ← skill area + mode
│                         │
│  Learn 10 food words    │  ← task action
│                         │
│                         │
│  "Anna. What does it    │  ← current utterance text
│   mean?"                │
│                         │
│                         │
│  ████████░░░░░░░░░░░░░  │  ← progress bar
│                         │
│       ▶      ⏭         │  ← play/pause + skip
│                         │
└─────────────────────────┘
```

### ConceptBank
```
┌─────────────────────────┐
│  ← Back                 │
│                         │
│  Concepts               │
│                         │
│  ethics                 │  ← skill area header
│  ┌────┐ ┌──────────┐   │
│  │util│ │deontology│   │  ← concept tag chips
│  └────┘ └──────────┘   │
│  ┌──────┐ ┌────────┐   │
│  │virtue│ │consent │   │
│  └──────┘ └────────┘   │
│                         │
│  fundamentals           │
│  ┌───┐ ┌──────────┐    │
│  │CAP│ │consensus │    │
│  └───┘ └──────────┘    │
└─────────────────────────┘
```

---

## Micro-interactions

| Moment | Interaction | Purpose |
|---|---|---|
| Task appears | Fade in over 300ms, slight upward drift | Feels like a message arriving, not a page load |
| "Let's go" tap | Button press animation + screen transition | Commitment moment — should feel decisive |
| "Not the right moment" tap | Reasons slide up gently | Non-judgmental, the app is listening |
| Skip reason selected | Current task fades out, new task fades in | Smooth, no jarring reload |
| "I'm done" tap | Warm pulse on button + transition to completion | Celebration without excess |
| Reflection saved | Text gently settles, like writing in a journal | Investment moment — this is yours |
| "Done for today" appears | Slow fade, slightly longer transition | Exhale — the pace slows down |
| Return after gap | "Welcome back. Ready for one?" | No shame, fresh start |

---

## Venue Design Project

Mockups: https://venue.aws.dev/projects/e7a2d70a-8297-40af-9365-f802c7d3f566

Note: Venue generated Cloudscape-based mockups. We're implementing with Tailwind + custom warm dark theme instead. The Venue project is a layout/content reference only — our Design System doc (above) is the source of truth for colors, typography, and interaction patterns.

---

## References

- [Duolingo UX: 9 lessons for designing world-class products](https://www.everydayux.net/the-duolingo-handbook-9-lessons-for-designing-world-class-products/)
- [Headspace: Emotion-Driven UI UX Design Case Study](https://www.neointeraction.com/blogs/headspace-a-case-study-on-successful-emotion-driven-ui-ux-design)
- [Finch: Where Self-Care Meets Enchanted Design](https://sophiepilley.substack.com/p/the-magic-of-finch-where-self-care)
- [5 Design Patterns from Habit Formation Apps](https://designmeetsai.substack.com/p/ritual-warmth-and-identity-what-habit)
- [Dark Mode in Design: Psychological Point of View](https://gapsystudio.com/blog/dark-mode-ux/)
- [The Psychology of User Retention: Designing for Habit Formation](https://www.contrast.studio/articles/the-psychology-of-user-retention-designing-for-habit-formation)

---

*Document created: March 31, 2026*
*Updated: April 11, 2026 — Learning effectiveness findings from UX Audit*

---

## Appendix: Learning Effectiveness Notes

> See `UX-Audit.md` for the full audit. Key findings that affect the Design System:

### Principle #6 Amendment: Immediate Payoff Must Be Variable

The current completion screen shows "Nice work." every time. Research on habit-forming apps (thisisglance.com, xqa.io) is emphatic: **variable rewards sustain engagement far better than predictable ones.** The completion screen should draw from a pool of 15-20 warm, varied messages and include specific stats (time spent, items learned, streak count). This doesn't conflict with the "warm pulse, not confetti" principle — it's about *content variety*, not visual excess.

### Principle #3 Amendment: Progressive Discovery Applies to Journey Tasks

The GoalHome screen currently shows all tasks in a journey (e.g., 39 vocabulary tasks at once). This violates progressive discovery. Show the next 3-5 tasks with a progress bar; reveal more as the user advances. The "Endowed Progress Effect" research shows people are more motivated when they see a partially-filled progress bar.

### New Principle: Retrieval Before Presentation

The flashcard Study step defaults to "Learn" mode (show answer). Decades of retrieval practice research (Roediger & Karpicke, 2006) show that **testing yourself produces dramatically better retention than re-reading.** The default should be Quiz mode (hide answer, attempt recall). Users can opt into Learn mode if stuck. This is a one-line change in `ReferenceRenderer` but a fundamental shift in learning effectiveness.

### New Principle: Practice Mode Must Match Skill Type

The `buildSteps()` function in `Focused.tsx` builds the same step flow for every task. But the task data already encodes different practice needs through `type`, `tools`, `reference.type`, and `completion` fields. A guitar task with `tools: ['metronome']` should lead with the metronome. A philosophy task with `tools: ['text_input']` should lead with the writing prompt. A Kannada dialogue task should render as interactive conversation. The rendering layer should be metadata-driven, not one-size-fits-all.
