---
outline: deep
---

# RedDotManager 红点系统

## 概述

`RedDotManager` 是一个用于游戏中红点提示功能的管理系统，常用于商城、任务、邮件等模块的未读/新内容提示。

### 核心特性

- **数据层**：树形结构管理红点数据，支持多层级路径（如 `shop.weapon.sword`），父节点自动汇总子节点计数
- **UI层**：通过可插拔的 `IRedDotDrive` 接口实现引擎无关的红点显示，支持 Cocos Creator 等多种引擎
- **事件系统**：可选集成 `EventManager`，支持红点变化的响应式通知
- **对象池**：自动管理红点实例的创建和复用，提升性能

### 设计理念

RedDotManager 采用数据层和UI层分离的设计：
- **数据层**：负责红点的逻辑状态（计数、显示/隐藏、层级关系）
- **UI层**：负责红点的视觉呈现（创建节点、位置、样式）

这种分离使得红点逻辑可以独立于具体的渲染引擎进行测试和维护。

## 快速开始

### 1. 创建 RedDotManager 实例

```ts
import { RedDotManager } from '@aixh-cc/xhgame_ec_framework'
import { MyRedDotDrive } from './MyRedDotDrive' // 你的驱动实现

// 创建管理器实例
const drive = new MyRedDotDrive()
const redDotManager = new RedDotManager(drive)
```

### 2. 数据层操作

```ts
// 设置红点数量
redDotManager.setCount('shop.weapon', 5)
redDotManager.setCount('shop.armor', 3)

// 获取红点数量（包含子节点）
console.log(redDotManager.getCount('shop.weapon')) // 5
console.log(redDotManager.getCount('shop'))        // 8（自动汇总）

// 判断是否显示红点
console.log(redDotManager.getShow('shop')) // true

// 清空红点
redDotManager.clear('shop.weapon')
```

### 3. UI层操作

```ts
// 为按钮添加红点
const buttonNode = getButtonNode() // 获取你的按钮节点
const redDot = redDotManager.addRedDot(buttonNode, {
    size: 24,
    color: { r: 255, g: 80, b: 80, a: 255 },
    showNumber: true
})

// 设置红点数字
redDotManager.setRedDotNumber(buttonNode, 10)

// 移除红点
redDotManager.removeRedDot(buttonNode)
```

## 数据层 API

数据层负责管理红点的逻辑状态，使用树形结构组织红点节点。

### register(key: string)

注册红点节点。通常不需要手动调用，`setCount` 会自动注册。

```ts
redDotManager.register('shop')
redDotManager.register('shop.weapon')
redDotManager.register('shop.weapon.sword')
```

### setCount(key: string, count: number)

设置红点数量。会自动注册节点并触发变化通知。

```ts
redDotManager.setCount('shop.weapon', 5)
```

**多层级自动汇总**：

```ts
redDotManager.setCount('shop.weapon.sword', 2)
redDotManager.setCount('shop.weapon.bow', 3)
redDotManager.setCount('shop.armor.helmet', 1)

console.log(redDotManager.getCount('shop.weapon.sword')) // 2
console.log(redDotManager.getCount('shop.weapon'))       // 5（2+3）
console.log(redDotManager.getCount('shop.armor'))        // 1
console.log(redDotManager.getCount('shop'))              // 6（5+1）
```

### getCount(key: string): number

获取红点数量，包含所有子节点的计数。

```ts
const count = redDotManager.getCount('shop')
```

### getShow(key: string): boolean

判断是否应该显示红点（计数 > 0）。

```ts
if (redDotManager.getShow('shop')) {
    // 显示红点
}
```

### clear(key: string)

清空指定节点的红点数量（等同于 `setCount(key, 0)`）。

```ts
redDotManager.clear('shop.weapon')
```

## UI层 API

UI层负责红点的视觉呈现，通过驱动接口与具体引擎交互。

### addRedDot(targetNode: IRedDotNode, config?: IRedDotConfig): IRedDotInstance

