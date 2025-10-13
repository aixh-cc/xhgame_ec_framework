import { ISkillTableItem, SkillTable } from "./tables/SkillTable";
import { IUnitTableItem, UnitTable } from "./tables/UnitTable";
import { BattleTable, IBattleTableItem } from "./tables/BattleTable";
import { IStoreTableItem, StoreTable } from "./tables/StoreTable";
import { ITableConfig } from "@aixh-cc/xhgame_ec_framework";
import { ConfigTable, IConfigTableItem } from "./tables/ConfigTable";
import { TableType } from "../MyTableManager";

export class MyTableConfig implements ITableConfig {
    [TableType.skill]: SkillTable<ISkillTableItem> = new SkillTable();
    [TableType.unit]: UnitTable<IUnitTableItem> = new UnitTable();
    [TableType.battle]: BattleTable<IBattleTableItem> = new BattleTable();
    [TableType.store]: StoreTable<IStoreTableItem> = new StoreTable();
    [TableType.config]: ConfigTable<IConfigTableItem> = new ConfigTable();
}
