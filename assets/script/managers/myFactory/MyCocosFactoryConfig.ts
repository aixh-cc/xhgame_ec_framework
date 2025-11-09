import { IFactoryConfig } from "@aixh-cc/xhgame_ec_framework";
import { FactoryType } from "../MyFactoryManager";

export class MyCocosFactoryConfig implements IFactoryConfig {
    //[FactoryType.effectItem]: EffectItemFactory<CocosEffectItemFactoryDrive, CocosEffectItem> = (new EffectItemFactory<CocosEffectItemFactoryDrive, CocosEffectItem>()).setItemProduceDrive(new CocosEffectItemFactoryDrive());
}
const getFactoryType = () => {
    return FactoryType // 主要是为了 FactoryType 被使用
}