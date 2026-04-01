# xhgame 框架 UiItem 使用指南：三层数据结构设计

## 背景

在 xhgame 框架中，UI 组件采用了清晰的三层数据结构设计，将数据、UI 容器和视图逻辑完全分离。这种设计模式解决了以下问题：

1. **数据与视图解耦**：业务数据不直接依赖 UI 实现
2. **生命周期管理**：UI 容器统一管理节点的创建、回收和复用
3. **视图逻辑复用**：ViewModel 层可以在不同场景下复用
4. **跨环境测试**：可以在 Bun 测试环境中模拟 Cocos 环境，测试业务逻辑

## 三层架构详解

### 第一层：数据层 (Data Layer)

**职责**：存储纯业务数据，不包含任何 UI 逻辑

**示例**：
```typescript
// 业务数据接口
interface IAtlasSword {
    swordId: number
    fragmentCount: number
    isCollected: boolean
    playerSword: {
        level: number
    }
    config: ISwordConfig
}
```

**特点**：
- 纯数据对象，可以来自服务器、本地存储或计算结果
- 不依赖任何 Cocos 或 UI 框架
- 可以在非 UI 环境中使用（如单元测试、后端逻辑）

### 第二层：UI 层 (UI Container Layer)

**职责**：管理 Cocos 节点的生命周期、位置、交互等通用 UI 属性

**核心类**：`CocosUiItem implements IUiItem`

**关键属性**：
```typescript
class CocosUiItem {
    itemsIndex: number        // 在列表中的索引
    scales: number[]          // 缩放
    active: boolean           // 显示/隐藏
    btnActive: boolean        // 按钮可交互性
    nodeName: string          // 节点名称
    onClickCallback: Function // 点击回调
    moveable: boolean         // 是否可拖动
    positions: number[]       // 位置
}
```

**核心方法**：
```typescript
// 获取 ViewModel 实例
getModelView(): CocosBaseItemView

// 获取 ViewModel 接口（类型安全）
getViewVm<T>(): T

// 场景管理
toScene(nodePath?: string): void  // 添加到场景
toPool(): void                     // 回收到对象池

// 动画
moveToUiRootPath(...): Promise
bezierTo(...): void
```

**特点**：
- 不关心具体显示什么内容
- 只管理通用的 UI 容器属性
- 提供统一的对象池管理
- 处理通用交互（点击、拖拽）

### 第三层：视图层 (ViewModel Layer)

**职责**：将数据层的业务数据映射到具体的 UI 显示

**核心类**：`XXXItemView extends CocosBaseItemView implements IXXXItemVM`

**示例**：
```typescript
// ViewModel 接口定义
export interface IAtlasSwordItemVM {
    is_lock: boolean
    is_up: boolean
    star: number
    level_up_fragment_num: number
    has_fragment_num: number
    swordNo: string
    swordName: string
    swordId: number
}

// ViewModel 实现
@ccclass('AtlasSwordItemView')
export class AtlasSwordItemView extends CocosBaseItemView
    implements IAtlasSwordItemVM {

    // 每个属性都有 getter/setter，控制具体的 UI 显示
    set is_lock(val: boolean) {
        this._is_lock = val
        this.node.getChildByName('lock').active = val
        this.node.getChildByName('stars').active = !val
    }

    set star(val: number) {
        this._star = val
        // 控制星星显示逻辑
        for (let i = 1; i <= 5; i++) {
            this.node.getChildByPath(`stars/xing${i}/empty`)
                .active = i > val
        }
    }
}
```

**特点**：
- 实现具体的数据到视图的映射逻辑
- 使用 Cocos 的 `@property` 装饰器，支持编辑器预览
- 每个属性的 setter 直接操作子节点
- 不关心数据来源，只负责显示

## 数据流动示例

### 完整流程：从数据到显示

