---
outline: deep
---

# xhgame-plugin-framework 架构思维导图

本文档以思维导图的形式，结合测试用例和实际项目代码，全面展示xhgame-plugin-framework的架构设计。

## 🎯 框架总览

```
┌─────────────────────────────────────────────────────────────┐
│                    xhgame-plugin-framework                   │
│                     游戏开发框架总架构                        │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ 架构层次结构

### 第一层：全局访问层
```
┌─────────────────────────────────────────────────────────────┐
│                    全局单例访问点                            │
├─────────────────────────────────────────────────────────────┤
│  🔄 gameInstance (SingletonInstance)                        │
│     ├── 📊 tableManager    (数据表管理)                     │
│     ├── 🏭 factoryManager  (物品工厂管理)                     │
│     ├── 🖼️  guiManager     (UI界面管理)                      │
│     ├── 🌐 netManager      (网络通信管理)                     │
│     ├── 💾 storageManager  (本地存储管理)                     │
│     ├── 🎵 audioManager    (音频管理)                        │
│     ├── ⚙️  configManager  (配置管理)                        │
│     ├── ⏰ timerManager    (时间管理)                        │
│     ├── 📱 deviceManager   (设备管理)                        │
│     ├── 🔐 cryptoManager   (加密管理)                        │
│     └── 📡 eventManager    (事件管理)                        │
└─────────────────────────────────────────────────────────────┘
```

### 第二层：快捷访问层
```
┌─────────────────────────────────────────────────────────────┐
│                    xhgame全局对象                           │
├─────────────────────────────────────────────────────────────┤
│  🎮 xhgame.                                               │
│     ├── 📊 table        → tableManager                     │
│     ├── 🏭 factory      → factoryManager                   │
│     ├── 🖼️  gui         → guiManager                       │
│     ├── 🌐 net          → netManager                       │
│     ├── 💾 storage      → storageManager                   │
│     ├── 🎵 audio        → audioManager                     │
│     ├── ⚙️  config      → configManager                    │
│     ├── ⏰ timer        → timerManager                     │
│     ├── 📱 device       → deviceManager                    │
│     └── 🔗 event        → eventManager                     │
└─────────────────────────────────────────────────────────────┘
```

## 🎮 游戏初始化流程

### 启动流程（基于实际代码）

```
┌─────────────────────────────────────────────────────────────┐
│                    游戏启动流程                              │
├─────────────────────────────────────────────────────────────┤
│ 1️⃣ Cocos场景加载                                           │
│     └── LoadScript.start()                                 │
│         ├── 📦 加载资源包 bundle_game                     │
│         ├── 📊 加载数据表 JSON文件                        │
│         └── 🎮 添加 MyGameDrive 组件                      │
│                                                           │
│ 2️⃣ 游戏构建                                               │
│     └── MyGameDrive.buildGame()                           │
│         ├── 🏗️  初始化 CocosGameBuilderDrive               │
│         ├── 🎯 创建 MyGame 实例                           │
│         └── 🚀 启动游戏 start()                            │
│                                                           │
│ 3️⃣ 系统初始化                                             │
│     ├── 🔐 平台检测 (WeChat/Douyin/H5)                     │
│     ├── 👤 用户认证 (ApiGetAccountComp)                    │
│     ├── 🎮 玩家进入 (ApiPlayerEnterComp)                   │
│     └── 🎯 战役数据加载 (ApiPlayerMissionComp)             │
└─────────────────────────────────────────────────────────────┘
```

### 测试环境初始化（基于GameTest.test.ts）

```
┌─────────────────────────────────────────────────────────────┐
│                    测试环境初始化                           │
├─────────────────────────────────────────────────────────────┤
│ 1️⃣ 设置测试环境                                           │
│     ├── xhgame.testing = true                             │
│     └── xhgame.at_platform = Platform.H5                  │
│                                                           │
│ 2️⃣ 构建测试游戏                                           │
│     └── gameInstance.game_test = new MyGame(...)          │
│         └── 使用 TestGameBuilderDrive                     │
│                                                           │
│ 3️⃣ 初始化逻辑驱动                                         │
│     └── xhgame.gameEntity.model.logicDrive = LogicDrive   │
└─────────────────────────────────────────────────────────────┘
```

## 🏭 物品工厂系统架构

### 物品类型层次

```
┌─────────────────────────────────────────────────────────────┐
│                    物品工厂系统                             │
├─────────────────────────────────────────────────────────────┤
│  🏭 FactoryManager                                         │
│     ├── 🎯 物品分类                                        │
│     │   ├── 🖼️  UI物品      (CocosUiItem)                  │
│     │   ├── 🎭 特效物品      (CocosEffectItem)               │
│     │   ├── 🧱 瓦片物品      (CocosTiledItem)               │
│     │   ├── 🎭 单位物品      (CocosUnitItem)                │
│     │   └── 📝 文本UI物品    (CocosTextUiItem)              │
│     │                                                      │
│     ├── 🔧 工厂驱动                                        │
│     │   ├── CocosUiItemFactoryDrive                       │
│     │   ├── CocosEffectItemFactoryDrive                   │
│     │   ├── CocosTiledItemFactoryDrive                    │
│     │   ├── CocosUnitItemFactoryDrive                     │
│     │   └── CocosTextUiItemFactoryDrive                   │
│     │                                                      │
│     └── 🎯 创建方法                                        │
│         ├── createUiItem('goods_item')                    │
│         ├── createEffectItem('effect_fire')               │
│         ├── createUnitItem('unit_001')                    │
│         └── createTextUiItem('text_hello')                │
└─────────────────────────────────────────────────────────────┘
```

## 📊 数据表系统架构

### 数据表结构

```
┌─────────────────────────────────────────────────────────────┐
│                    数据表系统                               │
├─────────────────────────────────────────────────────────────┤
│  📊 TableManager                                          │
│     ├── 🎯 数据表类型 (TableType)                          │
│     │   ├── 📋 skill       (技能表)                       │
│     │   ├── 🧍 unit        (单位表)                       │
│     │   ├── ⚔️  battle      (战役表)                       │
│     │   └── 🛒 store       (商店表)                       │
│     │                                                      │
│     ├── 📁 表定义                                         │
│     │   ├── SkillTable <ISkillTableItem>               │
│     │   ├── UnitTable <IUnitTableItem>                 │
│     │   ├── BattleTable <IBattleTableItem>             │
│     │   └── StoreTable <IStoreTableItem>               │
│     │                                                      │
│     └── 🔍 查询方法                                        │
│         ├── queryById(id)                                 │
│         ├── getAll()                                      │
│         ├── queryByCondition()                            │
│         └── init(jsonData)                                │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 ECS实体组件系统

