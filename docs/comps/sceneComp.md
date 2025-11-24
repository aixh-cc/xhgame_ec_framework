---
outline: deep
---

# sceneComp组件

## 主要职责

 - 负责某场景的调度与管理组件

## 具体说明

这里以战役场景为例：

`BattleSenceSystem`初始化场景时，需要挂载的组件内容

`BattleSenceComp`初始化前数据的预处理，卸载时关联组件的卸载

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
