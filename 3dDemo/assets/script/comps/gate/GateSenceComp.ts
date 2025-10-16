import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
// import { GateGroupMissionComp } from "./GateGroupMissionComp"
// import { GateToBattleComp } from "./GateToBattleComp"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"

// import { SettingViewComp } from "../common/SettingViewComp"
// import { GateStorePanelComp } from "./GateStorePanelComp"
// import { GateDYYJViewComp } from "./GateDYYJViewComp"
// import { GatePackagePanelComp } from "./PackagePanel/GatePackagePanelComp"
// import { PackageType } from "../../tsshared/defined/Interface"

export class GateSenceSystem extends System {

    static async initComp(comp: GateSenceComp) {
        await xhgame.gui.openUIAsync(xhgame.gui.enums.Gate_Index, comp)
        xhgame.audio.playMusic(xhgame.audio.enums.QingBg)
    }

    /** 从gate进入战役 */
    static async startBattle(comp: GateSenceComp, battleId: number = 0) {
        // const curBattle = xhgame.table.getTable(xhgame.table.enums.battle).getInfo(battleId)
        // if (curBattle == undefined) {
        //     xhgame.gui.toast('未找到该关卡信息，敬请期待')
        //     return
        // }
        // xhgame.gameEntity.battleModel.reset()
        // xhgame.gameEntity.battleModel.curBattleTableItem = JSON.parse(JSON.stringify(curBattle))
        // console.log('GateToBattleComp')
        // await xhgame.gameEntity.attachComponent(GateToBattleComp).setup({ battleId: battleId }).done()
        // xhgame.gameEntity.detachComponent(GateToBattleComp)
    }

    static openGateGroupMission(comp: GateSenceComp) {
        // return xhgame.gameEntity.attachComponent(GateGroupMissionComp).done() as Promise<GateGroupMissionComp>
    }

    static openSettingDialog(comp: GateSenceComp) {
        // xhgame.gameEntity.attachComponent(SettingViewComp)
    }

    static showStorePanel(comp: GateSenceComp) {
        // xhgame.gameEntity.attachComponent(GateStorePanelComp)
    }

    static dyRukouyoujiang(comp: GateSenceComp) {
        // xhgame.gameEntity.attachComponent(GateDYYJViewComp)
    }

    static showPackagePanel(comp: GateSenceComp) {
        // xhgame.gameEntity.attachComponent(GatePackagePanelComp).setup({ curPackageType: PackageType.Skill, curShap: 'O' })
    }

}

export class GateSenceComp extends BaseModelComp {
    compName: string = 'GateSenceComp'
    initBySystems = [GateSenceSystem]
    reset() {

    }
    // 在gate场景,玩家的操作
    actions = {
        /** 开始游戏 */
        startBattle: (battleId: number = 0) => {
            return GateSenceSystem.startBattle(this, battleId)
        },
        /** 打开关卡 */
        openGateGroupMission: () => {
            return GateSenceSystem.openGateGroupMission(this)
        },
        /** 打开设置 */
        openSettingDialog: () => {
            GateSenceSystem.openSettingDialog(this)
        },
        showStorePanel: () => {
            GateSenceSystem.showStorePanel(this)
        },
        dyRukouyoujiang: () => {
            GateSenceSystem.dyRukouyoujiang(this)
        },
        showPackagePanel: () => {
            GateSenceSystem.showPackagePanel(this)
        }
    }

    onAttach() {

    }

    onDetach() {
        xhgame.gui.removeUI(xhgame.gui.enums.Gate_Index)
    }
}