import { IEffectItem } from "db://assets/script/managers/myFactory/MyFactorys"
import { BaseTestItem } from "./BaseTestItem"
import { IItemProduceDrive } from "@aixh-cc/xhgame_ec_framework"

export class TestEffectItem extends BaseTestItem implements IEffectItem {
    static className = 'TestEffectItem'
    /** 特效时间，单位秒 */
    effectTime: number = 0  // 特效持续时间
    onToScene: Function = null
    reset() {
        this.effectTime = 0
    }
    clone() {
        this.effectTime = 0
        this.onToScene = null
    }
    toScene(): void {
        console.log('TestEffectItem toScene ')
    }
    toPool(): void {

    }
}

export class TestEffectItemFactoryDrive implements IItemProduceDrive {
    name: string = 'TestEffectItemFactoryDrive'
    createItem(itemNo: string, itemId: number) {
        return new TestEffectItem()
    }
    removeItem(item: TestEffectItem) {

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