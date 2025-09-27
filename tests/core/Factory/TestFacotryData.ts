import { BaseFactory, DriveConfig, FactoryConfig } from "../../../packages/core/src/Factory/Factory";
import { IItem, IItemProduceDrive } from "../../../packages/core/src/Factory/Item";

export enum FactoryType {
    unitItem = "unitItem",
    effectItem = 'effectItem',
}
export interface IUnitItem {
    owner_is_player: boolean
}
export interface IEffectItem {
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
    abstract reset(): void
    abstract clone(): void
    abstract toScene(): void
    abstract toPool(): void
}
export class TestUnitItem extends BaseTestItem implements IUnitItem {
    static className = 'TestUnitItem'
    owner_is_player: boolean = false
    reset() {
        this.owner_is_player = false
    }
    clone() {

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
    createItem() {
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
    createItem() {
        return new TestUnitItem()
    }
    removeItem(item: TestUnitItem): void {

    }
}

export class UnitItemFactory<T extends IItemProduceDrive, TT extends IItem & IUnitItem> extends BaseFactory<T, TT> {
    name = FactoryType.unitItem;
}
export class EffectItemFactory<T extends IItemProduceDrive, TT extends IItem & IEffectItem> extends BaseFactory<T, TT> {
    name = FactoryType.effectItem;
}
export class MyTestFactoryConfig extends FactoryConfig {
    [FactoryType.unitItem]: typeof UnitItemFactory<TestEffectItemProduceDrive, IItem & IUnitItem> = UnitItemFactory;
    [FactoryType.effectItem]: typeof EffectItemFactory<TestEffectItemProduceDrive, IItem & IEffectItem> = EffectItemFactory;
}

export class MyTestDriveConfig extends DriveConfig {
    [FactoryType.unitItem]: typeof TestUnitItemProduceDrive = TestUnitItemProduceDrive;
    [FactoryType.effectItem]: typeof TestEffectItemProduceDrive = TestEffectItemProduceDrive;
}