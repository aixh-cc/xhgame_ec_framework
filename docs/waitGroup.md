---
outline: deep
---

## 组件使用之-----WaitGroup

当我们想一堆异步组件一起执行，全部执行后返回结果
如：

```
    let wg: IWaitGroup = { groupResolve: resolve, groupCount: 3, hasDoneCount: 0 }
    xhgame.gameEntity.attachComponent(PlayerLoginComp).done(wg)
    xhgame.gameEntity.attachComponent(GateSenceComp).done(wg)
    xhgame.gameEntity.attachComponent(HelpComp).done(wg)
```
在done中加入一个对象参数wg: IWaitGroup
其中的groupCount 就是你需要等待的异步个数