为目标节点添加红点。如果已存在红点，直接返回现有实例。

```ts
const redDot = redDotManager.addRedDot(buttonNode, {
    size: 24,                                      // 红点大小
    color: { r: 255, g: 80, b: 80, a: 255 },     // 红点颜色
    offset: { x: 10, y: 10, z: 0 },              // 偏移量
    showNumber: true,                             // 是否显示数字
    fontSize: 12,                                 // 字体大小
    numberColor: { r: 255, g: 255, b: 255, a: 255 } // 数字颜色
})
```

**配置项说明**：

```ts
interface IRedDotConfig {
    spriteFrame?: any       // 自定义精灵帧（可选）
    size?: number           // 红点大小，默认 24
    color?: IColor          // 红点颜色，默认红色
    offset?: IVec3          // 偏移量，默认 (0,0,0)
    showNumber?: boolean    // 是否显示数字，默认 true
    fontSize?: number       // 字体大小，默认 12
    numberColor?: IColor    // 数字颜色，默认白色
}
```

### removeRedDot(targetNode: IRedDotNode)

移除目标节点的红点，红点实例会自动回收到对象池。

```ts
redDotManager.removeRedDot(buttonNode)
```

### getRedDot(targetNode: IRedDotNode): IRedDotInstance | null

获取目标节点的红点实例。

```ts
const redDot = redDotManager.getRedDot(buttonNode)
if (redDot) {
    console.log('红点存在')
}
```

### setRedDotNumber(targetNode: IRedDotNode, num: number)

设置红点显示的数字。

```ts
redDotManager.setRedDotNumber(buttonNode, 99)
```

### setDefaultConfig(config: IRedDotConfig)

设置默认配置，后续创建的红点会使用这些默认值。

```ts
redDotManager.setDefaultConfig({
    size: 20,
    color: { r: 255, g: 100, b: 100, a: 255 },
    showNumber: true
})
```

### clearAll()

清空所有红点，所有实例会回收到对象池。

```ts
redDotManager.clearAll()
```

## 事件系统集成

RedDotManager 支持可选的事件系统集成，当红点数据变化时自动发送通知。

### 创建带事件的管理器

```ts
import { EventManager } from '@aixh-cc/xhgame_ec_framework'
import { RedDotEventMap } from '@aixh-cc/xhgame_ec_framework'

const eventManager = new EventManager<RedDotEventMap>()
const redDotManager = new RedDotManager(drive, eventManager)
```

### 监听红点变化

事件名格式为 `redDot_${key}`，数据包含 `show` 和 `count` 两个字段。

```ts
// 监听特定红点变化
eventManager.on('redDot_shop.weapon', (event, data) => {
    console.log(`武器红点变化: show=${data.show}, count=${data.count}`)

    if (data.show) {
        // 显示红点UI
    } else {
        // 隐藏红点UI
    }
})

// 监听父节点变化（会收到子节点变化的通知）
eventManager.on('redDot_shop', (event, data) => {
    console.log(`商城红点变化: count=${data.count}`)
})
```

### 事件数据结构

```ts
interface RedDotChangeData {
    show: boolean   // 是否显示红点（count > 0）
    count: number   // 红点总计数（包含子节点）
}
```

### 变化通知机制

当调用 `setCount()` 或 `clear()` 时，会向上冒泡通知所有父节点：

```ts
redDotManager.setCount('shop.weapon.sword', 5)

// 触发事件：
// 1. redDot_shop.weapon.sword (count=5)
// 2. redDot_shop.weapon (count=5)
// 3. redDot_shop (count=5)
```

### 不使用事件系统

事件系统是可选的，不传入 `EventManager` 也能正常使用：

```ts
const redDotManager = new RedDotManager(drive) // 不传 eventManager
redDotManager.setCount('shop', 5) // 正常工作，只是不会发送事件
```

## 实现自定义驱动

RedDotManager 通过 `IRedDotDrive` 接口实现引擎无关，你需要为具体引擎实现这个接口。

### IRedDotDrive 接口

