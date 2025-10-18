import { Component } from 'cc';
import { BaseModelComp, ViewUtil, IView } from '@aixh-cc/xhgame_ec_framework';

export abstract class CocosBaseView extends Component implements IView {
    abstract reset(): void
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
        ViewUtil.updateByModel(modelComp, this)
    }

}