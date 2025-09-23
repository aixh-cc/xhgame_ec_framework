---
outline: deep
---

# 继承关系说明
这里以物品为例。
一般需要继承BaseItemView。
并且对该item做一个接口约束 IGoodsItemViewVM

```ts
@ccclass('GoodsItemView')
@executeInEditMode(true)
export class GoodsItemView extends BaseItemView implements IGoodsItemViewVM {
    ...
}
```
IGoodsItemViewVM 值的是本item数据与视图的双向绑定的属性
```ts
export interface IGoodsItemViewVM {
    goodsNo: string
    num: number
}
```

有了双向绑定的属性有就对其属性进行修改定义

```ts

@ccclass('GoodsItemView')
@executeInEditMode(true)
export class GoodsItemView extends BaseItemView implements IGoodsItemViewVM {
    /** 图标编码 */
    @property
    _goodsNo: string = '';
    @property({ type: CCString, visible: true })
    get goodsNo() {
        return this._goodsNo
    }
    set goodsNo(val) {
        this._goodsNo = val
        if (val != '') {
            this.node.getComponent(PlistSpriteComponent).plistCode = val
        }
    }
    /** 数量 */
    @property
    _num: number = 0;
    @property({ type: CCInteger, visible: true })
    get num() {
        return this._num
    }
    set num(val) {
        this._num = val
        this.node.getChildByName('num').getComponent(Label).string = val > 0 ? val + '' : '';
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

