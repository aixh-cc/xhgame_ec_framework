import { IItem } from "@aixh-cc/xhgame_ec_framework"

export abstract class BaseTestItem implements IItem {
    static className = 'BaseTestItem'
    node: any
    /** itemId */
    private _itemId: number = 0
    get itemId() {
        return this._itemId
    }
    set itemId(val) {
        this._itemId = val
    }
    /** itemNo */
    private _itemNo: string = ''
    get itemNo() {
        return this._itemNo
    }
    set itemNo(val) {
        this._itemNo = val
    }
    // 
    private _alive: boolean = false
    get alive() {
        return this._alive
    }
    set alive(val) {
        this._alive = val
    }
    /** 位置信息 */
    private _positions: number[] = [0, 0, 0]
    get positions() {
        return this._positions
    }
    set positions(val) {
        this._positions = val
    }
    init(itemNo: string, itemId: number) {
        this._itemId = itemId
        this._itemNo = itemNo
    }
    baseAttrReset() {
        this.positions = [0, 0, 0]
        this.mock_vm = null
        // 视图中数据层
    }
    mock_vm: any = null
    getViewVm<T>(): T {
        if (this.mock_vm == null) {
            this.mock_vm = {}
        }
        return this.mock_vm
    }
    abstract reset(): void
    abstract clone(): void
    abstract toScene(): void
    abstract toPool(): void
}