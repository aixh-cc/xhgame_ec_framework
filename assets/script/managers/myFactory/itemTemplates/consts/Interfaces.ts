export interface IItem {
    node: any;
    /** item出厂id,不能被reset和baseAttrReset重置,只能有工厂设置 */
    itemId: number;
    /** item出厂品类,不能被reset和baseAttrReset重置,只能有工厂设置 */
    itemNo: string;
    /** 是否存活,alive=false代表已进入单位池 */
    alive: boolean;
    /** 坐标 */
    positions: number[];
    /** 出厂贴标 */
    init(itemNo: string, itemId: number): void;
    /** 重置 */
    reset(): void;
    /** 克隆(自行) */
    clone(): any;
    /** 上场 */
    toScene(): void;
    /** 回对象池 */
    toPool(): void;
    /** 基类中的基础属性重置 */
    baseAttrReset(): void;
    /** 获取Item的ViewVm */
    getViewVm<T>(): T;
}

export interface IEffectItem extends IItem {
    effectTime: number
    /** 部分单位状态动态没有很快达到，需要onToScene来实现 */
    onToScene: Function
}

export interface ITextUiItem extends IItem {
    content: string
    playTime: number
    playEndCallback: Function
}
export interface ITiledItem extends IItem {
    // 特有的
}
export interface IUiItem extends IItem {
    itemsIndex: number
    active: boolean
    btnActive: boolean
    onClickCallback: Function
    onClickItem(): void
    playAnim(animName: string): void
    moveToUiRootPath(sec: number, path: string, children_index: number, offsetX: number, offsetY: number): void
}
export interface IUnitItem extends IItem {
    owner_is_player: boolean
    animator: any // UnitAnimator
    hp: number
    maxHp: number
    bloodUnitUiItem: IUnitUiItem
    state: any // IUnitState
    active: boolean
    getModelName(): string
    // 动作
    idle(): void
    die(): void
    lookAt(x: number, y: number, z: number): void
    /** 部分单位状态动态没有很快达到，需要onToScene来实现 */
    onToScene: Function
    unitUiItemCode: string
}
export interface IUnitUiItem extends IItem {
    atUnitItem: IUnitItem
    content: string
    active: boolean
    offsetPositions: number[]
    refreshHP(): void
}