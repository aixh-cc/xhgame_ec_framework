
import { IUnitItem, IUnitUiItem } from "db://assets/script/managers/myFactory/MyFactorys"
import { BaseTestItem } from "./BaseTestItem"
import { IItemProduceDrive } from "@aixh-cc/xhgame_ec_framework"


export class TestUnitUiItem extends BaseTestItem implements IUnitUiItem {
    static className = 'TestUnitUiItem'
    private _atUnitItem: IUnitItem = null
    get atUnitItem() {
        return this._atUnitItem
    }
    set atUnitItem(val) {
        this._atUnitItem = val
    }
    offsetPositions: number[] = [0, 0, 0]
    _active: boolean = true
    get active() {
        return this._active
    }
    set active(val) {
        this._active = val
        this.node.active = val
    }
    _content: string = ''
    get content() {
        return this._content
    }
    set content(val) {
        this._content = val
    }
    reset() {
        this._atUnitItem = null
        this.offsetPositions = [0, 0, 0]
        this.active = true
        this.content = ''
    }
    clone() {

    }
    toScene(): void {
        console.log('TestUnitUiItem toScene ')
    }
    toPool(): void {

    }
    /** 当位置或者初始化时更新一下 */
    refreshHP(): void {

    }
}

export class TestUnitUiItemFactoryDrive implements IItemProduceDrive {
    name: string = 'TestUnitUiItemFactoryDrive'
    createItem(itemNo: string, itemId: number) {
        return new TestUnitUiItem()
    }
    removeItem(item: TestUnitUiItem) {

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