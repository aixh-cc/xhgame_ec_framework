
export class WeixinSDK {
    private constructor() { }
    private static _instance: WeixinSDK = new this()
    static getInstance() {
        return this._instance
    }
    private videoAd: any = null
    showAd(adUnitId: string) {
        return new Promise<boolean>((resolve, reject) => {
            if (this.videoAd == null) {
                this.videoAd = wx.createRewardedVideoAd({
                    adUnitId: adUnitId
                })
            }
            this.videoAd.show().catch(() => {
                // 失败重试
                this.videoAd.load()
                    .then(() => this.videoAd.show())
                    .catch(err => {
                        resolve(true)
                    })
            })
            // 监听异常
            this.videoAd.onError(err => {
                console.log('[微信]onError错误', err)
                resolve(true)
            })
            // 监听关闭
            this.videoAd.onClose(res => {
                // 用户点击了【关闭广告】按钮
                // 小于 2.1.0 的基础库版本，res 是一个 undefined
                if (res && res.isEnded || res === undefined) {
                    // 正常播放结束，可以下发游戏奖励
                    resolve(true)
                } else {
                    // 播放中途退出，不下发游戏奖励
                    resolve(false)
                }
            })
        })
    }
    login() {
        return new Promise<{ code: string, anonymousCode: string }>((resolve, reject) => {
            wx.login({
                success: function (res) {
                    res.anonymousCode = ''
                    resolve(res)
                }
            });
        })
    }
    vibrateShort() {
        this._wxzhen(3)
    }
    private _wxzhen(num: number = 1) {
        wx.vibrateShort({
            complete: () => {
                num--;
                if (num > 0) {
                    this._wxzhen(num)
                }
            }
        }) // 短振
    }
}