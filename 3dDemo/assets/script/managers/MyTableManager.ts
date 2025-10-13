import { ITableConfig, TableManager } from "@aixh-cc/xhgame_ec_framework"

export class MyTableManager<T extends ITableConfig> extends TableManager<T> {
    get enums() {
        return TableType
    }
}

export enum TableType {
    skill = "skill",
    unit = "unit",
    battle = "battle",
    store = "store",
    config = "config"
}