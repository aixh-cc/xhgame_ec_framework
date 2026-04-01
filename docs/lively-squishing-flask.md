# 红点系统设计

## Context（背景）

游戏需要一个专业的红点系统，支持：

1. **树形结构管理**：红点有层级关系，父节点自动汇总子节点状态
2. **服务化架构**：RedDotService 统一管理所有红点状态
3. **数据驱动**：红点状态由业务数据决定，自动传播更新
4. **易于集成**：在 UiItem 和 View 中轻松绑定红点

## 架构设计

### 红点树形结构

```
root
├── gate (大厅)
│   ├── gate.mission (任务)
│   │   ├── gate.mission.group1
│   │   └── gate.mission.group2
│   ├── gate.atlas (图鉴)
│   └── gate.package (背包)
└── battle (战斗)
```

**特点**：
- 子节点变化，父节点自动更新
- 支持动态注册和注销
- 支持数字红点（显示数量）

### 核心架构

```
数据层 (ModelComp)
    ↓ 计算红点状态
RedDotService (服务层)
    ↓ 更新树节点 + 向上传播
    ↓ emit 事件
UI层 (CocosUiItem / CocosBaseUiView)
    ↓ 监听并显示
红点节点显示/隐藏
```

## 实现步骤

### 1. 创建 RedDotService

**文件**: `assets/script/services/RedDotService.ts`

```typescript
import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "db://assets/script/xhgame"

class RedDotNode {
    key: string
    count: number = 0
    children: Map<string, RedDotNode> = new Map()
    parent: RedDotNode = null

    constructor(key: string) {
        this.key = key
    }

    get show(): boolean {
        return this.count > 0
    }

    addChild(childKey: string): RedDotNode {
        if (!this.children.has(childKey)) {
            const child = new RedDotNode(childKey)
            child.parent = this
            this.children.set(childKey, child)
        }
        return this.children.get(childKey)
    }

    getTotalCount(): number {
        let total = this.count
        this.children.forEach(child => {
            total += child.getTotalCount()
        })
        return total
    }
}

export class RedDotService extends System {
    private root: RedDotNode = new RedDotNode('root')
    private nodeMap: Map<string, RedDotNode> = new Map()

    register(key: string): void {
        if (this.nodeMap.has(key)) return
        const keys = key.split('.')
        let current = this.root
        let path = ''
        for (const k of keys) {
            path = path ? `${path}.${k}` : k
            if (!this.nodeMap.has(path)) {
                current = current.addChild(path)
                this.nodeMap.set(path, current)
            } else {
                current = this.nodeMap.get(path)
            }
        }
    }

    setCount(key: string, count: number): void {
        this.register(key)
        const node = this.nodeMap.get(key)
        if (node && node.count !== count) {
            node.count = count
            this.notifyChange(key)
        }
    }

    getCount(key: string): number {
        const node = this.nodeMap.get(key)
        return node ? node.getTotalCount() : 0
    }

    getShow(key: string): boolean {
        return this.getCount(key) > 0
    }

    private notifyChange(key: string): void {
        let node = this.nodeMap.get(key)
        while (node) {
            const count = node.getTotalCount()
            xhgame.event.emit(`redDot_${node.key}`, { show: count > 0, count })
            node = node.parent
        }
    }

    clear(key: string): void {
        this.setCount(key, 0)
    }
}
```

### 2. 注册 RedDotService 到框架

**文件**: `assets/script/xhgame.ts`

```typescript
import { RedDotService } from './services/RedDotService'

export class xhgame {
    static redDot: RedDotService

    static init() {
        this.redDot = new RedDotService()
    }
}
```

### 3. 在 CocosUiItem 中添加红点绑定

**文件**: `assets/script/managers/myFactory/itemTemplates/CocosUiItem.ts`

```typescript
export class CocosUiItem extends BaseCocosItem implements IUiItem {
    _redDotKey: string = ''
    _redDotShow: boolean = false
    _redDotCount: number = 0

    get redDotKey() {
        return this._redDotKey
    }
    set redDotKey(val: string) {
        if (this._redDotKey) {
            xhgame.event.off(`redDot_${this._redDotKey}`, this.onRedDotChange, this)
        }
        this._redDotKey = val
        if (val) {
            xhgame.event.on(`redDot_${val}`, this.onRedDotChange, this)
            this.updateRedDot()
        }
    }

    get redDotShow() {
        return this._redDotShow
    }
    set redDotShow(val: boolean) {
        this._redDotShow = val
        this.node.getChildByName('red_dot')?.active = val
    }

    private onRedDotChange = (data: { show: boolean; count: number }) => {
        this._redDotShow = data.show
        this._redDotCount = data.count
        this.updateRedDot()
    }

    private updateRedDot() {
        const redDotNode = this.node.getChildByName('red_dot')
        if (redDotNode) {
            redDotNode.active = this._redDotShow
            const label = redDotNode.getChildByName('Label')?.getComponent(Label)
            if (label && this._redDotCount > 0) {
                label.string = this._redDotCount > 99 ? '99+' : this._redDotCount.toString()
            }
        }
    }

    reset() {
        if (this._redDotKey) {
            xhgame.event.off(`redDot_${this._redDotKey}`, this.onRedDotChange, this)
        }
        this._redDotKey = ''
        this._redDotShow = false
    }
}
```

