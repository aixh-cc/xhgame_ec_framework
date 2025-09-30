import { Entity } from "../EC/Entity"

export interface IGame {
    name: string
    init(): Promise<void>
    play(): void
    setGameEntity(gameEntity: Entity): void
    getGameEntity(): Entity
}

export abstract class Game<T extends Entity> implements IGame {
    private _gameEntity: T = null
    abstract name: string;
    abstract init(): Promise<void>
    abstract play(): Promise<void>
    setGameEntity(gameEntity: T) {
        this._gameEntity = gameEntity
    }
    getGameEntity(): T {
        if (this._gameEntity == null) {
            console.error('请在game.init方法内,通过setGameEntity进行设置')
        }
        return this._gameEntity as T
    }
}