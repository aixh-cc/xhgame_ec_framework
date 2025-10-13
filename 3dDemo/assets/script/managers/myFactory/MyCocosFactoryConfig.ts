import { CocosUnitItem, CocosUnitItemFactoryDrive } from "../../cocos/items/CocosUnitItem"
import { CocosUiItem, CocosUiItemFactoryDrive } from "../../cocos/items/CocosUiItem"
import { CocosTextUiItem, CocosTextUiItemFactoryDrive } from "../../cocos/items/CocosTextUiItem"
import { CocosUnitUiItem, CocosUnitUiItemFactoryDrive } from "../../cocos/items/CocosUnitUiItem"
import { CocosEffectItem, CocosEffectItemFactoryDrive } from "../../cocos/items/CocosEffectItem"
import { CocosTiledItem, CocosTiledItemFactoryDrive } from "../../cocos/items/CocosTiledItem"
import { IFactoryConfig } from "@aixh-cc/xhgame_ec_framework"
import { EffectItemFactory, FactoryType, TextUiItemFactory, TiledItemFactory, UiItemFactory, UnitItemFactory, UnitUiItemFactory } from "./MyFactorys"

export class MyCocosFactoryConfig implements IFactoryConfig {
    [FactoryType.unitItem]: UnitItemFactory<CocosUnitItemFactoryDrive, CocosUnitItem> = (new UnitItemFactory<CocosUnitItemFactoryDrive, CocosUnitItem>()).setItemProduceDrive(new CocosUnitItemFactoryDrive());
    [FactoryType.uiItem]: UiItemFactory<CocosUiItemFactoryDrive, CocosUiItem> = (new UiItemFactory<CocosUiItemFactoryDrive, CocosUiItem>()).setItemProduceDrive(new CocosUiItemFactoryDrive());
    [FactoryType.textUiItem]: TextUiItemFactory<CocosTextUiItemFactoryDrive, CocosTextUiItem> = (new TextUiItemFactory<CocosTextUiItemFactoryDrive, CocosTextUiItem>()).setItemProduceDrive(new CocosTextUiItemFactoryDrive());
    [FactoryType.unitUiItem]: UnitUiItemFactory<CocosUnitUiItemFactoryDrive, CocosUnitUiItem> = (new UnitUiItemFactory<CocosUnitUiItemFactoryDrive, CocosUnitUiItem>()).setItemProduceDrive(new CocosUnitUiItemFactoryDrive());
    [FactoryType.effectItem]: EffectItemFactory<CocosEffectItemFactoryDrive, CocosEffectItem> = (new EffectItemFactory<CocosEffectItemFactoryDrive, CocosEffectItem>()).setItemProduceDrive(new CocosEffectItemFactoryDrive());
    [FactoryType.tiledItem]: TiledItemFactory<CocosTiledItemFactoryDrive, CocosTiledItem> = (new TiledItemFactory<CocosTiledItemFactoryDrive, CocosTiledItem>()).setItemProduceDrive(new CocosTiledItemFactoryDrive());
}

