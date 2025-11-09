import { IFactoryConfig } from "@aixh-cc/xhgame_ec_framework";
import { FactoryType } from "../MyFactoryManager";
import { EffectItemFactory } from "./factorys/EffectItemFactory";

export class MyCocosFactoryConfig implements IFactoryConfig {
    //[FactoryType.effectItem]: EffectItemFactory<CocosEffectItemFactoryDrive, CocosEffectItem> = (new EffectItemFactory<CocosEffectItemFactoryDrive, CocosEffectItem>()).setItemProduceDrive(new CocosEffectItemFactoryDrive());
    [FactoryType.effectItem]: EffectItemFactory<CocosEffectItemProduceDrive, CocosEffectItem> = (new EffectItemFactory<CocosEffectItemProduceDrive, CocosEffectItem>()).setItemProduceDrive(new CocosEffectItemProduceDrive());
}
const getFactoryType = () => {
    return FactoryType // 主要是为了 FactoryType 被使用
}