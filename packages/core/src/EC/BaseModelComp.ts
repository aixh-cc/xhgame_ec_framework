import { DI } from "../DI/DI";
import { Comp } from "./Comp";
/**
 * 组件
 */
export abstract class BaseModelComp extends Comp implements ISubject {
    compName: string;
    abstract reset(): void
    onAttach() {
        DI.bindInstance(this.compName, this)
    }
    abstract onDetach(): void
    /**
     * 被观察着的视图列表
     * 设计模式14:观察者模式
     * 意图:定义对象(modelComp)间的一种一对多的依赖关系，当一个对象（modelComp）的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新。
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
    // todo 下一帧生效
    notify(): void {
        // console.log(this.compName + '，开始notify', this._viewObservers)
        for (const _viewObserver of this._viewObservers) {
            _viewObserver.updateBySubject(this);
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