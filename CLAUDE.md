# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

面向 Cocos Creator 的轻量级游戏开发框架，侧重于清晰的工程分层（EC、UI、事件、时间调度、资源与表管理等）。

## 开发命令

```bash
# 安装依赖
bun install

# 构建项目（清理 dist，运行 rollup）
npm run build

# 运行测试
bun test

# 清理构建产物
npm run clean
```

## 核心架构

### ECS（实体-组件-系统）

**Entity** (`src/EC/Entity.ts`)：
- 管理单个实体上的组件生命周期
- 支持泛型组件注册表（`TRegistry`），按名称操作组件时提供类型安全
- 核心方法：`attachComponent()`、`detachComponent()`、`getComponent()`
- 注册表方法：`attachComponentByRegisterName()`、`getComponentByRegisterName()`、`safeGetComponentByRegisterName()`

**Comp** (`src/EC/Comp.ts`)：
- 所有组件的基类，带对象池
- 生命周期：`onAttach()` → `onDetach()` → `reset()`
- `setup(...args)` 用于初始化参数
- `requires` 属性声明组件依赖（挂载时检查）
- `onUpdate(dt)` 钩子被重写时自动注册到 TimeSystem
- `initBySystems` 数组触发系统初始化回调
- `done()` 返回 promise，在所有系统初始化完成后 resolve

**System** (`src/EC/System.ts`)：
- `ISystemStatic` 接口，包含静态 `initComp()` 方法
- 系统在挂载阶段通过 `initComp(comp)` 初始化组件

### 依赖注入

**DI** (`src/DI/DI.ts`)：
- 使用 inversify 容器
- `DI.bindSingleton()`、`DI.bindTransient()`、`DI.bindInstance()`
- `DI.make<T>()` 解析服务
- `@autoBindForDI()` 装饰器用于自动注册
- 组件可重写 `bindToDI()` 来注册自身

### UI 管理

**UiManager** (`src/Ui/UiManager.ts`)：
- 通过 `IUiDrive` 接口实现可插拔的 UI 驱动
- 跟踪 opening/opened 状态以防止重复打开
- `openUIAsync()`、`removeUI()`、`checkOpened()`、`checkOpening()`
- `toast()`、`loading()`、`loaded()` 便捷方法
- 通过 `gui_root`、`world_root` 访问根节点

**View** (`src/Ui/View.ts`)：
- `SimpleBaseView` UI 视图基类
- 通过 `bindProps` 映射支持属性绑定

### 时间系统

**TimeSystem** (`src/Time/TimeSystem.ts`)：
- 单例模式，管理调度任务和帧更新
- `addSystemToTimeUpdate()` 用于每帧回调
- 带 `onUpdate()` 的组件在挂载时自动注册
- 播放/暂停/重置控制，一次性和循环调度

### 事件系统

**EventManager** (`src/Event/EventManager.ts`)：
- 发布-订阅模式，`on()`、`off()`、`emit()`
- 基于 tag 的清理，批量取消订阅
- 支持泛型事件类型映射，提供类型安全

### 其他管理器

- **StorageManager**：可选加密包装，类型化 get/set
- **CryptoManager**：md5/encrypt/decrypt 抽象封装
- **NetManager**：聚合 Http 和 Socket 实现
- **TableManager** & **FactoryManager**：轻量级数据/工厂包装
- **AudioManager** & **AssetManager**：音频/资源加载的可插拔驱动

## 代码规范

- 所有 TypeScript 接口必须以 'I' 为前缀（如 `IUiDrive`、`ISystemStatic`）
- 使用实验性装饰器（`experimentalDecorators: true`）
- 目标：ES6，CommonJS 模块
- 路径别名：`@aixh-cc/xhgame_ec_framework` 映射到 `./src/index.ts`

## 测试

测试位于 `tests/` 目录，使用 Poku 测试运行器。每个模块都有对应的测试文件（如 `tests/EC/EC.test.ts`、`tests/Ui/UiManager.test.ts`）。
