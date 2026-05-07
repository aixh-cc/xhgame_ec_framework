import { Entity } from "./Entity";
import { ISystemStatic } from "./System";
import { TimeSystem } from "../Time/TimeSystem";
/**
 * 组件
 */
export abstract class Comp {
    abstract compName: string
    /**
     * 组件池（每类组件最大缓存数量）
     */
    private static compsPool: Map<new () => any, Comp[]> = new Map();
    private static readonly MAX_POOL_SIZE = 64;
    /**
     * 清理组件池（用于测试隔离）
     */
    public static clearPool(): void {
        this.compsPool.clear();
        this._dirty_comps = [];
        this._dirty_comps_set.clear();
    }
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
        // 如果有 onUpdate，先从 TimeSystem 移除
        if (comp._updateBridge) {
            TimeSystem.getInstance().removeSystemFromTimeUpdate(comp._updateBridge)
            comp._updateBridge = null
        }
        comp.onRemoveCleanup();
        comp.onDetach();
        comp.entity = null

        // 特殊处理：如果是 BaseModelComp，清理所有 observers
        // 防止组件回收到池子时保留旧的 observer 引用
        if ('_viewObservers' in comp && Array.isArray((comp as any)._viewObservers)) {
            (comp as any)._viewObservers = [];
        }

        comp.reset();
        // 获取组件实例的构造函数
        const compClass = comp.constructor as new () => Comp;
        // 从组件池中找到对应的构造函数对应的池子
        const pool = this.compsPool.get(compClass);
        // 如果池子存在且未满，将组件实例放回池子中
        if (pool) {
            if (pool.length < Comp.MAX_POOL_SIZE) {
                pool.push(comp);
            }
            // 超过上限则丢弃，让 GC 回收
        } else {
            // 如果池子不存在，创建一个新的池子并将组件实例放入
            this.compsPool.set(compClass, [comp]);
        }
    }

    private static _dirty_comps: Comp[] = [];
    private static _dirty_comps_set: Set<Comp> = new Set();
    static pushDirtyComp(comp: Comp) {
        if (!Comp._dirty_comps_set.has(comp)) {
            Comp._dirty_comps_set.add(comp);
            Comp._dirty_comps.push(comp)
        }
    }
    static isDirtyComp(comp: Comp): boolean {
        return Comp._dirty_comps_set.has(comp)
    }
    static notifyAllDirtyComps() {
        // 先取快照再清空，避免通知过程中新增的脏组件被丢弃
        const snapshot = Comp._dirty_comps;
        Comp._dirty_comps = [];
        Comp._dirty_comps_set.clear();
        for (let i = 0; i < snapshot.length; i++) {
            try {
                snapshot[i].notify(true);
            } catch (e) {
                console.error('[Comp] notifyAllDirtyComps 回调异常:', e);
            }
        }
    }
    abstract notify(is_update_now: boolean): void
    /**
     * 设置脏标记
     */
    setDirtyMark() {
        Comp.pushDirtyComp(this)
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
    /** TimeSystem 更新桥接对象，用于自动注册/移除 */
    _updateBridge: { update: (dt: number) => void } | null = null
    attach(entity: Entity): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.entity = entity
            setTimeout(() => {
                this.bindToDI && this.bindToDI()
                this.onAttach && this.onAttach()
                // 如果子类覆盖了 onUpdate，自动注册到 TimeSystem
                if (this.onUpdate !== Comp.prototype.onUpdate) {
                    this._updateBridge = { update: (dt: number) => this.onUpdate(dt) }
                    TimeSystem.getInstance().addSystemToTimeUpdate(this._updateBridge)
                }
                resolve(true)
            }, 0)
        })
    }
    /** 组件移除时的额外清理钩子（子类可覆盖，如清理 DI 绑定） */
    protected onRemoveCleanup(): void { }
    /** 监听从实体卸载 */
    abstract onDetach(): void
    /** 重置 */
    abstract reset(): void
    /** 准备 */
    setup(...obj: any): this {
        return this
    }
    /** 组件自己卸载自己 */
    detach() {
        this.entity!.detachComponentByName(this.compName)
    }
    /** 依赖的组件名列表（可选），attach 时自动检查 */
    get requires(): string[] { return [] }
    /**
     * 每帧更新钩子（可选），子类覆盖后自动注册到 TimeSystem
     * @param dt 帧间隔时间（毫秒）
     */
    onUpdate(dt: number): void { }
    /**
     * 挂载时被以下系统初始化
     */
    abstract initBySystems: ISystemStatic[]
    /**
     * 初始化完成后的回调通知（包含 resolve 和 reject）
     */
    _initedCallbacks: { resolve: (comp: Comp) => void, reject: (err: Error) => void } | null = null
    /**
     * 初始化等待异步操作完成指令函数
     * @returns
     */
    async done(): Promise<this> {
        return new Promise((resolve, reject) => {
            this._initedCallbacks = {
                resolve: resolve as (comp: Comp) => void,
                reject
            };
        });
    }
}