### 实体层次结构

```
┌─────────────────────────────────────────────────────────────┐
│                    ECS实体系统                             │
├─────────────────────────────────────────────────────────────┤
│  🎯 实体 (Entity)                                          │
│     ├── 👤 PlayerEntity                                    │
│     │   └── 📋 玩家相关组件                                │
│     │       ├── ApiGetAccountComp                         │
│     │       ├── ApiPlayerEnterComp                        │
│     │       └── ApiPlayerMissionComp                      │
│     │                                                      │
│     ├── ⚔️  GameEntity                                     │
│     │   └── 📋 游戏相关组件                                │
│     │       ├── GateSenceComp                             │
│     │       ├── BattleSenceComp                           │
│     │       └── LogicDrive                                │
│     │                                                      │
│     └── ⚔️  BattleEntity                                   │
│         └── 📋 战役相关组件                                │
│             ├── BattleWinComp                             │
│             ├── BattleOverViewComp                        │
│             └── BattleSkillPanelComp                      │
└─────────────────────────────────────────────────────────────┘
```

### 组件生命周期

```
┌─────────────────────────────────────────────────────────────┐
│                    组件生命周期                             │
├─────────────────────────────────────────────────────────────┤
│  🔄 标准流程                                               │
│     ├── 📦 Entity.createEntity()                          │
│     ├── 🔗 entity.attachComponent()                       │
│     ├── ⚙️  component.init()                              │
│     ├── 🚀 component.start()                              │
│     ├── ♻️  component.update()                            │
│     └── 🗑️  component.destroy()                           │
│                                                           │
│  📋 异步组件模式                                           │
│     ├── attachComponent().set({...}).done()               │
│     ├── onSuccess 回调                                    │
│     └── onFail 回调                                       │
└─────────────────────────────────────────────────────────────┘
```

## 🖼️ UI系统架构

### 视图层次结构

