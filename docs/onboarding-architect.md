---
outline: deep
---

# 架构师入职对接文档

欢迎加入 xhgame 开发团队！本文档帮助架构师快速了解 `xhgame_ec_framework` 框架的核心设计与职责范围。

## 📋 职责定位

作为架构师，你的主要职责是：

- ✅ **维护底层框架**：`packages/core` 和 `packages/builder` 的核心代码
- ✅ **架构设计与优化**：保持框架的可扩展性和模块化
- ✅ **技术选型与评审**：评估新技术引入的必要性
- ✅ **文档维护**：更新架构文档和 API 说明
- ❌ **不写业务代码**：具体游戏逻辑由业务开发团队负责

## 🏗️ 项目概览

### 基本信息

- **项目路径**: `/Users/hcz/Documents/xhgamekaifa/xhgame_ec_framework`
- **技术栈**: TypeScript + Bun + Inversify (DI)
- **目标平台**: Cocos Creator
- **测试框架**: Poku + Bun

### 核心理念

1. **简单至上**：EC 系统只做挂载与卸载两件事
2. **可替换性**：所有模块可替换，只有架构不变
3. **终端开发**：支持 Bun 运行单元测试，AI 友好
4. **组件化**：支持在线安装/卸载扩展组件

## 📦 核心包结构

### packages/core - 运行时核心

```
packages/core/src/
├── EC/              # 实体-组件系统
├── Ui/              # UI 管理
├── Event/           # 事件系统
├── Time/            # 时间调度
├── Storage/         # 存储管理
├── Crypto/          # 加密工具
├── Net/             # 网络抽象
├── Asset/           # 资源管理
├── Audio/           # 音频管理
├── Table/           # 表管理
├── Factory/         # 工厂管理
├── DI/              # 依赖注入
├── Log/             # 日志系统
└── Game/            # 游戏入口
```

**核心模块说明**：

- **EC**: 轻量级实体-组件系统，组件通过 `initBySystems` 声明初始化系统
- **UI**: 基于 `IUiDrive` 的驱动模式，支持 Toast/Loading
- **Event**: 发布-订阅模式，支持 tag 批量清理和重复监听去重
- **Time**: 播放/暂停/重置、一次性与循环调度
- **Storage**: 可选 md5+加密包装，类型化读写
- **Net**: Http/Socket 接口聚合

### packages/builder - 构建工具

```
packages/builder/src/
├── Pack/            # 打包工具
├── Builder/         # 安装/卸载管理
└── Backup/          # 备份/回滚
```

**工作流**：

1. **打包**：将 `assets` 中的资源复制到 `extensions/<plugin>/packages`，生成 `setup.json` 清单
2. **安装**：按 `setup.json.files` 清单复制文件，处理依赖校验和脚本追加
3. **卸载**：备份为 ZIP，删除文件和脚本记录
4. **回滚**：从备份恢复文件和安装信息

## 🔧 开发环境设置

### 1. 安装依赖

```bash
cd /Users/hcz/Documents/xhgamekaifa/xhgame_ec_framework
bun install
```

### 2. 运行测试

```bash
# 运行所有测试
bun ./tests/run.test.mjs

# 运行特定模块测试
bun ./tests/core/EC/EC.test.ts
```

### 3. 目录约定

- **项目根**: 向上查找存在的 `extensions` 目录
- **资源根**: `assets`
- **扩展包**: `extensions/<plugin>/packages/<group>`
- **备份**: `extensions/<plugin>/backups/<projectName>/<group>`

## 📚 核心概念深入

### EC 组件生命周期

```typescript
// 1. 定义组件
export class MyComp extends BaseModelComp {
    compName: string = 'MyComp'
    initBySystems: (typeof System)[] = [MySystem]
    
    vm = { count: 0 }
    
    reset() {
        this.vm = { count: 0 }
    }
    
    actions = {
        increment: () => MySystem.increment(this)
    }
    
    onDetach() {
        // 清理资源
    }
}

// 2. 挂载组件
let comp = xhgame.gameEntity.attachComponent(MyComp)
// 或异步等待初始化完成
let comp = await xhgame.gameEntity.attachComponent(MyComp) as MyComp

// 3. 卸载组件
xhgame.gameEntity.detachComponent(MyComp)
```

### 驱动模式 (Drive Pattern)

框架中的 UI、Asset、Audio 等模块都采用驱动模式，将具体实现与框架解耦：

```typescript
// 定义驱动接口
interface IUiDrive {
    open(uiCode: number): void
    remove(uiCode: number): void
    // ...
}

// 注入具体实现
UiManager.setDrive(new CocosUiDrive())
```

**优势**：
- 框架不依赖 Cocos Creator 具体 API
- 支持终端测试（Mock Drive）
- 可替换为其他引擎实现

### 依赖注入 (DI)

使用 Inversify 实现依赖注入：

```typescript
import { container } from './DI/DI'

// 注册服务
container.bind<IService>(TYPES.Service).to(ServiceImpl)

// 获取服务
const service = container.get<IService>(TYPES.Service)
```

## 🎯 架构设计原则

### 1. 单一职责

每个模块只做一件事：
- EC 只管组件挂载/卸载
- Event 只管事件发布/订阅
- Time 只管时间调度

### 2. 开放封闭

- 对扩展开放：通过驱动模式、工厂模式支持扩展
- 对修改封闭：核心架构稳定，不轻易改动

### 3. 依赖倒置

- 高层模块不依赖低层模块，都依赖抽象
- 使用接口和驱动模式解耦

### 4. 最小惊讶原则

- API 设计符合直觉
- 命名清晰，行为可预测

## 🔍 常见维护任务

### 添加新的核心模块

1. 在 `packages/core/src/` 创建模块目录
2. 定义接口和实现
3. 在 `Managers.ts` 中注册
4. 编写单元测试
5. 更新文档

### 优化现有模块

1. 先写测试覆盖现有行为
2. 重构代码
3. 确保测试通过
4. 更新文档

### 处理 Breaking Changes

1. 在 `CHANGELOG.md` 中记录
2. 提供迁移指南
3. 考虑向后兼容方案

## 📖 文档维护

### 文档结构

```
docs/
├── index.md              # 首页
├── readme.md             # 初衷与设计理念
├── ec.md                 # EC 使用指南
├── onboarding-architect.md  # 本文档
└── .vitepress/           # VitePress 配置
```

### 更新文档

```bash
# 本地预览文档
cd docs
npm install
npm run dev
```

## 🧪 测试策略

### 测试覆盖

- **Core 模块**：每个模块都有对应测试
- **Builder 工作流**：端到端测试打包/安装/卸载流程
- **Mock 驱动**：使用 Mock 实现进行终端测试

### 测试原则

1. 每个 PR 必须包含测试
2. 测试应该快速、独立、可重复
3. 使用 `beforeEach` 清理状态

## 🚀 发布流程

1. 更新版本号（`package.json`）
2. 更新 `CHANGELOG.md`
3. 运行完整测试套件
4. 提交并打 tag
5. 发布到 npm（如果需要）

## 📞 联系方式

- **项目负责人**: hd
- **技术讨论**: 飞书群组

## 🔗 相关资源

- [Cocos Creator 文档](https://docs.cocos.com/creator/manual/)
- [Inversify 文档](https://inversify.io/)
- [Bun 文档](https://bun.sh/docs)

---

**欢迎提问！** 有任何疑问随时在群里 @ 我。
