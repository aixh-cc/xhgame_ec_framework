import { IAudioDrive } from "./AudioDrive"

/**
 * 音频驱动门面。管理器不缓存播放状态，所有操作直接委托给驱动。
 * @example
 * ```ts
 * const audio = new AudioManager(new CocosAudioDrive())
 * audio.setMusicVolume(0.6)
 * audio.playMusic('audio/bgm')
 * ```
 */
export class AudioManager<T extends IAudioDrive> implements IAudioDrive {
    private _drive: T
    constructor(drive: T) {
        this._drive = drive
    }
    /** 获取底层驱动，供业务调用驱动扩展的方法。 */
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
