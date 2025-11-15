import { Entity } from "../EC/Entity"
import { INode } from "../Ui/UiDrive"

export interface IGame {
    name: string
    node: INode
    meta: IGameMeta
    init(): Promise<void>
    play(): void
    setGameEntity(gameEntity: Entity): void
    getGameEntity(): Entity
}
export interface IGameMeta {
    server_no: string
    name: string
    version: string
    game_code: string
    account_domain: string
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
