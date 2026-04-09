---
outline: deep
---

# View 与 Observer 清理机制

## 📌 重要说明

在使用 `ViewUtil.bindAttr()` 绑定 View 和 ModelComp 时，框架会自动将 View 添加到 ModelComp 的观察者列表中。**View 销毁时必须正确清理这些绑定，否则会造成内存泄漏。**

## 🎯 核心机制

框架提供了**双层防护机制**确保 Observer 被正确清理：

### 1. View 主动清理（推荐方式）

View 关闭时调用 `closeView()` 或 `clearBindAttrMap()` 自动清理所有绑定。

### 2. 组件回收强制清理（兜底机制）

组件回收到对象池时，`Comp.removeComp()` 会强制清空 `_viewObservers` 数组，防止池子污染。

## 📖 使用场景

### 场景 1: View 与专属 ViewComp（一对一）

这是最常见的场景，View 有自己专属的 ViewComp：

```typescript
class GateTreasureAtlasDialogView extends SimpleBaseView {
    protected onLoad(): void {
        // 绑定自己的 ViewComp
        this.setBindAttrMap({
            "title": 'GateTreasureAtlasDialogViewComp::title',
            "items": 'GateTreasureAtlasDialogViewComp::items'
        })
    }
}

// 使用
let view = new GateTreasureAtlasDialogView()
view.setViewComp(viewComp)

// 关闭时自动清理
view.closeView()  // ✅ 自动清理所有绑定
```

### 场景 2: View 绑定全局 ModelComp（多对一）

View 除了绑定自己的 ViewComp，还绑定了全局的 ModelComp（如 `PlayerAtlasModelComp`）：

```typescript
class GateTreasureAtlasDialogView extends SimpleBaseView {
    protected onLoad(): void {
        this.setBindAttrMap({
            // 绑定自己的 ViewComp
            "title": 'GateTreasureAtlasDialogViewComp::title',

            // 绑定全局 ModelComp（不会 detach）
            "items": 'PlayerAtlasModelComp::atlasInfo.treasures',
            "upAtlasTreasures": 'PlayerAtlasModelComp::upAtlasTreasures'
        })
    }
}

// 使用
let view = new GateTreasureAtlasDialogView()
view.setViewComp(viewComp)

// 关闭时自动清理（包括全局 ModelComp 的绑定）
view.closeView()  // ✅ 不会造成内存泄漏
```

**重要**：即使 `PlayerAtlasModelComp` 是全局单例不会 detach，`closeView()` 也会正确清理 View 在其 observers 列表中的引用。

### 场景 3: 手动清理绑定

如果需要在不关闭 View 的情况下清理绑定：

```typescript
// 只清理绑定，不关闭 View
view.clearBindAttrMap()

// 重新绑定
view.setBindAttrMap({
    "newAttr": 'OtherModelComp::newAttr'
})
```

### 场景 4: 多次调用 setBindAttrMap

框架会自动清理旧绑定，避免重复：

```typescript
// 第一次绑定
view.setBindAttrMap({
    "attr1": 'ModelComp1::attr1'
})

// 第二次绑定（会先清理旧绑定）
view.setBindAttrMap({
    "attr2": 'ModelComp2::attr2'
})
// ✅ ModelComp1 的 observer 已被清理
```

## ⚠️ 常见错误

### ❌ 错误：忘记调用 closeView()

```typescript
let view = new MyView()
view.setViewComp(viewComp)
view.setBindAttrMap({
    "data": 'GlobalModelComp::data'
})

// 直接销毁 View，没有调用 closeView()
view = null  // ❌ GlobalModelComp 仍然持有 View 的引用，内存泄漏！
```

### ✅ 正确：始终调用 closeView()

```typescript
let view = new MyView()
view.setViewComp(viewComp)
view.setBindAttrMap({
    "data": 'GlobalModelComp::data'
})

// 关闭 View
view.closeView()  // ✅ 清理所有绑定
view = null
```

## 🔧 API 说明

### IView 接口

```typescript
interface IView {
    setViewComp(modelComp: BaseModelComp, isRebindAttr?: boolean): void
    getViewComp(): BaseModelComp
    closeView(): void  // 关闭 View，自动清理所有绑定
    getBindAttrMap(): any
    setBindAttrMap(val: any): void  // 设置绑定，自动清理旧绑定
    clearBindAttrMap(): void  // 手动清理所有绑定
    updateBySubject(modelComp: BaseModelComp): void
}
```

