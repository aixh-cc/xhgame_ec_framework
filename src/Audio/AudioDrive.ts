/**
 * 音频平台适配接口。
 *
 * URL 的格式和音量范围由具体驱动定义；建议音量统一使用 `0..1`。
 */
export interface IAudioDrive {
    /** 播放一次音效。 */
    playEffect: (url: string) => void
    /** 播放或切换循环背景音乐。 */
    playMusic: (url: string) => void
    /** 停止背景音乐。 */
    stopMusic: () => void
    /** 恢复驱动管理的全部音频。 */
    resumeAll: () => void
    /** 暂停驱动管理的全部音频。 */
    pauseAll: () => void
    /** 获取背景音乐音量。 */
    getMusicVolume: () => number
    /** 设置背景音乐音量。 */
    setMusicVolume: (val: number) => void
    /** 获取音效音量。 */
    getEffectVolume: () => number
    /** 设置音效音量。 */
    setEffectVolume: (val: number) => void
}
