import { Entity } from "../../../packages/core/src/EC/Entity";
import { BaseModelComp } from "../../../packages/core/src/EC/BaseModelComp";
export class GameEntity extends Entity {
    model: GameModelComp | null = null;
    init() {
        this.model = this.attachComponent(GameModelComp)
    }
}

export class GameModelComp extends BaseModelComp {
    compName: string = 'GameModelComp'
    initBySystems = []
    // 
    platform: string = ''
    reset() {
        this.platform = ''
    }
    onDetach() {

    }
}