```
┌─────────────────────────────────────────────────────────────┐
│                    UI视图系统                              │
├─────────────────────────────────────────────────────────────┤
│  🖼️  UiManager                                           │
│     ├── 🎯 视图类型                                       │
│     │   ├── 🏰 Gate系列                                  │
│     │   │   ├── GateView                                 │
│     │   │   ├── GateStorePanelView                       │
│     │   │   └── GateGroupMissionView                     │
│     │   │                                              │
│     │   ├── ⚔️  Battle系列                               │
│     │   │   ├── BattleView                              │
│     │   │   ├── BattleTouchView                         │
│     │   │   └── BattleWidget系列                        │
│     │   │                                              │
│     │   └── 🎭 通用视图                                 │
│     │       ├── LoadingView                             │
│     │       ├── SettingView                             │
│     │       └── HelpGuideView                           │
│     │                                                  │
│     └── 🔧 创建方法                                     │
│         ├── xhgame.gui.getView('BattleView')            │
│         ├── view.magicValue = 0.75                      │
│         └── view.updateUI()                             │
└─────────────────────────────────────────────────────────────┘
```

## 🌐 网络系统架构

### API组件层次

```
┌─────────────────────────────────────────────────────────────┐
│                    网络通信系统                             │
├─────────────────────────────────────────────────────────────┤
│  🌐 NetManager                                           │
│     ├── 📡 通信方式                                       │
│     │   ├── 🌐 HTTP (TsrpcHttp)                          │
│     │   └── ⚡ WebSocket (Websocket)                     │
│     │                                                  │
│     ├── 🔗 API组件                                       │
│     │   ├── 📋 玩家相关                                   │
│     │   │   ├── ApiGetAccountComp                       │
│     │   │   ├── ApiPlayerEnterComp                      │
│     │   │   ├── ApiPlayerMissionComp                    │
│     │   │   └── ApiPlayerWinBattleComp                  │
│     │   │                                              │
│     │   ├── 🛒 商店相关                                   │
│     │   │   ├── ApiBuyStoreComp                         │
│     │   │   └── ApiGetPackageComp                       │
│     │   │                                              │
│     │   └── ⚔️  战役相关                                  │
│     │       ├── ApiBattleReviveComp                     │
│     │       └── ApiPlayerGetDoubleRewardComp            │
│     │                                                  │
│     └── 📞 使用方法                                     │
│         ├── apiComp.send({...}).done()                  │
│         ├── onSuccess: (data) => {...}                  │
│         └── onFail: (error) => {...}                    │
└─────────────────────────────────────────────────────────────┘
```

## 💾 存储系统架构

### 存储层次

```
┌─────────────────────────────────────────────────────────────┐
│                    数据存储系统                             │
├─────────────────────────────────────────────────────────────┤
│  💾 StorageManager                                       │
│     ├── 🔐 加密策略                                       │
│     │   ├── CryptoEmpty (无加密)                         │
│     │   └── CryptoAES (AES加密)                          │
│     │                                                  │
│     ├── 📁 存储类型                                       │
│     │   ├── 📱 本地存储 (localStorage)                   │
│     │   └── ☁️  云存储 (WxCloudStorage)                   │
│     │                                                  │
│     └── 🔧 操作方法                                       │
│         ├── set(key, value)                              │
│         ├── get(key, defaultValue)                       │
│         ├── remove(key)                                  │
│         └── clear()                                      │
└─────────────────────────────────────────────────────────────┘
```

## 🎵 音频系统架构

### 音频管理层次

```
┌─────────────────────────────────────────────────────────────┐
│                    音频系统                               │
├─────────────────────────────────────────────────────────────┤
│  🎵 AudioManager                                         │
│     ├── 🎼 音频类型                                       │
│     │   ├── 🎵 音效 (AudioEffect)                        │
│     │   └── 🎶 背景音乐 (AudioMusic)                     │
│     │                                                  │
│     ├── 🔧 控制方法                                       │
│     │   ├── playEffect('sound_name')                    │
│     │   ├── playMusic('music_name', loop)               │
│     │   ├── pauseAll()                                  │
│     │   ├── resumeAll()                                 │
│     │   └── stopMusic()                                 │
│     │                                                  │
│     └── 📊 状态管理                                       │
│         ├── volume control                              │
│         └── mute control                                │
└─────────────────────────────────────────────────────────────┘
```

