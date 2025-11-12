import { DI } from "../DI/DI";
import { Comp } from "./Comp";
/**
 * 组件
 */
export abstract class BaseModelComp extends Comp implements ISubject {
    compName: string;
    abstract reset(): void
    /**
     * 监听挂载
     */
    onAttach() {

    }
    /** 所有model都需要挂载到DI中 */
    bindToDI() {
        DI.bindInstance(this.compName, this)
    }
    abstract onDetach(): void
    /**
     * 被观察着的视图列表
    */
    private _viewObservers: IObserver[] = []
    getObservers() {
        return this._viewObservers
    }
    attachObserver(observer: IObserver): void {
        const observerIndex = this._viewObservers.indexOf(observer);
        if (observerIndex > -1) {
            // console.log('已存在监听者', observer.name, '在', this.compName)
            return;
        }
        // observer.subjectModelComps.push(this)
        this._viewObservers.push(observer);
        // console.log(this.compName + '的this._viewObservers', this._viewObservers)
    }
    detachObserver(observer: IObserver): void {
        const observerIndex = this._viewObservers.indexOf(observer);
        if (observerIndex === -1) {
            return console.log('不存在监听者');
        }
        this._viewObservers.splice(observerIndex, 1);
    }
    notify(is_update_now: boolean = false): void {
        if (is_update_now) {
            for (const _viewObserver of this._viewObservers) {
                _viewObserver.updateBySubject(this);
            }
        } else {
            this.setDirtyMark()
        }
    }
}
// 主题接口
export interface ISubject {
    getObservers(): IObserver[]
    attachObserver(observer: IObserver): void
    detachObserver(observer: IObserver): void
    notify(): void
}

/** 观察者 */
export interface IObserver {
    name: string
    updateBySubject(subject: ISubject): void
}