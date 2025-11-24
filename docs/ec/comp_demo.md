---
outline: deep
---

# 一个完整组件的构成

## 构成

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
 - `onDetach` 监听组件卸载。这部分理论上是放到system中的，但实践过程中，comp职责是挂载前和挂载后的数据处理，为了防止comp变臃肿(不小心写方法实现)，所以comp被放到了文件最底下，system被放到了最上面。最底下就是负责收尾工作的（本组件发起的，本组件自己处理）。


## comp样例
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

    // 卸载，
    onDetach() {
        xhgame.gui.removeUI(xhgame.gui.enums.gate_group_mission_dialog)
    }
}
```

## comp对应的system样例
```ts
export class GateGroupMissionViewSystem extends System {

    static async initComp(comp: GateGroupMissionViewComp) {
        await xhgame.gui.openUIAsync(xhgame.gui.enums.gate_group_mission_dialog, comp)
        const playerModel = xhgame.gameEntity.safeGetComponentByRegisterName('PlayerModelComp')
        const playerMissionModel = xhgame.gameEntity.safeGetComponentByRegisterName('PlayerMissionModelComp')
        const maxBattleId = playerModel.playerInfo.maxBattleId
        // // 显示关卡信息到view上
        let group = 0
        const curGroupMissionInfo = await playerMissionModel.actions.getGroupMissionInfo(group)
        let missionItems: IMissionItemModel[] = curGroupMissionInfo.missionItems
        missionItems.forEach((_iMissionItem: IMissionItemModel, _index: number) => {
            let missionUiItem = xhgame.factory.getFactory(xhgame.factory.enums.uiItem).produceItem('mission_item')
            missionUiItem.positions = itemsPositions[_index]
            missionUiItem.itemsIndex = _index
            let vm = missionUiItem.getViewVm<IMissionItemViewVM>()
            vm.starNum = _iMissionItem.maxStar
            vm.isFight = false
            vm.battleId = _iMissionItem.battleId
            if (_iMissionItem.maxScore == 0) {
                vm.isActive = false
            }
            if (_iMissionItem.battleId <= maxBattleId) {
                vm.isActive = true
            }
            missionUiItem.onClickCallback = () => {
                console.log('clickMissionItem', missionUiItem.itemsIndex)
                comp.actions.clickMissionItem(missionUiItem.itemsIndex)
            }
            missionUiItem.toScene()
            comp.uiItems.push(missionUiItem)
            if (playerModel.selectedBattleId == _iMissionItem.battleId) {
                comp.selectedIndex = _iMissionItem.index
                vm.isFight = true
            }
        })
    }

    static clickMissionItem(comp: GateGroupMissionViewComp, uiItemIndex: number) {
        let uiItem = comp.uiItems[uiItemIndex]
        console.log('玩家点击了MissionItem', uiItem)
        const playerModel = xhgame.gameEntity.safeGetComponentByRegisterName('PlayerModelComp')
        const maxBattleId = playerModel.playerInfo.maxBattleId
        let vm = uiItem.getViewVm<IMissionItemViewVM>()
        if (vm.battleId > maxBattleId) {
            console.log('vm.battleId > maxBattleId')
            return // 不能点击
        }
        vm.isFight = true
        let pre_uiItem = comp.uiItems[comp.selectedIndex]
        let pre_vm = pre_uiItem.getViewVm<IMissionItemViewVM>()
        pre_vm.isFight = false
        // 
        comp.selectedIndex = uiItemIndex
    }

}
```
