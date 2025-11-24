---
outline: deep
---

# 组件的引用与注册


目前主要有2种模式
## 1、强引用模式（组件必须存在，不存在就没法启动cocos）
适用场景，明确知道引用组件肯定存在
```ts
// 头部引用
import { LoadResourceToGateComp } from "db://assets/script/comps/enter/LoadResourceToGateComp";
// 
// 其他业务代码
// ...
// 业务中使用
await xhgame.gameEntity.attachComponent(LoadResourceToGateComp).done()
```

## 2、注册引用模式（组件名必须在RegisterComps注册，不存在触发时提示错误）
适用场景，去耦合场景（如希望通过在线组件系统，一键安装\替换的）
```ts
// 无头部引用
// 其他业务代码
// ...
// 业务中直接使用
await xhgame.gameEntity.safeGetComponentByRegisterName('BattleTiledComp').done()
await xhgame.gameEntity.safeGetComponentByRegisterName('BattleViewComp').done()
// 如果存在开发调试页面（相当于预留的钩子）
if (xhgame.gameEntity.isExistComponentByRegisterName('BattleDevViewComp')) {
    await xhgame.gameEntity.attachComponentByRegisterName('BattleDevViewComp').done()
}
```
