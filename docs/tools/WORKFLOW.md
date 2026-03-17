# 完整工作流示例

从 UI 设计图到最终代码的完整流程。

## 🎯 场景：创建一个奖励弹窗

假设我们要创建一个战斗胜利后的奖励弹窗，显示金币和经验奖励。

---

## 📐 Step 1: UI 设计与分析

### UI 设计图

```
┌─────────────────────────────────┐
│         战斗胜利！               │  ← title
├─────────────────────────────────┤
│                                 │
│   💰 金币: 1000                 │  ← gold
│   ⭐ 经验: 500                  │  ← exp
│                                 │
│   [领取奖励]  [分享]            │  ← actions
│                                 │
└─────────────────────────────────┘
```

### UI 分析师输出

```json
{
  "componentName": "BattleRewardDialog",
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
    },
    "onShare": {
      "description": "分享"
    }
  },
  "uiEnumKey": "battle_reward_dialog"
}
```

---

## 🏗️ Step 2: 生成 Comp 层（引擎无关）

### 2.1 创建规格文件

保存为 `battle-reward-dialog-comp.json`：

```json
{
  "componentName": "BattleRewardDialog",
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
    },
    "onShare": {
      "description": "分享"
    }
  },
  "setup": {
    "rewardData": "IRewardData"
  },
  "uiEnumKey": "battle_reward_dialog"
}
```

### 2.2 运行生成器

```bash
cd ~/.openclaw/workspace-xhgamekaifa/skills/ui-component
node generator.js battle-reward-dialog-comp.json /Users/hcz/Documents/xhgamekaifa/xhgame_lingjian3d
```

### 2.3 生成结果

**文件**: `assets/script/comps/battle/dialog/BattleRewardDialogViewComp.ts`

```typescript
import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "db://assets/script/xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"

export interface IBattleRewardDialogViewVM {
    title: string
    gold: number
    exp: number
}

export class BattleRewardDialogViewSystem extends System {
    static async initComp(comp: BattleRewardDialogViewComp) {
        await xhgame.gui.openUIAsync(xhgame.gui.enums.battle_reward_dialog, comp)
        comp.notify()
    }

    /** 领取奖励 */
    static onClaim(comp: BattleRewardDialogViewComp) {
        // TODO: 实现业务逻辑
        // 例如：调用奖励发放接口
        xhgame.player.addGold(comp.vm.gold)
        xhgame.player.addExp(comp.vm.exp)
        comp.notify()
    }

    /** 分享 */
    static onShare(comp: BattleRewardDialogViewComp) {
        // TODO: 实现业务逻辑
        // 例如：调用分享接口
        comp.notify()
    }
}

export class BattleRewardDialogViewComp extends BaseModelComp {
    compName: string = 'BattleRewardDialogViewComp'
    initBySystems: (typeof System)[] = [BattleRewardDialogViewSystem]
    vm: IBattleRewardDialogViewVM = {
        title: '战斗胜利！',
        gold: 0,
        exp: 0
    }
    actions = {
        onClaim: () => {
            BattleRewardDialogViewSystem.onClaim(this)
        },
        onShare: () => {
            BattleRewardDialogViewSystem.onShare(this)
        }
    }
    setup(obj: { rewardData: IRewardData }) {
        this.vm.gold = obj.rewardData.gold
        this.vm.exp = obj.rewardData.exp
        return this
    }
    reset() {
        this.vm = {
            title: '战斗胜利！',
            gold: 0,
            exp: 0
        }
    }
    onDetach() {
        xhgame.gui.removeUI(xhgame.gui.enums.battle_reward_dialog)
    }
}
```

### 2.4 手动完善业务逻辑

在 `onClaim` 和 `onShare` 方法中实现具体的业务逻辑。

---

## 🎮 Step 3: 生成 View 层（Cocos Creator）

### 3.1 创建规格文件

保存为 `battle-reward-dialog-view.json`：

```json
{
  "componentName": "BattleRewardDialog",
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
      "nodePath": "body/rewards/gold/value",
      "component": "Label",
      "property": "string",
      "transform": "toString()"
    },
    "exp": {
      "type": "number",
      "nodePath": "body/rewards/exp/value",
      "component": "Label",
      "property": "string",
      "transform": "toString()"
    }
  },
  "compClassName": "BattleRewardDialogViewComp",
  "vmInterfaceName": "IBattleRewardDialogViewVM"
}
```

### 3.2 运行生成器

```bash
cd ~/.openclaw/workspace-xhgamekaifa/skills/cocos-component-view
node generator.js battle-reward-dialog-view.json /Users/hcz/Documents/xhgamekaifa/xhgame_lingjian3d
```

### 3.3 生成结果

**文件**: `assets/script/uiViews/battle/dialog/BattleRewardDialogView.ts`

