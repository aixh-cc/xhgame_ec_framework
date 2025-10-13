
export class DouyinSDK {
    private constructor() { }
    private static _instance: DouyinSDK = new this()
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
    login(): Promise<{ code: string, anonymousCode: string }> {
        return new Promise((resolve, reject) => {
            // 进行登录
            tt.login({
                success: function (res) {
                    // 获取用户信息
                    tt.getUserInfo({
                        // withCredentials: true, // 是否需要返回敏感数据
                        withRealNameAuthenticationInfo: true, // 是否需要返回用户实名认证状态(真机情况下有效)
                        success(infoRes) {
                            if (infoRes.realNameAuthenticationStatus && infoRes.realNameAuthenticationStatus == 'certified') {
                                resolve(res) //已实名认证
                            } else {
                                if (typeof infoRes.realNameAuthenticationStatus == 'undefined') {
                                    resolve(res) //说明在本地调试机上
                                } else {
                                    tt.authenticateRealName({
                                        complete(_res) {
                                            resolve(res) // 因为抖音平台规定，暂时不认证不影响继续游戏
                                        }
                                    });
                                }
                            }
                        },
                        fail(infoRes) {
                            resolve(res) // 因为抖音平台规定，暂时不认证不影响继续游戏
                        },
                    });
                },
                fail(res) {
                    // 匿名用户
                    resolve(res)
                }
            });
        })
    }
    vibrateShort() {
        tt.vibrateShort({
            type: 'medium'
        }) // 短振
    }
}