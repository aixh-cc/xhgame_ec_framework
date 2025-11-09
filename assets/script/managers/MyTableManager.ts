import { ITableConfig, TableManager } from "@aixh-cc/xhgame_ec_framework"
import { ISkillTableItem, SkillTable } from "./myTable/tables/SkillTable";
import { IUnitTableItem, UnitTable } from "./myTable/tables/UnitTable";
import { BattleTable, IBattleTableItem } from "./myTable/tables/BattleTable";
import { IStoreTableItem, StoreTable } from "./myTable/tables/StoreTable";
import { ConfigTable, IConfigTableItem } from "./myTable/tables/ConfigTable";
import { HelpTable, IHelpTableItem } from "./myTable/tables/HelpTable";


export enum TableType {
    skill = "skill",
    unit = "unit",
    battle = "battle",
    store = "store",
    config = "config",
    help = 'help',
}

export class MyTableConfig implements ITableConfig {
    [TableType.skill]: SkillTable<ISkillTableItem> = new SkillTable();
    [TableType.unit]: UnitTable<IUnitTableItem> = new UnitTable();
    [TableType.battle]: BattleTable<IBattleTableItem> = new BattleTable();
    [TableType.store]: StoreTable<IStoreTableItem> = new StoreTable();
    [TableType.config]: ConfigTable<IConfigTableItem> = new ConfigTable();
    [TableType.help]: ConfigTable<IHelpTableItem> = new HelpTable();
}
export class MyTableManager extends TableManager<MyTableConfig> {

    constructor() {
        super(new MyTableConfig())
    }

    get enums() {
        return TableType
    }
}

