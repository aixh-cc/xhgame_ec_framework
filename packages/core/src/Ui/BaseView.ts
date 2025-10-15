
import { DI } from "../DI/DI";
import { BaseModelComp, IObserver } from "../EC/BaseModelComp";

export abstract class BaseView implements IObserver {
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
    private _bindModelMap: Object = null
    get bindModelMap() {
        return this._bindModelMap
    }
    set bindModelMap(val: any) {
        this._bindModelMap = val
        if (val) {
            let keys = Object.keys(val);
            for (let key of keys) {
                let item_attr_str: string = val[key]
                if (item_attr_str.indexOf('::') == -1) {
                    continue;
                } else {
                    let compName = item_attr_str.split('::')[0]
                    let modelComp = DI.getContainer().get(compName) as BaseModelComp
                    if (!modelComp) {
                        continue;
                    }
                    let sub_item_attr_str = item_attr_str.replace(compName + '::', '');
                    let vals_arr: string[] = sub_item_attr_str.split('.');
                    // 逐层检查属性
                    let current = modelComp as unknown as any;
                    let pre_current = current as any
                    let valid = true;
                    for (let i = 0; i < vals_arr.length; i++) {
                        if (current[vals_arr[i]] === undefined) {
                            valid = false; // 如果某层属性不存在，标记为无效
                            break;
                        }
                        pre_current = current
                        current = current[vals_arr[i]]; // 向下深入
                        if (current == null) {
                            break;
                        }
                    }
                    if (valid) {
                        DI.bindInstance(item_attr_str, pre_current)
                        modelComp.attachObserver(this)
                    }
                }
            }
        }
    }
    updateBySubject(modelComp: BaseModelComp) {
        if (this._bindModelMap == null) {
            return
        }
        let keys = Object.keys(this.bindModelMap);
        for (let key of keys) {
            let item_attr_str: string = this.bindModelMap[key];
            if (item_attr_str.indexOf(modelComp.compName + '::') === -1) {
                continue; // 跳过
            }
            let vvv = DI.safeMake(item_attr_str) as any
            if (vvv) {
                const that = this as any
                if (typeof that[key] != 'undefined' && vvv[key] != 'undefined') {
                    that[key] = vvv[key];
                }
            } else {
                continue;// 跳过
            }
        }
    }
}