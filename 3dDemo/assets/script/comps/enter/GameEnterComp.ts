import { IWaitGroup, System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
import { SdkComp } from "../common/SdkComp"
import { HelpComp } from "../common/HelpComp"

export class GameEnterSystem extends System {
    static async initComp(comp: GameEnterComp) {
        return new Promise<void>(async (resolve, reject) => {
            await xhgame.gameEntity.attachComponent(SdkComp).done()
            let wg: IWaitGroup = { groupResolve: resolve, groupCount: 1, hasDoneCount: 0 }
            // xhgame.gameEntity.attachComponent(PlayerLoginComp).done(wg)
            // xhgame.gameEntity.attachComponent(GateSenceComp).done(wg)
            xhgame.gameEntity.attachComponent(HelpComp).done(wg)
        })
    }
}

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