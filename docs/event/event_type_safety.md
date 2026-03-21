---
outline: deep
---

# EventManager 事件类型安全

## 概述

`EventManager` 支持泛型事件映射，通过 TypeScript 类型系统在编译期检查事件名和数据类型。

## 用法

### 1、定义事件映射

```ts
interface MyEventMap {
    'game_start': { level: number }
    'game_over': { score: number; win: boolean }
    'coin_change': { amount: number }
}
```

### 2、创建带类型的 EventManager

```ts
const eventMgr = new EventManager<MyEventMap>()
```

### 3、监听事件（自动推导数据类型）

```ts
eventMgr.on('game_start', (e, data) => {
    console.log(data.level)  // ✅ 自动推导为 { level: number }
})

eventMgr.on('game_over', (e, data) => {
    console.log(data.score, data.win)  // ✅ 自动推导
})
```

### 4、触发事件（类型检查）

```ts
eventMgr.emit('game_start', { level: 1 })        // ✅
eventMgr.emit('game_over', { score: 100, win: true })  // ✅

// eventMgr.emit('game_start', { score: 1 })     // ❌ 编译报错：类型不匹配
// eventMgr.emit('not_exist', {})                 // ❌ 编译报错：事件名不存在
```

## 向后兼容

不传泛型参数时，行为与之前完全一致：

```ts
const eventMgr = new EventManager()  // 等同于 EventManager<Record<string, any>>
eventMgr.on('any_event', (e, data) => { ... })  // data 为 any
```

## 配合 tag 使用

类型安全与 tag 机制互不影响：

```ts
eventMgr.setTag('battle').on('game_start', (e, data) => {
    // data 仍然有类型推导
})

// 按 tag 批量清理
eventMgr.clearByTag('battle')
```
