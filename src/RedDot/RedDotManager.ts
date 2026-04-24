import { EventManager } from "../Event/EventManager";
import { IRedDotDrive, IRedDotNode, IRedDotConfig, IRedDotInstance, IVec3, IColor } from "./IRedDotDrive";
import { RedDotEventMap } from "./RedDotEvents";

/**
 * 红点树节点（数据层）
 */
export class RedDotNode {
    key: string;
    count: number = 0;
    children: Map<string, RedDotNode> = new Map();
    parent: RedDotNode | null = null;

    constructor(key: string) {
        this.key = key;
    }

    get show(): boolean {
        return this.count > 0;
    }

    addChild(childKey: string): RedDotNode {
        if (!this.children.has(childKey)) {
            const child = new RedDotNode(childKey);
            child.parent = this;
            this.children.set(childKey, child);
        }
        return this.children.get(childKey)!;
    }

    getTotalCount(): number {
        let total = this.count;
        this.children.forEach(child => {
            total += child.getTotalCount();
        });
        return total;
    }
}

/**
 * 红点管理器 - 整合数据层和UI层
 *
 * ## 核心功能
 * - **数据层**：管理红点树结构，支持层级关系（如 'shop.weapon.sword'）
 * - **状态管理**：对象池、活跃红点跟踪
 * - **UI层**：委托给 IRedDotDrive 实现平台相关的UI渲染
 * - **事件通知**：通过依赖注入的 EventManager 发送红点变化事件
 * - **批处理优化**：收集同一帧内的红点变化，批量触发事件，避免重复更新
 *
 * ## 批处理机制
 * 为了优化性能，红点管理器采用批处理模式：
 * - `setCount()` 只收集变化到待通知队列，不立即触发事件
 * - 调用 `flush()` 批量触发所有待处理的事件
 * - 同一节点在一帧内多次修改，只触发一次事件（使用最新数据）
 * - 树形结构的父节点自动去重（10个子节点变化，父节点只触发1次）
 *
 * ## 使用示例
 *
 * ### 基础用法
 * ```typescript
 * const manager = new RedDotManager(drive, eventManager);
 *
 * // 设置红点数量（收集到队列）
 * manager.setCount('shop.weapon', 5);
 * manager.setCount('shop.armor', 3);
 *
 * // 在游戏循环中批量触发事件
 * update(dt: number) {
 *   manager.flush(); // 批量触发红点事件
 * }
 * ```
 *
 * ### 监听红点事件
 * ```typescript
 * eventManager.on('redDot_shop.weapon', (event, data) => {
 *   console.log(data.show, data.count); // { show: true, count: 5 }
 * });
 * ```
 *
 * ### 立即触发（特殊场景）
 * ```typescript
 * // 绕过批处理，立即触发事件
 * manager.notifyImmediate('shop.weapon');
 * ```
 *
 * ## 性能优化
 * - **优化前**：10个子节点更新 → 父节点触发10次 → 10次UI更新
 * - **优化后**：10个子节点更新 → 收集到队列 → flush时父节点触发1次 → 1次UI更新
 * - **性能提升**：10倍（取决于同帧内的子节点数量）
 *
 * @see tests/RedDot/RedDotManager.test.ts 完整测试用例
 */
export class RedDotManager<T extends IRedDotDrive = IRedDotDrive> {
    // === 数据层属性 ===
    private root: RedDotNode = new RedDotNode('root');
    private nodeMap: Map<string, RedDotNode> = new Map();

    // === UI层属性 ===
    private _drive: T;
    private _eventManager?: EventManager<RedDotEventMap>;
    private _pool: IRedDotInstance[] = [];
    private _activeRedDots: Map<IRedDotNode, IRedDotInstance> = new Map();
    private _defaultConfig: IRedDotConfig = {
        size: 24,
        color: { r: 255, g: 80, b: 80, a: 255 },
        offset: { x: 0, y: 0, z: 0 },
        showNumber: true,
        fontSize: 12,
        numberColor: { r: 255, g: 255, b: 255, a: 255 }
    };

    // === 批处理属性 ===
    private _pendingNotifyKeys: Set<string> = new Set();

    constructor(drive: T, eventManager?: EventManager<RedDotEventMap>) {
        this._drive = drive;
        this._eventManager = eventManager;
    }

    /**
     * 获取驱动实例
     */
    getDrive(): T {
        return this._drive;
    }

    /**
     * 设置默认配置
     */
    setDefaultConfig(config: IRedDotConfig) {
        Object.assign(this._defaultConfig, config);
    }

    // ==================== 数据层 API ====================

    /**
     * 注册红点节点
     */
    register(key: string): void {
        if (this.nodeMap.has(key)) return;
        const keys = key.split('.');
        let current = this.root;
        let path = '';
        for (const k of keys) {
            path = path ? `${path}.${k}` : k;
            if (!this.nodeMap.has(path)) {
                current = current.addChild(path);
                this.nodeMap.set(path, current);
            } else {
                current = this.nodeMap.get(path)!;
            }
        }
    }

