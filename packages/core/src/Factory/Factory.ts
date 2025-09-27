import { IItem, IItemProduceDrive } from "./Item";

export interface IFactory {
    name: string
    /** 初始化时设置的item生产驱动 */
    setItemProduceDrive(itemProduceDrive: IItemProduceDrive): void
    /** 获取当前item */
    getItemProduceDrive(): IItemProduceDrive
    /** 生产item */
    produceItem(itemNo: string): IItem
    /** 回收item */
    recycleItem(item: IItem): void
    /** 预加载资源 */
    preloadItemsResource(): Promise<boolean>
    /** 回收所有item */
    recycleAllItems(): void
    /** 获取item对象池 */
    getItemPools(): Map<string, IItem[]>
    /** 获取item使用记录 */
    getItemHistorys(): Map<IItem, number[]>
    /** 获取alive数量 */
    getAliveCount(itemNo?: string): number
}

export abstract class BaseFactory<T extends IItemProduceDrive, TT extends IItem> implements IFactory {
    abstract name: string;
    private _lastItemId: number = 0
    /** item被重复使用记录 */
    private _itemHistorysMap: Map<TT, number[]> = new Map();
    /** 当前各个item的灵魂回收池 */
    private _itemPoolsMap: Map<string, TT[]> = new Map();
    /** 生产驱动 */
    private _itemProduceDrive: T
    setItemProduceDrive(itemProduceDrive: T): void {
        this._itemProduceDrive = itemProduceDrive
    }
    getItemProduceDrive(): T {
        return this._itemProduceDrive
    }
    produceItem(itemNo: string): TT {
        let item: TT = null
        let itemsPool = this._itemPoolsMap.get(itemNo)
        if (itemsPool === undefined) {
            itemsPool = [];
            this._itemPoolsMap.set(itemNo, itemsPool); // 提前准备灵魂池
        }
        let itemId = this._getNewItemId()
        if (itemsPool.length > 0) {
            item = itemsPool.pop()
        } else {
            item = this._itemProduceDrive.createItem(itemNo, itemId) as TT;
        }
        item.init(itemNo, itemId)
        // 
        let hasHistory = this._itemHistorysMap.get(item)
        if (hasHistory === undefined) {
            hasHistory = [];
            this._itemHistorysMap.set(item, [itemId])
        } else {
            hasHistory.push(itemId)
        }
        item.alive = true
        return item
    }
    recycleItem(item: TT) {
        this._itemProduceDrive.removeItem(item) // 销毁肉身
        let itemsPool = this._itemPoolsMap.get(item.itemNo)
        if (itemsPool) {
            itemsPool.push(item) // 放回灵魂池
        }
        item.baseAttrReset() // 基础属性(主要为基类使用)
        item.reset() // 抹除灵魂记忆
        item.alive = false
    }
    preloadItemsResource() {
        return this._itemProduceDrive.preloadItemsResource()
    }
    private _getNewItemId() {
        return ++this._lastItemId;
    }
    recycleAllItems(): void {
        for (let [item, historys] of this._itemHistorysMap) {
            if (item.alive) {
                this.recycleItem(item)
            }
        }
        this._itemPoolsMap.clear()
        this._itemHistorysMap.clear()
    }
    getItemPools(): Map<string, TT[]> {
        return this._itemPoolsMap
    }
    getItemHistorys(): Map<TT, number[]> {
        return this._itemHistorysMap
    }
    getAliveCount(itemNo: string = ''): number {
        let count = 0;
        for (let [item, historys] of this._itemHistorysMap) {
            if (item.alive) {
                if (itemNo != '') {
                    if (item.itemNo == itemNo) {
                        count++
                    }
                } else {
                    count++
                }
            }
        }
        return count
    }

}

/**
 * 
 *  工厂配置
 *  例子:
 *  class MyTestFactoryConfig extends FactoryConfig {
 *      [FactoryType.unitItem]: typeof UnitItemFactory<IItemProduceDrive, IUnitItem> = UnitItemFactory;
 *      [FactoryType.effectItem]: typeof EffectItemFactory<IItemProduceDrive, IEffectItem> = EffectItemFactory;
 *  }
 */
export class FactoryConfig {
    [key: string]: new (...args: any[]) => any;
}
export class DriveConfig {
    [key: string]: new (...args: any[]) => any;
}