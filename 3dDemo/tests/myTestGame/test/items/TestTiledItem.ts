import { IItemProduceDrive } from "@aixh-cc/xhgame_ec_framework"
import { BaseTestItem } from "./BaseTestItem"
import { ITiledItem } from "db://assets/script/managers/myFactory/MyFactorys"

export class TestTiledItem extends BaseTestItem implements ITiledItem {
    static className = 'TestTiledItem'
    getViewVm() {
        return null
    }
    itemsIndex: number = 0
    reset() {
        this.itemsIndex = 0
    }
    clone() {

    }
    toScene(): void {

    }
    toPool(): void {

    }
}

export class TestTiledItemFactoryDrive implements IItemProduceDrive {
    name: string = 'TestTiledItemFactoryDrive'
    createItem(itemNo: string, itemId: number) {
        return new TestTiledItem()
    }
    removeItem(item: TestTiledItem) {

    }
    preloadItemsResource(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            resolve(true)
        })
    }
    releaseItemsResource(itemNos?: string[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }
}