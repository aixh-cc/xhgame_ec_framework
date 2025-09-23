---
outline: deep
---

## 说明

以个人实践为主，有些方案并非是最佳实践。

## 架构 ec
全局只有一个主体`gameEntity`
所有的业务逻辑都是在这个主体上`挂载`与`卸载`

```ts
// 挂载
await xhgame.gameEntity.attachComponent(GateSenceComp).done() // 挂载场景
await xhgame.gameEntity.attachComponent(GateViewComp).done() // 挂载页面
await xhgame.gameEntity.attachComponent(HelpChatComp).done() // 挂载剧情对话组件
// 卸载
xhgame.gameEntity.detachComponent(GateSignViewComp) // 卸载页面
```


## 🧩 组件分类

挂载的组件根据功能不同，主要分为以下四类：

### 📦 1. 数据组件  
**职责**：存储非临时数据  
**示例**：  
- `GameModelComp`  
- `PlayerModelComp`  
**命名约定**：以 **`ModelComp`** 结尾

### 🏞️ 2. 场景组件  
**职责**：负责特定场景的调度与管理  
**示例**：  
- `GateSceneComp`  
**命名约定**：以 **`SceneComp`** 结尾

### 🖼️ 3. UI 组件  
**职责**：负责页面展示与交互控制  
**示例**：  
- `GateSignViewComp`（签到弹窗页）  
**命名约定**：以 **`ViewComp`** 结尾

### 📦 4. 玩法组件 
**职责**：负责游戏玩法从开始到胜利的逻辑  
**示例**：  
- `DaoshuiGameBoxComp`（倒水游戏玩法）  
**命名约定**：以 **`GameBoxComp`** 结尾

### ⚙️ 5. 其他组件  
**职责**：处理特定业务逻辑  
**示例**：  
- `HelpComp`（帮助组件）  
- `UnloadBattleComp`（卸载战役组件）  
**命名约定**：以 **`Comp`** 结尾，无特殊后缀要求

---

通过清晰的命名约定，更好地组织和管理不同类型的组件，提升代码可读性与可维护性 ✅


## 🎯 本框架想解决的问题

🔹 **1. 去除复杂的框架学习成本**  
❓ 框架太难学？  
💡 本 EC 框架只做两件事：`挂载` 与 `卸载`，极简上手。

🔹 **2. 模块功能自定义替换**  
❓ 不满意自带的某个功能模块？  
💡 没关系，构建时直接替换成你自己的实现即可。

🔹 **3. 一套代码同时开发 2D 和 3D 游戏**  
❓ 只做过 2D，不懂 3D？  
💡 构建时替换 2D 单位模板为 3D 模板，代码无需重写。

🔹 **4. 终端开发 + 单元测试，摸鱼也高效**  
❓ 想摸鱼写游戏代码？  
💡 支持终端运行开发，顺手完成单元测试。回家再用编辑器拖拽调整效果。

🔹 **5. 功能组件化，移植轻松**  
❓ 代码耦合严重难移植？  
💡 每个功能都是独立组件，拿来只需`挂载`，告别删减纠结。

🔹 **6. 告别生命周期混乱**  
❓ 总在纠结代码放哪个 Component？  
💡 如果你不能用挂载/卸载解决，说明代码放错了位置。

🔹 **7. 数据驱动 + Cocos Component = 天然 ViewModel**  
❓ 在找好用的 MVVM 框架？  
💡 Cocos 组件本身就是 ViewModel，你可能一直没发现它的正确用法。

🔹 **8. 停止重构，开始开发**  
❓ 游戏功能没多少，版本倒是一大堆？  
💡 有时作为技术人的一个悲哀,总是想着优化,来试试这个框架，专注功能实现，告别反复重构。

🔹 **9. ai开发**  
❓ ai开发这么流行，有没有直接让ai完成游戏开发的。
💡 虽然不能让ai完成100%的开发，但是本框架支持终端开发,逻辑方面可以给ai,审美和视觉效果还是得靠人力

---

如果你还有其他问题，欢迎提出！😊


## 开始第一个游戏

首先来完善入口文件CocosGame.ts
入口文件主要完成几个事情：

1、当前平台的收集
2、整个的初始化（manager的初始化+游戏的资源初始化）
3、当前游戏暂停,切换后台的监听
4、游戏进入play阶段
5、提前预加载一些资源信息



play

// 挂载gate页面
await xhgame.gameEntity.attachComponent(GateSenceComp).done()
// 挂载登录逻辑
await xhgame.gameEntity.attachComponent(GateLoginComp).done()
// 通知等待玩家操作
xhgame.event.emit('gate_wait_player_actions')
