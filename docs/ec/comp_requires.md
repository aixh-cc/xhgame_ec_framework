---
outline: deep
---

# 组件依赖声明（requires）

## 概述

组件可以声明自己依赖哪些其他组件。挂载时框架会自动检查依赖是否已挂载，未满足时输出警告。

## 用法

覆盖 `requires` getter，返回依赖的组件名数组：

```ts
export class BattleViewComp extends BaseModelComp {
    compName = 'BattleViewComp'
    initBySystems = [BattleViewSystem]

    // 声明依赖：必须先挂载 BattleModelComp
    get requires(): string[] {
        return ['BattleModelComp']
    }

    // ...
}
```

## 行为

- 挂载时自动检查：如果 `BattleModelComp` 未在当前实体上挂载，控制台输出警告：
  ```
  [EC] BattleViewComp 依赖 BattleModelComp，但当前实体未挂载
  ```
- 这是一个**软约束**（warning），不会阻止挂载，方便开发阶段排查问题
- 默认返回空数组 `[]`，不声明则无检查

## 建议

- View 组件通常依赖对应的 Model 组件
- GameBox 组件可能依赖场景组件或数据组件
- 保持依赖关系清晰，有助于理解组件的挂载顺序
