import { ITable, TableConfig } from "./Table";

export class TableManager<T extends TableConfig> {
    private _tables = new Map<keyof T, ITable>();
    private _config: T
    constructor(config: T) {
        this._config = config
    }
    autoRegister() {
        // 遍历所有属性
        Object.keys(this._config).forEach(key => {
            const registerClass = this._config[key as keyof T] as any
            this.register(new registerClass())
        });
    }
    /** 注册 */
    register(
        table: ITable
    ): this {
        this._tables.set(table.name as keyof T, table);
        return this;
    }
    getTable<K extends keyof T>(
        key: K
    ): InstanceType<T[K]> | undefined {
        return this._tables.get(key) as InstanceType<T[K]>;
    }
    getTables(): (keyof T)[] {
        return Array.from(this._tables.keys());
    }
}
