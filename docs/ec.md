# EC的使用过程

本框架除了gameEntity一个实体
其他都是组件，所以我们只需要知道组件是如何工作就可以。


## 一个完整组件的构成
 - `compName` 组件名需要和className相同

 - `initBySystems` 组件会哪些系统初始化
 - `vm` 页面的展示变量。通过 
    > comp.vm.group_num = 3;
    > 
    > comp.notify()去刷新展示效果
 - `其他数据` 如：
    > selectedIndex : number = -1 // 其他临时属性
    > 
    > uiItems: IUiItem[] // 在本comp中产生的uiItems
 - `reset` 重置comp的数据
 - `actions` 通过comp暴露的方法,页面层发方法都通过这个进入。comp不执行具体操作，主要操作有system完成
 - `onDetach` 组件卸载时需要处理的，一般是由本组件里发起挂载组件由本组件卸载（也有特殊的）

```ts
export class GateGroupMissionViewComp extends BaseModelComp {
    compName: string = 'GateGroupMissionViewComp'
    initBySystems: (typeof System)[] = [GateGroupMissionViewSystem]
    // 其他临时属性
    selectedIndex: number = -1
    // 在本comp中产生的uiItems
    uiItems: IUiItem[] = []
    // 在对应页面上需要随时变化的数据
    vm: IGateGroupMissionViewVM{
        group_num: 1
    }
    reset() {
        this.selectedIndex = -1
        for (let i = 0; i < this.uiItems.length; i++) {
            const element = this.uiItems[i];
            element.toPool()
        }
        this.uiItems = []
        this.vm = {
            group_num:1
        }
    }
    actions = {
        clickMissionItem: (_uiItemIndex: number) => {
            GateGroupMissionViewSystem.clickMissionItem(this, _uiItemIndex)
        }
    }

    onDetach() {
        xhgame.gui.removeUI(xhgame.gui.enums.gate_group_mission_dialog)
    }
}
```


## 组件挂载的过程

1、实体挂载ABComp
```ts
xhgame.gameEntity.attachComponent(ABComp)
```

2、内部会遍历ABComp的initBySystems,被哪些系统初始化，sys.initComp(component),有对应系统初始化该组件

3、如果initedCallback存在(在comp.done()时赋值)
```ts

let abComp = xhgame.gameEntity.attachComponent(ABComp) // 同步的，未inited完成

let abComp = await xhgame.gameEntity.attachComponent(ABComp) as ABComp // 异步的，inited完成

```

4
