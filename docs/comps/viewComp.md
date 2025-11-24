---
outline: deep
---

# viewComp组件

## 主要职责

 - 1、负责页面展示
 - 2、comp数据=>view显示
 - 3、view操作=>comp的actions
 - 4、页面的销毁

## 具体说明
类似mvc模式
 - viewComp == controller
 - view == view （cocos的页面Component）
 - modelComp == model


 modelComp/viewComp中，通过comp.notify() 进行观察者模式的通知
 view中 绑定监听了 comp中数组的变化事件

### 1、页面展示

页面的展示,会通过 
`xhgame.gui.openUIAsync(uiid, comp)`
的方式通知`xhgame.gui`打开一个页面,同时将当前`viewComp`作为该页面的“controller”

```ts
export class BattleViewSystem extends System {

    /** 初始化 */
    static async initComp(comp: BattleViewComp) {
        await xhgame.gui.openUIAsync(xhgame.gui.enums.battle_index, comp)
        // 其他代码
        // ....
    }
}
```
### 2、comp数据=>view显示

在介绍交互前，不得不提一下view

#### view的约束

这xhgame框架中，view的展示只能是数据驱动，不能是其他组件驱动。
什么意思呢？

或许你开发其他cocos组件时，经常会做一些引用，比如常见的`cc.Button`
但在xhgame中，这里并不提倡。因为我们是数据驱动。从`viewComp`给到`cc.Component`的内容只能是纯数据。

这样 modelComp 或者 viewComp中通过对数据修改，然后通过 comp.notify() ，相应的view页面就能监听到数值进行变化了。

#### view的调试

那是不是很难调试了呢？

并不是的，因为cocos提供了`executeInEditMode`的装饰器方法

加上`@executeInEditMode(true)`这个装饰器，我们就能修改数值，直接查看变化的样式了、
当我们能用简单的数据驱动view页面的变化时，这个组件就算是合格的组件了。

下面看一下关卡的样例：
只要修改 starNum的值就可以直接看到效果。


```ts
export interface IMissionItemViewVM {
    starNum: number
    // 其他属性....
}

@ccclass('MissionItemView')
@executeInEditMode(true) // 这个很重要，是为了我们数据调试用的
export class MissionItemView extends CocosBaseItemView implements IMissionItemViewVM {
    toSceneNodePath: string = 'gate_group_mission_dialog/items'
    /** 几星 */
    @property
    _starNum: number = 3;
    @property({ type: CCInteger, visible: true })
    get starNum() {
        return this._starNum
    }
    set starNum(val) {
        this._starNum = val
        if (this.starNum == 0) {
            this.node.getChildByName('stars').children.forEach((_node: Node) => {
                _node.getChildByName('xing').active = false
            })
        } else {
            this.node.getChildByName('stars').children.forEach((_node: Node, _index: number) => {
                if (_index <= (this.starNum - 1)) {
                    _node.getChildByName('xing').active = true
                } else {
                    _node.getChildByName('xing').active = false
                }
            })
        }
    }
}
```


需要注意的是，下面这段，这段是模板之一
```ts
    /** 几星 */
    @property
    _starNum: number = 3;
    @property({ type: CCInteger, visible: true })
    get starNum() {
        return this._starNum
    }
    set starNum(val) {
        this._starNum = val
        // 修改view组件上的
        // ...
    }
```
#### view页面的监听

在view页面中,通过`setBindAttrMap`进行绑定
key是本view中的属性
value是监听的comp内的属性

```ts
    protected onLoad(): void {
        this.setBindAttrMap({
            "music_open": 'GateSettingDialogViewComp::vm.music_open',
            "effect_open": 'GateSettingDialogViewComp::vm.effect_open',
        })
    }
```



#### view页面的展示

框架并不是完全的mvvm模式，应该说是半自动模式，你需要对更新对象进行更新时，你就要对你的comp进行`comp.notify()`。
在同一帧里多次触发同一个comp的notify，并不会触发很多次，而是在下一帧里触发一次。


### 3、view操作=>comp的actions

每个继承 CocosBaseUiView 的都有一个viewModelComp 但这里最好重新覆盖一下，方便获取actions

```ts
export class GateSettingDialogView extends CocosBaseUiView implements IGateSettingDialogViewVM {
    // 每个继承 CocosBaseUiView 的都有一个viewModelComp 但这里最好重新覆盖一下
    viewModelComp: GateSettingDialogViewComp
    // 其他
    // ....

    // 动作
    onMusicBtnClick() {
        this.viewModelComp.actions.onMusicBtnClick() // 触发
    }

```

### 4、页面的销毁

目前有3种常见方法

 - 1、快速关闭。如关闭按钮,cc.Button中选择触发当前view下面的closeView()
 
 - 2、使用xhgame.gameEntity进行关闭
 ```ts
let abComp = xhgame.gameEntity.getComponent(ABComp)
abComp.detach();
 ```

 - 3、在组件内，使用`comp.detach()`
