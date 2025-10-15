import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
import { SdkComp } from "../common/SdkComp"
import { HelpComp } from "../common/HelpComp"

export class GameEnterComp extends BaseModelComp {
    compName: string = 'GameEnterComp'
    initBySystems: (typeof System)[] = [GameEnterSystem]
    reset() {
    }
    actions = {

    }
    onDetach() {

    }
}

export class GameEnterSystem extends System {
    static async initComp(comp: GameEnterComp) {
        await xhgame.gameEntity.attachComponent(SdkComp).done()
        console.log('SdkComp done')
        await Promise.all([
            // await xhgame.gameEntity.attachComponent(GateSenceComp).done(),
            // await xhgame.gameEntity.attachComponent(PlayerLoginComp).done(),
            await xhgame.gameEntity.attachComponent(HelpComp).done()
        ])
        // let wg: IWaitGroup = { groupResolve: resolve, groupCount: 1, hasDoneCount: 0 }
        // // xhgame.gameEntity.attachComponent(PlayerLoginComp).done(wg)
        // // xhgame.gameEntity.attachComponent(GateSenceComp).done(wg)
        // xhgame.gameEntity.attachComponent(HelpComp).done(wg)
    }
}

