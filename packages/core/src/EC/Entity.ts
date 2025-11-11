import { Comp } from "./Comp";
/** 实体构造器接口 */
export interface EntityCtor<T> {
    new(): T;
}
export class Entity {
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
        // console.log('卸载实体', entity)
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

    constructor() {
        this.id = Entity.generateEntityId();
    }
    init() {

    }

    /** 单实体上挂载组件 */
    attachComponent<T extends Comp>(componentClass: new () => T): T {
        let hasIndex = this._components_class.indexOf(componentClass)
        if (hasIndex > -1) {
            const component = this.components[hasIndex] as T;
            console.warn('已存在组件,不会触发挂载事件compName=' + component.compName)
            return component;
        } else {
            const component = Comp.createComp(componentClass);
            this._components_class.push(componentClass)
            this._components_names.push(component.compName)
            this._components.push(component)
            this._doAttachComponent(component)
            return component
        }
    }
    // /**
    //  * 单实体上挂载组件
    //  * @param componentClass 组件类名
    //  * @returns 组件实例
    //  */
    // attachComponentByName<T extends Comp>(componentClass: string): T {
    //     let component = this.getComponentByName(componentClass) as T
    //     if (component) {
    //         console.warn('已存在组件,不会触发挂载事件compName=' + component.compName)
    //         return component;
    //     } else {
    //         const component = DI.make(componentClass) as T;
    //         this._components_class.push(componentClass)
    //         this._components_names.push(component.compName)
    //         this._components.push(component)
    //         this._doAttachComponent(component)
    //         return component
    //     }
    // }
    private _doAttachComponent(component: Comp) {
        component.attach(this).then(async () => {
            if (component.initBySystems.length > 0) {
                for (let i = 0; i < component.initBySystems.length; i++) {
                    const sys = component.initBySystems[i] as any
                    await sys.initComp(component)
                }
            }
            component.initedCallback && component.initedCallback(component)
        })
    }

    /** 单实体上卸载组件 */
    detachComponent<T extends Comp>(componentClass: new () => T): void {
        let hasIndex = this._components_class.indexOf(componentClass)
        if (hasIndex > -1) {
            this._removeComponentByIndex(hasIndex)
        } else {
            // console.error('无componentClass')
        }
    }
    private _removeComponentByIndex(index: number) {
        const component = this._components[index]
        this._components_class.splice(index, 1);
        this._components_names.splice(index, 1);
        this._components.splice(index, 1);
        Comp.removeComp(component)
    }
    /** 单实体上卸载组件 */
    detachComponentByName(className: string): void {
        let hasIndex = this._components_names.indexOf(className)
        if (hasIndex > -1) {
            this._removeComponentByIndex(hasIndex)
        } else {
            console.error('无className=' + className)
        }
    }
    getComponent<T extends Comp>(componentClass: new () => T): T | undefined {
        let hasIndex = this._components_class.indexOf(componentClass)
        return this.components[hasIndex] as T;
    }

    getComponentByName<T extends Comp>(className: string): T | undefined {
        let hasIndex = this._components_names.indexOf(className)
        return this.components[hasIndex] as T;
    }

}