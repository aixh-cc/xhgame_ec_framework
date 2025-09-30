import { BaseModelComp } from "../../../packages/core/src/EC/BaseModelComp"
import { System } from "../../../packages/core/src/EC/System"

export class TestViewComp extends BaseModelComp {
    compName: string = 'BattleOverViewComp'
    initBySystems: (typeof System)[] = []
    actions = {

    }
    reset() {

    }
    onDetach() {

    }
}