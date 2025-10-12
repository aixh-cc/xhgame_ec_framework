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