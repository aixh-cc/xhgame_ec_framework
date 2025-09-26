import { IFactory, IFactoryConfig } from "./Factory";

export class FactoryManager<T extends IFactoryConfig, TT> {
    actions: TT // 快速入口
    private _factorys = new Map<keyof T, IFactory>();
    /** 注册 */
    register(
        factory: IFactory
    ): this {
        this._factorys.set(factory.name as keyof T, factory);
        return this;
    }
    getFactory<K extends keyof T>(
        key: K
    ): T[K] | undefined {
        return this._factorys.get(key) as T[K];
    }
    getFactorys(): (keyof T)[] {
        return Array.from(this._factorys.keys());
    }
}
