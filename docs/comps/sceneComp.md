# sceneComp组件

## 主要职责

 - 1、sceneComp处理挂载前、挂载后的数据事务
 - 2、senceSystem处理挂载后的资源调度

## 具体说明

### 1、sceneComp处理挂载前、挂载后的数据事务

这里以战役场景为例：
主要是挂载后的组件卸载

```ts
export class BattleSenceComp extends BaseModelComp {
    compName: string = 'BattleSenceComp'
    initBySystems: (typeof System)[] = [BattleSenceSystem]
    battleId: number = 0
    setup(obj: { battleId: number }) {
        this.battleId = obj.battleId
        return this
    }

    reset() {
        this.battleId = 0
    }

    actions = {

    }

    onDetach() {
        xhgame.audio.stopMusic()
        // xhgame.gameEntity.detachComponent(BattleGameBoxComp)
        xhgame.gameEntity.detachComponentByRegisterName('BattleTiledComp')
        xhgame.gameEntity.detachComponentByRegisterName('BattleViewComp')
    }
}
```

### 2、senceSystem处理挂载后的资源调度
主要处理挂载后的具体调用其他组件的顺序

```ts
export class BattleSenceSystem extends System {

    static async initComp(comp: BattleSenceComp) {
        xhgame.audio.playMusic(xhgame.audio.enums.battle_bg_audio)
        // await xhgame.gameEntity.attachComponent(BattleGameBoxComp).done() // todo 游戏主逻辑
        await xhgame.gameEntity.safeGetComponentByRegisterName('BattleTiledComp').done()
        await xhgame.gameEntity.safeGetComponentByRegisterName('BattleViewComp').done()
        // 如果存在开发调试页面
        if (xhgame.gameEntity.isExistComponentByRegisterName('BattleDevViewComp')) {
            await xhgame.gameEntity.attachComponentByRegisterName('BattleDevViewComp').done()
        }
    }
}
```