## 📁 测试环境架构

### 测试层次结构

```
┌─────────────────────────────────────────────────────────────┐
│                    测试系统                               │
├─────────────────────────────────────────────────────────────┤
│  🧪 测试目录结构                                           │
│     ├── 🎯 游戏测试 (tests/game/)                          │
│     │   ├── GameTest.test.ts                              │
│     │   ├── TestTools.ts                                  │
│     │   └── testDemo/                                     │
│     │       ├── drive/ (测试驱动)                         │
│     │       └── items/ (测试物品)                         │
│     │                                                  │
│     ├── 🔧 核心测试 (tests/core/)                          │
│     │   └── TableManagerTest.ts                           │
│     │                                                  │
│     ├── 🧠 逻辑测试 (tests/logic/)                         │
│     │   └── ShapAtGridsLogic.test.ts                      │
│     │                                                  │
│     └── 🔗 库测试 (tests/lib/)                            │
│         ├── EventManagerTest.ts                           │
│         └── ecs/                                          │
│             ├── DemoTest.ts                               │
│             └── EntityManagerTest.ts                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 生命周期管理

### 完整生命周期

```
┌─────────────────────────────────────────────────────────────┐
│                    应用生命周期                             │
├─────────────────────────────────────────────────────────────┤
│  🚀 启动阶段                                               │
│     ├── 场景加载 → LoadScript                              │
│     ├── 资源加载 → bundle_game                            │
│     ├── 框架初始化 → CocosGameBuilderDrive                │
│     ├── 游戏创建 → MyGame                                 │
│     └── 实体初始化 → Entity + Components                  │
│                                                           │
│  🎮 运行阶段                                               │
│     ├── 游戏循环 → update(dt)                             │
│     ├── 事件处理 → xhgame.event                           │
│     ├── 数据同步 → API调用                                │
│     └── 状态更新 → 视图刷新                               │
│                                                           │
│  ⏸️  暂停/恢复                                             │
│     ├── GAME_HIDE → 暂停音频、定时器                      │
│     ├── GAME_SHOW → 恢复音频、定时器                      │
│     └── GAME_EXIT → 清理资源                              │
│                                                           │
│  🗑️  销毁阶段                                              │
│     ├── 组件销毁 → component.destroy()                    │
│     ├── 实体销毁 → entity.destroy()                       │
│     └── 资源回收 → 对象池回收                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 最佳实践模式

### 开发模式总结

```
┌─────────────────────────────────────────────────────────────┐
│                    开发最佳实践                             │
├─────────────────────────────────────────────────────────────┤
│  📁 文件组织规范                                           │
│     ├── assets/script/                                    │
│     │   ├── common/      (公共配置)                       │
│     │   ├── severs/      (ECS实体和组件)                  │
│     │   ├── view/        (视图相关)                       │
│     │   └── net/         (网络相关)                       │
│     │                                                  │
│  🏷️  命名规范                                             │
│     ├── 实体: {Name}Entity                                │
│     ├── 组件: {Name}Comp                                  │
│     ├── 视图: {Name}View                                  │
│     └── 物品: Cocos{Name}Item                             │
│     │                                                  │
│  🔄 异步处理模式                                           │
│     ├── attachComponent().set({...}).done()              │
│     ├── Promise/async-await                              │
│     └── 事件回调机制                                      │
│     │                                                  │
│  🧪 测试驱动开发                                           │
│     ├── 单元测试 (poku)                                  │
│     ├── 集成测试 (GameTest)                              │
│     └── 模拟数据 (TestTools)                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 调试和监控

### 调试工具

```
┌─────────────────────────────────────────────────────────────┐
│                    调试和监控                              │
├─────────────────────────────────────────────────────────────┤
│  🔍 调试功能                                               │
│     ├── window['xhgame'] 全局访问                         │
│     ├── DEBUG模式下的性能监控                             │
│     └── 控制台日志输出                                    │
│                                                           │
│  📊 性能监控                                               │
│     ├── profiler.showStats()                              │
│     ├── 资源加载进度监控                                  │
│     └── 内存使用监控                                      │
│                                                           │
│  🐛 错误处理                                               │
│     ├── try-catch异常捕获                                 │
│     ├── 组件错误边界                                      │
│     └── 网络错误重试机制                                  │
└─────────────────────────────────────────────────────────────┘
```