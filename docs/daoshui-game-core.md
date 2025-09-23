---
outline: deep
---

# 核心代码


## 定义状态及结构
解`数学问题`，一般都是需要`解题过程`的，这时就需要一些`状态及结构变量`来存储这个过程。

```ts
export enum BottleState {
    Empty,
    Some,
    Full,
    Close,
}
export enum GameState {
    GameInit,
    GamePlay,
    GameWin,
    GameLost,
    GameOver,
    GamePause
}

export interface IBottle {
    bodys: number[]
    index: number
    state: BottleState
}

export interface IDaoShuiGameBoxData {
    /** 所有瓶子 */
    bottles: IBottle[]
    /** 当前选中瓶子index */
    curIndex: number
    /** 目标瓶子index */
    targetIndex: number
    /** 每个瓶子最大body数 */
    maxBodyLength: number
    /** 最大操作数 */
    maxRound: number
    /** 当前操作数 */
    curRound: number
    /** 最大额外添加的操作数 */
    maxMoreRound: number
    /** 当前额外添加的操作数 */
    curMoreRound: number,
    /** 游戏时间 */
    gameTime: number
    /** 游戏状态 */
    gameState: GameState
    /** 失败次数 */
    lostCount: number
}

export enum DaoShuiGameEvent {
    /** 游戏胜利 */
    GameWin,
    /** 游戏失利(可复活) */
    GameLost,
    /** 游戏失败 */
    GameOver,
    /** 移动 */
    Move,
}

export interface IGameEventItem {
    /** 游戏时间 */
    gameTime: number,
    /** from对象组(多个是为了后期拓展多对象事件) */
    fromIndexs: number[],
    /** to对象组(多个是为了后期拓展多对象事件) */
    toIndexs: number[],
    /** 事件 */
    gameEvent: DaoShuiGameEvent,
    /** 事件数值 */
    eventValues: number[],
    /** 本次动作持续时间(一般和特效时间有关,单位ms) */
    duration: number,
}
```


