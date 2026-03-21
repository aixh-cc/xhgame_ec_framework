import { Comp } from "./Comp";

/**
 * System 构造器接口 —— 约束 initComp 静态方法签名
 * 用于 Comp.initBySystems 的类型声明，确保编译期检查
 */
export interface ISystemCtor {
    initComp(comp: Comp): Promise<void>;
}

export abstract class System {
    // 本系统为ec系统,system系统目前只是comp的静态方法实现
    /** 默认 initComp，子类应覆盖 */
    static async initComp(_comp: Comp): Promise<void> { }
}