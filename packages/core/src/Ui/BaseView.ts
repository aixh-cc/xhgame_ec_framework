
import { DI } from "../DI/DI";
import { BaseModelComp, IObserver } from "../EC/BaseModelComp";

export abstract class BaseView implements IObserver {
    abstract name: string;
    abstract reset(): void

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
                        console.log('有效')
                        DI.bindInstance(item_attr_str, pre_current)
                        console.log('绑定值关系,modelComp.attachObserver(this)')
                        modelComp.attachObserver(this)
                        // console.log('modelComp完成.attachObserver', modelComp.compName, this.name)
                        // // console.log('vm[key]' + key, this.vm)
                        // if (typeof this[key] != 'undefined') {
                        //     // console.log('通过 this[key] = current')
                        //     this[key] = current;
                        // }
                        // // this.vm[key] = current; // 如果有效，赋值
                        // console.log('comp原先的值 value=', DI.getContainer().get(item_attr_str))

                        // let atPlayerComp = xhgame.gameEntity.getComponentByName(compName) as BaseModelComp
                        // if (atPlayerComp && compNames.indexOf(compName) == -1) {
                        //     compNames.push(compName)

                        //     modelComps.push(atPlayerComp)
                        // }
                    }




                }
            }

        }
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
        if (this._bindModelMap == null) {
            return
        }
        let keys = Object.keys(this.bindModelMap);
        for (let key of keys) {
            let item_attr_str: string = this.bindModelMap[key];
            if (item_attr_str.indexOf(modelComp.compName + '::') === -1) {
                continue; // 如果不在这个 modelComp 内，跳过
            }
            let vvv = DI.safeMake(item_attr_str) as any
            if (vvv) {
                console.log('有')
                let that = this as any
                if (typeof that[key] != 'undefined') {
                    // console.log('通过 this[key] = current')
                    that[key] = vvv[key];
                }
            } else {
                console.log('无')
            }
            // let sub_item_attr_str = item_attr_str.replace(modelComp.compName + '::', '');
            // let vals_arr = sub_item_attr_str.split('.');
            // // 逐层检查属性
            // let current = modelComp;
        }
    }
}