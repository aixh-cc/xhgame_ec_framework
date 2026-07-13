import { DI } from "../DI/DI";
import { BaseModelComp, IObserver } from "../EC/BaseModelComp";
import { IView } from "./View";

export class ViewUtil {
    static bindAttr(observer: IObserver, bindAttrMap: Record<string, string>, preferredModelComp?: BaseModelComp): BaseModelComp[] {
        let keys = Object.keys(bindAttrMap);
        let allBaseModelComps: BaseModelComp[] = []
        for (let key of keys) {
            let _bindAttrLink: string = bindAttrMap[key]
            if (_bindAttrLink.indexOf('::') == -1) {
                continue;
            } else {
                let compName = _bindAttrLink.split('::')[0]
                let modelComp = preferredModelComp?.compName === compName
                    ? preferredModelComp
                    : DI.safeMake(compName) as BaseModelComp
                if (!modelComp) {
                    continue;
                }
                if (allBaseModelComps.indexOf(modelComp) == -1) {
                    allBaseModelComps.push(modelComp)
                    modelComp.attachObserver(observer)
                }
            }
        }
        return [...allBaseModelComps]
    }
    /**
     * 解绑观察者与 ModelComp 的绑定关系
     * @param observer 观察者（通常是 View）
     * @param modelComps 需要解绑的 ModelComp 数组
     */
    static unBindAttr(observer: IObserver, modelComps: BaseModelComp[]): void {
        if (!modelComps || modelComps.length === 0) {
            return;
        }
        for (let modelComp of modelComps) {
            if (modelComp) {
                modelComp.detachObserver(observer);
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
            const [valid, last_i, pre_current] = this._getMoreInfo(modelComp, vals_arr)
            if (valid && last_i === vals_arr.length - 1) {
                const vvv = pre_current;
                const that = observer as any;
                let last_key = vals_arr.length > 0 ? vals_arr[vals_arr.length - 1] : key;
                // 使用 !== 严格比较，与 undefined 值比较而非字符串 'undefined'
                if (typeof that[key] !== 'undefined' && vvv[last_key] !== undefined) {
                    that[key] = vvv[last_key];
                }
            }
        }
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
