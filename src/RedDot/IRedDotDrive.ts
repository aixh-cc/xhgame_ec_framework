/**
 * 三维向量抽象
 */
export interface IVec3 {
    x: number;
    y: number;
    z: number;
}

/**
 * 颜色抽象
 */
export interface IColor {
    r: number;
    g: number;
    b: number;
    a: number;
}

/**
 * 红点节点抽象
 */
export interface IRedDotNode {
    name: string;
    active: boolean;
    layer: number;
    parent: IRedDotNode | null;
    setPosition(x: number, y: number, z: number): void;
    removeFromParent(): void;
}

/**
 * 变换信息抽象
 */
export interface IRedDotTransform {
    width: number;
    height: number;
    anchorX: number;
    anchorY: number;
}

/**
 * 红点配置
 */
export interface IRedDotConfig {
    spriteFrame?: any;          // 保持 any，由具体实现决定
    size?: number;              // 大小
    color?: IColor;             // 颜色
    offset?: IVec3;             // 偏移量
    showNumber?: boolean;       // 是否显示数字
    fontSize?: number;          // 字体大小
    numberColor?: IColor;       // 数字颜色
}

/**
 * 红点实例接口
 */
export interface IRedDotInstance {
    node: IRedDotNode;
    targetNode: IRedDotNode | null;
    currentNumber: number;
    setNumber(num: number): void;
    reset(): void;
}

/**
 * 红点驱动接口
 * - 负责 UI 层的创建、更新、附加、分离操作
 */
export interface IRedDotDrive {
    /**
     * 创建红点实例
     */
    createRedDot(config: IRedDotConfig): IRedDotInstance;

    /**
     * 更新红点配置
     */
    updateRedDotConfig(instance: IRedDotInstance, config: IRedDotConfig): void;

    /**
     * 附加红点到目标节点（包含位置计算）
     */
    attachRedDot(instance: IRedDotInstance, targetNode: IRedDotNode, config: IRedDotConfig): void;

    /**
     * 从目标节点分离红点
     */
    detachRedDot(instance: IRedDotInstance): void;
}
