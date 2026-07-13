import { Comp } from "./Comp";

export interface EntityCtor<T> { new(): T; }

export type CompInstances<T> = {
    [K in keyof T]: T[K] extends new () => infer R ? R : never;
};

export class Entity<TRegistry extends Record<string, new () => Comp> = Record<string, new () => Comp>> {
    private static _entities: Map<number, Entity> = new Map();
    private static nextEntityId = 0;

    static get entities(): Map<number, Entity> { return this._entities; }

    static clearAllEntities(): void {
        for (const entity of [...this._entities.values()]) this.removeEntity(entity);
    }

    static createEntity<T extends Entity>(ctor: EntityCtor<T>): T {
        const entity = new ctor();
        this.entities.set(entity.id, entity);
        entity.init();
        return entity;
    }

    static removeEntity(entity: Entity): void {
        const errors: Error[] = [];
        for (const component of [...entity.components]) {
            try {
                entity._removeComponent(component);
            } catch (e) {
                errors.push(e instanceof Error ? e : new Error(String(e)));
            }
        }
        entity._components.length = 0;
        entity._componentsByClass.clear();
        entity._componentsByName.clear();
        this.entities.delete(entity.id);
        if (errors.length > 0) {
            console.error(`[Entity] removeEntity(${entity.id}) 清理时发生 ${errors.length} 个错误:`, errors);
        }
    }

    static getEntity(entityId: number): Entity | undefined { return this.entities.get(entityId); }
    static generateEntityId(): number { return this.nextEntityId++; }

    private _components: Comp[] = [];
    get components(): readonly Comp[] { return this._components; }
    private _componentsByClass: Map<new () => Comp, Comp> = new Map();
    private _componentsByName: Map<string, Comp> = new Map();
    public readonly id: number;
    registerComps: TRegistry = {} as TRegistry;

    constructor() { this.id = Entity.generateEntityId(); }
    init(): void { }

    attachComponent<T extends Comp>(componentClass: new () => T, ...setupArgs: any[]): T {
        const existing = this._componentsByClass.get(componentClass);
        if (existing) {
            console.warn('已存在组件,不会触发挂载事件compName=' + existing.compName);
            return existing as T;
        }

        const component = Comp.createComp(componentClass);
        if (this._componentsByName.has(component.compName)) {
            Comp.removeComp(component);
            throw new Error(`组件名 ${component.compName} 已被其他组件占用`);
        }

        if (setupArgs.length > 0) component.setup(...setupArgs);
        for (const req of component.requires) {
            if (!this._componentsByName.has(req)) {
                console.warn(`[EC] ${component.compName} 依赖 ${req}，但当前实体未挂载`);
            }
        }

        this._componentsByClass.set(componentClass, component);
        this._componentsByName.set(component.compName, component);
        this._components.push(component);
        this._initializeComponent(component);
        return component;
    }

    /** 缺少依赖时直接失败的挂载入口。 */
    attachComponentStrict<T extends Comp>(componentClass: new () => T, ...setupArgs: any[]): T {
        const component = Comp.createComp(componentClass);
        const missing = component.requires.filter(req => !this._componentsByName.has(req));
        Comp.removeComp(component);
        if (missing.length > 0) throw new Error(`${component.compName} 缺少依赖: ${missing.join(', ')}`);
        return this.attachComponent(componentClass, ...setupArgs);
    }

    private async _initializeComponent(component: Comp): Promise<void> {
        try {
            await component.attach(this);
            for (const system of component.initBySystems) {
                if (component.entity !== this || component.lifecycleState !== 'attached') {
                    throw new Error(`组件 ${component.compName} 初始化期间已卸载`);
                }
                await system.initComp(component);
            }
            if (component.entity !== this || component.lifecycleState !== 'attached') {
                throw new Error(`组件 ${component.compName} 初始化期间已卸载`);
            }
            component._resolveReady();
        } catch (e) {
            const error = e instanceof Error ? e : new Error(String(e));
            component._rejectReady(error);
            const wasRegistered = this._components.includes(component);
            if (wasRegistered) {
                this._removeComponent(component);
                console.error(`[Entity] 组件 ${component.compName} (id=${this.id}) 初始化失败:`, error);
            }
        }
    }

    attachComponentByRegisterName<K extends keyof TRegistry & string>(compName: K): CompInstances<TRegistry>[K] {
        const componentClass = this.registerComps[compName];
        if (!componentClass) throw new Error(`compName ${compName} 未在注册表中找到`);
        return this.attachComponent(componentClass) as CompInstances<TRegistry>[K];
    }

    detachComponentByRegisterName<K extends keyof TRegistry & string>(compName: K): void {
        const componentClass = this.registerComps[compName];
        if (!componentClass) throw new Error(`compName ${compName} 未在注册表中找到`);
        this.detachComponent(componentClass);
    }

    getComponentByRegisterName<K extends keyof TRegistry & string>(compName: K): CompInstances<TRegistry>[K] | undefined {
        return this.getComponentByName(compName) as CompInstances<TRegistry>[K] | undefined;
    }

    safeGetComponentByRegisterName<K extends keyof TRegistry & string>(compName: K): CompInstances<TRegistry>[K] {
        return this.getComponentByRegisterName(compName) ?? this.attachComponentByRegisterName(compName);
    }

    detachComponent<T extends Comp>(componentClass: new () => T): void {
        const component = this._componentsByClass.get(componentClass);
        if (component) this._removeComponent(component);
    }

    private _removeComponent(component: Comp): void {
        this._componentsByClass.delete(component.constructor as new () => Comp);
        this._componentsByName.delete(component.compName);
        const index = this._components.indexOf(component);
        if (index >= 0) this._components.splice(index, 1);
        Comp.removeComp(component);
    }

    detachComponentByName(className: string): void {
        const component = this._componentsByName.get(className);
        if (component) this._removeComponent(component);
        else console.error('无className=' + className);
    }

    getComponent<T extends Comp>(componentClass: new () => T): T | undefined {
        return this._componentsByClass.get(componentClass) as T | undefined;
    }

    getComponentByName<T extends Comp = Comp>(className: string): T | undefined {
        return this._componentsByName.get(className) as T | undefined;
    }
}
