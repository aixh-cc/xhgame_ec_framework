---
outline: deep
---

# v1.5.0 升级指南

## 概述

v1.5.0 是一个**结构重构 + 类型增强**版本。框架从 monorepo 简化为单包结构，builder 分离为独立项目，同时开启 TypeScript 严格模式后修复了一系列类型问题。

本文档列出升级时需要注意的**破坏性变更**和对应的修改方法。

## 1. 项目结构变更

builder 已分离为独立项目 [xhgame_builder](https://github.com/aixh-cc/xhgame_builder)。

如果你之前引用 `packages/builder/src` 的内容，需要改为依赖 `@aixh-cc/xhgame_builder`。

## 2. ISystemStatic.initComp 参数类型

### 变更

`ISystemStatic` 接口的 `initComp` 参数从 `Comp` 改为 `any`：

```ts
// 旧
export interface ISystemStatic {
    initComp(comp: Comp): Promise<void>;
}

// 新
export interface ISystemStatic {
    initComp(comp: any): Promise<void>;
}
```

### 原因

严格模式下，TypeScript 对函数参数做**逆变**检查。如果 `initComp` 声明接收 `Comp`（基类），子类 System 写成接收具体的 Comp 子类型会报错：

```
不能将类型"(comp: TestSenceComp) => Promise<void>"分配给类型"(comp: Comp) => Promise<void>"
```

### 影响

- 业务层 **无需改动**，System 子类可以继续声明具体的 Comp 类型
- 类型安全由 `initBySystems` 的绑定关系保证，运行时不会传错类型

## 3. initBySystems 显式类型声明

### 变更

`initBySystems` 需要显式声明类型为 `ISystemStatic[]`：

```ts
// 旧（隐式推导，严格模式下可能推导为 any[]）
initBySystems = [MySystem]

// 新
initBySystems: ISystemStatic[] = [MySystem]
```

### 影响

所有 Comp 子类的 `initBySystems` 属性都需要加上类型注解。

## 4. setup() 返回类型改为 this

### 变更

`setup()` 方法的返回类型从具体类名改为 `this`：

```ts
// 旧
setup(obj: { arr: number[] }): MyComp {
    this.arr = obj.arr
    return this
}

// 新
setup(obj: { arr: number[] }): this {
    this.arr = obj.arr
    return this
}
```

### 原因

`BaseModelComp` 中 `setup()` 声明返回类型为 `this`（多态 this 类型）。子类如果返回具体类名，在被其他子类继承时会产生类型不兼容。

### 影响

所有重写了 `setup()` 的 Comp 子类，返回类型都需要改为 `this`。

## 5. initedCallback 类型变更

### 变更

`Comp.initedCallback` 从回调类型改为接受 `Comp` 参数：

```ts
// 旧
initedCallback: (() => void) | null = null

// 新
initedCallback: ((comp: Comp) => void) | null = null
```

### 影响

如果你直接操作过 `initedCallback`，需要适配新的函数签名。正常使用 `done()` 的代码不受影响。

## 6. IUiDrive 新增 getFirstUIView 方法

### 变更

`IUiDrive` 接口新增了 `getFirstUIView` 方法：

```ts
export interface IUiDrive {
    // 新增
    getFirstUIView: () => IView
    // ...其他方法不变
}
```

### 影响

所有实现 `IUiDrive` 接口的类都需要添加 `getFirstUIView` 方法。

## 7. IItem 属性显式类型

### 变更

实现 `IItem` 接口时，属性需要显式声明类型，避免隐式 `any`：

```ts
// 旧
onClickItem = null

// 新
onClickItem: any = null
```

### 影响

严格模式下 `null` 会被推导为 `null` 类型而非 `any`。需要显式声明为 `any` 或具体类型。

## 升级检查清单

- [ ] `initBySystems` 加上 `ISystemStatic[]` 类型注解
- [ ] `setup()` 返回类型改为 `this`
- [ ] `IUiDrive` 实现类添加 `getFirstUIView` 方法
- [ ] `IItem` 实现类属性加上显式类型声明
- [ ] 确认构建无 warning：`npm run build`
- [ ] 确认测试通过：`bun ./tests/run.test.mjs`
