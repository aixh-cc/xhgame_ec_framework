
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
                let _bindAttrMap: string = val[key]
                if (_bindAttrMap.indexOf('::') == -1) {
                    continue;
                } else {
                    let compName = _bindAttrMap.split('::')[0]
                    let modelComp = DI.safeMake(compName) as BaseModelComp
                    if (!modelComp) {
                        continue;
                    }
                    let vals_arr: string[] = _bindAttrMap.replace(compName + '::', '').split('.');
                    // 逐层检查属性
                    const [valid, last_i, pre_current] = this._getMoreInfo(modelComp, vals_arr)
                    if (valid) {
                        let final_path = this._getFinalPrePath(compName, vals_arr)
                        if (last_i == vals_arr.length - 1) {
                            DI.bindInstance(final_path, pre_current)
                        } else {
                            // notify时重新查找
                        }
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
            let _bindAttrMap: string = this.bindModelMap[key];
            if (_bindAttrMap.indexOf(modelComp.compName + '::') === -1) {
                continue; // 跳过
            }
            let vals_arr: string[] = _bindAttrMap.replace(modelComp.compName + '::', '').split('.');
            let last_key = key
            if (vals_arr.length > 0) {
                last_key = vals_arr[vals_arr.length - 1]
            }
            let final_path = this._getFinalPrePath(modelComp.compName, vals_arr)
            let vvv = DI.safeMake(final_path) as any
            if (!vvv) {
                // console.log('未找到final_path=', final_path)
                // 再次逐层检查属性
                const [valid, last_i, pre_current] = this._getMoreInfo(modelComp, vals_arr)
                if (valid) {
                    let final_path = this._getFinalPrePath(modelComp.compName, vals_arr)
                    if (last_i == vals_arr.length - 1) {
                        // console.log(final_path + '重新注入成功', pre_current)
                        DI.bindInstance(final_path, pre_current)
                        vvv = pre_current
                    }
                }
            }
            if (vvv) {
                const that = this as any
                if (typeof that[key] != 'undefined' && vvv[last_key] != 'undefined') {
                    that[key] = vvv[last_key];
                }
            } else {
                continue;// 跳过
            }
        }
    }
    private _getFinalPrePath(compName: string, vals_arr: any[]) {
        let final_pre_object_attr_map = ''
        if (vals_arr.length <= 1) {
            final_pre_object_attr_map = compName // 只有一个的话默认取compName
        } else {
            let _arrs = []
            for (let i = 0; i < vals_arr.length; i++) {
                if (i < vals_arr.length - 1) {
                    _arrs.push(vals_arr[i])
                }
            }
            final_pre_object_attr_map = compName + '::' + _arrs.join('.')
        }
        return final_pre_object_attr_map
    }
    private _getMoreInfo(modelComp: BaseModelComp, vals_arr: string[]) {
        let current = modelComp as any;
        let pre_current = modelComp as any
        let valid = true;
        let last_i = 0
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
            last_i = i
        }
        return [valid, last_i, pre_current]
    }
}