```ts
interface IRedDotDrive {
    // 创建红点实例
    createRedDot(config: IRedDotConfig): IRedDotInstance

    // 更新红点配置
    updateRedDotConfig(instance: IRedDotInstance, config: IRedDotConfig): void

    // 附加红点到目标节点（包含位置计算）
    attachRedDot(instance: IRedDotInstance, targetNode: IRedDotNode, config: IRedDotConfig): void

    // 从目标节点分离红点
    detachRedDot(instance: IRedDotInstance): void
}
```

### 实现示例（Cocos Creator）

```ts
import { Node, Sprite, Label, UITransform, Color } from 'cc'

class CocosRedDotDrive implements IRedDotDrive {
    createRedDot(config: IRedDotConfig): IRedDotInstance {
        // 创建红点节点
        const node = new Node('RedDot')
        const uiTransform = node.addComponent(UITransform)
        uiTransform.setContentSize(config.size || 24, config.size || 24)

        // 添加精灵组件
        const sprite = node.addComponent(Sprite)
        if (config.spriteFrame) {
            sprite.spriteFrame = config.spriteFrame
        }
        if (config.color) {
            sprite.color = new Color(config.color.r, config.color.g, config.color.b, config.color.a)
        }

        // 添加数字标签
        let label: Label | null = null
        if (config.showNumber) {
            const labelNode = new Node('Number')
            label = labelNode.addComponent(Label)
            label.fontSize = config.fontSize || 12
            if (config.numberColor) {
                label.color = new Color(
                    config.numberColor.r,
                    config.numberColor.g,
                    config.numberColor.b,
                    config.numberColor.a
                )
            }
            labelNode.parent = node
        }

        // 创建红点实例
        return {
            node: node,
            targetNode: null,
            currentNumber: 0,
            label: label,

            setNumber(num: number) {
                this.currentNumber = num
                if (this.label) {
                    this.label.string = num > 99 ? '99+' : num.toString()
                }
                this.node.active = num > 0
            },

            reset() {
                this.node.active = false
                this.targetNode = null
                this.currentNumber = 0
                if (this.label) {
                    this.label.string = ''
                }
            }
        }
    }

    updateRedDotConfig(instance: IRedDotInstance, config: IRedDotConfig): void {
        const node = instance.node as Node

        // 更新大小
        if (config.size) {
            const uiTransform = node.getComponent(UITransform)
            uiTransform?.setContentSize(config.size, config.size)
        }

        // 更新颜色
        if (config.color) {
            const sprite = node.getComponent(Sprite)
            if (sprite) {
                sprite.color = new Color(config.color.r, config.color.g, config.color.b, config.color.a)
            }
        }
    }

    attachRedDot(instance: IRedDotInstance, targetNode: IRedDotNode, config: IRedDotConfig): void {
        const redDotNode = instance.node as Node
        const target = targetNode as Node

        // 附加到目标节点
        redDotNode.parent = target
        redDotNode.layer = target.layer

        // 计算位置（右上角）
        const targetTransform = target.getComponent(UITransform)
        if (targetTransform) {
            const offset = config.offset || { x: 0, y: 0, z: 0 }
            redDotNode.setPosition(
                targetTransform.width * (1 - targetTransform.anchorX) + offset.x,
                targetTransform.height * (1 - targetTransform.anchorY) + offset.y,
                offset.z
            )
        }
    }

    detachRedDot(instance: IRedDotInstance): void {
        const node = instance.node as Node
        node.removeFromParent()
    }
}
```

### 简化的测试驱动

测试时可以使用简化的 Mock 驱动：

```ts
class MockRedDotDrive implements IRedDotDrive {
    createRedDot(config: IRedDotConfig): IRedDotInstance {
        return {
            node: { name: 'RedDot', active: true },
            targetNode: null,
            currentNumber: 0,
            setNumber(num: number) {
                this.currentNumber = num
                this.node.active = num > 0
            },
            reset() {
                this.node.active = false
                this.targetNode = null
                this.currentNumber = 0
            }
        }
    }

    updateRedDotConfig(instance: IRedDotInstance, config: IRedDotConfig): void {}

    attachRedDot(instance: IRedDotInstance, targetNode: IRedDotNode, config: IRedDotConfig): void {
        instance.node.parent = targetNode
    }

    detachRedDot(instance: IRedDotInstance): void {
        instance.node.parent = null
    }
}
```

