import { DI } from "../DI/DI";
import { BaseModelComp, IObserver } from "../EC/BaseModelComp";
import { IView } from "./View";

export class ViewUtil {
    static bindAttr(observer: IObserver, bindAttrMap: any) {
        let keys = Object.keys(bindAttrMap);
        for (let key of keys) {
            let _bindAttrLink: string = bindAttrMap[key]
            if (_bindAttrLink.indexOf('::') == -1) {
                continue;
            } else {
                let compName = _bindAttrLink.split('::')[0]
                let modelComp = DI.safeMake(compName) as BaseModelComp
                if (!modelComp) {
                    continue;
                }
                let vals_arr: string[] = _bindAttrLink.replace(compName + '::', '').split('.');
                // 逐层检查属性
                const [valid, last_i, pre_current] = this._getMoreInfo(modelComp, vals_arr)
                if (valid) {
                    let final_path = this._getFinalPrePath(compName, vals_arr)
                    if (last_i == vals_arr.length - 1) {
                        DI.bindInstance(final_path, pre_current)
                    } else {
                        // notify时重新查找
                    }
                    modelComp.attachObserver(observer)
                }
            }
        }
    }
    static updateByModel(modelComp: BaseModelComp, observer: IView) {
        let bindAttrMap = observer.getBindAttrMap()
        if (bindAttrMap == null) {
            return
        }
        let keys = Object.keys(bindAttrMap);
        for (let key of keys) {
            let _bindAttrLink: string = bindAttrMap[key];
            if (_bindAttrLink.indexOf(modelComp.compName + '::') === -1) {
                continue; // 跳过
            }
            let vals_arr: string[] = _bindAttrLink.replace(modelComp.compName + '::', '').split('.');
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
                const that = observer as any
                if (typeof that[key] != 'undefined' && vvv[last_key] != 'undefined') {
                    that[key] = vvv[last_key];
                }
            } else {
                continue;// 跳过
            }
        }
    }
    static _getFinalPrePath(compName: string, vals_arr: any[]) {
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
    static _getMoreInfo(modelComp: BaseModelComp, vals_arr: string[]) {
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