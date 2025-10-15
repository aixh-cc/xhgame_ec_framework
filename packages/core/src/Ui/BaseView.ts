// import { BaseModelComp, IObserver } from '@aixh-cc/xhgame_ec_framework';

import { BaseModelComp, IObserver } from "../EC/BaseModelComp";

export abstract class BaseView implements IObserver {
    abstract name: string;
    abstract reset(): void

    private _bindModelMap: Object = null
    get bindModelMap() {
        return this._bindModelMap
    }
    set bindModelMap(val) {
        this._bindModelMap = val
    }
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
    updateBySubject(modelComp: BaseModelComp) {

    }
}