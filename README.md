# xhgame_ec_framework

一个面向 Cocos Creator 的轻量级游戏开发框架与构建工具合集。框架侧重于清晰的工程分层（EC、UI、事件、时间调度、资源与表管理等）与可维护的扩展包工作流（打包、安装、卸载、备份、回滚）。

本仓库包含两个核心包：
- `packages/core`：运行时核心（EC、事件、UI、时间、网络、存储、加密、表/工厂等）
- `packages/builder`：资源扩展包构建与安装工具（打包、安装、卸载、备份/回滚、追加脚本）

## 特性
- ECS 组件体系：实体管理、组件挂载/卸载、系统初始化回调
- UI 管理：驱动可插拔，统一打开/移除/状态检查，Toast/Loading 控制
- 事件中心：发布-订阅、按 tag 批量清理、重复监听去重
- 时间系统：播放/暂停/重置、一次性与循环调度、由驱动更新
- 资源与表：工厂/表管理的轻量封装，支持脚本追加
- 存储与加密：可选 md5+加密包装，类型化读写
- 网络抽象：Http/Socket 接口聚合
- 构建与安装：按 `setup.json` 的 `files` 清单复制，ZIP 解压根目录智能选择
- 备份与回滚：卸载前生成 `<code>.zip` 与描述 JSON，回滚自动剥离顶级目录前缀

## 目录结构
顶层关键目录：
- `packages/core/src`：核心运行时代码
- `packages/builder/src`：构建与安装工具代码
- `extensions/<plugin>/packages`：示例扩展资源包（`*.setup.json` 与 `*.zip`）
- `assets/script/managers`：示例管理器与类型枚举文件（供追加脚本演示）
- `tests`：所有核心与构建的可运行用例
- `docs`：使用与设计文档（VitePress 结构）

## 快速开始
- 运行全部测试（验证功能与示例工作流）：
  - `bun ./tests/run.test.mjs`
- 使用构建工具的示例工作流：
  1. 打包项目内资源为扩展包（生成 `setup.json.files` 清单）
     - 参考 `packages/builder/src/Pack/Pack.ts` 与 `tests/builder/Pack.test.ts`
  2. 安装扩展组件到 `assets`（仅按清单复制）
     - `LocalInstallManager.installComponent(group, componentCode)`
     - 参考 `tests/builder/LocalInstallManager.test.ts`
  3. 卸载组件（先备份 ZIP+JSON，再删除文件与脚本）
     - `LocalInstallManager.uninstallComponent(group, componentCode)`
     - 回滚使用 `BackupManager.rollback(group, componentCode)`

## Core 核心概念与用法
- ECS（`packages/core/src/EC`）
  - `Entity`：创建/移除实体，挂载/卸载组件；系统初始化回调在 `Comp.attach` 后执行
  - 参考：`tests/core/EC/EC.test.ts`
- UI（`packages/core/src/Ui`）
  - `UiManager`：基于 `IUiDrive` 的打开/移除 UI、状态检查、Toast/Loading
  - `SimpleBaseView`：轻量 View 基类，支持绑定属性映射
  - 参考：`tests/core/Ui/UiManager.test.ts`、`tests/core/Ui/View.test.ts`
- 事件（`packages/core/src/Event`）
  - `EventManager`：`on/off/emit`，按 `tag` 清理，重复监听自动去重
  - 参考：`tests/core/Event/EventManager.test.ts`
- 时间（`packages/core/src/Time`）
  - `TimeSystem`：播放/暂停/重置、一次性与循环调度，`updateByDrive(dt)` 驱动
  - 参考：`tests/core/Time/TimeSystem.test.ts`
- 存储（`packages/core/src/Storage`）
  - `StorageManager`：可选加密包装、`set/get/remove/clear` 与类型化读取
  - 参考：`tests/core/Storage/StorageManager.test.ts`
- 加密（`packages/core/src/Crypto`）
  - `CryptoManager`：统一 `md5/encrypt/decrypt` 的封装
  - 参考：`tests/core/Crypto/CryptoManager.test.ts`
- 网络（`packages/core/src/Net`）
  - `NetManager`：聚合 `Http` 与 `Socket` 的具体实现
  - 参考：`tests/core/Net/NetManager.test.ts`
- 表与工厂（`packages/core/src/Table`、`packages/core/src/Factory`）
  - `TableManager` 与 `FactoryManager`：轻量封装，结合追加脚本可动态扩展类型
  - 参考：`tests/core/Table/TableManager.test.ts`、`tests/core/Factory/*`

## Builder 工作流
- 打包（`packages/builder/src/Pack/Pack.ts`）
  - 将项目 `assets/.../<group>/<item>` 复制到 `extensions/<plugin>/packages/<group>/<item>`
  - 生成/更新 `<group>/<item>.setup.json` 的 `files` 清单供安装使用
- 安装（`packages/builder/src/Builder/LocalInstallManager.ts`）
  - 解压 ZIP 或使用同名目录作为源；仅复制 `setup.json.files` 中列出的相对路径
  - 依赖校验：文件存在性、UUID 一致性（支持 `replaceUuid`）、组件安装依赖（同插件）
  - 追加脚本：枚举/类属性追加（Factory/Table/GUI/Audio/Comp）
  - 记录安装信息：`<plugin>-installInfo.json`
- 卸载与备份（`packages/builder/src/Builder/LocalInstallManager.ts`、`BackupManager.ts`）
  - 卸载前备份：生成 `<componentCode>.zip` 与 `<componentCode>.setup.json`
  - ZIP 顶层目录为组件码；回滚自动剥离 `${componentCode}/` 前缀，恢复至 `assets`
  - 幂等恢复追加脚本与安装信息

## 约定与路径
- 项目根查找：向上查找存在的 `extensions` 目录（Creator 环境使用 `Editor.Project.path`）
- 资源根：`assets`
- 扩展包目录：`extensions/<plugin>/packages/<group>`
- 备份目录：`extensions/<plugin>/backups/<projectName>/<group>`
- 安装信息：`/<plugin>-installInfo.json`

## 运行测试
- 使用 `bun`：
  - `bun ./tests/run.test.mjs`
- 测试会：
  - 在 `beforeEach` 清空 `assets/bundle_factory` 与 `assets/script/itemViews`
  - 按用例安装/卸载/备份/回滚进行端到端验证

## 文档
- 详见 `docs/` 目录，包含架构设计、用法与示例（VitePress 结构）。

## 贡献
- 欢迎提交 Issue、PR。建议先运行测试并附带用例覆盖新增/修改的行为。

## 许可证
- MIT