```typescript
// 1. 准备数据层（来自服务器或本地）
const swordData: IAtlasSword = {
    swordId: 1001,
    fragmentCount: 25,
    isCollected: true,
    playerSword: { level: 3 },
    config: { name: "青锋剑", goodsNo: "sword_001" }
}

// 2. 创建 UI 层（从工厂获取，自动管理对象池）
const uiItem = xhgame.factory
    .getFactory(xhgame.factory.enums.uiItem)
    .produceItem('atlas_sword_item')

// 3. 设置 UI 容器属性
uiItem.positions = [100, 200]
uiItem.onClickCallback = (item) => {
    console.log('点击了剑', item)
}

// 4. 获取 ViewModel 并绑定数据
const vm = uiItem.getViewVm<IAtlasSwordItemVM>()
vm.swordId = swordData.swordId
vm.swordNo = swordData.config.goodsNo
vm.swordName = swordData.config.name
vm.is_lock = !swordData.isCollected
vm.star = swordData.playerSword.level
vm.has_fragment_num = swordData.fragmentCount

// 5. 显示到场景
uiItem.toScene()

// 6. 使用完毕后回收
uiItem.toPool()
```

### 在虚拟网格中使用

```typescript
// 虚拟网格会自动管理 UiItem 的创建和回收
virtualGrid.initVirtualGrid(
    'atlas_sword_item',  // UiItem 模板名称
    'path/to/container', // 容器路径
    (uiItem: IUiItem, data: IAtlasSword) => {
        // 这个回调会在每次需要显示数据时调用

        // 设置 UI 层属性
        uiItem.onClickCallback = () => {
            console.log('点击了', data.swordId)
        }

        // 设置 ViewModel 数据
        const vm = uiItem.getViewVm<IAtlasSwordItemVM>()
        vm.swordId = data.swordId
        vm.swordNo = data.config.goodsNo
        vm.is_lock = !data.isCollected
        vm.star = data.playerSword.level
    }
)
```

## 为什么需要三层？

### 对比：传统单层设计的问题

```typescript
// ❌ 不好的做法：数据和 UI 混在一起
class SwordItem extends Component {
    swordData: any  // 数据混在组件里

    updateDisplay() {
        // UI 逻辑和数据逻辑耦合
        if (this.swordData.isCollected) {
            this.lockNode.active = false
        }
    }
}
```

**问题**：
1. 数据和 UI 强耦合，难以测试
2. 无法复用数据逻辑
3. 对象池管理困难
4. 难以在编辑器中预览

### 三层设计的优势

```typescript
// ✅ 好的做法：三层分离

// 数据层：可以在任何地方使用
interface IAtlasSword { ... }

// UI 层：统一管理容器
class CocosUiItem {
    getViewVm<T>(): T  // 桥接到 ViewModel
}

// ViewModel 层：专注显示逻辑
class AtlasSwordItemView implements IAtlasSwordItemVM {
    set is_lock(val: boolean) {
        this.node.getChildByName('lock').active = val
    }
}
```

**优势**：
1. **可测试性**：数据层可以独立测试
2. **可复用性**：ViewModel 可以在不同场景复用
3. **可维护性**：每层职责清晰
4. **性能优化**：UI 层统一管理对象池
5. **编辑器友好**：ViewModel 支持编辑器预览

## 跨环境测试：Bun 模拟 Cocos

三层架构的一个重要优势是**可以在 Bun 测试环境中模拟 Cocos 环境**，无需启动 Cocos Creator 就能测试业务逻辑。

### 为什么可以跨环境测试？

因为三层分离，我们可以：
1. **数据层**：完全独立，不依赖任何环境
2. **UI 层**：通过 `IUiItem` 接口抽象，可以有不同实现
3. **ViewModel 层**：通过 `mock_vm` 模拟，不需要真实 Cocos 节点

### 环境切换机制

在 `xhgame.ts` 中通过注释切换环境：

```typescript
// Bun 测试环境
static getManagers() {
    return DI.make<BunGameManagers>('IManagers') as BunGameManagers;
}
static getGame() {
    return DI.make<BunGame>('IGame') as BunGame;
}

// Cocos 运行环境
// static getManagers() {
//     return DI.make<CocosGameManagers>('IManagers') as CocosGameManagers;
// }
// static getGame() {
//     return DI.make<CocosGame>('IGame') as CocosGame;
// }
```

