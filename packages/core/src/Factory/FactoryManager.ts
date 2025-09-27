import { DriveConfig, FactoryConfig, IFactory } from "./Factory";

export class FactoryManager<T extends FactoryConfig, TD extends DriveConfig, TT> {
    actions: TT // 快速入口
    private _factorys = new Map<keyof T, IFactory>();
    private _config: T
    private _drive: TD
    constructor(config: T, drive: TD) {
        this._config = config
        this._drive = drive
    }
    autoRegister() {
        // 遍历所有属性
        Object.keys(this._config).forEach(key => {
            const registerClass = this._config[key as keyof T] as any
            if (registerClass) {
                let factory = new registerClass()
                this.register(factory)
                const driveClass = this._drive[key as keyof TD] as any
                driveClass && factory.setItemProduceDrive(new driveClass())
            }
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
    ): InstanceType<T[K]> | undefined {
        return this._factorys.get(key) as InstanceType<T[K]>;
    }
    getFactorys(): Map<keyof T, IFactory> {
        return this._factorys
    }
}
