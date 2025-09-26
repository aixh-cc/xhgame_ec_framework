import { ITable, ITableConfig } from "./Table";

export class TableManager<T extends ITableConfig> {
    private _tables = new Map<keyof T, ITable>();
    /** 注册 */
    register(
        table: ITable
    ): this {
        this._tables.set(table.name as keyof T, table);
        return this;
    }
    getTable<K extends keyof T>(
        key: K
    ): T[K] | undefined {
        return this._tables.get(key) as T[K];
    }
    getTables(): (keyof T)[] {
        return Array.from(this._tables.keys());
    }
}
