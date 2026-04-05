declare module 'soundfont-player' {
  interface Player {
    play(note: string, time?: number, options?: { duration?: number; gain?: number }): { stop(): void }
    stop(): void
  }
  function instrument(ac: AudioContext, name: string, options?: any): Promise<Player>
}