### BunUiItem：模拟 CocosUiItem

```typescript
// tests/myBunGame/managers/myFactory/itemTemplates/BunUiItem.ts
export class BunUiItem extends BaseBunItem implements IUiItem {
    itemsIndex: number = 0
    active: boolean = false
    onClickCallback: Function = null

    // 关键：使用 mock_vm 模拟 ViewModel
    mock_vm: any = null

    getViewVm<T>(): T {
        if (this.mock_vm == null) {
            this.mock_vm = {}
        }
        return this.mock_vm as T
    }

    toScene(): void {
        console.log('BunUiItem toScene', this.itemNo)
    }

    toPool(): void {
        // 模拟回收
    }
}
```

### 测试示例：完全相同的业务代码

```typescript
// 在 Cocos 环境中运行
const uiItem = xhgame.factory
    .getFactory(xhgame.factory.enums.uiItem)
    .produceItem('atlas_sword_item')  // 返回 CocosUiItem

const vm = uiItem.getViewVm<IAtlasSwordItemVM>()
vm.swordId = 1001
vm.is_lock = false
vm.star = 3

// 在 Bun 测试环境中运行（完全相同的代码！）
const uiItem = xhgame.factory
    .getFactory(xhgame.factory.enums.uiItem)
    .produceItem('atlas_sword_item')  // 返回 BunUiItem

const vm = uiItem.getViewVm<IAtlasSwordItemVM>()
vm.swordId = 1001  // 写入 mock_vm.swordId
vm.is_lock = false // 写入 mock_vm.is_lock
vm.star = 3        // 写入 mock_vm.star

// 验证数据
assert(vm.swordId === 1001)
assert(vm.is_lock === false)
assert(vm.star === 3)
```

### 完整测试用例

```typescript
// tests/myBunGame/myTests/basic.test.ts
import { xhgame } from "db://assets/script/xhgame"
import { BunGame } from "../baseBun/BunGame"

// 初始化 Bun 游戏环境
let testGame = new BunGame()
testGame.start().then(() => {
    test('测试战斗系统', async () => {
        // 准备数据层
        let gridData = {
            units: [
                { id: 1, x: 0, y: 0, hp: 100 }
            ]
        }

        // 调用业务逻辑（与 Cocos 环境完全相同）
        await xhgame.gameEntity
            .safeGetComponentByRegisterName('BattleGameBoxComp')
            .setup({ gridData })
            .done()

        // 验证结果
        const boxComp = xhgame.gameEntity
            .safeGetComponentByRegisterName('BattleGameBoxComp')
        assert(boxComp.game.units.length === 1)
    })
})
```

### 测试的优势

**1. 快速迭代**
```bash
# Cocos 环境：需要启动编辑器，加载场景（30秒+）
# Bun 环境：直接运行测试（1秒内）
bun test
```

**2. 自动化测试**
```typescript
// 可以在 CI/CD 中自动运行
test('测试100场战斗', async () => {
    for (let i = 0; i < 100; i++) {
        await runBattle(testData[i])
        assert(result.isValid)
    }
})
```

**3. 调试业务逻辑**
```typescript
// 不需要 Cocos 环境，直接测试数据流
const vm = uiItem.getViewVm<IAtlasSwordItemVM>()
vm.swordId = 1001

console.log(vm)  // { swordId: 1001 }
// 在 Cocos 中，vm 是真实的 AtlasSwordItemView 实例
// 在 Bun 中，vm 是 mock_vm 对象
// 但业务代码完全相同！
```

### 关键设计原则

**接口抽象**：
```typescript
// IUiItem 接口定义了契约
interface IUiItem {
    getViewVm<T>(): T
    toScene(): void
    toPool(): void
}

// CocosUiItem 实现：真实 UI
class CocosUiItem implements IUiItem {
    getViewVm<T>(): T {
        return this.node.getComponent(CocosBaseItemView) as T
    }
}

// BunUiItem 实现：模拟 UI
class BunUiItem implements IUiItem {
    getViewVm<T>(): T {
        return this.mock_vm as T
    }
}
```

