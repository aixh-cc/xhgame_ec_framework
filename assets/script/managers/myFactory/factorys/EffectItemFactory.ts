import { IItem, BaseFactory, IItemProduceDrive } from "@aixh-cc/xhgame_ec_framework"
import { FactoryType } from "../MyFactorys"

export interface IEffectItem extends IItem {
    effectTime: number
    /** 部分单位状态动态没有很快达到，需要onToScene来实现 */
    onToScene: Function
}

export class EffectItemFactory<T extends IItemProduceDrive, TT extends IItem & IEffectItem> extends BaseFactory<T, TT> {
    name = FactoryType.effectItem;
}