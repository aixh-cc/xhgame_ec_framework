
import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"

export class LoadResourceViewSystem extends System {
    static async initComp(comp: LoadResourceViewComp) {
        // 这个是唯一直接已挂载在root上的
        xhgame.event.emit('load_resource')
        // comp.viewVM.is_load_resource = true
        // comp.notify()
        await this.loadFinished(comp)
    }

    static loadFinished(comp: LoadResourceViewComp) {
        return new Promise((resolve, reject) => {
            comp.loadFinishedCallback = resolve
        })
    }
}

export class LoadResourceViewComp extends BaseModelComp {
    compName: string = 'LoadResourceViewComp'
    initBySystems: (typeof System)[] = [LoadResourceViewSystem]
    loadFinishedCallback: Function = null
    reset() {
        this.loadFinishedCallback = null
    }

    actions = {

    }

    onDetach() {

    }
}