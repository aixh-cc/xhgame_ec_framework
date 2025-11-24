---
outline: deep
---

# sceneComp组件

## 主要职责

 - 负责特定场景的调度与管理

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

### 2、senceSystem主要是方法实现

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
