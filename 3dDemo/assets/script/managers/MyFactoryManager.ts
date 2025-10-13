import { FactoryManager, IFactoryConfig, IHttp, ISocket, NetManager } from "@aixh-cc/xhgame_ec_framework"
import { MyFactoryActions } from "./myFactory/MyFactoryActions"

export class MyFactoryManager<T extends IFactoryConfig> extends FactoryManager<T> {
    private _myFactoryActions: MyFactoryActions = null
    /** 快速操作 */
    get actions() {
        if (this._myFactoryActions == null) {
            this._myFactoryActions = new MyFactoryActions()
        }
        return this._myFactoryActions
    }
}