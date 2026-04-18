import type { Utterance } from './speechEngine'

export class SpeechPlayer {
  private utterances: Utterance[] = []
  private index = 0
  private paused = false
  private pauseTimer: number | null = null
  private synth = window.speechSynthesis
  private audioEl: HTMLAudioElement
  onProgress?: (index: number, total: number) => void
  onComplete?: () => void

  constructor() {
    // Single reusable audio element — keeps the OS audio session alive
    this.audioEl = new Audio()
    this.audioEl.preload = 'auto'
    this.pickVoice()
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.onvoiceschanged = () => this.pickVoice()
    }
  }

  load(utterances: Utterance[]) {
    this.stop()
    this.utterances = utterances.filter(u => u.text.trim() || u.audioUrl)
    this.index = 0
    this.paused = false
  }

  play() {
    this.paused = false
    this.speakCurrent()
  }

  pause() {
    this.paused = true
    this.synth.cancel()
    this.audioEl.pause()
    if (this.pauseTimer) { clearTimeout(this.pauseTimer); this.pauseTimer = null }
  }

  next() {
    this.synth.cancel()
    this.audioEl.pause()
    if (this.pauseTimer) { clearTimeout(this.pauseTimer); this.pauseTimer = null }
    this.index++
    if (this.index < this.utterances.length) {
      this.speakCurrent()
    } else {
      this.onComplete?.()
    }
  }

  stop() {
    this.paused = true
    this.synth.cancel()
    this.audioEl.pause()
    this.audioEl.removeAttribute('src')
    if (this.pauseTimer) { clearTimeout(this.pauseTimer); this.pauseTimer = null }
    this.index = 0
  }

  get isPlaying() { return !this.paused && this.index < this.utterances.length }
  get progress() { return { current: this.index, total: this.utterances.length } }

  private speakCurrent() {
    if (this.paused || this.index >= this.utterances.length) {
      if (this.index >= this.utterances.length) this.onComplete?.()
      return
    }

    const u = this.utterances[this.index]
    this.onProgress?.(this.index, this.utterances.length)

    if (u.audioUrl) {
      this.playAudioFile(u)
    } else {
      this.playSpeechSynthesis(u)
    }
  }

  private playAudioFile(u: Utterance) {
    const audio = this.audioEl

    // Preload next clip
    const nextIdx = this.index + 1
    if (nextIdx < this.utterances.length) {
      const next = this.utterances[nextIdx]
      if (next.audioUrl) {
        const preload = new Audio(next.audioUrl)
        preload.preload = 'auto'
        preload.load()
      }
    }

    audio.onended = () => {
      if (this.paused) return
      const delay = u.pauseAfter * 1000
      if (delay <= 0) {
        this.index++
        this.speakCurrent()
      } else {
        this.pauseTimer = window.setTimeout(() => {
          this.index++
          this.speakCurrent()
        }, delay)
      }
    }
    audio.onerror = () => {
      this.index++
      this.speakCurrent()
    }
    audio.src = u.audioUrl!
    audio.play()
  }

  private voice: SpeechSynthesisVoice | null = null

  private pickVoice() {
    const voices = this.synth.getVoices()
    // Prefer: female English voices that sound natural
    const preferred = ['Samantha', 'Google US English', 'Karen', 'Moira', 'Fiona', 'Victoria']
    for (const name of preferred) {
      const v = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'))
      if (v) { this.voice = v; return }
    }
    // Fallback: any en-US female-sounding voice (non-male names)
    this.voice = voices.find(v => v.lang.startsWith('en-US')) || null
  }

  private playSpeechSynthesis(u: Utterance) {
    const ssu = new SpeechSynthesisUtterance(u.text)
    if (u.lang) ssu.lang = u.lang
    if (this.voice && !u.lang) ssu.voice = this.voice
    ssu.rate = 0.95

    ssu.onend = () => {
      if (this.paused) return
      this.pauseTimer = window.setTimeout(() => {
        this.index++
        this.speakCurrent()
      }, u.pauseAfter * 1000)
    }

    ssu.onerror = () => {
      this.index++
      this.speakCurrent()
    }

    this.synth.speak(ssu)
  }
}