**依赖注入**：
```typescript
// 通过 DI 容器切换实现
xhgame.factory.produceItem('atlas_sword_item')
// Cocos 环境 → CocosUiItem
// Bun 环境 → BunUiItem
```

### 测试覆盖范围

**可以测试**：
- ✅ 数据层逻辑（计算、转换）
- ✅ 业务逻辑（战斗系统、背包系统）
- ✅ 数据绑定逻辑（ViewModel 赋值）
- ✅ 事件流程（游戏开始、结束）
- ✅ 网络请求（使用 MockHttp）

**无法测试**：
- ❌ 真实的 UI 渲染效果
- ❌ Cocos 动画播放
- ❌ 触摸交互
- ❌ 性能表现

### 总结

三层架构 + 接口抽象 = **业务逻辑可以在任何环境运行**

```
数据层 (IAtlasSword)
    ↓
UI 层 (IUiItem) ← 接口抽象
    ↓                ↓
CocosUiItem      BunUiItem
    ↓                ↓
真实 UI          模拟 UI
```

这就是为什么三层数据结构如此重要：它不仅仅是代码组织方式，更是**让业务逻辑可测试、可复用、可跨环境运行**的基础架构。

## 最佳实践

### 1. 创建新的 UiItem

**步骤**：

1. 定义 ViewModel 接口
2. 实现 ViewModel 类
3. 在工厂中注册
4. 在业务代码中使用

**代码示例**：

```typescript
// 步骤 1: 定义 ViewModel 接口
export interface IGoodsItemViewVM {
    goodsNo: string  // 物品图标编号
    num: number      // 数量
}

// 步骤 2: 实现 ViewModel
@ccclass('GoodsItemView')
@executeInEditMode(true)
export class GoodsItemView extends CocosBaseItemView
    implements IGoodsItemViewVM {

    toSceneNodePath: string = 'normal_layer/battle_win/goodsItems'

    @property
    _goodsNo: string = ''
    @property({ type: CCString, visible: true })
    get goodsNo() {
        return this._goodsNo
    }
    set goodsNo(val) {
        this._goodsNo = val
        if (val != '') {
            this.node.getChildByPath('modelBody')
                .getComponent(PlistSpriteComponent)
                .plistCode = val
        }
    }

    @property
    _num: number = 0
    @property({ type: CCInteger, visible: true })
    get num() {
        return this._num
    }
    set num(val) {
        this._num = val
        this.node.getChildByName('num')
            .getComponent(Label)
            .string = val > 0 ? val + '' : ''
    }

    reset(): void {
        this._goodsNo = ''
        this._num = 0
    }
}

// 步骤 3: 在工厂枚举中注册
enum UiItemEnums {
    goods_item = 'goods_item',  // 添加枚举
}

// 步骤 4: 使用
const goodsItem = xhgame.factory
    .getFactory(xhgame.factory.enums.uiItem)
    .produceItem('goods_item')

const vm = goodsItem.getViewVm<IGoodsItemViewVM>()
vm.goodsNo = 'gold_coin'
vm.num = 100

goodsItem.toScene()
```

### 2. 数据绑定模式

```typescript
// 方式 1: 直接设置（适合简单场景）
const vm = uiItem.getViewVm<IAtlasSwordItemVM>()
vm.swordNo = data.config.goodsNo
vm.star = data.playerSword.level

// 方式 2: 封装设置函数（适合复杂逻辑）
class GateAtlasDialogViewSystem {
    static setUiItemData(uiItem: IUiItem, data: IAtlasSword) {
        const vm = uiItem.getViewVm<IAtlasSwordItemVM>()

        // 复杂的数据映射逻辑
        vm.swordId = data.swordId
        vm.swordNo = data.config.goodsNo

        if (data.playerSword && data.playerSword.level > 0) {
            vm.level_up_fragment_num =
                data.config.upgradeFragments[data.playerSword.level - 1]
        } else {
            vm.level_up_fragment_num = data.config.fragmentCount
        }

        vm.is_lock = !data.isCollected
        vm.star = data.isCollected ? data.playerSword.level : 0
    }
}

// 使用
GateAtlasDialogViewSystem.setUiItemData(uiItem, swordData)
```

