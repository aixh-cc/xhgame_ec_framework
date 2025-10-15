import { BaseModelComp, IObserver } from "../EC/BaseModelComp";
import { ViewUtil } from "./ViewUtil";

export interface IView {
    setViewComp(modelComp: BaseModelComp): void
    getViewComp(): BaseModelComp
    closeView(): void
    getBindAttrMap(): any
    setBindAttrMap(val: any): void
    updateBySubject(modelComp: BaseModelComp): void
}

export abstract class BaseView implements IObserver, IView {
    abstract name: string;
    abstract reset(): void
    /** 当前视图关联的modelComp ，todo 改为ControllerComp */
    viewModelComp: BaseModelComp = null
    setViewComp(comp: BaseModelComp) {
        this.viewModelComp = comp
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
        if (val) {
            ViewUtil.bindAttr(this, val)
        }
    }
    updateBySubject(modelComp: BaseModelComp) {
        if (this._bindAttrMap == null) {
            return
        }
        ViewUtil.updateByModel(modelComp, this)
    }

}