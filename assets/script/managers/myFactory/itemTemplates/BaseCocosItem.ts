import { IItem } from "@aixh-cc/xhgame_ec_framework"
import { v3, Component } from "cc"
import { CocosBaseItemView } from "db://assets/script/views/CocosBaseItemView"

export abstract class BaseCocosItem extends Component implements IItem {
    static className = 'BaseCocosItem'
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
        this.node.setPosition(v3(...val))
    }
    init(itemNo: string, itemId: number) {
        this._itemId = itemId
        this._itemNo = itemNo
    }
    baseAttrReset() {
        this.positions = [0, 0, 0]
        // 视图中数据层
        let _baseview = this.node.getComponentInChildren(CocosBaseItemView)
        if (_baseview) {
            return _baseview.reset()
        }
        this.mock_vm = null
    }
    mock_vm: any = null
    getViewVm<T>(): T {
        let _baseview = this.node.getComponentInChildren(CocosBaseItemView)
        if (_baseview) {
            return _baseview as T
        } else {
            if (this.mock_vm == null) {
                this.mock_vm = {}
            }
            return this.mock_vm
        }
    }
    abstract reset(): void
    abstract clone(): void
    abstract toScene(): void
    abstract toPool(): void
}