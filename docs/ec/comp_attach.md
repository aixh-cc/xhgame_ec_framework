# 组件挂载/卸载的过程
本框架除了gameEntity一个实体
其他都是组件，所以我们只需要知道组件是如何使用的就可以。


## 1、开始挂载ABComp
```ts
// 同步(瞬时完成)挂载
xhgame.gameEntity.attachComponent(ABComp)
// 带参数传入的同步(瞬时完成)挂载
xhgame.gameEntity.attachComponent(ABComp).setup({num:1})

```

## 2、内部会遍历组件的initBySystems

对应系统初始化该组件（一个comp一般只被一个system初始化,所以当前system和comp在同一个文件内）

```ts
export class GateGroupMissionViewComp extends BaseModelComp {
    compName: string = 'GateGroupMissionViewComp'
    initBySystems: (typeof System)[] = [GateGroupMissionViewSystem]
    ...
}
```
```ts
// 内部
const sys = component.initBySystems[i] as any
await sys.initComp(component)
```


## 3、是否被done()改为异步(initedCallback有异步回调函数存在)
```ts
// 异步挂载
let abComp = await xhgame.gameEntity.attachComponent(ABComp).done() as ABComp
// 带参数的异步挂载
let abComp = await xhgame.gameEntity.attachComponent(ABComp).setup({num:1}).done() as ABComp
```

## 4、挂载后，可使用组件对外的actions方法。
```ts
let abComp = xhgame.gameEntity.getComponent(ABComp)
abComp.actions.doSomething()
```

## 5、卸载
```ts
// 由gameEntity发起卸载组件
xhgame.gameEntity.detachComponent(ABComp)
// 有组件自己发起
let abComp = xhgame.gameEntity.getComponent(ABComp)
abComp.detach()
```
