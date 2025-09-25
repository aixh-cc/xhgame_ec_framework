
export interface ITable {
    name: string
    data?: any
    getList: () => any[]
    getInfo: (id: string | number) => any | undefined
}

export abstract class BaseTable<T> implements ITable {
    abstract name: string;
    private _data: any = null;
    /** 游戏配置数据 */
    public get data(): any {
        return this._data;
    }
    init(data: any): this {
        this._data = Object.freeze(data);
        return this;
    }
    getList = (): T[] => {
        return this._data ? Object.values(this._data) : [];
    }
    getInfo = (id: string | number): T | undefined => {
        if (!this._data) return undefined;
        return this._data[id] || undefined;
    }
}

// 定义工厂类型映射
export interface ITableMap {

}

export class TableManager<T extends ITableMap> {
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
