import { BaseTable } from "@aixh-cc/xhgame_ec_framework";
import { TableType } from "../../MyTableManager";

export class ConfigTable<T> extends BaseTable<T> {
    name = TableType.config;
}
export interface IConfigTableItem {
    server_no: string
    name: string
    version: string
    game_code: string
    account_domain: string
}