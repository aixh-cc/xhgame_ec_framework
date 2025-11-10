import { ITableConfig } from "@aixh-cc/xhgame_ec_framework";
import { TableType } from "../MyTableManager";

export class MyTableConfig implements ITableConfig {
}
const getTableType = () => {
    return TableType // 主要是为了 TableType 被使用
}
