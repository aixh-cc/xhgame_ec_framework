---
outline: deep
---

# table

这里以
- unit单位
- battle战役
- skill技能

3个表为例子

首先


```ts
import { ITableMap } from "db://xhgame-plugin-framework/core/config/TableManager";
import { TableType } from "./ClientEnum";
import { ISkillTableItem, SkillTable } from "./tables/SkillTable";
import { IUnitTableItem, UnitTable } from "./tables/UnitTable";
import { BattleTable, IBattleTableItem } from "./tables/BattleTable";

export class MyTableMap implements ITableMap {
    [TableType.skill]: SkillTable<ISkillTableItem>
    [TableType.unit]: UnitTable<IUnitTableItem>
    [TableType.battle]: BattleTable<IBattleTableItem>
}

```
UnitTable为例
```ts
import { BaseTable } from "db://xhgame-plugin-framework/core/config/TableManager";
import { TableType } from "../ClientEnum";

export class UnitTable<T> extends BaseTable<T> {
    name = TableType.unit;
}
export interface IUnitTableItem {
    id: number
    name: string // 单位名称
    describe: string // 说明
    unit_type: number // 单位类型
    skills: number[] // 技能ids
    model_no: string // 模型编号
    scale: number // 单位缩放比例
}
```
## 使用说明
使用先在tableManager中进行注册
```ts
this.setTableManager(this.getTables())
```
注册完后，就对table进行初始化
```ts

    getTables() {
        let tableManager = new TableManager<MyTableMap>()
        tableManager.register(new SkillTable())
        tableManager.register(new UnitTable())
        tableManager.register(new BattleTable())
        // init
        let loadScriptComponent = this.node.getComponent(LoadScript)
        tableManager.getTable(TableType.skill).init(loadScriptComponent.skillJson.json)
        tableManager.getTable(TableType.unit).init(loadScriptComponent.unitJson.json)
        tableManager.getTable(TableType.battle).init(loadScriptComponent.battleJson.json)
        return tableManager
    }

```
获取单条数据

```ts
  let unitId = 1001
  let unit_table_item = xhgame.table.getTable(TableType.unit).queryById(unitId)
      

```