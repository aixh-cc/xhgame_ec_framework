---
outline: deep
---

# viewComp组件

## 主要职责

 - 1、负责页面展示与销毁
 - 2、与view进行交互

## 具体说明
类似mvc模式
 - viewComp == controller
 - view == view （cocos的页面Component）
 - modelComp == model


### 1、viewComp 主要是actions的路由作用
及部分临时变量


```ts
export class BattleViewComp extends BaseModelComp {
    compName: string = 'BattleViewComp'
    initBySystems: (typeof System)[] = [BattleViewSystem]
    // 当前页面的定时器
    time_uuid: string = ''
    playtimeFormat: string = ''

    actions = {
        playerMoveLeft:()=>{
            BattleViewSystem.playerMoveLeft()
        }
    }
    reset() {
        xhgame.timer.unschedule(this.time_uuid)
        this.time_uuid = ''
        this.playtimeFormat = ''
    }

    onDetach() {
        xhgame.gui.removeUI(xhgame.gui.enums.battle_index)
    }
}

```

### 2、viewSystem主要是方法实现

```ts
export class BattleViewSystem extends System {

    /** 初始化 */
    static async initComp(comp: BattleViewComp) {

        await xhgame.gui.openUIAsync(xhgame.gui.enums.battle_index, comp)

        comp.time_uuid = xhgame.timer.schedule(() => {
            this.secUpdate(comp)
        }, 1000)

        // 如果存在帮助组件，触发新手指引事件
        if (xhgame.gameEntity.isExistComponentByRegisterName('HelpComp')) {
            let obj = { round: 0, battle_id: 1, max_battle_id: 1 }
            xhgame.event.emit('first_enter_battle', obj) // 手动触发新手指引事件
            xhgame.gameEntity.safeGetComponentByRegisterName('HelpComp').actions.playHelpOnEvent('first_enter_battle', obj).then(() => {
                xhgame.gui.toast('指引结束')
            })
        }
    }
    static secUpdate(comp: BattleViewComp) {
        // todo 更新游戏时间的显示
    }


}
```
