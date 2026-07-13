import { Entity } from "./Entity";
import { ISystemStatic } from "./System";
import { TimeSystem } from "../Time/TimeSystem";

export type CompLifecycleState = 'pooled' | 'created' | 'attaching' | 'attached' | 'detaching';

type ReadyWaiter = {
    resolve: (comp: Comp) => void;
    reject: (error: Error) => void;
};

/** Entity 上可复用的业务组件。 */
export abstract class Comp {
    abstract compName: string;

    private static compsPool: Map<new () => any, Comp[]> = new Map();
    private static readonly MAX_POOL_SIZE = 64;

    public static clearPool(): void {
        this.compsPool.clear();
        this._dirty_comps = [];
        this._dirty_comps_set.clear();
    }

    public static createComp<T extends Comp>(compClass: new () => T): T {
        let pool = this.compsPool.get(compClass);
        if (!pool) {
            pool = [];
            this.compsPool.set(compClass, pool);
        }
        const comp = pool.length > 0 ? pool.pop() as T : new compClass();
        comp._prepareLifecycle();
        return comp;
    }

    static removeComp(comp: Comp): void {
        if (comp.lifecycleState === 'pooled') return;

        comp.lifecycleState = 'detaching';
        comp._rejectReady(new Error(`组件 ${comp.compName} 在初始化完成前已卸载`));
        const errors: Error[] = [];
        const safely = (cleanup: () => void) => {
            try { cleanup(); } catch (error) {
                errors.push(error instanceof Error ? error : new Error(String(error)));
            }
        };

        try {
            if (comp._updateBridge) {
                TimeSystem.getInstance().removeSystemFromTimeUpdate(comp._updateBridge);
                comp._updateBridge = null;
            }
            if (comp._didAttach) {
                safely(() => comp.onRemoveCleanup());
                safely(() => comp.onDetach());
            }
            safely(() => comp.onPoolCleanup());
            safely(() => comp.reset());
        } finally {
            comp._didAttach = false;
            comp.entity = null;
            Comp._dirty_comps_set.delete(comp);
            comp.lifecycleState = 'pooled';

            const compClass = comp.constructor as new () => Comp;
            const pool = this.compsPool.get(compClass) ?? [];
            if (!this.compsPool.has(compClass)) this.compsPool.set(compClass, pool);
            if (pool.length < Comp.MAX_POOL_SIZE && !pool.includes(comp)) pool.push(comp);
        }

        if (errors.length > 0) {
            const error = new Error(`组件 ${comp.compName} 清理时发生 ${errors.length} 个错误`);
            (error as any).causes = errors;
            throw error;
        }
    }

    private static _dirty_comps: Comp[] = [];
    private static _dirty_comps_set: Set<Comp> = new Set();

    static pushDirtyComp(comp: Comp): void {
        if (comp.lifecycleState === 'pooled' || comp.lifecycleState === 'detaching' || Comp._dirty_comps_set.has(comp)) return;
        Comp._dirty_comps_set.add(comp);
        Comp._dirty_comps.push(comp);
    }

    static isDirtyComp(comp: Comp): boolean {
        return Comp._dirty_comps_set.has(comp);
    }

    static notifyAllDirtyComps(): void {
        const snapshot = Comp._dirty_comps;
        Comp._dirty_comps = [];
        Comp._dirty_comps_set.clear();
        for (const comp of snapshot) {
            if (comp.lifecycleState === 'pooled' || comp.lifecycleState === 'detaching') continue;
            try {
                comp.notify(true);
            } catch (e) {
                console.error('[Comp] notifyAllDirtyComps 回调异常:', e);
            }
        }
    }

    abstract notify(is_update_now: boolean): void;

    setDirtyMark(): void {
        Comp.pushDirtyComp(this);
    }

    public entity: Entity | null = null;
    public lifecycleState: CompLifecycleState = 'created';
    private _didAttach = false;
    private _readyStatus: 'pending' | 'fulfilled' | 'rejected' = 'pending';
    private _readyError: Error | null = null;
    private _readyWaiters: ReadyWaiter[] = [];

    abstract onAttach(): void;
    protected bindToDI(): void { }
    protected onRemoveCleanup(): void { }
    /** 子类可在这里清理池化前的框架级引用。 */
    protected onPoolCleanup(): void { }
    abstract onDetach(): void;
    abstract reset(): void;

    _updateBridge: { update: (dt: number) => void } | null = null;

    private _prepareLifecycle(): void {
        this.entity = null;
        this.lifecycleState = 'created';
        this._didAttach = false;
        this._readyStatus = 'pending';
        this._readyError = null;
        this._readyWaiters = [];
    }

    /**
     * 延迟到 microtask 执行，使旧有的 attachComponent(...).setup(...) 链式调用仍能先完成 setup。
     */
    attach(entity: Entity): Promise<void> {
        if (this.lifecycleState !== 'created') {
            return Promise.reject(new Error(`组件 ${this.compName} 当前状态 ${this.lifecycleState}，不能挂载`));
        }
        this.entity = entity;
        this.lifecycleState = 'attaching';
        return new Promise<void>((resolve, reject) => {
            queueMicrotask(() => {
                if (this.lifecycleState !== 'attaching' || this.entity !== entity) {
                    reject(new Error(`组件 ${this.compName} 的挂载已取消`));
                    return;
                }
                try {
                    this.bindToDI();
                    this.onAttach();
                    this._didAttach = true;
                    if (this.onUpdate !== Comp.prototype.onUpdate) {
                        this._updateBridge = { update: (dt: number) => this.onUpdate(dt) };
                        TimeSystem.getInstance().addSystemToTimeUpdate(this._updateBridge);
                    }
                    this.lifecycleState = 'attached';
                    resolve();
                } catch (error) {
                    reject(error instanceof Error ? error : new Error(String(error)));
                }
            });
        });
    }

    _resolveReady(): void {
        if (this._readyStatus !== 'pending') return;
        this._readyStatus = 'fulfilled';
        const waiters = this._readyWaiters.splice(0);
        for (const waiter of waiters) waiter.resolve(this);
    }

    _rejectReady(error: Error): void {
        if (this._readyStatus !== 'pending') return;
        this._readyStatus = 'rejected';
        this._readyError = error;
        const waiters = this._readyWaiters.splice(0);
        for (const waiter of waiters) waiter.reject(error);
    }

    setup(..._obj: any[]): this {
        return this;
    }

    detach(): void {
        this.entity?.detachComponentByName(this.compName);
    }

    get requires(): string[] { return []; }
    onUpdate(_dt: number): void { }
    abstract initBySystems: ISystemStatic[];

    /** 等待当前挂载周期完成；可重复调用，也可在初始化完成后调用。 */
    done(): Promise<this> {
        if (this._readyStatus === 'fulfilled') return Promise.resolve(this);
        if (this._readyStatus === 'rejected') return Promise.reject(this._readyError!);
        return new Promise<this>((resolve, reject) => {
            this._readyWaiters.push({
                resolve: resolve as (comp: Comp) => void,
                reject
            });
        });
    }

    /** done() 的语义化别名。 */
    ready(): Promise<this> {
        return this.done();
    }
}
