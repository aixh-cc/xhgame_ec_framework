import { TestUnitItem, TestUnitItemFactoryDrive } from "./test/items/TestUnitItem"
import { TestUiItem, TestUiItemFactoryDrive } from "./test/items/TestUiItem"
import { TestTextUiItem, TestTextUiItemFactoryDrive } from "./test/items/TestTextUiItem"
import { TestUnitUiItem, TestUnitUiItemFactoryDrive } from "./test/items/TestUnitUiItem"
import { TestEffectItem, TestEffectItemFactoryDrive } from "./test/items/TestEffectItem"
import { TestTiledItem, TestTiledItemFactoryDrive } from "./test/items/TestTiledItem"
import { IFactoryConfig } from "@aixh-cc/xhgame_ec_framework"
import { EffectItemFactory, FactoryType, TextUiItemFactory, TiledItemFactory, UiItemFactory, UnitItemFactory, UnitUiItemFactory } from "db://assets/script/managers/myFactory/MyFactorys"

export class MyTestFactoryConfig implements IFactoryConfig {
    [FactoryType.unitItem]: UnitItemFactory<TestUnitItemFactoryDrive, TestUnitItem> = (new UnitItemFactory<TestUnitItemFactoryDrive, TestUnitItem>()).setItemProduceDrive(new TestUnitItemFactoryDrive());
    [FactoryType.uiItem]: UiItemFactory<TestUiItemFactoryDrive, TestUiItem> = (new UiItemFactory<TestUiItemFactoryDrive, TestUiItem>()).setItemProduceDrive(new TestUiItemFactoryDrive());
    [FactoryType.textUiItem]: TextUiItemFactory<TestTextUiItemFactoryDrive, TestTextUiItem> = (new TextUiItemFactory<TestTextUiItemFactoryDrive, TestTextUiItem>()).setItemProduceDrive(new TestTextUiItemFactoryDrive());
    [FactoryType.unitUiItem]: UnitUiItemFactory<TestUnitUiItemFactoryDrive, TestUnitUiItem> = (new UnitUiItemFactory<TestUnitUiItemFactoryDrive, TestUnitUiItem>()).setItemProduceDrive(new TestUnitUiItemFactoryDrive());
    [FactoryType.effectItem]: EffectItemFactory<TestEffectItemFactoryDrive, TestEffectItem> = (new EffectItemFactory<TestEffectItemFactoryDrive, TestEffectItem>()).setItemProduceDrive(new TestEffectItemFactoryDrive());
    [FactoryType.tiledItem]: TiledItemFactory<TestTiledItemFactoryDrive, TestTiledItem> = (new TiledItemFactory<TestTiledItemFactoryDrive, TestTiledItem>()).setItemProduceDrive(new TestTiledItemFactoryDrive());
}