### 3. 交互处理

```typescript
// UI 层处理通用交互
uiItem.onClickCallback = (item) => {
    // 获取 ViewModel 数据
    const vm = item.getViewVm<IAtlasSwordItemVM>()
    console.log('点击了剑', vm.swordId)

    // 触发业务逻辑
    openSwordDetailDialog(vm.swordId)
}

// 拖拽交互
uiItem.moveable = true
uiItem.onStarted = (item, startX, startY, curX, curY) => {
    console.log('开始拖拽')
}
uiItem.onEnded = (item, startX, startY, endX, endY) => {
    const vm = item.getViewVm<IUpJianzhenItemVM>()
    // 处理拖拽结束逻辑
    handleDragEnd(vm.swordId, endX, endY)
}
```

### 4. 对象池管理

```typescript
// 创建（自动从对象池获取或创建新的）
const item = xhgame.factory
    .getFactory(xhgame.factory.enums.uiItem)
    .produceItem('atlas_sword_item')

// 使用
item.toScene()

// 回收（自动放回对象池）
item.toPool()

// 虚拟网格会自动管理对象池
// 无需手动回收
```

## 常见问题

### Q1: 什么时候使用 UiItem？

**A**: 当你需要创建可复用的 UI 元素时，特别是：
- 列表项（虚拟网格）
- 动态创建的 UI 元素
- 需要对象池管理的元素
- 需要在多个场景复用的 UI

### Q2: ViewModel 接口是必须的吗？

**A**: 强烈推荐。接口提供：
- 类型安全
- IDE 自动补全
- 清晰的契约定义
- 便于重构

### Q3: 如何在编辑器中预览 ViewModel？

**A**: 使用 `@executeInEditMode(true)` 和 `@property` 装饰器：

```typescript
@ccclass('AtlasSwordItemView')
@executeInEditMode(true)  // 启用编辑器模式
export class AtlasSwordItemView extends CocosBaseItemView {
    @property({ type: CCBoolean })  // 在编辑器中可见
    get is_lock() { return this._is_lock }
    set is_lock(val: boolean) {
        this._is_lock = val
        this.node.getChildByName('lock').active = val
    }
}
```

### Q4: 数据层应该包含什么？

**A**: 只包含业务数据，不包含：
- ❌ UI 状态（如 `isExpanded`、`isHovered`）
- ❌ 临时计算结果（应该在 ViewModel 中计算）
- ❌ Cocos 节点引用
- ✅ 服务器返回的数据
- ✅ 本地存储的数据
- ✅ 业务逻辑需要的数据

### Q5: 如何处理复杂的数据转换？

**A**: 在 System 层封装转换逻辑：

```typescript
export class GateAtlasDialogViewSystem {
    static setUiItemData(uiItem: IUiItem, data: IAtlasSword) {
        const vm = uiItem.getViewVm<IAtlasSwordItemVM>()

        // 复杂的转换逻辑集中在这里
        const config = xhgame.table
            .getTable(xhgame.table.enums.swordConfig)
            .getInfo(data.swordId)

        vm.swordNo = config.goodsNo
        vm.swordName = config.name

        // 根据业务规则计算显示值
        if (data.isCollected) {
            vm.is_lock = false
            vm.star = data.playerSword.level
        } else {
            vm.is_lock = true
            vm.star = 0
        }
    }
}
```

## 总结

xhgame 框架的三层数据结构设计：

1. **数据层 (T)**: 纯业务数据，与 UI 无关
2. **UI 层 (IUiItem)**: 管理节点生命周期和通用属性
3. **视图层 (ViewModel)**: 数据到视图的映射逻辑

这种设计实现了：
- ✅ 关注点分离
- ✅ 高度可复用
- ✅ 易于测试
- ✅ 性能优化（对象池）
- ✅ 类型安全

**核心理念**：让每一层只做自己该做的事，通过清晰的接口连接各层，最终实现灵活、可维护的 UI 系统。
