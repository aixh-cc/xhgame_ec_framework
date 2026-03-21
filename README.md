# xhgame_ec_framework

一个面向 Cocos Creator 的轻量级游戏开发框架。侧重于清晰的工程分层（EC、UI、事件、时间调度、资源与表管理等）。

> 构建工具已分离为独立项目：[xhgame_builder](https://github.com/aixh-cc/xhgame_builder)

## 特性
- ECS 组件体系：实体管理、组件挂载/卸载、系统初始化回调、依赖声明、onUpdate 生命周期
- UI 管理：驱动可插拔，统一打开/移除/状态检查，Toast/Loading 控制
- 事件中心：发布-订阅、按 tag 批量清理、重复监听去重、泛型类型安全
- 时间系统：播放/暂停/重置、一次性与循环调度、由驱动更新
- 资源与表：工厂/表管理的轻量封装
- 存储与加密：可选 md5+加密包装，类型化读写
- 网络抽象：Http/Socket 接口聚合
- 玩法组件基类：BaseGameBoxComp 收敛 Game + GameBoxComp 样板代码
- Entity 泛型注册表：按名称操作组件时获得完整类型推导

## 目录结构
```
src/                # 核心运行时代码
  EC/               # 实体-组件系统
  Ui/               # UI 管理
  Event/            # 事件系统
  Time/             # 时间系统
  Storage/          # 存储管理
  Crypto/           # 加密
  Net/              # 网络抽象
  Table/            # 表管理
  Factory/          # 工厂管理
  DI/               # 依赖注入
  Log/              # 日志
  Audio/            # 音频
  Asset/            # 资源管理
tests/              # 可运行测试用例
docs/               # 使用与设计文档（VitePress）
```

## 快速开始

### 安装依赖
```bash
bun install
```

### 运行测试
```bash
bun ./tests/run.test.mjs
```

### 构建
```bash
npm run build
```

## 核心概念与用法

### ECS（`src/EC`）
- `Entity`：创建/移除实体，挂载/卸载组件；支持泛型注册表，按名称操作类型安全
- `Comp`：组件基类，支持 setup 参数、requires 依赖声明、onUpdate 每帧更新
- `System`：ISystemStatic 接口约束，编译期检查 initComp 签名
- 参考：`tests/EC/EC.test.ts`

### UI（`src/Ui`）
- `UiManager`：基于 `IUiDrive` 的打开/移除 UI、状态检查、Toast/Loading
- `SimpleBaseView`：轻量 View 基类，支持绑定属性映射
- 参考：`tests/Ui/UiManager.test.ts`、`tests/Ui/View.test.ts`

### 事件（`src/Event`）
- `EventManager`：`on/off/emit`，按 `tag` 清理，支持泛型事件映射类型安全
- 参考：`tests/Event/EventManager.test.ts`

### 时间（`src/Time`）
- `TimeSystem`：播放/暂停/重置、一次性与循环调度，`updateByDrive(dt)` 驱动
- 参考：`tests/Time/TimeSystem.test.ts`

### 存储（`src/Storage`）
- `StorageManager`：可选加密包装、`set/get/remove/clear` 与类型化读取
- 参考：`tests/Storage/StorageManager.test.ts`

### 加密（`src/Crypto`）
- `CryptoManager`：统一 `md5/encrypt/decrypt` 的封装
- 参考：`tests/Crypto/CryptoManager.test.ts`

### 网络（`src/Net`）
- `NetManager`：聚合 `Http` 与 `Socket` 的具体实现
- 参考：`tests/Net/NetManager.test.ts`

### 表与工厂（`src/Table`、`src/Factory`）
- `TableManager` 与 `FactoryManager`：轻量封装
- 参考：`tests/Table/TableManager.test.ts`、`tests/Factory/*`

## 文档
详见 `docs/` 目录（VitePress 结构）。

## 贡献
欢迎提交 Issue、PR。建议先运行测试并附带用例覆盖新增/修改的行为。

## 许可证
MIT
