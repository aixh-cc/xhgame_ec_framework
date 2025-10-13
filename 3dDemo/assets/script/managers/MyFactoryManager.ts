import { FactoryManager, IFactoryConfig, IHttp, ISocket, NetManager } from "@aixh-cc/xhgame_ec_framework"
import { MyFactoryActions } from "./myFactory/MyFactoryActions"
import { MyCocosFactoryConfig } from "./myFactory/MyCocosFactoryConfig"

export class MyFactoryManager extends FactoryManager<MyCocosFactoryConfig> {

    constructor() {
        super(new MyCocosFactoryConfig())
    }


    private _myFactoryActions: MyFactoryActions = null
    /** 快速操作 */
    get actions() {
        if (this._myFactoryActions == null) {
            this._myFactoryActions = new MyFactoryActions()
        }
        return this._myFactoryActions
    }
}