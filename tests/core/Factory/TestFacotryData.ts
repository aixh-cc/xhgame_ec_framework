import { BaseFactory, IFactoryConfig, IFactory, IFactoryAction } from "../../../packages/core/src/Factory/Factory";
import { IItem, IItemProduceDrive } from "../../../packages/core/src/Factory/Item";

export enum FactoryType {
    uiItem = 'uiItem',
    unitItem = "unitItem",
    effectItem = 'effectItem',
}
export interface IUiItem extends IItem {
    onClickItem: Function | null
}
export interface IUnitItem extends IItem {
    owner_is_player: boolean
}
export interface IEffectItem extends IItem {
    effectTime: number
}

export abstract class BaseTestItem implements IItem {
    node: any;
    itemId: number = 0
    itemNo: string = ''
    alive: boolean = false
    positions: number[] = [0, 0, 0]
    init(itemNo: string, itemId: number): void {
        this.itemNo = itemNo
        this.itemId = itemId
    }
    baseAttrReset() {
        this.positions = [0, 0, 0]
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
export class TestUiItem extends BaseTestItem implements IUiItem {
    static className = 'TestUiItem'
    onClickItem = null
    reset() {
        this.onClickItem = null
    }
    clone() {
        this.itemId
    }
    toScene(): void {

    }
    toPool(): void {

    }
}
export class TestUnitItem extends BaseTestItem implements IUnitItem {
    static className = 'TestUnitItem'
    owner_is_player: boolean = false
    reset() {
        this.owner_is_player = false
    }
    clone() {
        this.itemId
    }
    toScene(): void {

    }
    toPool(): void {

    }
}
export class TestEffectItem extends BaseTestItem implements IEffectItem {
    static className = 'TestEffectItem'
    /** 特效时间，单位秒 */
    effectTime: number = 0  // 特效持续时间
    reset() {
        this.effectTime = 0
    }
    clone() {

    }
    toScene(): void {

    }
    toPool(): void {

    }
}
export class TestUiItemProduceDrive implements IItemProduceDrive {
    name: string = 'TestUiItemProduceDrive'
    preloadItemsResource(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }
    releaseItemsResource(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }
    createItem(itemNo: string, itemId: number) {
        return new TestUiItem()
    }
    removeItem(item: TestUiItem): void {

    }
}
export class TestEffectItemProduceDrive implements IItemProduceDrive {
    name: string = 'TestEffectItemProduceDrive'
    preloadItemsResource(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }
    releaseItemsResource(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }
    createItem(itemNo: string, itemId: number) {
        return new TestEffectItem()
    }
    removeItem(item: TestEffectItem): void {

    }
}
export class TestUnitItemProduceDrive implements IItemProduceDrive {
    name: string = 'TestUnitItemProduceDrive'
    preloadItemsResource(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }
    releaseItemsResource(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }
    createItem(itemNo: string, itemId: number) {
        return new TestUnitItem()
    }
    removeItem(item: TestUnitItem): void {

    }
}
export class UiItemFactory<T extends IItemProduceDrive, TT extends IUiItem> extends BaseFactory<T, TT> {
    name = FactoryType.uiItem;
}
export class UnitItemFactory<T extends IItemProduceDrive, TT extends IUnitItem> extends BaseFactory<T, TT> {
    name = FactoryType.unitItem;
}
export class EffectItemFactory<T extends IItemProduceDrive, TT extends IEffectItem> extends BaseFactory<T, TT> {
    name = FactoryType.effectItem;
}
export class MyTestFactoryConfig implements IFactoryConfig {
    [FactoryType.uiItem]: UiItemFactory<TestUiItemProduceDrive, TestUiItem> = (new UiItemFactory<TestUiItemProduceDrive, TestUiItem>()).setItemProduceDrive(new TestUiItemProduceDrive());
    [FactoryType.unitItem]: UnitItemFactory<TestUnitItemProduceDrive, TestUnitItem> = (new UnitItemFactory<TestUnitItemProduceDrive, TestUnitItem>()).setItemProduceDrive(new TestUnitItemProduceDrive());
    [FactoryType.effectItem]: EffectItemFactory<TestEffectItemProduceDrive, TestEffectItem> = (new EffectItemFactory<TestEffectItemProduceDrive, TestEffectItem>()).setItemProduceDrive(new TestEffectItemProduceDrive());
}
export class MyFactoryAction implements IFactoryAction {
    createUiItem(itemNo: string): IItem {
        return new TestUiItem()
    }
    removeUiItem(item: IItem): void {

    }
    getUiItemFactory(): IFactory {
        return {} as IFactory
    }
    createEffectItem(itemNo: string): IItem {
        return new TestUiItem()
    }
    removeEffectItem(item: IItem): void {

    }
    getEffectItemFactory(): IFactory {
        return {} as IFactory
    }
}