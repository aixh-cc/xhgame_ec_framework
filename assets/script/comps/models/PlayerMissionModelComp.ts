import { BaseModelComp, DI, System } from "@aixh-cc/xhgame_ec_framework";
import { xhgame } from "db://assets/script/xhgame";
import { PlayerModelComp } from "./PlayerModelComp";

/**
 * 关卡item,命名以model结尾的数据结构与后端保持一致
 */
export interface IMissionItemModel {
    battleId: number,
    index: number,
    maxScore: number,
    maxStar: number,
}

export interface IGroupMissionInfoModel {
    playerId: number,
    groupId: number,
    missionItems: IMissionItemModel[]
}

export class PlayerMissionModelSystem extends System {
    static async getGroupMissionInfo(comp: PlayerMissionModelComp, group: number) {
        return new Promise<IGroupMissionInfoModel>(async (resolve, reject) => {
            if (comp.lastRewardId == comp.preLastRewardId) {
                console.log('getGroupMissionInfo:最近没有胜利，则取本地的数据')
                resolve(comp.curGroupMissionInfo)
                return
            }
            console.log('getGroupMissionInfo:从接口获取')
            let data = {
                token: xhgame.storage.origin_get('token'),
                groupId: group,
            }
            const playerModel = xhgame.gameEntity.safeGetComponentByRegisterName('PlayerModelComp')
            let ret = await xhgame.net.http.post(playerModel.accountInfo.hallDomain + '/' + xhgame.net.enums.GetPlayerMission, data)
            if (ret.isSucc) {
                let data = ret.res
                comp.curGroupMissionInfo = data.missionInfo
                comp.preLastRewardId = comp.lastRewardId
                resolve(comp.curGroupMissionInfo)
            } else {
                reject()
            }
        })
    }

}

export class PlayerMissionModelComp extends BaseModelComp {
    compName: string = 'PlayerMissionModelComp'
    initBySystems: (typeof System)[] = []
    // 
    curGroupMissionInfo: IGroupMissionInfoModel = null
    selectedBattleId: number = 0
    lastRewardId: number = 0
    preLastRewardId: number = -1
    reset() {
        this.curGroupMissionInfo = null
        this.selectedBattleId = 0
        this.lastRewardId = 0
        this.preLastRewardId = -1
    }
    actions = {
        getGroupMissionInfo: (group) => {
            return PlayerMissionModelSystem.getGroupMissionInfo(this, group)
        }
    }
    onDetach(): void {

    }
}