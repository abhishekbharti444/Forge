import type { Utterance } from './speechEngine'

export class SpeechPlayer {
  private utterances: Utterance[] = []
  private index = 0
  private paused = false
  private pauseTimer: number | null = null
  private synth = window.speechSynthesis
  onProgress?: (index: number, total: number) => void
  onComplete?: () => void

  load(utterances: Utterance[]) {
    this.stop()
    this.utterances = utterances.filter(u => u.text.trim())
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
    if (this.pauseTimer) { clearTimeout(this.pauseTimer); this.pauseTimer = null }
  }

  next() {
    this.synth.cancel()
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

    const ssu = new SpeechSynthesisUtterance(u.text)
    if (u.lang) ssu.lang = u.lang
    ssu.rate = 0.9

    ssu.onend = () => {
      if (this.paused) return
      this.pauseTimer = window.setTimeout(() => {
        this.index++
        this.speakCurrent()
      }, u.pauseAfter * 1000)
    }

    ssu.onerror = () => {
      // Skip on error, move to next
      this.index++
      this.speakCurrent()
    }

    this.synth.speak(ssu)
  }
}
