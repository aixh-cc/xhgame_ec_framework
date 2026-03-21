---
outline: deep
---

# 组件初始化参数（setup）

## 概述

挂载组件时，可以直接传入初始化参数，组件会自动调用 `setup()` 方法。

## 用法

### 1、attachComponent 直接传参

```ts
// 以前：分两步
xhgame.gameEntity.attachComponent(ABComp).setup({ num: 1 })

// 现在：一步到位
xhgame.gameEntity.attachComponent(ABComp, { num: 1 })
```

### 2、组件中覆盖 setup

`setup()` 返回 `this`，支持链式调用：

```ts
export class BattleViewComp extends BaseModelComp {
    compName = 'BattleViewComp'
    initBySystems = [BattleViewSystem]

    level: number = 0
    difficulty: string = 'normal'

    setup(config: { level: number; difficulty?: string }) {
        this.level = config.level
        this.difficulty = config.difficulty ?? 'normal'
        return this
    }

    // ...
}
```

### 3、配合 done() 异步等待

`done()` 同样返回具体类型，不再需要强转：

```ts
// 以前需要 as ABComp
let comp = await xhgame.gameEntity.attachComponent(ABComp).done() as ABComp

// 现在自动推导为 ABComp
let comp = await xhgame.gameEntity.attachComponent(ABComp, { num: 1 }).done()
```