    /**
     * 设置红点数量
     * @param key 红点节点键名（支持层级，如 'a.b.c'）
     * @param count 新的红点数量
     * @param ignoreChange 是否忽略数量变化（默认 false）
     * @returns 是否实际更新了红点数量
     */
    setCount(key: string, count: number, ignoreChange: boolean = false): boolean {
        this.register(key);
        const node = this.nodeMap.get(key);
        if (node && (node.count !== count || ignoreChange)) {
            node.count = count;
            this.notifyChange(key);
            return true;
        }
        return false;
    }

    /**
     * 获取红点数量（包含子节点）
     */
    getCount(key: string): number {
        const node = this.nodeMap.get(key);
        return node ? node.getTotalCount() : 0;
    }

    /**
     * 是否显示红点
     */
    getShow(key: string): boolean {
        return this.getCount(key) > 0;
    }

    /**
     * 清空红点数量
     */
    clear(key: string): void {
        this.setCount(key, 0);
    }

    /**
     * 通知红点变化（收集到待通知队列）
     */
    private notifyChange(key: string): void {
        if (!this._eventManager) return;

        // 收集当前节点及所有父节点到待通知队列
        let node: RedDotNode | undefined = this.nodeMap.get(key);
        while (node) {
            this._pendingNotifyKeys.add(node.key);
            node = node.parent ?? undefined;
        }
    }

    /**
     * 刷新：批量触发所有待处理的红点事件
     * 应在游戏循环的每帧结束时调用
     */
    flush(): void {
        if (!this._eventManager || this._pendingNotifyKeys.size === 0) return;

        // 复制并清空队列（避免在触发过程中产生的新事件影响当前批次）
        const keysToNotify = new Set(this._pendingNotifyKeys);
        this._pendingNotifyKeys.clear();

        // 批量触发事件
        keysToNotify.forEach(key => {
            const node = this.nodeMap.get(key);
            if (node) {
                const count = node.getTotalCount();
                this._eventManager!.emit(`redDot_${key}`, {
                    show: count > 0,
                    count
                });
            }
        });
    }

    /**
     * 立即通知（绕过批处理，用于特殊场景）
     */
    notifyImmediate(key: string): void {
        if (!this._eventManager) return;

        let node: RedDotNode | undefined = this.nodeMap.get(key);
        while (node) {
            const count = node.getTotalCount();
            this._eventManager!.emit(`redDot_${node.key}`, {
                show: count > 0,
                count
            });
            node = node.parent ?? undefined;
        }
    }

    // ==================== UI层 API ====================

    /**
     * 为节点添加红点
     */
    addRedDot(targetNode: IRedDotNode, config?: IRedDotConfig): IRedDotInstance {
        // 如果已经有红点，直接返回
        if (this._activeRedDots.has(targetNode)) {
            return this._activeRedDots.get(targetNode)!;
        }

        // 从对象池获取或创建新的红点
        const finalConfig = { ...this._defaultConfig, ...config };
        const redDot = this._getOrCreateRedDot(finalConfig);
        redDot.targetNode = targetNode;

        // 委托给 Drive 附加红点（包含位置计算）
        this._drive.attachRedDot(redDot, targetNode, finalConfig);

        this._activeRedDots.set(targetNode, redDot);
        return redDot;
    }

    /**
     * 移除节点的红点（回收到对象池）
     */
    removeRedDot(targetNode: IRedDotNode) {
        const redDot = this._activeRedDots.get(targetNode);
        if (redDot) {
            // 委托给 Drive 分离红点
            this._drive.detachRedDot(redDot);
            redDot.reset();
            this._pool.push(redDot);
            this._activeRedDots.delete(targetNode);
        }
    }

    /**
     * 获取节点的红点实例
     */
    getRedDot(targetNode: IRedDotNode): IRedDotInstance | null {
        return this._activeRedDots.get(targetNode) || null;
    }

    /**
     * 设置红点数字
     */
    setRedDotNumber(targetNode: IRedDotNode, num: number) {
        const redDot = this._activeRedDots.get(targetNode);
        if (redDot) {
            redDot.setNumber(num);
        }
    }

    /**
     * 清空所有红点（回收到对象池）
     */
    clearAll() {
        this._activeRedDots.forEach((redDot) => {
            this._drive.detachRedDot(redDot);
            redDot.reset();
            this._pool.push(redDot);
        });
        this._activeRedDots.clear();
    }

    // ==================== 对象池管理 ====================

    /**
     * 从对象池获取或创建红点
     */
    private _getOrCreateRedDot(config: IRedDotConfig): IRedDotInstance {
        let redDot: IRedDotInstance;

        if (this._pool.length > 0) {
            redDot = this._pool.pop()!;
            this._drive.updateRedDotConfig(redDot, config);
        } else {
            redDot = this._drive.createRedDot(config);
        }

        return redDot;
    }
}
