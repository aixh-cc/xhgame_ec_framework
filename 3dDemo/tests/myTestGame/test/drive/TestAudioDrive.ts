import { IAudioDrive } from "@aixh-cc/xhgame_ec_framework"

export class TestAudioDrive implements IAudioDrive {
    getMusicVolume() {
        return 1
    }
    setMusicVolume(val: number) {
        // this.music.volume = val
    }
    getEffectVolume() {
        return 1
    }
    setEffectVolume(val: number) {
        // this.effect.volume = val
    }
    playEffect(url: string) {
        console.log('【模拟】playEffect url=' + url)
    }
    playMusic(url: string) {
        console.log('playMusic url=' + url)
    }
    stopMusic() {
        console.log('stopMusic')
    }
    resumeAll() {
        console.log('resumeAll')
    }
    pauseAll() {
        console.log('pauseAll')
    }
}