## 游戏核心代码(GameBox黑盒子)
这个是我们的核心代码，我们需要将它打造成一个黑盒子。
这个黑盒子的数据源,从外部进行注入,通过提供给外部的功能接口加工和处理数据。
后面我们会对核心代码进行rust改造，并最终打包成wasm,变成真正的“黑盒子”
```ts

export class DaoShuiGameBox {

    private data: IDaoShuiGameBoxData
    /** 前一次操作cur的state */
    tmpPreCurBottleState: BottleState
    /** 前一次操作target的state */
    tmpPreTargetBottleState: BottleState

    constructor(data: IDaoShuiGameBoxData) {
        this.data = data
    }

    public getBottles() {
        return this.data.bottles
    }
    public getData() {
        return this.data
    }
    public getBottleInfo(index: number) {
        return this.data.bottles[index]
    }
    public getGameTime() {
        return this.data.gameTime
    }
    public play() {
        this.data.gameState = GameState.GamePlay
    }
    public backplay() {
        this.data.gameState = GameState.GamePlay
    }
    public stop() {
        this.data.gameState = GameState.GamePause
    }
    public getGameState() {
        return this.data.gameState
    }
    public update(dt: number) {
        if (this.data.gameState == GameState.GamePlay) {
            this.data.gameTime += dt
            // console.log('this.data.gameTime', this.data.gameTime)
            // this.doOnePlay()
        }
    }
    // 
    public touchBottle(index: number): number {
        if (this.data.curIndex == -1) {
            return this._setCurBottle(index)
        }
        if (this.data.curIndex == index) {
            this.data.curIndex = -1
            return -1
        }
        return this._setTargetBottle(index)
    }

    private _setCurBottle(index: number): number {
        if (this.data.bottles[index].state == BottleState.Close) {
            this.data.curIndex = -1 // 已经盖上盖子
        } else {
            if (this.data.bottles[index].state == BottleState.Empty) {
                this.data.curIndex = -1 // 空瓶子
            } else {
                this.data.curIndex = index
            }
        }
        return this.data.curIndex
    }
    public getCurBottle(): IBottle | null {
        if (this.data.curIndex == -1) {
            return null
        }
        return this.data.bottles[this.data.curIndex]
    }

    public getTargetBottle(): IBottle | null {
        if (this.data.targetIndex == -1) {
            return null
        }
        return this.data.bottles[this.data.targetIndex]
    }
    public moveBody(): number[] {
        if (this.data.curIndex == -1 || this.data.targetIndex == -1) {
            console.error('this.data.curIndex == -1 || this.data.targetIndex == -1')
            return []
        }
        let move_bodys = this.getMoveBodys(this.data.curIndex, this.data.targetIndex)
        let gameEventItem: IGameEventItem = {
            gameTime: this.getGameTime(),
            fromIndexs: [this.data.curIndex],
            toIndexs: [this.data.targetIndex],
            gameEvent: DaoShuiGameEvent.Move,
            eventValues: move_bodys,
            duration: 1000,
        }
        this.saveGameEvent(gameEventItem)
        this.tmpPreCurBottleState = this.getCurBottle().state
        this.tmpPreTargetBottleState = this.getTargetBottle().state
        this.data.curIndex = -1
        this.data.targetIndex = -1

        return move_bodys
    }
    public checkGameWinOrLost() {
        if (this.tmpPreCurBottleState == BottleState.Empty && this.tmpPreTargetBottleState == BottleState.Close) {
            if (this.checkWin() == false) {
                this.checkLost()
            }
        } else {
            this.checkLost()
        }
        this.data.curRound++
    }
    public gameRevive() {
        this.data.gameState = GameState.GamePlay
        this.data.curMoreRound = this.data.maxMoreRound // 加了回合
    }

    private checkWin(): boolean {
        // 所有瓶子要么空，要么close
        let is_win = true
        for (let i = 0; i < this.data.bottles.length; i++) {
            const _bottle = this.data.bottles[i];
            if (_bottle.state != BottleState.Empty && _bottle.state != BottleState.Close) {
                is_win = false
            }
        }
        if (is_win) {
            this.data.gameState = GameState.GameWin
        }
        return is_win
    }
    private checkLost() {
        if (this.data.curRound >= (this.data.maxRound + this.data.curMoreRound)) {
            if (this.data.lostCount == 0) {
                this.data.lostCount++
                this.data.gameState = GameState.GameLost
            } else {
                this.data.gameState = GameState.GameOver
            }
        }
    }

    private _setTargetBottle(index: number): number {
        if (this.data.bottles[index].state == BottleState.Full ||
            this.data.bottles[index].state == BottleState.Close) {
            this.data.targetIndex = -1
        } else {
            this.data.targetIndex = index
        }
        return this.data.targetIndex
    }

    private getMoveBodys(fromIndex: number, toIndex: number): number[] {
        let from_bottle: IBottle = this.data.bottles[fromIndex]
        let to_bottle: IBottle = this.data.bottles[toIndex]
        let move_bodys: number[] = []
        let del_from_i = -1
        let del_len = 0
        for (let i = from_bottle.bodys.length - 1; i > -1; i--) {
            const _body = from_bottle.bodys[i];
            if (to_bottle.bodys.length < this.data.maxBodyLength) {
                if (move_bodys.length == 0 || move_bodys[move_bodys.length - 1] == _body) {
                    move_bodys.push(_body)
                    // 从 from中移除
                    del_from_i = i
                    to_bottle.bodys.push(_body)
                    del_len++
                } else {
                    break;
                }
            } else {
                break;
            }
        }
        if (del_from_i == -1) {
            console.error('del_from_i, del_len', del_from_i, del_len)
        }
        from_bottle.bodys.splice(del_from_i, del_len)
        if (from_bottle.bodys.length == 0) {
            from_bottle.state = BottleState.Empty
        } else {
            from_bottle.state = BottleState.Some
        }
        if (to_bottle.bodys.length == this.data.maxBodyLength) {
            to_bottle.state = BottleState.Full
            // 同时查一下是否已经同色
            const uniqueArray = Array.from(new Set(to_bottle.bodys));
            if (uniqueArray.length == 1) {
                to_bottle.state = BottleState.Close
            }
        } else {
            to_bottle.state = BottleState.Some
        }
        return move_bodys
    }

    private saveGameEvent(gameEventItem: IGameEventItem) {
        // this.data.tmpGameEventItems.push(gameEventItem)
        // this.data.tmpGameEventItems.sort((a, b) => a.gameTime - b.gameTime);// 进行排序
    }
}
```
