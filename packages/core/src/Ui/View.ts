import { BaseModelComp, IObserver } from "../EC/BaseModelComp";
import { ViewUtil } from "./ViewUtil";

export interface IView extends IObserver {
    setViewComp(modelComp: BaseModelComp, isRebindAttr?: boolean): void
    getViewComp(): BaseModelComp
    closeView(): void
    getBindAttrMap(): any
    setBindAttrMap(val: any): void
    updateBySubject(modelComp: BaseModelComp): void
}

export abstract class SimpleBaseView implements IView {
    abstract name: string;
    abstract reset(): void
    viewModelComp: BaseModelComp = null
    setViewComp(comp: BaseModelComp, isRebindAttr: boolean = false) {
        this.viewModelComp = comp
        if (isRebindAttr && this._bindAttrMap) {
            ViewUtil.bindAttr(this, this._bindAttrMap)
        }
    }
    getViewComp() {
        return this.viewModelComp
    }
    /** 
     * 关闭窗口
     * */
    closeView() {
        if (this.viewModelComp) {
            this.viewModelComp.detach()
        }
    }
    private _bindAttrMap: Object = null
    getBindAttrMap() {
        return this._bindAttrMap
    }
    setBindAttrMap(val: any) {
        this._bindAttrMap = val
        if (this._bindAttrMap) {
            ViewUtil.bindAttr(this, this._bindAttrMap)
        }
    }
    updateBySubject(modelComp: BaseModelComp) {
        ViewUtil.updateByModel(modelComp, this)
    }

}