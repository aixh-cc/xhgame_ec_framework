# v2.2.4 升级说明

本版本保持现有调用方式兼容，集中修复组件生命周期、事件派发和基础服务的一致性问题。

## 组件生命周期

- `attachComponent(...).setup(...).done()` 保持可用。
- `done()` 现在可重复调用，也可以在初始化完成后调用；新增等价别名 `ready()`。
- 初始化失败会回滚 Entity 索引，挂载期间卸载不会重新注册 DI 或帧更新。
- 新增 `attachComponentStrict()`，用于在依赖缺失时直接失败。

## 新增接口

- `TimeSystem.resetAll()`：同时清理计时器、帧更新对象和时间状态。
- `UiManager.openUIOrThrow()`：打开失败时保留异常。
- `StorageManager.clearNamespace()`：只清理当前前缀的数据。
- `DI.tryMake()` 与 `DI.requireMake()`：分别用于可选解析和必须解析。
- EventManager 的 `on/onSingle/once` 支持显式 `tag` 参数；`setTag()` 继续兼容但已废弃。

## 行为修复

- EventManager 在派发期间增删监听不会错位，全量清理会同步清理 tag 状态。
- FetchHttp 的 GET 参数改为 query string，不再发送 GET body。
- StorageManager 对空值执行删除时不再重复添加 prefix。
- Factory 忽略重复回收，Manager/UI/TimeSystem 的内部状态改为幂等处理。
