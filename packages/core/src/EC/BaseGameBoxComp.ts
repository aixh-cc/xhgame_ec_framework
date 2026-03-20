import { BaseModelComp } from "./BaseModelComp";

/**
 * 可销毁的游戏逻辑接口（可选约束）
 */
export interface IDestroyable {
    destroy(): void;
}

/**
 * 玩法组件基类
 * 收敛 subGames 模式（Game + GameBoxComp）的样板代码：
 * - 持有纯逻辑 game 实例
 * - 统一 destroyGame / reset 流程
 * 
 * @typeParam T 纯逻辑 Game 类型，无强制接口约束
 * 
 * @example
 * ```ts
 * class LinkGameBoxComp extends BaseGameBoxComp<LinkGame> {
 *     compName = 'LinkGameBoxComp'
 *     initBySystems = [LinkGameBoxSystem]
 *
 *     setup(obj: { rows: number; cols: number; cakes: string[] }) {
 *         // 初始化逻辑...
 *         return this
 *     }
 *
 *     onAttach() { super.onAttach() }
 *     onDetach() {}
 *     notify(is_update_now: boolean) { /* ... *\/ }
 * }
 * ```
 */
export abstract class BaseGameBoxComp<T = any> extends BaseModelComp {
    /** 纯逻辑游戏实例 */
    game: T | null = null;

    /**
     * 销毁游戏实例，子类可覆盖以添加额外清理逻辑
     */
    protected destroyGame(): void {
        if (this.game != null) {
            // 如果 game 实现了 destroy 方法，自动调用
            if (typeof (this.game as any).destroy === 'function') {
                (this.game as any).destroy();
            }
            this.game = null;
        }
    }

    /**
     * 重置组件，默认调用 destroyGame()
     * 子类覆盖时应先调用 super.reset() 或自行调用 this.destroyGame()
     */
    reset(): void {
        this.destroyGame();
    }
}