### 4. 在 CocosBaseUiView 中添加红点支持

**文件**: `assets/script/baseCocos/CocosBaseUiView.ts`

```typescript
export abstract class CocosBaseUiView extends Component implements IView {
    private redDotBindings: Map<string, string> = new Map()

    bindRedDot(nodePath: string, redDotKey: string) {
        this.redDotBindings.set(nodePath, redDotKey)
        xhgame.event.on(`redDot_${redDotKey}`, (data) => {
            this.updateRedDotNode(nodePath, data)
        }, this)
        const count = xhgame.redDot.getCount(redDotKey)
        this.updateRedDotNode(nodePath, { show: count > 0, count })
    }

    private updateRedDotNode(nodePath: string, data: { show: boolean; count: number }) {
        const redDotNode = this.node.getChildByPath(`${nodePath}/red_dot`)
        if (redDotNode) {
            redDotNode.active = data.show
        }
    }

    onDestroy() {
        this.redDotBindings.forEach((key, nodePath) => {
            xhgame.event.off(`redDot_${key}`, null, this)
        })
    }
}
```

### 5. 在 ModelComp 中更新红点

**文件**: `assets/script/comps/models/PlayerMissionModelComp.ts`

```typescript
export class PlayerMissionModelComp extends BaseModelComp {
    notify() {
        super.notify()
        this.updateRedDots()
    }

    private updateRedDots() {
        if (!this.curGroupMissionInfo) return

        // 更新每个任务组的红点
        this.curGroupMissionInfo.missionItems?.forEach((item, index) => {
            const hasReward = item.maxScore > 0 && !item.rewardClaimed
            xhgame.redDot.setCount(`gate.mission.item${index}`, hasReward ? 1 : 0)
        })
    }
}
```

## 使用示例

### 场景1：UiItem 绑定红点 key

```typescript
virtualGrid.initVirtualGrid('mission_item', 'path', (uiItem, data, index) => {
    uiItem.redDotKey = `gate.mission.item${index}`
    const vm = uiItem.getViewVm<IMissionItemVM>()
    vm.missionName = data.name
})
```

### 场景2：View 中绑定红点

```typescript
export class GateMissionPanelView extends CocosBaseUiView {
    onLoad() {
        this.bindRedDot('mission_btn', 'gate.mission')
        this.bindRedDot('atlas_btn', 'gate.atlas')
    }
}
```

### 场景3：树形传播

```typescript
xhgame.redDot.setCount('gate.mission.group1', 2)
xhgame.redDot.setCount('gate.mission.group2', 1)
xhgame.redDot.getCount('gate.mission')  // 3
xhgame.redDot.getCount('gate')          // 3
```

## 关键文件

### 需要创建的文件

1. `assets/script/services/RedDotService.ts` - 红点服务

### 需要修改的文件

1. `assets/script/xhgame.ts` - 注册 redDot 服务
2. `assets/script/managers/myFactory/itemTemplates/CocosUiItem.ts` - 添加 redDotKey 属性
3. `assets/script/baseCocos/CocosBaseUiView.ts` - 添加 bindRedDot 方法
4. 各个 ModelComp - 在 notify() 中更新红点

## 优势

1. **树形结构**：父节点自动汇总子节点，无需手动计算
2. **服务化架构**：RedDotService 统一管理，易于维护
3. **自动传播**：子节点变化，父节点自动更新并触发事件
4. **双重绑定**：支持 UiItem.redDotKey 和 View.bindRedDot
5. **数字红点**：支持显示数量（1, 2, 99+）
6. **符合框架**：利用现有事件系统，最小化实现

## 验证方案

### 1. 单元测试

```typescript
test('红点树形传播', () => {
    xhgame.redDot.setCount('gate.mission.group1', 2)
    assert(xhgame.redDot.getCount('gate.mission') === 2)
    assert(xhgame.redDot.getCount('gate') === 2)
})
```

### 2. UI 测试

1. 设置子节点红点 → 观察父节点自动显示
2. 清空子节点 → 观察父节点自动隐藏
3. 绑定 redDotKey → 观察自动更新

## 总结

**核心设计**：
- RedDotService 管理树形结构
- 子节点变化自动向上传播
- UiItem 通过 redDotKey 绑定
- View 通过 bindRedDot 绑定

**关键代码**：
```typescript
// 1. 设置红点
xhgame.redDot.setCount('gate.mission.group1', 1)

// 2. UiItem 绑定
uiItem.redDotKey = 'gate.mission.group1'

// 3. View 绑定
this.bindRedDot('mission_btn', 'gate.mission')

// 4. 树形传播（自动）
xhgame.redDot.getCount('gate.mission') // 汇总所有子节点
```


