import { IItem, IItemProduceDrive } from "./Item";

export interface IFactory {
    name: string
    setProduceDrive(itemProduceDrive: IItemProduceDrive): void
    getProduceDrive(): IItemProduceDrive
    produceItem(itemNo: string): IItem
    recycleItem(item: IItem): void
    preloadItemsResource(): Promise<boolean>
    getNewItemId(): number
    clearAllItems(): void
}

export abstract class BaseFactory<T extends IItemProduceDrive, TT extends IItem> implements IFactory {
    abstract name: string;
    private _lastItemId: number = 0
    /** item被重复使用记录 */
    private _itemHistoryMap: Map<TT, number[]> = new Map();
    /** 当前各个item的灵魂回收池 */
    private itemsPoolMap: Map<string, TT[]> = new Map();
    /** 生产驱动 */
    private _itemProduceDrive: T
    setProduceDrive(itemProduceDrive: T): void {
        this._itemProduceDrive = itemProduceDrive
    }
    getProduceDrive(): T {
        return this._itemProduceDrive
    }
    produceItem(itemNo: string): TT {
        let item: TT = null
        let itemsPool = this.itemsPoolMap.get(itemNo)
        if (itemsPool === undefined) {
            itemsPool = [];
            this.itemsPoolMap.set(itemNo, itemsPool); // 提前准备灵魂池
        }
        let itemId = this.getNewItemId()
        if (itemsPool.length > 0) {
            item = itemsPool.pop()
        } else {
            item = this._itemProduceDrive.createItem(itemNo, itemId) as TT;
        }
        item.init(itemNo, itemId)
        // 
        let hasHistory = this._itemHistoryMap.get(item)
        if (hasHistory === undefined) {
            hasHistory = [];
            this._itemHistoryMap.set(item, [itemId])
        } else {
            hasHistory.push(itemId)
        }
        return item
    }
    recycleItem(item: TT) {
        this._itemProduceDrive.removeItem(item) // 销毁肉身
        let itemsPool = this.itemsPoolMap.get(item.itemNo)
        if (itemsPool) {
            itemsPool.push(item) // 放回灵魂池
        }
        item.baseAttrReset() // 基础属性(主要为基类使用)
        item.reset() // 抹除灵魂记忆
    }
    preloadItemsResource() {
        return this._itemProduceDrive.preloadItemsResource()
    }
    getNewItemId() {
        return ++this._lastItemId;
    }
    clearAllItems(): void {
        for (let [item, historys] of this._itemHistoryMap) {
            if (item.alive) {
                this.recycleItem(item)
            }
        }
    }
}

/**
 * 
 *  工厂配置
 *  例子:
 *  class MyTestFactoryConfig extends FactoryConfig {
 *      [FactoryType.unitItem]: typeof UnitItemFactory<IItemProduceDrive, IItem & IUnitItem> = UnitItemFactory;
 *      [FactoryType.effectItem]: typeof EffectItemFactory<IItemProduceDrive, IItem & IEffectItem> = EffectItemFactory;
 *  }
 */
export class FactoryConfig {
    [key: string]: new (...args: any[]) => any;
}