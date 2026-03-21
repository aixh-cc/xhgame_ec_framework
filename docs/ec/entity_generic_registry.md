---
outline: deep
---

# Entity 泛型注册表

## 概述

Entity 支持泛型注册表 `TRegistry`，按名称操作组件时获得完整的类型推导，不再需要 `as` 强转。

## 以前的问题

```ts
// 返回类型是 Comp，需要手动强转
let comp = xhgame.gameEntity.safeGetComponentByRegisterName('PlayerModelComp') as PlayerModelComp
```

每次按名称获取组件都要 `as`，容易遗漏或写错类型。

## 现在的用法

### 1、定义注册表类型

```ts
import { PlayerModelComp } from './comps/PlayerModelComp'
import { BattleViewComp } from './comps/BattleViewComp'

// 注册表：组件名 → 组件构造器
interface GameRegisterComps {
    PlayerModelComp: typeof PlayerModelComp
    BattleViewComp: typeof BattleViewComp
}
```

### 2、创建带泛型的 Entity

```ts
class GameEntity extends Entity<GameRegisterComps> {
    // ...
}

const gameEntity = Entity.createEntity(GameEntity)

// 赋值注册表
gameEntity.registerComps = {
    PlayerModelComp: PlayerModelComp,
    BattleViewComp: BattleViewComp,
}
```

### 3、按名称操作组件（类型自动推导）

```ts
// 返回类型自动推导为 PlayerModelComp，无需 as
let player = gameEntity.safeGetComponentByRegisterName('PlayerModelComp')
player.playerInfo  // ✅ 有类型提示

// 挂载
let battle = gameEntity.attachComponentByRegisterName('BattleViewComp')
battle.actions  // ✅ 有类型提示

// 获取（可能为 undefined）
let comp = gameEntity.getComponentByRegisterName('PlayerModelComp')
comp?.playerInfo  // ✅ 类型安全

// 卸载
gameEntity.detachComponentByRegisterName('BattleViewComp')

// 不存在的名称编译报错
// gameEntity.safeGetComponentByRegisterName('NotExist')  // ❌ 编译报错
```

### 4、IGame 接口泛型化

`IGame` 也支持自定义 Entity 子类：

```ts
export interface IGame<TEntity extends Entity = Entity> {
    name: string
    node: INode
    meta: IGameMeta
    init(): Promise<void>
    play(): void
    setGameEntity(gameEntity: TEntity): void
    getGameEntity(): TEntity
}
```

## 向后兼容

不传泛型参数时，默认为 `Record<string, new () => Comp>`，行为与之前一致：

```ts
class OldEntity extends Entity {
    // registerComps 类型为 Record<string, new () => Comp>
    // 按名称操作返回 Comp 类型（与以前相同）
}
```

## 类型工具

框架提供 `CompInstances<T>` 工具类型，将注册表的构造器映射为实例类型：

```ts
type CompInstances<T> = {
    [K in keyof T]: T[K] extends new () => infer R ? R : never
}

// { PlayerModelComp: PlayerModelComp, BattleViewComp: BattleViewComp }
type Instances = CompInstances<GameRegisterComps>
```
