export interface ITable {
    name: string
    init: (data: any) => this
    getList: () => any[]
    getInfo: (id: string | number) => any | undefined
}

export abstract class BaseTable<T> implements ITable {
    abstract name: string;
    private _data: any = null;
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
export interface ITableConfig {

}