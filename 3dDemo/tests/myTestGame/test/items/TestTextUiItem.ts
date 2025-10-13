import { IFactory, IItemProduceDrive } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../../../assets/script/xhgame"
import { BaseTestItem } from "./BaseTestItem"
import { ITextUiItem } from "db://assets/script/managers/myFactory/MyFactorys"

export class TestTextUiItem extends BaseTestItem implements ITextUiItem {
    static className = 'TestTextUiItem'
    content: string = ''
    playTime: number = 0
    playEndCallback: Function = null
    reset() {
        this.content = ''
        this.playTime = 0
        this.playEndCallback = null
    }
    clone() {

    }
    toScene(): void {
        xhgame.timer.scheduleOnce(() => {
            this.toPool()
        }, this.playTime)
    }
    toPool(): void {
        xhgame.factory.actions.removeTextUiItem(this)
    }
}

export class TestTextUiItemFactoryDrive implements IItemProduceDrive {
    name: string = 'TestTextUiItemFactoryDrive'
    createItem(itemNo: string, itemId: number) {
        // 直接new一个
        return new TestTextUiItem()
    }
    removeItem(item: TestTextUiItem) {
        // 无node.parent关系
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