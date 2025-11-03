import { Entity } from "./Entity";
import { System } from "./System";
/**
 * 组件
 */
export abstract class Comp {
    abstract compName: string
    /**
     * 组件池
     */
    private static compsPool: Map<new () => any, Comp[]> = new Map();
    /**
     * 创建组件
     * @param compClass 
     * @returns 
     */
    public static createComp<T extends Comp>(compClass: new () => T): T {
        // 获取对应组件类的池子
        let pool = this.compsPool.get(compClass);
        // 如果池子不存在，为组件类创建一个新的空池子
        if (!pool) {
            pool = [];
            this.compsPool.set(compClass, pool);
        }
        // 如果池子中有实例，则取出并返回；否则创建一个新实例并返回
        let comp = pool.length > 0 ? pool.pop() as T : new compClass();
        return comp
    }

    static removeComp(comp: Comp) {
        comp.onDetach();
        comp.entity = null
        comp.reset();
        // 获取组件实例的构造函数
        const compClass = comp.constructor as new () => Comp;
        // 从组件池中找到对应的构造函数对应的池子
        const pool = this.compsPool.get(compClass);
        // 如果池子存在，将组件实例放回池子中
        if (pool) {
            pool.push(comp);
        } else {
            // 如果池子不存在，创建一个新的池子并将组件实例放入
            this.compsPool.set(compClass, [comp]);
        }
    }
    /**
     * 组件的实体
     */
    public entity: Entity | null = null;
    /** 
     * 监听挂载到实体
     */
    abstract onAttach(): void
    protected bindToDI(): void { }
    attach(entity: Entity): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.entity = entity
            setTimeout(() => {
                this.bindToDI && this.bindToDI()
                this.onAttach && this.onAttach()
                resolve(true)
            }, 0)
        })
    }
    /** 监听从实体卸载 */
    abstract onDetach(): void
    /** 重置 */
    abstract reset(): void
    /** 准备 */
    setup(...obj: any): Comp {
        return this
    }
    /** 组件自己卸载自己 */
    detach() {
        this.entity!.detachComponentByName(this.compName)
    }
    /**
     * 挂载时被以下系统初始化
     */
    abstract initBySystems: (typeof System)[]
    /**
     * 初始化完成后的回调通知
     */
    initedCallback: (comp: Comp) => void = null
    /**
     * 初始化等待异步操作完成指令函数
     * @returns 
     */
    async done(): Promise<Comp> {
        return new Promise((resolve) => {
            this.initedCallback = resolve;
        });
    }
}