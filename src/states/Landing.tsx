interface Props {
  onGetStarted: () => void
}

export function Landing({ onGetStarted }: Props) {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero */}
      <div className="px-6 pt-20 pb-16 text-center max-w-lg mx-auto">
        <h1 className="text-5xl font-bold text-text-primary mb-3 tracking-tight">Forge</h1>
        <p className="text-text-secondary text-lg mb-10">Small actions, real progress.</p>
        <p className="text-text-secondary/70 text-sm leading-relaxed mb-12 max-w-sm mx-auto">
          Open the app. Get one task. Do it in 5–15 minutes. Build any skill through daily micro-practice.
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-3.5 bg-accent-amber text-bg-primary font-semibold rounded-xl hover:bg-accent-amber-hover transition-colors text-lg"
        >
          Get started
        </button>
      </div>

      {/* What it is */}
      <div className="px-6 py-16 max-w-lg mx-auto">
        <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">How it works</h2>
        <div className="space-y-6">
          {[
            { step: '1', title: 'Pick a skill', desc: 'Choose what you want to get better at.' },
            { step: '2', title: 'Get a task', desc: 'A specific, time-bounded exercise designed for deliberate practice.' },
            { step: '3', title: 'Do it now', desc: '5–15 minutes. The app guides you with instructions, examples, and interactive tools.' },
            { step: '4', title: 'Reflect & repeat', desc: 'Capture what you learned. Come back tomorrow. Build the habit.' },
          ].map(item => (
            <div key={item.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-accent-amber/15 flex items-center justify-center flex-shrink-0">
                <span className="text-accent-amber text-sm font-semibold">{item.step}</span>
              </div>
              <div>
                <p className="text-text-primary font-medium">{item.title}</p>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-16 max-w-lg mx-auto">
        <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">What you can practice</h2>
        <div className="space-y-3">
          {[
            { name: 'Creative Writing', desc: '175 tasks across observation, dialogue, structure, voice, imagery, and reflection.', count: '175 tasks' },
            { name: 'Learn Kannada', desc: 'Vocabulary, grammar, script, phrases, and pronunciation with interactive quizzes and dialogues.', count: '150 tasks' },
            { name: 'Public Speaking', desc: 'Vocal delivery, storytelling, impromptu speaking, persuasion, clarity, and presence.', count: '150 tasks' },
          ].map(cat => (
            <div key={cat.name} className="bg-bg-surface border border-border rounded-xl px-5 py-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-text-primary font-medium">{cat.name}</p>
                <span className="text-accent-amber text-xs">{cat.count}</span>
              </div>
              <p className="text-text-secondary text-sm">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-6 py-16 max-w-lg mx-auto">
        <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">Built for real practice</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '📝', label: 'Fill-in-the-blank exercises' },
            { icon: '💬', label: 'Dialogue practice' },
            { icon: '⏱', label: 'Timed speaking drills' },
            { icon: '🧠', label: 'Quiz & recall modes' },
            { icon: '📊', label: 'Skill area tracking' },
            { icon: '📖', label: 'Reflection journal' },
          ].map(f => (
            <div key={f.label} className="bg-bg-surface border border-border rounded-lg px-3 py-3 text-center">
              <p className="text-lg mb-1">{f.icon}</p>
              <p className="text-text-secondary text-xs">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 py-16 text-center">
        <p className="text-text-primary text-lg font-semibold mb-2">Ready to start?</p>
        <p className="text-text-secondary text-sm mb-8">475 tasks across 3 skills. Free.</p>
        <button
          onClick={onGetStarted}
          className="px-8 py-3.5 bg-accent-amber text-bg-primary font-semibold rounded-xl hover:bg-accent-amber-hover transition-colors text-lg"
        >
          Get started
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 text-center border-t border-border">
        <p className="text-text-secondary/30 text-xs">Forge — Small actions, real progress.</p>
      </div>
    </div>
  )
}