## 完整示例

以下是一个商城系统的完整示例，展示数据层、UI层和事件系统的配合使用。

```ts
import { RedDotManager, EventManager } from '@aixh-cc/xhgame_ec_framework'
import { RedDotEventMap } from '@aixh-cc/xhgame_ec_framework'

// 1. 初始化
const eventManager = new EventManager<RedDotEventMap>()
const drive = new CocosRedDotDrive()
const redDotManager = new RedDotManager(drive, eventManager)

// 2. 设置默认配置
redDotManager.setDefaultConfig({
    size: 20,
    color: { r: 255, g: 80, b: 80, a: 255 },
    showNumber: true,
    fontSize: 12
})

// 3. 监听红点变化
eventManager.on('redDot_shop', (event, data) => {
    console.log(`[DEBUG] 商城红点变化: count=${data.count}, show=${data.show}`)
    updateShopBadge(data.count)
})

eventManager.on('redDot_shop.weapon', (event, data) => {
    console.log(`[DEBUG] 武器红点变化: count=${data.count}`)
})

// 4. 数据层操作 - 设置红点数量
function onNewWeaponArrived() {
    // 新武器到货
    redDotManager.setCount('shop.weapon.sword', 2)
    redDotManager.setCount('shop.weapon.bow', 3)

    // 父节点自动汇总
    console.log(redDotManager.getCount('shop.weapon')) // 5
    console.log(redDotManager.getCount('shop'))        // 5
}

function onNewArmorArrived() {
    // 新防具到货
    redDotManager.setCount('shop.armor.helmet', 1)

    // 商城总计数更新
    console.log(redDotManager.getCount('shop')) // 6
}

// 5. UI层操作 - 添加红点
function setupShopUI() {
    const shopButton = getShopButton()
    const weaponButton = getWeaponButton()
    const armorButton = getArmorButton()

    // 为按钮添加红点
    redDotManager.addRedDot(shopButton)
    redDotManager.addRedDot(weaponButton)
    redDotManager.addRedDot(armorButton)

    // 设置红点数字
    redDotManager.setRedDotNumber(shopButton, redDotManager.getCount('shop'))
    redDotManager.setRedDotNumber(weaponButton, redDotManager.getCount('shop.weapon'))
    redDotManager.setRedDotNumber(armorButton, redDotManager.getCount('shop.armor'))
}

// 6. 用户查看后清空红点
function onUserViewWeapons() {
    // 清空武器红点
    redDotManager.clear('shop.weapon.sword')
    redDotManager.clear('shop.weapon.bow')

    // 父节点自动更新
    console.log(redDotManager.getCount('shop.weapon')) // 0
    console.log(redDotManager.getCount('shop'))        // 1（只剩防具）
}

// 7. 对象池自动复用
function testObjectPool() {
    const button1 = getButton1()
    const button2 = getButton2()

    // 添加红点
    const redDot1 = redDotManager.addRedDot(button1)
    console.log('创建第一个红点')

    // 移除红点（回收到对象池）
    redDotManager.removeRedDot(button1)
    console.log('红点已回收到对象池')

    // 再次添加红点（复用对象池中的实例）
    const redDot2 = redDotManager.addRedDot(button2)
    console.log('复用对象池中的红点')
    console.log(redDot1 === redDot2) // true - 同一个实例
}

// 8. 清理
function cleanup() {
    // 清空所有红点UI
    redDotManager.clearAll()

    // 清空所有红点数据
    redDotManager.clear('shop')
}
```

## 最佳实践

### 1. 红点路径命名规范

使用点号分隔的层级路径，从大到小：

