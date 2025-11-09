import { IFactoryConfig } from "@aixh-cc/xhgame_ec_framework";
import { FactoryType } from "../MyFactoryManager";
import { CocosEffectItem, CocosEffectItemFactoryDrive } from "db://assets/script/managers/myFactory/itemTemplates/CocosEffectItem";
import { EffectItemFactory } from "./factorys/EffectItemFactory";

export class MyCocosFactoryConfig implements IFactoryConfig {
    [FactoryType.effectItem]: EffectItemFactory<CocosEffectItemFactoryDrive, CocosEffectItem> = (new EffectItemFactory<CocosEffectItemFactoryDrive, CocosEffectItem>()).setItemProduceDrive(new CocosEffectItemFactoryDrive());
}