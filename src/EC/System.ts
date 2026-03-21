/**
 * System 构造器接口 —— 约束 initComp 静态方法存在
 * 用于 Comp.initBySystems 的类型声明
 * 参数使用 any 以允许子类声明具体 Comp 子类型（类型安全由 initBySystems 绑定保证）
 */
export interface ISystemCtor {
    initComp(comp: any): Promise<void>;
}

export abstract class System {
    // 本系统为ec系统,system系统目前只是comp的静态方法实现
    /** 默认 initComp，子类应覆盖 */
    static async initComp(_comp: any): Promise<void> { }
}
