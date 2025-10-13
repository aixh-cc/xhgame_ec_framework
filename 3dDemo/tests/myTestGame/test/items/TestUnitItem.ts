import { IUnitItem, IUnitUiItem } from "db://assets/script/managers/myFactory/MyFactorys"
// import { IUnitState, StandingState } from "../../../../assets//script/common/unit/State"
// import { UnitAnimator } from "../../../../assets/script/cocos/items/CocosUnitItem"

import { xhgame } from "../../../../assets/script/xhgame"
import { BaseTestItem } from "./BaseTestItem"
import { IFactory, IItem, IItemProduceDrive } from "@aixh-cc/xhgame_ec_framework"

export class TestUnitItem extends BaseTestItem implements IUnitItem {
    static className = 'TestUnitItem'
    unique_code: string = '';
    animator: any; //UnitAnimator
    /** 是否是玩家单位 */
    private _owner_is_player: boolean = false
    get owner_is_player() {
        return this._owner_is_player
    }
    set owner_is_player(val) {
        this._owner_is_player = val
    }
    /** 是否显示 */
    _active: boolean = true
    get active() {
        return this._active
    }
    set active(val) {
        this._active = val
        // todo同时血条也隐藏起来
        // _item.bloodBar.node.active = false
    }
    /** 当前hp */
    _hp: number = 0
    get hp() {
        return this._hp
    }
    set hp(val) {
        this._hp = val
    }
    /** 最大hp */
    _maxHp: number = 0
    get maxHp() {
        return this._maxHp
    }
    set maxHp(val) {
        this._maxHp = val
    }

    onToScene: Function = null
    reset() {
        this.unique_code = ''
        this._owner_is_player = false
        this._hp = 0
        this._maxHp = 0
        this._active = true
        this.onToScene = null
    }
    clone() {

    }
    toScene(): void {

    }
    toPool(): void {

    }
    idle(): void {
        this.state.stand()
    }
    die(): void {
        this.state.die()
    }
    lookAt(x: number = 0, y: number = 0, z: number = 0) {

    }
    /** 当前单位状态(只能通过方法修改) */
    private _bloodUnitUiItem: IUnitUiItem = null
    get bloodUnitUiItem() {
        if (this._bloodUnitUiItem == null) {
            this._bloodUnitUiItem = xhgame.factory.actions.createUnitUiItem('blood')
            this._bloodUnitUiItem.atUnitItem = this
            this._bloodUnitUiItem.offsetPositions = [-10, 30, 0]
        }
        return this._bloodUnitUiItem
    }
    /** 获取单位状态 */
    private _state: any // IUnitState
    get state(): any {
        if (this._state == null) {
            // this.state = new StandingState()
        }
        return this._state;
    }
    /** 设置单位状态 */
    set state(state: any) {
        this._state = state;
        state.enterState(this);
    }
    getModelName() {
        return this.itemNo
    }
}

export class TestUnitItemFactoryDrive implements IItemProduceDrive {
    name: string = 'TestUnitItemFactoryDrive'
    createItem(itemNo: string, itemId: number) {
        return new TestUnitItem()
    }
    removeItem(item: IItem) {

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