---
outline: deep
---

# 组件 onUpdate 生命周期钩子

## 概述

组件可以覆盖 `onUpdate(dt)` 方法，实现每帧更新逻辑。框架会自动将其注册到 `TimeSystem`，无需手动管理。

## 用法

```ts
export class BulletComp extends BaseModelComp {
    compName = 'BulletComp'
    initBySystems = []

    x: number = 0
    speed: number = 5

    // 覆盖 onUpdate，自动注册到 TimeSystem
    onUpdate(dt: number) {
        this.x += this.speed * dt
    }

    reset() {
        this.x = 0
        this.speed = 5
    }
    onAttach() {}
    onDetach() {}
    notify(is_update_now: boolean) {}
}
```

## 行为

- **自动注册**：组件挂载（attach）时，框架检测到子类覆盖了 `onUpdate`，自动注册到 `TimeSystem`
- **自动移除**：组件卸载（removeComp）时，自动从 `TimeSystem` 移除，无需手动清理
- **不覆盖则不注册**：默认 `onUpdate` 是空实现，不覆盖不会产生任何开销
- `dt` 参数为帧间隔时间（毫秒）

## 适用场景

- 需要每帧更新的游戏逻辑（移动、动画、计时器等）
- 替代以前手动调用 `TimeSystem.addSystemToTimeUpdate` 的方式
