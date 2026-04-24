import { BaseModelComp, IObserver } from "../EC/BaseModelComp";
import { ViewUtil } from "./ViewUtil";

/** View 抽象接口（观察者） */
export interface IView extends IObserver {
    setViewComp(modelComp: BaseModelComp, isRebindAttr?: boolean): void
    getViewComp(): BaseModelComp | null
    closeView(): void
    getBindAttrMap(): any
    setBindAttrMap(val: any): void
    clearBindAttrMap(): void
    updateBySubject(modelComp: BaseModelComp): void
}

/**
 * 轻量 View 基类
 * - 支持绑定属性映射与关闭视图
 * 使用示例：`tests/core/Ui/View.test.ts`
 */
export abstract class SimpleBaseView implements IView {
    abstract name: string;
    abstract reset(): void
    viewModelComp: BaseModelComp | null = null
    private _bindAttrMap: Record<string, string> | null = null
    private _boundModelComps: BaseModelComp[] = []

    setViewComp(comp: BaseModelComp, isRebindAttr: boolean = false) {
        this.viewModelComp = comp

        // 如果有 bindAttrMap 配置，自动执行绑定
        if (this._bindAttrMap) {
            // 先清理旧的绑定（如果存在）
            this.clearBindAttrMap()
            // 执行绑定并存储
            this._boundModelComps = ViewUtil.bindAttr(this, this._bindAttrMap)

            // 如果需要立即通知，触发更新
            if (isRebindAttr) {
                for (let _comp of this._boundModelComps) {
                    _comp.notify(true, this)
                }
            }
        }
    }
    getViewComp() {
        return this.viewModelComp
    }
    /**
     * 关闭窗口
     * */
    closeView() {
        // 清理所有 observer 绑定
        this.clearBindAttrMap()

        if (this.viewModelComp) {
            this.viewModelComp.detach()
        }
        this.viewModelComp = null;
        this._bindAttrMap = null;
    }
    getBindAttrMap() {
        return this._bindAttrMap
    }
    setBindAttrMap(val: any) {
        // 先清理旧的绑定（如果存在）
        this.clearBindAttrMap()

        // 保存配置
        this._bindAttrMap = val

        // 如果已经设置了 viewModelComp，立即执行绑定
        if (this._bindAttrMap && this.viewModelComp) {
            this._boundModelComps = ViewUtil.bindAttr(this, this._bindAttrMap)
        }
    }
    clearBindAttrMap(): void {
        if (this._boundModelComps.length > 0) {
            ViewUtil.unBindAttr(this, this._boundModelComps);
            this._boundModelComps = [];
        }
    }
    updateBySubject(modelComp: BaseModelComp) {
        ViewUtil.updateByModel(modelComp, this)
    }

}