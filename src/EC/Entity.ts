import { Comp } from "./Comp";
/** 实体构造器接口 */
export interface EntityCtor<T> {
    new(): T;
}

/**
 * 注册表实例类型映射工具类型
 * 将 { name: new () => CompA } 映射为 { name: CompA }
 */
export type CompInstances<T> = {
    [K in keyof T]: T[K] extends new () => infer R ? R : never;
};

/**
 * 实体（ECS）
 * - 提供实体的创建/移除/查询
 * - 支持在单实体上挂载/卸载组件，并触发系统初始化回调
 * - 支持泛型注册表，提供按名称操作组件的类型安全方法
 * 使用示例：`tests/core/EC/EC.test.ts`
 * 
 * @typeParam TRegistry 组件注册表类型，业务层传入
 */
export class Entity<TRegistry extends Record<string, new () => Comp> = Record<string, new () => Comp>> {
    private static _entities: Map<number, Entity> = new Map();
    private static nextEntityId = 0;
    // 添加一个公共的 getter 方法来获取 entities
    static get entities(): Map<number, Entity> {
        return this._entities;
    }

    static createEntity<T extends Entity>(ctor: EntityCtor<T>): T {
        const entity = new ctor();
        this.entities.set(entity.id, entity);
        entity.init()
        return entity;
    }

    static removeEntity(entity: Entity): void {
        for (let component of entity.components.values()) {
            Comp.removeComp(component)
        }
        this.entities.delete(entity.id);
    }

    static getEntity(entityId: number): Entity | undefined {
        return this.entities.get(entityId);
    }

    static generateEntityId(): number {
        return this.nextEntityId++;
    }

    /** 单实体上挂载的组件 */
    private _components: Comp[] = [];
    get components() {
        return this._components;
    }
    private _components_names: string[] = [];
    private _components_class: any[] = [];
    /** 实体id */
    public readonly id: number;

    /** 组件注册表（业务层赋值） */
    registerComps: TRegistry = {} as TRegistry;

    constructor() {
        this.id = Entity.generateEntityId();
    }
    init() {

    }

    /** 单实体上挂载组件 */
    /** 挂载组件（避免重复），可选传入 setupData 自动调用 setup */
    attachComponent<T extends Comp>(componentClass: new () => T, ...setupArgs: any[]): T {
        let hasIndex = this._components_class.indexOf(componentClass)
        if (hasIndex > -1) {
            const component = this.components[hasIndex] as T;
            console.warn('已存在组件,不会触发挂载事件compName=' + component.compName)
            return component;
        } else {
            const component = Comp.createComp(componentClass);
            if (setupArgs.length > 0) {
                component.setup(...setupArgs)
            }
            // 检查组件依赖
            for (const req of component.requires) {
                if (!this._components_names.includes(req)) {
                    console.warn(`[EC] ${component.compName} 依赖 ${req}，但当前实体未挂载`)
                }
            }
            this._components_class.push(componentClass)
            this._components_names.push(component.compName)
            this._components.push(component)
            this._doAttachComponent(component)
            return component
        }
    }
    private _doAttachComponent(component: Comp) {
        component.attach(this).then(async () => {
            if (component.initBySystems.length > 0) {
                for (let i = 0; i < component.initBySystems.length; i++) {
                    const sys = component.initBySystems[i]
                    await sys.initComp(component)
                }
            }
            component.initedCallback && component.initedCallback(component)
        })
    }

    /** 按注册名挂载组件（类型安全） */
    attachComponentByRegisterName<K extends keyof TRegistry & string>(compName: K): CompInstances<TRegistry>[K] {
        let componentClass = this.registerComps[compName];
        if (!componentClass) {
            throw new Error(`compName ${compName} 未在注册表中找到`);
        }
        return this.attachComponent(componentClass as any) as CompInstances<TRegistry>[K];
    }

    /** 按注册名卸载组件 */
    detachComponentByRegisterName<K extends keyof TRegistry & string>(compName: K): void {
        let componentClass = this.registerComps[compName];
        if (!componentClass) {
            throw new Error(`compName ${compName} 未在注册表中找到`);
        }
        this.detachComponent(componentClass as any);
    }

    /** 按注册名获取组件（可能为 undefined） */
    getComponentByRegisterName<K extends keyof TRegistry & string>(compName: K): CompInstances<TRegistry>[K] | undefined {
        let component = this.getComponentByName(compName);
        return component as CompInstances<TRegistry>[K] | undefined;
    }

    /** 按注册名安全获取组件（不存在则自动挂载） */
    safeGetComponentByRegisterName<K extends keyof TRegistry & string>(compName: K): CompInstances<TRegistry>[K] {
        let component = this.getComponentByName(compName);
        if (component) {
            return component as CompInstances<TRegistry>[K];
        }
        return this.attachComponentByRegisterName(compName);
    }

    /** 卸载组件（按类） */
    detachComponent<T extends Comp>(componentClass: new () => T): void {
        let hasIndex = this._components_class.indexOf(componentClass)
        if (hasIndex > -1) {
            this._removeComponentByIndex(hasIndex)
        }
    }
    private _removeComponentByIndex(index: number) {
        const component = this._components[index]
        this._components_class.splice(index, 1);
        this._components_names.splice(index, 1);
        this._components.splice(index, 1);
        Comp.removeComp(component)
    }
    /** 卸载组件（按类名） */
    detachComponentByName(className: string): void {
        let hasIndex = this._components_names.indexOf(className)
        if (hasIndex > -1) {
            this._removeComponentByIndex(hasIndex)
        } else {
            console.error('无className=' + className)
        }
    }
    /** 获取组件（按类） */
    getComponent<T extends Comp>(componentClass: new () => T): T | undefined {
        let hasIndex = this._components_class.indexOf(componentClass)
        if (hasIndex === -1) {
            return undefined
        }
        return this.components[hasIndex] as T;
    }

    /** 获取组件（按类名） */
    getComponentByName<T extends Comp>(className: string): T | undefined {
        let hasIndex = this._components_names.indexOf(className)
        if (hasIndex === -1) {
            return undefined
        }
        return this.components[hasIndex] as T;
    }
}
