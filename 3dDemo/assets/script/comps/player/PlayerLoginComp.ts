import { DI, System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
import { SdkComp } from "../common/SdkComp"
import { PlayerModelComp } from "../models/PlayerModelComp"

export class PlayerLoginSystem extends System {
    static async initComp(comp: PlayerLoginComp) {
        let ret = await xhgame.gameEntity.getComponent(SdkComp).actions.login()
        await DI.make<PlayerModelComp>('PlayerModelComp').actions.getAccount({
            code: ret.code,
            anonymousCode: ret.anonymousCode,
        })
        console.log('postPlayerEnter')
        await DI.make<PlayerModelComp>('PlayerModelComp').actions.postPlayerEnter()
    }
}

export class PlayerLoginComp extends BaseModelComp {
    compName: string = 'PlayerLoginComp'
    initBySystems: (typeof System)[] = [PlayerLoginSystem]

    reset() {

    }
    actions = {

    }

    onDetach() {

    }
}