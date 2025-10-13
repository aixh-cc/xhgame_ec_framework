import { ITableConfig, TableManager } from "@aixh-cc/xhgame_ec_framework"
import { MyTableConfig } from "./myTable/MyTableConfig"

export class MyTableManager extends TableManager<MyTableConfig> {

    constructor() {
        super(new MyTableConfig())
    }

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