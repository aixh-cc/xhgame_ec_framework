import { IItem } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "db://assets/script/xhgame"
import { FactoryType } from "./MyFactorys"

export class MyFactoryActions {

    createTextUiItem(itemNo: string) {
        return xhgame.factory.getFactory(FactoryType.textUiItem).produceItem(itemNo)
    }
    removeTextUiItem(item: IItem) {
        return xhgame.factory.getFactory(FactoryType.textUiItem).recycleItem(item)
    }
    getTextUiItemFactory() {
        return xhgame.factory.getFactory(FactoryType.textUiItem)
    }
    // 
    createUnitItem(itemNo: string) {
        return xhgame.factory.getFactory(FactoryType.unitItem).produceItem(itemNo)
    }
    removeUnitItem(item: IItem) {
        return xhgame.factory.getFactory(FactoryType.unitItem).recycleItem(item)
    }
    getUnitItemFactory() {
        return xhgame.factory.getFactory(FactoryType.unitItem)
    }
    // 
    createUnitUiItem(itemNo: string) {
        return xhgame.factory.getFactory(FactoryType.unitUiItem).produceItem(itemNo)
    }
    removeUnitUiItem(item: IItem) {
        return xhgame.factory.getFactory(FactoryType.unitUiItem).recycleItem(item)
    }
    getUnitUiItemFactory() {
        return xhgame.factory.getFactory(FactoryType.unitUiItem)
    }
    // 
    createEffectItem(itemNo: string) {
        return xhgame.factory.getFactory(FactoryType.effectItem).produceItem(itemNo)
    }
    removeEffectItem(item: IItem) {
        return xhgame.factory.getFactory(FactoryType.effectItem).recycleItem(item)
    }
    getEffectItemFactory() {
        return xhgame.factory.getFactory(FactoryType.effectItem)
    }
    // 
    createTiledItem(itemNo: string) {
        return xhgame.factory.getFactory(FactoryType.tiledItem).produceItem(itemNo)
    }
    removeTiledItem(item: IItem) {
        return xhgame.factory.getFactory(FactoryType.tiledItem).recycleItem(item)
    }
    getTiledItemFactory() {
        return xhgame.factory.getFactory(FactoryType.tiledItem)
    }
    // 
    createUiItem(itemNo: string) {
        return xhgame.factory.getFactory(FactoryType.uiItem).produceItem(itemNo)
    }
    removeUiItem(item: IItem) {
        return xhgame.factory.getFactory(FactoryType.uiItem).recycleItem(item)
    }
    getUiItemFactory() {
        return xhgame.factory.getFactory(FactoryType.uiItem)
    }
}