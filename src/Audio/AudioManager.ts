import { IAudioDrive } from "./AudioDrive"

export class AudioManager<T extends IAudioDrive> implements IAudioDrive {
    private _drive: T
    constructor(drive: T) {
        this._drive = drive
    }
    getDrive() {
        return this._drive
    }
    playEffect(url: string) {
        this._drive.playEffect(url)
    }
    playMusic(url: string) {
        this._drive.playMusic(url)
    }
    stopMusic() {
        this._drive.stopMusic()
    }
    resumeAll() {
        this._drive.resumeAll()
    }
    pauseAll() {
        this._drive.pauseAll()
    }
    getMusicVolume() {
        return this._drive.getMusicVolume()
    }
    setMusicVolume(val: number) {
        this._drive.setMusicVolume(val)
    }
    getEffectVolume() {
        return this._drive.getEffectVolume()
    }
    setEffectVolume(val: number) {
        this._drive.setEffectVolume(val)
    }
}