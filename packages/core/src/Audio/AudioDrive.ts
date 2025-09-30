export interface IAudioDrive {
    playEffect: (url: string) => void
    playMusic: (url: string) => void
    stopMusic: () => void
    resumeAll: () => void
    pauseAll: () => void
    getMusicVolume: () => number
    setMusicVolume: (val: number) => void
    getEffectVolume: () => number
    setEffectVolume: (val: number) => void
}