```ts
// ✅ 推荐
'shop'                    // 商城
'shop.weapon'             // 商城 > 武器
'shop.weapon.sword'       // 商城 > 武器 > 剑

'mail'                    // 邮件
'mail.system'             // 邮件 > 系统邮件
'mail.friend'             // 邮件 > 好友邮件

// ❌ 不推荐
'shop_weapon_sword'       // 使用下划线，无法利用层级汇总
'shopWeaponSword'         // 驼峰命名，无法解析层级
```

### 2. 数据层和UI层职责分离

```ts
// ✅ 推荐：数据层管理逻辑，UI层管理显示
class ShopController {
    // 数据层：更新红点数量
    updateRedDotData() {
        const newItemCount = this.getNewItemCount()
        redDotManager.setCount('shop.weapon', newItemCount)
    }

    // UI层：监听变化更新UI
    setupRedDotUI() {
        eventManager.on('redDot_shop.weapon', (e, data) => {
            const button = this.getWeaponButton()
            redDotManager.setRedDotNumber(button, data.count)
        })
    }
}

// ❌ 不推荐：混合数据和UI逻辑
class ShopController {
    updateRedDot() {
        const count = this.getNewItemCount()
        redDotManager.setCount('shop.weapon', count)
        const button = this.getWeaponButton()
        redDotManager.setRedDotNumber(button, count) // 耦合
    }
}
```

### 3. 何时使用事件系统

```ts
// ✅ 适合使用事件系统的场景
// - UI需要响应数据变化
// - 多个UI组件监听同一个红点
// - 需要解耦数据更新和UI更新

eventManager.on('redDot_shop', (e, data) => {
    updateMainMenuBadge(data.count)
    updateShopButtonBadge(data.count)
    updateNavigationBar(data.show)
})

// ✅ 不需要事件系统的场景
// - 简单的单向数据流
// - 手动控制UI更新时机

const count = redDotManager.getCount('shop')
updateBadge(count)
```

### 4. 性能优化

```ts
// ✅ 对象池自动管理，无需手动优化
redDotManager.addRedDot(button1)    // 创建新实例
redDotManager.removeRedDot(button1) // 回收到对象池
redDotManager.addRedDot(button2)    // 自动复用对象池实例

// ✅ 批量更新时避免频繁触发事件
function batchUpdate() {
    // 如果担心性能，可以临时不使用事件系统
    const managerNoEvent = new RedDotManager(drive)
    managerNoEvent.setCount('shop.weapon.sword', 10)
    managerNoEvent.setCount('shop.weapon.bow', 20)
    // ... 批量更新完成后，手动触发一次UI更新
}

// ✅ 使用 getShow() 而不是 getCount() > 0
if (redDotManager.getShow('shop')) {  // 更语义化
    // ...
}
```

### 5. 测试建议

```ts
// ✅ 使用 Mock 驱动进行单元测试
describe('商城红点逻辑', () => {
    let manager: RedDotManager

    beforeEach(() => {
        const mockDrive = new MockRedDotDrive()
        manager = new RedDotManager(mockDrive)
    })

    test('多层级汇总', () => {
        manager.setCount('shop.weapon.sword', 2)
        manager.setCount('shop.weapon.bow', 3)
        expect(manager.getCount('shop.weapon')).toBe(5)
        expect(manager.getCount('shop')).toBe(5)
    })
})
```

### 6. 常见陷阱

```ts
// ❌ 错误：重复添加红点
redDotManager.addRedDot(button)
redDotManager.addRedDot(button) // 返回同一个实例，但可能造成困惑

// ✅ 正确：先检查是否存在
if (!redDotManager.getRedDot(button)) {
    redDotManager.addRedDot(button)
}

// ❌ 错误：忘记清理红点
function closeShop() {
    // 关闭商城UI，但忘记移除红点
}

// ✅ 正确：及时清理
function closeShop() {
    redDotManager.removeRedDot(shopButton)
    // 或者清空所有
    redDotManager.clearAll()
}
```
