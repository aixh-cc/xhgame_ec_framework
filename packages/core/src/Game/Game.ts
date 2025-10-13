import { Entity } from "../EC/Entity"
import { INode } from "../Ui/UiDrive"

export interface IGame {
    name: string
    node: INode
    init(): Promise<void>
    play(): void
    setGameEntity(gameEntity: Entity): void
    getGameEntity(): Entity
}

export enum Platform {
    Weixin = 'weixin',
    Douyin = 'douyin',
    H5 = 'h5',
    //
    Android = 'android',
    IOS = 'ios',
    HarmonyOS = 'harmony_os',
    Alipay = 'alipay',
    HuaweiQuick = 'huawei_quick',
}