/**
 * 红点变化数据
 */
export interface RedDotChangeData {
    show: boolean;
    count: number;
}

/**
 * 红点事件映射
 * - 支持动态红点键（redDot_${string}）
 * - 为 EventManager 提供类型安全
 */
export interface RedDotEventMap {
    [key: `redDot_${string}`]: RedDotChangeData;
}
