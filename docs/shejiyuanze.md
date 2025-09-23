---
outline: deep
---

## 框架使用原则

挂载 & 卸载

比如：
你想显示一个页面
xhgame.gameEntity.attachComponent(GateViewComp)
这个页面不想显示了
xhgame.gameEntity.attachComponent(GateViewComp)

## 框架约束

1、所有的逻辑起点 & 逻辑终点，对应的都是 挂载 & 卸载 Comp组件
2、所有的用户行为和过程操作，通过 Comp.actions.xxx() 进行
3、cc的Component只做渲染View和部分页面驱动,接受参数只能是基础类型（number,string等）
4、


## 新手痛点

1、cocos的节点生命周期用于游戏逻辑层并不友好
比如：我想打开页面前就先请求接口,
