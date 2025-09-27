import { IFactory, IFactoryConfig } from "./Factory";

export class FactoryManager<T extends IFactoryConfig, TT> {
    actions: TT // 快速入口
    private _factorys = new Map<keyof T, IFactory>();
    private _config: T
    constructor(config: T) {
        this._config = config
    }
    autoRegister() {
        // 遍历所有属性
        Object.keys(this._config).forEach(key => {
            const factoryKey = key as keyof T;
            const factoryNew = this._config[factoryKey] as IFactory
            this.register(factoryNew)
        });
    }
    /** 注册 */
    register(
        factory: IFactory
    ): this {
        this._factorys.set(factory.name as keyof T, factory);
        return this;
    }
    getFactory<K extends keyof T>(
        key: K
    ): T[K] | undefined {  // 使用 InstanceType 获取实例类型
        return this._factorys.get(key) as T[K];
    }
    getFactorys(): Map<keyof T, IFactory> {
        return this._factorys
    }
}
