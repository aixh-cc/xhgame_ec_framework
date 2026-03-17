# 使用指南

快速上手 xhgame UI 组件生成工具。

## 📋 前置要求

- Node.js v14+
- xhgame_ec_framework 项目
- Cocos Creator 3.x（用于 View 层）

## 🚀 快速开始

### 1. 生成 Dialog 组件

#### Step 1: 准备 Comp 层规格文件

创建 `my-dialog-spec.json`：

```json
{
  "componentName": "RewardDialog",
  "componentType": "dialog",
  "module": "battle",
  "vm": {
    "title": "string",
    "gold": "number",
    "exp": "number"
  },
  "actions": {
    "onClaim": {
      "description": "领取奖励"
    }
  },
  "uiEnumKey": "battle_reward_dialog"
}
```

#### Step 2: 生成 Comp 层代码

```bash
cd ~/.openclaw/workspace-xhgamekaifa/skills/ui-component
node generator.js my-dialog-spec.json /Users/hcz/Documents/xhgamekaifa/xhgame_lingjian3d
```

**输出**：
```
assets/script/comps/battle/dialog/RewardDialogViewComp.ts
```

包含：
- `IRewardDialogViewVM` 接口
- `RewardDialogViewSystem` 类
- `RewardDialogViewComp` 类

#### Step 3: 准备 View 层规格文件

创建 `my-dialog-view-spec.json`：

```json
{
  "componentName": "RewardDialog",
  "module": "battle",
  "componentType": "dialog",
  "vm": {
    "title": {
      "type": "string",
      "nodePath": "body/title/Label",
      "component": "Label",
      "property": "string"
    },
    "gold": {
      "type": "number",
      "nodePath": "body/gold/value",
      "component": "Label",
      "property": "string",
      "transform": "toString()"
    },
    "exp": {
      "type": "number",
      "nodePath": "body/exp/value",
      "component": "Label",
      "property": "string",
      "transform": "toString()"
    }
  },
  "compClassName": "RewardDialogViewComp",
  "vmInterfaceName": "IRewardDialogViewVM"
}
```

#### Step 4: 生成 View 层代码

```bash
cd ~/.openclaw/workspace-xhgamekaifa/skills/cocos-component-view
node generator.js my-dialog-view-spec.json /Users/hcz/Documents/xhgamekaifa/xhgame_lingjian3d
```

**输出**：
```
assets/script/uiViews/battle/dialog/RewardDialogView.ts
```

#### Step 5: 在 Cocos Creator 中配置

1. 创建 Dialog 预制件
2. 添加 `RewardDialogView` 组件到根节点
3. 配置节点结构：
   ```
   RewardDialog (根节点)
   └── body
       ├── title
       │   └── Label
       ├── gold
       │   └── value (Label)
       └── exp
           └── value (Label)
   ```

---

### 2. 生成 Panel 组件

与 Dialog 类似，只需将 `componentType` 改为 `"panel"`：

```json
{
  "componentName": "LoadingPanel",
  "componentType": "panel",
  "module": "gate",
  "vm": {
    "tip": "string",
    "progress": "number"
  },
  "uiEnumKey": "loading_panel"
}
```

---

### 3. 生成 ItemView 组件

#### Step 1: 准备规格文件

创建 `my-item-spec.json`：

```json
{
  "itemName": "Skill",
  "itemType": "uiItem",
  "toSceneNodePath": "normal_layer/battle_panel/skills",
  "vm": {
    "iconUrl": {
      "type": "string",
      "description": "技能图标",
      "nodePath": "icon",
      "component": "Sprite",
      "property": "spriteFrame"
    },
    "cooldown": {
      "type": "number",
      "description": "冷却时间",
      "nodePath": "cooldown/Label",
      "component": "Label",
      "property": "string",
      "transform": "toString()"
    },
    "isLocked": {
      "type": "boolean",
      "description": "是否锁定",
      "nodePath": "lock",
      "component": "Node",
      "property": "active"
    }
  }
}
```

