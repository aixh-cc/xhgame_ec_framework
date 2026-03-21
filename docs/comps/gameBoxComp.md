---
outline: deep
---

# BaseGameBoxComp 玩法组件基类

## 概述

`BaseGameBoxComp<T>` 收敛了 subGames 模式下的样板代码。玩法组件只需继承它，即可获得统一的 game 实例管理和销毁流程。

## 结构

```
BaseModelComp
  └── BaseGameBoxComp<T>    ← 玩法组件基类
        ├── game: T | null   ← 纯逻辑游戏实例
        ├── destroyGame()    ← 销毁游戏实例
        └── reset()          ← 重置时自动销毁
```

## 用法

```ts
// 纯逻辑层
class LinkGame {
    rows: number
    cols: number
    grid: number[][] = []

    constructor(rows: number, cols: number) {
        this.rows = rows
        this.cols = cols
    }

    destroy() {
        this.grid = []
    }
}

// 玩法组件
class LinkGameBoxComp extends BaseGameBoxComp<LinkGame> {
    compName = 'LinkGameBoxComp'
    initBySystems: ISystemStatic[] = [LinkGameBoxSystem]

    setup(config: { rows: number; cols: number }) {
        this.game = new LinkGame(config.rows, config.cols)
        return this
    }

    onAttach() { super.onAttach() }
    onDetach() {}
    notify(is_update_now: boolean) {}
}
```

## 行为

- `game` 属性持有纯逻辑实例，类型由泛型 `T` 决定
- `reset()` 自动调用 `destroyGame()`
- `destroyGame()` 会检测 game 是否实现了 `destroy()` 方法，有则自动调用
- 子类可覆盖 `destroyGame()` 添加额外清理逻辑

## 设计理念

将玩法拆分为两层：
- **GameBoxComp**：接入层，负责 UI 渲染、事件响应、与宿主交互
- **Game**：纯逻辑层，不依赖引擎，可独立测试

这样玩法逻辑可以在 Bun 终端直接跑测试，不需要启动 Cocos。
