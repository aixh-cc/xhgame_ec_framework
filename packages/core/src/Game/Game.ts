import { Entity } from "../EC/Entity"

export interface IGame {
    name: string
    init(): Promise<void>
    play(): void
    setGameEntity(gameEntity: Entity): void
    getGameEntity(): Entity
}