# xhgame UI 组件生成工具

为 xhgame_ec_framework 自动生成 UI 组件代码的工具集。

## 🎯 功能

- ✅ 自动生成 Dialog/Panel 组件（Comp + System + VM + View）
- ✅ 自动生成 ItemView 组件（所有类型）
- ✅ 引擎无关的业务逻辑层
- ✅ Cocos Creator 专用的视图层
- ✅ 支持自定义逻辑和复杂属性

## 📦 已开发的 Skills

### 1. UIComponent Skill
生成 Dialog/Panel 的引擎无关层（Comp、System、VM 接口）

**路径**: `~/.openclaw/workspace-xhgamekaifa/skills/ui-component/`

**支持类型**: 
- `dialog` - 弹窗组件
- `panel` - 面板组件

### 2. CocosComponentView Skill
生成 Dialog/Panel 的 Cocos Creator 视图层

**路径**: `~/.openclaw/workspace-xhgamekaifa/skills/cocos-component-view/`

**支持类型**: 
- `dialog` - 弹窗 View
- `panel` - 面板 View

### 3. CocosItemView Skill
生成所有类型的 ItemView 组件

**路径**: `~/.openclaw/workspace-xhgamekaifa/skills/cocos-item-view/`

**支持类型**: 
- `uiItem` - UI 元素
- `textUiItem` - 文本 UI 元素
- `effectItem` - 特效元素
- `unitItem` - 单位元素
- `unitUiItem` - 单位 UI 元素
- `tiledItem` - 瓦片地图元素
- `tiled25dItem` - 2.5D 瓦片元素

## 🚀 快速开始

详见 [USAGE.md](./USAGE.md)

## 🔄 工作流

详见 [WORKFLOW.md](./WORKFLOW.md)

## 📁 项目结构

```
~/.openclaw/workspace-xhgamekaifa/
├── skills/
│   ├── ui-component/           # Dialog/Panel Comp 生成器
│   │   ├── SKILL.md           # Agent 文档
│   │   ├── generator.js       # 代码生成器
│   │   └── test-*.json        # 测试用例
│   ├── cocos-component-view/  # Dialog/Panel View 生成器
│   │   ├── SKILL.md
│   │   ├── generator.js
│   │   └── test-*.json
│   └── cocos-item-view/       # ItemView 生成器
│       ├── SKILL.md
│       ├── generator.js
│       └── test-*.json
├── TODO.md                    # 任务清单
├── TOOLS.md                   # 项目信息
└── README.md                  # 本文档
```

## 🏗️ 架构设计

### 分层架构

```
┌─────────────────────────────────────┐
│      UI 分析师 (AI Agent)            │
│  分析 UI 图片 → 输出数据结构          │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│   UIComponent Agent (引擎无关层)     │
│  生成 Comp + System + VM 接口        │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│  CocosComponentView Agent (Cocos层)  │
│  生成 View + 属性绑定 + 节点映射      │
└─────────────────────────────────────┘
```

### ItemView 工作流

```
┌─────────────────────────────────────┐
│      UI 分析师 (AI Agent)            │
│  分析 UI 图片 → 输出数据结构          │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│   CocosItemView Agent (纯视图层)     │
│  生成 ItemView + VM 接口             │
└─────────────────────────────────────┘
```

## 🎨 设计原则

1. **引擎解耦**: Core 业务逻辑与渲染引擎分离
2. **职责分离**: Comp（业务）、System（初始化）、View（渲染）各司其职
3. **可测试性**: 纯 TS 代码可用 Bun 测试
4. **AI 友好**: 结构化输入输出，易于 Agent 调用

## 📝 示例

### 生成 Dialog 组件

```bash
# 1. 生成 Comp 层
cd ~/.openclaw/workspace-xhgamekaifa/skills/ui-component
node generator.js dialog-spec.json /path/to/project

# 2. 生成 View 层
cd ~/.openclaw/workspace-xhgamekaifa/skills/cocos-component-view
node generator.js view-spec.json /path/to/project
```

### 生成 ItemView 组件

```bash
cd ~/.openclaw/workspace-xhgamekaifa/skills/cocos-item-view
node generator.js item-spec.json /path/to/project
```

## 🔧 开发

### 测试 Skill

每个 Skill 目录下都有测试用例：

```bash
cd ~/.openclaw/workspace-xhgamekaifa/skills/ui-component
node generator.js test-spec.json /path/to/project
```

### 添加新 Skill

1. 创建 Skill 目录
2. 编写 `SKILL.md`（Agent 文档）
3. 实现 `generator.js`（代码生成器）
4. 添加测试用例

## 📚 相关文档

- [USAGE.md](./USAGE.md) - 使用指南
- [WORKFLOW.md](./WORKFLOW.md) - 完整工作流示例
- [TODO.md](./TODO.md) - 开发任务清单
- [TOOLS.md](./TOOLS.md) - 项目信息

## 👥 团队

- **架构师 Agent** - 负责 Skills 开发和维护
- **UI 分析师 Agent** - 负责 UI 图片分析
- **UIComponent Agent** - 负责生成 Comp 层代码
- **CocosComponentView Agent** - 负责生成 View 层代码
- **CocosItemView Agent** - 负责生成 ItemView 代码

## 📄 License

MIT

---

**版本**: 1.0.0  
**更新时间**: 2026-03-17
