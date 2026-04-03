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
    parent: RedDotNode = null;

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
        return this.children.get(childKey);
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
 * - 数据层：管理红点树结构
 * - 状态管理：对象池、活跃红点跟踪
 * - UI层：委托给 IRedDotDrive 实现
 * - 事件通知：通过依赖注入的 EventManager
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
                current = this.nodeMap.get(path);
            }
        }
    }

    /**
     * 设置红点数量
     */
    setCount(key: string, count: number, force?: boolean): void {
        this.register(key);
        const node = this.nodeMap.get(key);
        if (node && (node.count !== count || force === true)) {
            node.count = count;
            this.notifyChange(key);
        }
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
     * 通知红点变化（私有方法）
     */
    private notifyChange(key: string): void {
        if (!this._eventManager) return; // 兼容不使用事件的场景

        let node = this.nodeMap.get(key);
        while (node) {
            const count = node.getTotalCount();
            this._eventManager.emit(`redDot_${node.key}`, {
                show: count > 0,
                count
            });
            node = node.parent;
        }
    }

    // ==================== UI层 API ====================

    /**
     * 为节点添加红点
     */
    addRedDot(targetNode: IRedDotNode, config?: IRedDotConfig): IRedDotInstance {
        // 如果已经有红点，直接返回
        if (this._activeRedDots.has(targetNode)) {
            return this._activeRedDots.get(targetNode);
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
            redDot = this._pool.pop();
            this._drive.updateRedDotConfig(redDot, config);
        } else {
            redDot = this._drive.createRedDot(config);
        }

        return redDot;
    }
}
