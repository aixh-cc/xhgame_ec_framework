export interface IItem {
    node: any
    /** item出厂id,不能被reset和baseAttrReset重置,只能有工厂设置 */
    itemId: number
    /** item出厂品类,不能被reset和baseAttrReset重置,只能有工厂设置 */
    itemNo: string
    /** 是否存活,alive=false代表已进入单位池 */
    alive: boolean
    /** 坐标 */
    positions: number[]
    /** 出厂贴标 */
    init(itemNo: string, itemId: number): void
    /** 重置 */
    reset(): void
    /** 克隆(自行) */
    clone(): any
    /** 上场 */
    toScene(): void
    /** 回对象池 */
    toPool(): void
    /** 基类中的基础属性重置 */
    baseAttrReset(): void
}

export interface IItemProduceDrive {
    name: string
    preloadItemsResource(): Promise<boolean>
    createItem(itemNo: string, itemId: number): IItem
    removeItem(item: IItem): void
}