
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

/**
 * 
 * table的配置
 * ITableConfig
 * 
 * 例子：
 *  [TableType.skill]!: SkillTable<ISkillTableItem>
 *  [TableType.unit]!: UnitTable<IUnitTableItem>
 * 
 *  当然前提是你准备了以下的定义
 *  enum TableType {
 *      skill = "skill",
 *      unit = "unit",
 *  }
 *  class SkillTable<T> extends BaseTable<T> {
 *      name = TableType.skill;
 *  }
 *  interface ISkillTableItem {
 *      id: number,
 *      name: string,
 *  }
 *  class UnitTable<T> extends BaseTable<T> {
 *      name = TableType.unit;
 *  }
 *  interface IUnitTableItem {
 *      id: number,
 *      name: string,
 *  }

 */
export interface ITableConfig {

}

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