#### Step 2: 生成代码

```bash
cd ~/.openclaw/workspace-xhgamekaifa/skills/cocos-item-view
node generator.js my-item-spec.json /Users/hcz/Documents/xhgamekaifa/xhgame_lingjian3d
```

**输出**：
```
assets/script/itemViews/SkillItemView.ts
```

#### Step 3: 在 Cocos Creator 中配置

1. 创建 ItemView 预制件
2. 添加 `SkillItemView` 组件到根节点
3. 配置节点结构
4. 在工厂配置中注册该 ItemView

---

## 📝 规格文件说明

### UIComponent 规格

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `componentName` | ✅ | string | 组件名称（PascalCase） |
| `componentType` | ✅ | string | `dialog` 或 `panel` |
| `module` | ❌ | string | 模块名（如 `battle`、`gate`），不指定则从 componentName 推断 |
| `vm` | ✅ | object | ViewModel 数据结构 |
| `actions` | ❌ | object | 交互方法定义 |
| `setup` | ❌ | object | setup 方法参数 |
| `uiEnumKey` | ✅ | string | UI 枚举键（snake_case） |

### CocosComponentView 规格

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `componentName` | ✅ | string | 组件名称 |
| `module` | ✅ | string | 模块名 |
| `componentType` | ✅ | string | `dialog` 或 `panel` |
| `vm` | ✅ | object | 属性配置（包含节点路径） |
| `compClassName` | ✅ | string | Comp 类名 |
| `vmInterfaceName` | ✅ | string | VM 接口名 |

### CocosItemView 规格

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `itemName` | ✅ | string | Item 名称 |
| `itemType` | ✅ | string | Item 类型（uiItem/textUiItem/effectItem 等） |
| `toSceneNodePath` | ✅ | string | 场景挂载路径 |
| `vm` | ✅ | object | 属性配置（包含节点路径） |

---

## 🎨 VM 属性配置

### 基础类型

```json
{
  "title": {
    "type": "string",
    "nodePath": "body/title/Label",
    "component": "Label",
    "property": "string"
  }
}
```

### 数值类型（需要转换）

```json
{
  "count": {
    "type": "number",
    "nodePath": "body/count/Label",
    "component": "Label",
    "property": "string",
    "transform": "toString()"
  }
}
```

### 布尔类型（控制显示）

```json
{
  "isVisible": {
    "type": "boolean",
    "nodePath": "body/icon",
    "component": "Node",
    "property": "active"
  }
}
```

### 自定义逻辑

```json
{
  "starNum": {
    "type": "number",
    "nodePath": "stars",
    "logic": "custom"
  }
}
```

生成的代码会包含 `// TODO: 实现自定义逻辑` 注释。

---

## 🔧 常见问题

### Q: 如何指定模块目录？

A: 在规格文件中添加 `module` 字段：
```json
{
  "module": "battle",
  ...
}
```

### Q: 如何添加交互方法？

A: 在 `actions` 中定义：
```json
{
  "actions": {
    "onConfirm": {
      "description": "确认按钮点击"
    },
    "onCancel": {
      "description": "取消按钮点击"
    }
  }
}
```

### Q: ItemView 需要 Comp 层吗？

A: 不需要。ItemView 是纯视图组件，直接继承 `CocosBaseItemView`。

### Q: 如何处理复杂对象属性？

A: 使用 `expand` 字段展开子属性（参考 CocosComponentView 的 SKILL.md）。

---

## 📚 下一步

- 查看 [WORKFLOW.md](./WORKFLOW.md) 了解完整工作流
- 查看各 Skill 的 `SKILL.md` 了解详细配置
- 查看 [TODO.md](./TODO.md) 了解开发计划

---

**提示**: 所有生成的代码都可以手动修改和扩展，生成器只是提供基础结构。
