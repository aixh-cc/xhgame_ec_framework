---
outline: deep
---

# 继承关系说明
这里以物品为例。
一般需要继承BaseItemView。
并且对该item做一个接口约束 IGoodsItemViewVM

```ts

export interface IGateStorePanelViewVM {
    gold: number
    diamond: number
}

@ccclass('GateStorePanelView')
export class GateStorePanelView extends BaseView implements IGateStorePanelViewVM {

    @property
    private _gold: number = 0
    @property({
        type: CCInteger
    })
    get gold() {
        return this._gold
    }
    set gold(val) {
        this._gold = val
        this.node.getChildByPath('top/gold/value').getComponent(Label).string = val.toString()
    }

    @property
    private _diamond: number = 0
    @property({
        type: CCInteger
    })
    get diamond() {
        return this._diamond
    }
    set diamond(val) {
        this._diamond = val
        this.node.getChildByPath('top/diamond/value').getComponent(Label).string = val.toString()
    }

    protected onLoad(): void {
        this.bindModelMap = {
            "gold": 'PlayerModelComp::playerInfo.gold',
            "diamond": 'PlayerModelComp::playerInfo.diamond',
        }
    }
```


## 使用说明
阿斯顿发顺丰


```ts
// 创建一个uiItem
let uiItem = xhgame.factory.enums.createUiItem('goods_item')
// 设置uiItem的基础属性
uiItem.positions = [0,0,0]
// 针对这个特有的uiItem的vm值进行绑定
let vm = uiItem.getViewVm<IGoodsItemViewVM>()
vm.goodsNo = 'gold'
vm.num = 100
// 放置到场景上
uiItem.toScene()
```

