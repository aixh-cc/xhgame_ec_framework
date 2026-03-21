---
outline: deep
---

# System 类型约束（ISystemStatic）

## 概述

`initBySystems` 现在使用 `ISystemStatic` 接口约束，编译期即可检查 `initComp` 方法签名是否正确。写错方法名或签名不匹配会直接报错。

## 以前的问题

```ts
export class ABSystem extends System {
    // 写错方法名，运行时才发现不会被调用
    static async initCom(comp: ABComp): Promise<void> {
        // ...
    }
}
```

以前 `initBySystems` 类型是 `(typeof System)[]`，不会检查子类是否正确实现了 `initComp`。

## 现在的约束

```ts
// System 构造器接口
export interface ISystemStatic {
    initComp(comp: any): Promise<void>;
}
```

组件声明：

```ts
export class ABComp extends BaseModelComp {
    compName = 'ABComp'
    initBySystems: ISystemStatic[] = [ABSystem]  // ✅ 编译期检查
    // ...
}
```

如果 `ABSystem` 没有正确的 `initComp` 静态方法，TypeScript 编译时就会报错。

## done() / setup() 返回类型

同时优化了返回类型：

- `setup()` 返回 `this` 而非 `Comp`
- `done()` 返回 `Promise<this>` 而非 `Promise<Comp>`

```ts
// 不再需要 as 强转
let comp = await xhgame.gameEntity.attachComponent(ABComp).done()
// comp 类型自动推导为 ABComp
```
