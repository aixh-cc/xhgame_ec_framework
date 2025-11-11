import { TableManager } from "@aixh-cc/xhgame_ec_framework"
import { MyTableConfig } from "./myTable/MyTableConfig";


export enum TableType {
    unit = "unit",
    battle = "battle",
    store = "store",
    config = "config",
    help = 'help',
}

export class MyTableManager extends TableManager<MyTableConfig> {

    constructor() {
        super(new MyTableConfig())
    }

    get enums() {
        return TableType
    }
}

