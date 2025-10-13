import { BaseFactory, IItem, IItemProduceDrive } from "@aixh-cc/xhgame_ec_framework";
import { UnitAnimator } from "../../cocos/items/CocosUnitItem";
import { IUnitState } from "../../common/unit/State";

export enum FactoryType {
    unitItem = "unitItem",
    uiItem = "uiItem",
    textUiItem = 'textUiItem',
    unitUiItem = 'unitUiItem',
    effectItem = 'effectItem',
    tiledItem = 'tiledItem',
}

export interface IEffectItem extends IItem {
    effectTime: number
    /** 部分单位状态动态没有很快达到，需要onToScene来实现 */
    onToScene: Function
}

export interface ITextUiItem extends IItem {
    // 特有的
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
    animator: UnitAnimator
    hp: number
    maxHp: number
    bloodUnitUiItem: IUnitUiItem
    state: IUnitState
    active: boolean
    getModelName(): string
    // 动作
    idle(): void
    die(): void
    lookAt(x: number, y: number, z: number): void
    /** 部分单位状态动态没有很快达到，需要onToScene来实现 */
    onToScene: Function
}
export interface IUnitUiItem extends IItem {
    atUnitItem: IUnitItem
    content: string
    active: boolean
    offsetPositions: number[]
    refreshHP(): void
}

export class EffectItemFactory<T extends IItemProduceDrive, TT extends IItem & IEffectItem> extends BaseFactory<T, TT> {
    name = FactoryType.effectItem;
}
export class TextUiItemFactory<T extends IItemProduceDrive, TT extends IItem & ITextUiItem> extends BaseFactory<T, TT> {
    name = FactoryType.textUiItem;
}
export class TiledItemFactory<T extends IItemProduceDrive, TT extends IItem & ITiledItem> extends BaseFactory<T, TT> {
    name = FactoryType.tiledItem;
}
export class UiItemFactory<T extends IItemProduceDrive, TT extends IItem & IUiItem> extends BaseFactory<T, TT> {
    name = FactoryType.uiItem;
}
export class UnitItemFactory<T extends IItemProduceDrive, TT extends IItem & IUnitItem> extends BaseFactory<T, TT> {
    name = FactoryType.unitItem;
}
export class UnitUiItemFactory<T extends IItemProduceDrive, TT extends IItem & IUnitUiItem> extends BaseFactory<T, TT> {
    name = FactoryType.unitUiItem;
}