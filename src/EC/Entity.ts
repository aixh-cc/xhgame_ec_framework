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

    /** 清理所有实体及组件（用于场景切换/重置） */
    static clearAllEntities(): void {
        const allEntities = [...this._entities.values()];
        for (let entity of allEntities) {
            this.removeEntity(entity);
        }
        this._entities.clear();
    }

    static createEntity<T extends Entity>(ctor: EntityCtor<T>): T {
        const entity = new ctor();
        this.entities.set(entity.id, entity);
        entity.init()
        return entity;
    }

    static removeEntity(entity: Entity): void {
        // 先创建副本再遍历，防止迭代过程中数组被 splice 修改
        const allComps = [...entity.components];
        const errors: Error[] = [];
        for (let component of allComps) {
            try {
                Comp.removeComp(component)
            } catch (e) {
                errors.push(e instanceof Error ? e : new Error(String(e)));
            }
        }
        // 无论如何都要从 Map 中移除实体
        this.entities.delete(entity.id);
        if (errors.length > 0) {
            console.error(`[Entity] removeEntity(${entity.id}) 清理时发生 ${errors.length} 个错误:`, errors);
        }
    }

    static getEntity(entityId: number): Entity | undefined {
        return this.entities.get(entityId);
    }

    static generateEntityId(): number {
        return this.nextEntityId++;
    }

    /** 单实体上挂载的组件（有序数组，保留迭代顺序） */
    private _components: Comp[] = [];
    get components() {
        return this._components;
    }
    /** O(1) 查找：类 → 组件 */
    private _componentsByClass: Map<new () => Comp, Comp> = new Map();
    /** O(1) 查找：名称 → 组件 */
    private _componentsByName: Map<string, Comp> = new Map();
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
        let existing = this._componentsByClass.get(componentClass);
        if (existing) {
            console.warn('已存在组件,不会触发挂载事件compName=' + existing.compName)
            return existing as T;
        }
        const component = Comp.createComp(componentClass);
        if (setupArgs.length > 0) {
            component.setup(...setupArgs)
        }
        // 检查组件依赖
        for (const req of component.requires) {
            if (!this._componentsByName.has(req)) {
                console.warn(`[EC] ${component.compName} 依赖 ${req}，但当前实体未挂载`)
            }
        }
        this._componentsByClass.set(componentClass, component);
        this._componentsByName.set(component.compName, component);
        this._components.push(component)
        this._doAttachComponent(component)
        return component
    }
    private _doAttachComponent(component: Comp) {
        component.attach(this).then(async () => {
            try {
                if (component.initBySystems.length > 0) {
                    for (let i = 0; i < component.initBySystems.length; i++) {
                        const sys = component.initBySystems[i]
                        await sys.initComp(component)
                    }
                }
                component._initedCallbacks && component._initedCallbacks.resolve(component)
            } catch (e) {
                const error = e instanceof Error ? e : new Error(String(e));
                console.error(`[Entity] 组件 ${component.compName} (id=${this.id}) 初始化失败:`, e);
                // reject 而非 resolve(null)，让调用方通过 .catch() 处理
                component._initedCallbacks && component._initedCallbacks.reject(error)
            }
        }).catch((e) => {
            const error = e instanceof Error ? e : new Error(String(e));
            console.error(`[Entity] 组件 ${component.compName} (id=${this.id}) attach 失败:`, e);
            component._initedCallbacks && component._initedCallbacks.reject(error)
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

    /** 卸载组件（按类）O(1) */
    detachComponent<T extends Comp>(componentClass: new () => T): void {
        const comp = this._componentsByClass.get(componentClass);
        if (comp) {
            const index = this._components.indexOf(comp);
            if (index > -1) {
                this._removeComponentByIndex(index);
            }
        }
    }
    private _removeComponentByIndex(index: number) {
        const component = this._components[index];
        // 清理 O(1) Map
        this._componentsByClass.delete(component.constructor as new () => Comp);
        this._componentsByName.delete(component.compName);
        // 清理数组
        this._components.splice(index, 1);
        Comp.removeComp(component)
    }
    /** 卸载组件（按类名）O(1) */
    detachComponentByName(className: string): void {
        const comp = this._componentsByName.get(className);
        if (comp) {
            const index = this._components.indexOf(comp);
            if (index > -1) {
                this._removeComponentByIndex(index);
            }
        } else {
            console.error('无className=' + className)
        }
    }
    /** 获取组件（按类）O(1) */
    getComponent<T extends Comp>(componentClass: new () => T): T | undefined {
        return this._componentsByClass.get(componentClass) as T | undefined;
    }

    /** 获取组件（按类名）O(1) */
    getComponentByName<T extends Comp>(className: string): T | undefined {
        return this._componentsByName.get(className) as T | undefined;
    }
}