### ViewUtil 工具类

```typescript
class ViewUtil {
    // 绑定 View 和 ModelComp，返回绑定的 ModelComp 列表
    static bindAttr(observer: IObserver, bindAttrMap: Record<string, string>): BaseModelComp[]

    // 解绑 View 和 ModelComp
    static unBindAttr(observer: IObserver, modelComps: BaseModelComp[]): void

    // 根据 ModelComp 更新 View 属性
    static updateByModel(modelComp: BaseModelComp, observer: IView): void
}
```

## 🧪 测试验证

框架提供了完整的测试用例验证清理机制：

```typescript
// tests/Ui/View.test.ts

test("测试组件回收时清理 observers", async () => {
    // 验证组件回收到池子时 observers 被清理
})

test("测试组件重用不会触发旧 View", async () => {
    // 验证组件从池子重用时不会触发已销毁的 View
})

test("测试 View 关闭时清理全局 ModelComp 的 observers", async () => {
    // 验证 View 关闭时清理全局 ModelComp 的绑定
})
```

## 💡 最佳实践

1. **始终调用 closeView()**
   View 销毁时必须调用 `closeView()`，确保清理所有绑定。

2. **使用 IUiDrive.removeUI() 统一管理**
   在 UI 驱动层统一调用 `view.closeView()`，避免遗漏。

3. **全局 ModelComp 也需要清理**
   即使 ModelComp 是全局单例，View 销毁时也要清理绑定。

4. **利用兜底机制**
   即使忘记调用 `closeView()`，组件回收时也会强制清理，但不要依赖这个机制。

## 🔍 实现原理

### 绑定流程

```
View.setBindAttrMap()
    ↓
ViewUtil.bindAttr()
    ↓
解析 bindAttrMap，从 DI 获取 ModelComp
    ↓
ModelComp.attachObserver(view)
    ↓
View 被添加到 ModelComp._viewObservers[]
    ↓
存储到 View._boundModelComps[]
```

### 清理流程

```
View.closeView()
    ↓
View.clearBindAttrMap()
    ↓
ViewUtil.unBindAttr(view, _boundModelComps)
    ↓
遍历 _boundModelComps，调用 detachObserver(view)
    ↓
View 从 ModelComp._viewObservers[] 中移除
    ↓
清空 View._boundModelComps[]
    ↓
viewModelComp.detach()（卸载专属 ViewComp）
```

### 兜底机制

```
Comp.detach()
    ↓
Comp.removeComp()
    ↓
检查是否有 _viewObservers 属性
    ↓
强制清空 _viewObservers = []
    ↓
comp.reset()
    ↓
回收到对象池
```

## 📚 相关文档

- [EC 架构说明](./ec.md)
- [数据驱动开发](./readme.md#数据驱动--cocos-component--天然-viewmodel)
- [单元测试](../tests/Ui/View.test.ts)

## 🐛 问题排查

### 如何检查是否有内存泄漏？

```typescript
// 在 ModelComp 中添加日志
class PlayerAtlasModelComp extends BaseModelComp {
    notify(immediately?: boolean) {
        console.log(`[DEBUG] observers count: ${this.getObservers().length}`)
        super.notify(immediately)
    }
}

// 观察 observers 数量是否持续增长
```

### 如何确认 View 已被清理？

```typescript
let view = new MyView()
view.setViewComp(viewComp)

let globalModelComp = DI.make('PlayerAtlasModelComp') as PlayerAtlasModelComp
console.log('Before close:', globalModelComp.getObservers().length)

view.closeView()
console.log('After close:', globalModelComp.getObservers().length)  // 应该减少
```

## 📝 更新日志

- **v1.6.8** (2026-04-09)
  - 添加 `IView.clearBindAttrMap()` 方法
  - 添加 `ViewUtil.unBindAttr()` 方法
  - `SimpleBaseView` 自动存储和清理绑定的 ModelComp
  - `Comp.removeComp()` 添加防御性清理
  - 完善测试用例覆盖全局 ModelComp 场景
