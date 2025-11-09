import { DI, FactoryManager, IFactoryConfig } from "@aixh-cc/xhgame_ec_framework"
import { MyFactoryActions } from "./myFactory/MyFactoryActions"
// import { MyCocosFactoryConfig } from "./myFactory/MyCocosFactoryConfig"

export class MyFactoryManager<T extends IFactoryConfig> extends FactoryManager<T> {

    private _myFactoryActions: MyFactoryActions = null

    constructor() {
        super(DI.make<T>('IFactoryConfig'))
    }

    /** 快速操作列表 */
    get actions() {
        if (this._myFactoryActions == null) {
            this._myFactoryActions = new MyFactoryActions()
        }
        return this._myFactoryActions
    }

}