```typescript
import { _decorator } from "cc"
import { CocosBaseUiView } from "db://assets/script/baseCocos/CocosBaseUiView"
import { BattleRewardDialogViewComp, IBattleRewardDialogViewVM } from "db://assets/script/comps/battle/dialog/BattleRewardDialogViewComp"
import { Label } from "cc"
import { CCString, CCInteger } from "cc"

const { ccclass, property } = _decorator;

@ccclass('BattleRewardDialogView')
export class BattleRewardDialogView extends CocosBaseUiView implements IBattleRewardDialogViewVM {
    viewModelComp: BattleRewardDialogViewComp

    @property
    _title: string = '';
    @property({ type: CCString, visible: true })
    get title() {
        return this._title
    }
    set title(val) {
        this._title = val
        this.node.getChildByPath('body/title/Label').getComponent(Label).string = val
    }

    @property
    _gold: number = 0;
    @property({ type: CCInteger, visible: true })
    get gold() {
        return this._gold
    }
    set gold(val) {
        this._gold = val
        this.node.getChildByPath('body/rewards/gold/value').getComponent(Label).string = val.toString()
    }

    @property
    _exp: number = 0;
    @property({ type: CCInteger, visible: true })
    get exp() {
        return this._exp
    }
    set exp(val) {
        this._exp = val
        this.node.getChildByPath('body/rewards/exp/value').getComponent(Label).string = val.toString()
    }

    reset(): void {
        this._title = ''
        this._gold = 0
        this._exp = 0
    }

    protected onLoad(): void {
        this.setBindAttrMap({
            "title": 'BattleRewardDialogViewComp::vm.title',
            "gold": 'BattleRewardDialogViewComp::vm.gold',
            "exp": 'BattleRewardDialogViewComp::vm.exp'
        })
    }
}
```

---

## 🎨 Step 4: 在 Cocos Creator 中配置

### 4.1 创建预制件

1. 在 Cocos Creator 中创建新场景
2. 创建节点结构：

```
BattleRewardDialog (根节点)
└── body
    ├── title
    │   └── Label (文本组件)
    ├── rewards
    │   ├── gold
    │   │   ├── icon (Sprite)
    │   │   └── value (Label)
    │   └── exp
    │       ├── icon (Sprite)
    │       └── value (Label)
    └── buttons
        ├── claimBtn (Button)
        └── shareBtn (Button)
```

### 4.2 添加组件

1. 选中根节点 `BattleRewardDialog`
2. 添加组件 → 自定义脚本 → `BattleRewardDialogView`

### 4.3 绑定按钮事件

1. 选中 `claimBtn`
2. 在 Button 组件的 Click Events 中添加：
   - Target: `BattleRewardDialog` (根节点)
   - Component: `BattleRewardDialogView`
   - Method: `viewModelComp.actions.onClaim`

3. 选中 `shareBtn`
4. 同样绑定到 `viewModelComp.actions.onShare`

### 4.4 保存为预制件

将 `BattleRewardDialog` 保存为预制件到 `assets/resources/prefabs/battle/dialog/`

---

## 🚀 Step 5: 使用组件

### 5.1 注册 UI 枚举

在 `GuiEnums.ts` 中添加：

```typescript
export enum GuiEnums {
    // ...
    battle_reward_dialog = 'battle_reward_dialog',
}
```

### 5.2 注册 UI 配置

在 GUI 管理器中注册：

```typescript
{
    key: GuiEnums.battle_reward_dialog,
    prefabPath: 'prefabs/battle/dialog/BattleRewardDialog',
    layer: 'dialog_layer'
}
```

### 5.3 调用显示

```typescript
// 战斗胜利后
const rewardData = {
    gold: 1000,
    exp: 500
};

const entity = xhgame.ecs.createEntity();
const comp = entity.addComp(BattleRewardDialogViewComp).setup({ rewardData });
```

---

## ✅ 完成！

现在你有了一个完整的奖励弹窗：
- ✅ 引擎无关的业务逻辑（Comp + System）
- ✅ Cocos Creator 视图绑定（View）
- ✅ 数据驱动的 UI 更新
- ✅ 交互事件处理

---

## 🔄 ItemView 工作流示例

### 场景：创建技能图标 ItemView

#### 1. 准备规格文件

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
      "logic": "custom"
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

#### 2. 生成代码

```bash
cd ~/.openclaw/workspace-xhgamekaifa/skills/cocos-item-view
node generator.js skill-item-spec.json /Users/hcz/Documents/xhgamekaifa/xhgame_lingjian3d
```

#### 3. 在 Cocos Creator 中配置

创建预制件并配置节点结构。

#### 4. 注册到工厂

在 `UiItemFactory` 中注册该 ItemView。

---

## 📝 总结

完整工作流：
1. **UI 分析** → 输出数据结构
2. **生成 Comp 层** → 业务逻辑
3. **生成 View 层** → 视图绑定
4. **Cocos 配置** → 预制件和节点
5. **注册使用** → 显示 UI

所有步骤都是自动化的，只需要：
- 准备规格文件（JSON）
- 运行生成器
- 在 Cocos 中配置节点结构

---

**提示**: 生成的代码是基础结构，可以根据需要手动扩展和优化。
