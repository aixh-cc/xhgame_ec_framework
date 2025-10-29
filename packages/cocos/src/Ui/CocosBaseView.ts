import { Component } from 'cc';
import { BaseModelComp, ViewUtil, IView } from '@aixh-cc/xhgame_ec_framework';

export abstract class CocosBaseView extends Component implements IView {
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