import { BaseModelComp, System } from "@aixh-cc/xhgame_ec_framework";
// import { IAccountInfo, IPlayer } from "../../tsshared/defined/Interface"
import { xhgame } from "db://assets/script/xhgame";

interface IPostParam {
    code: string
    anonymousCode: string
}
interface IAccountInfo {
    account: string,
    account_token: string,
    hallDomain: string
}
/** 玩家 */
interface IPlayer {
    /** 自增量唯一标识 */
    playerId: number,
    /** 账户名 */
    account: string,
    /** 游戏code */
    gameCode: string,
    /** 主服务 */
    serverNo: string,
    /** name */
    name: string,
    /** 金币 */
    gold: number,
    /** 体力 */
    ps: number,
    /** 钻石 */
    diamond: number,
    /** 最大的关卡index */
    maxBattleId: number,
    /** 创建时间 */
    createtime: Date | null,
    /** 部分数据的 */
    numsOne: number
}

export class PlayerModelSystem extends System {

    static async getAccount(comp: PlayerModelComp, pdata: IPostParam) {
        return new Promise<IAccountInfo>(async (resolve, reject) => {
            let data = {
                code: pdata.code,
                platform: xhgame.game.at_platform,
                anonymousCode: pdata.anonymousCode,
                version: '1.0.0'//xhgame.game.config.version
            }
            console.time('getAccount')
            // resolve(comp.accountInfo)
            // return
            let resdata = await xhgame.net.http.post(xhgame.game.config.account_domain + '/' + xhgame.net.enums.GetServerInfo, data)
            if (resdata) {
                resdata = resdata.res
                console.log(xhgame.game.config.account_domain, resdata)
                console.timeEnd('getAccount')
                let hallDomain = resdata.hallDomain.replace(/^\/+|\/+$/g, '')
                xhgame.storage.origin_set('account', resdata.account)
                xhgame.storage.origin_set('account_token', resdata.account_token)
                xhgame.storage.origin_set('hallDomain', hallDomain)
                comp.accountInfo = {
                    account: resdata.account,
                    account_token: resdata.account_token,
                    hallDomain: hallDomain
                }
                resolve(comp.accountInfo)
            } else {
                reject(false)
            }
        })
    }

    static postPlayerEnter(comp: PlayerModelComp) {
        return new Promise<boolean>(async (resolve, reject) => {
            let data = {
                account: comp.accountInfo.account,
                account_token: comp.accountInfo.account_token,
                gameCode: xhgame.game.config.game_code,
                serverNo: xhgame.game.config.server_no,
            }
            console.time('postPlayerEnter')
            // resolve(true)
            // return
            let ret = await xhgame.net.http.post(comp.accountInfo.hallDomain + '/' + xhgame.net.enums.PlayerEnter, data)
            if (ret) {
                console.log(comp.accountInfo.hallDomain + '/' + xhgame.net.enums.PlayerEnter, ret)
                ret = ret.res
                console.timeEnd('postPlayerEnter')
                console.log('PlayerEnter res ', ret)
                xhgame.storage.origin_set('token', ret.token)
                comp.playerInfo = ret.playerInfo
                comp.selectedBattleId = ret.playerInfo.maxBattleId
                comp.notify()
                resolve(true)
            } else {
                reject(false)
            }
        })
    }

}

export class PlayerModelComp extends BaseModelComp {
    compName: string = 'PlayerModelComp'
    initBySystems: (typeof System)[] = []
    // 
    //
    accountInfo: IAccountInfo = null
    playerInfo: IPlayer = null
    selectedBattleId: number = 0
    reset() {
        this.accountInfo = null
        this.playerInfo = null
        this.selectedBattleId = 0
    }
    actions = {
        getAccount: (pdata: IPostParam) => {
            return PlayerModelSystem.getAccount(this, pdata)
        },
        postPlayerEnter: () => {
            return PlayerModelSystem.postPlayerEnter(this)
        }
    }
    onDetach(): void {

    }
}