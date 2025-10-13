
import { Platform, System } from "@aixh-cc/xhgame_ec_framework"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "db://assets/script/xhgame"
import { WeixinSDK } from "../../../../extensions/xhgame_plugin/assets/util/third/WeixinSDK";
import { DouyinSDK } from "../../../../extensions/xhgame_plugin/assets/util/third/DouyinSDK";

export class DdkSystem extends System {

    static async initComp(comp: SdkComp) {
        if (xhgame.game.at_platform == Platform.Weixin) {
            // 分享菜单
            wx.showShareMenu({
                withShareTicket: true,
                menus: ['shareAppMessage', 'shareTimeline']
            })
        }
        if (xhgame.game.at_platform == Platform.Douyin) {
            // 分享菜单
            tt.showShareMenu({
                success: () => { },
                fail: () => { },
                complete: () => { }
            });
        }
        if (xhgame.game.at_platform == Platform.H5) {
            // 无
        }
    }

    static showAd(comp: SdkComp): Promise<boolean> {
        if (xhgame.game.at_platform == Platform.Weixin) {
            return WeixinSDK.getInstance().showAd(comp.weixinAdId)
        }
        if (xhgame.game.at_platform == Platform.Douyin) {
            return DouyinSDK.getInstance().showAd(comp.douyinAdId)
        }
        if (xhgame.game.at_platform == Platform.H5) {
            return new Promise((resolve, reject) => {
                resolve(true)
            })
        }
    }
    static async login(comp: SdkComp): Promise<{ code: string, anonymousCode: string }> {
        if (xhgame.game.at_platform == Platform.Weixin) {
            return WeixinSDK.getInstance().login()
        }
        if (xhgame.game.at_platform == Platform.Douyin) {
            return DouyinSDK.getInstance().login()
        }
        if (xhgame.game.at_platform == Platform.H5) {
            return new Promise((resolve, reject) => {
                resolve({ code: 'test', anonymousCode: '' })
            })
        }
    }
    static vibrateShort(comp: SdkComp): void {
        if (xhgame.game.at_platform == Platform.Weixin) {
            return WeixinSDK.getInstance().vibrateShort()
        }
        if (xhgame.game.at_platform == Platform.Douyin) {
            return DouyinSDK.getInstance().vibrateShort()
        }
        if (xhgame.game.at_platform == Platform.H5) {
            console.log('h5模拟抖动')
        }
    }
}
export class SdkComp extends BaseModelComp {
    compName: string = 'SdkComp'
    initBySystems: (typeof System)[] = [DdkSystem]
    weixinAdId: string = 'adunit-ed1ee8d464314008'
    douyinAdId: string = '1298e66a158ja63idc'
    reset() {

    }
    actions = {
        showAd: () => {
            return DdkSystem.showAd(this)
        },
        login: () => {
            return DdkSystem.login(this)
        },
        vibrateShort: () => {
            return DdkSystem.vibrateShort(this)
        }
    }

    onDetach() {

    }
}