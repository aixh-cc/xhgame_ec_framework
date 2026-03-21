import { Entity } from "../../src/EC/Entity";
import { BaseModelComp } from "../../src/EC/BaseModelComp";
import { ISystemCtor, System } from "../../src/EC/System";
import { Comp } from "../../src/EC/Comp";
export class GameEntity extends Entity {
    model: GameModelComp | null = null;
    init() {
        this.model = this.attachComponent(GameModelComp)
    }
}

export class GameModelComp extends BaseModelComp {
    compName: string = 'GameModelComp'
    initBySystems: ISystemCtor[] = []
    // 
    platform: string = ''
    reset() {
        this.platform = ''
    }
    onDetach() {

    }
}


export class TestSenceSystem extends System {

    static async initComp(comp: TestSenceComp) {
        await this.doData(comp)
    }
    static doData(comp: TestSenceComp) {
        return new Promise((resolve, reject) => {
            comp.arr.push(...[111, 222, 333, 444])
            for (let i = 0; i < comp.arr.length; i++) {
                comp.arr[i] = comp.arr[i] + comp.add_value
            }
            resolve(1)
        })
    }
}

export class TestSenceComp extends BaseModelComp {
    compName: string = 'TestSenceComp'
    initBySystems: ISystemCtor[] = [TestSenceSystem]
    arr: number[] = []
    add_value: number = 0
    reset() {
        this.arr = []
        this.add_value = 0
    }
    setup(obj: { arr: number[], add_value: number }): this {
        this.arr = obj.arr
        this.add_value = obj.add_value
        return this
    }

    actions = {

    }

    onAttach() {

    }

    onDetach() {

    }
}


export class TestViewSystem extends System {

    static async initComp(comp: TestSenceComp) {
        await this.doData(comp)
    }
    static async doData(comp: TestSenceComp) {
        return new Promise((resolve, reject) => {
            comp.arr.push(...[555, 666, 777, 888])
            for (let i = 0; i < comp.arr.length; i++) {
                comp.arr[i] = comp.arr[i] + comp.add_value
            }
            resolve(true)
        })
    }

}

export class TestViewComp extends BaseModelComp {
    compName: string = 'TestViewComp'
    initBySystems: ISystemCtor[] = [TestViewSystem]
    arr: number[] = []
    add_value: number = 0
    reset() {
        this.arr = []
        this.add_value = 0
    }
    setup(obj: { arr: number[], add_value: number }): this {
        this.arr = obj.arr
        this.add_value = obj.add_value
        return this
    }
    actions = {

    }

    onAttach() {

    }

    onDetach() {

    }
}
