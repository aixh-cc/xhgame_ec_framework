import { Component, EventTouch, _decorator } from 'cc';
import { xhgame } from '../../../../assets/script/xhgame';
import { BaseModelComp, IObserver } from '@aixh-cc/xhgame_ec_framework';

const { ccclass, property } = _decorator;

@ccclass('BaseView')
export abstract class BaseView extends Component implements IObserver {
    abstract reset(): void

    private _bindAttrMap: Object = null
    get bindAttrMap() {
        return this._bindAttrMap
    }
    set bindAttrMap(val) {
        this._bindAttrMap = val
        if (xhgame.game && val) {
            let keys = Object.keys(val);
            let compNames: string[] = []
            let modelComps: BaseModelComp[] = []
            for (let key of keys) {
                // console.log('AAAA:key=' + key)
                let item_attr_str: string = val[key];
                // console.log('item_attr_str=' + item_attr_str)
                if (item_attr_str.indexOf('::') == -1) {
                    // console.log('本modelComp内的属性' + key)
                    // 本modelComp内的属性
                    if (this.viewModelComp) {
                        this.viewModelComp.attachObserver(this)
                        modelComps.push(this.viewModelComp)
                        // console.log('modelComps.push name=' + this.viewModelComp.compName)
                    }
                } else {

                    // console.log('其他Comp内的属性' + key)
                    let compName = item_attr_str.split('::')[0]
                    if (this.viewModelComp && compName == this.viewModelComp.compName) {
                        this.viewModelComp.attachObserver(this)
                        modelComps.push(this.viewModelComp)
                        // console.log('本modelComp内的属性' + key)
                    } else {
                        let atPlayerComp = xhgame.gameEntity.getComponentByName(compName) as BaseModelComp
                        if (atPlayerComp && compNames.indexOf(compName) == -1) {
                            compNames.push(compName)
                            atPlayerComp.attachObserver(this)
                            modelComps.push(atPlayerComp)
                        }
                    }
                }
            }
            modelComps.forEach((_modelComp: BaseModelComp) => {
                _modelComp.notify(); // 第一次设置时先来一次通知
                // console.log('第一次设置时先来一次通知 _modelComp.notify()', _modelComp.compName)
            })
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
        if (this._bindAttrMap == null) {
            return
        }
        let keys = Object.keys(this.bindAttrMap);
        for (let key of keys) {
            let vals: string = this.bindAttrMap[key];
            if (vals.indexOf(modelComp.compName + '::') === -1) {
                continue; // 如果不在这个 modelComp 内，跳过
            }
            vals = vals.replace(modelComp.compName + '::', '');
            let vals_arr = vals.split('.');
            // 逐层检查属性
            let current = modelComp;

            let valid = true;
            for (let i = 0; i < vals_arr.length; i++) {
                if (current[vals_arr[i]] === undefined) {
                    valid = false; // 如果某层属性不存在，标记为无效
                    break;
                }
                current = current[vals_arr[i]]; // 向下深入
                if (current == null) {
                    break;
                }
            }
            if (valid) {
                // console.log('vm[key]' + key, this.vm)
                if (typeof this[key] != 'undefined') {
                    // console.log('通过 this[key] = current')
                    this[key] = current;
                }
                // this.vm[key] = current; // 如果有效，赋值
            }
        }
    }
}