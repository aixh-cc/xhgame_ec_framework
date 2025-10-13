import { BaseTable } from "@aixh-cc/xhgame_ec_framework";
import { TableType } from "../../MyTableManager";

export class StoreTable<T> extends BaseTable<T> {
    name = TableType.store;
}
export interface IStoreTableItem {
    id: number
    name: string
    item_no: string
    describe: string
    maxNum: number
    getNum: number
    subNum: number
}