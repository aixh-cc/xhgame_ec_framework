import { DI, IHttp, ISocket, NetManager } from "@aixh-cc/xhgame_ec_framework"
import { ApiEnums } from "./ApiEnums"

export class MyNetManager<T extends IHttp, TS extends ISocket> extends NetManager<T, TS> {
    constructor() {
        super(DI.make('IHttp'), DI.make('ISocket'))
    }

    get enums() {
        return ApiEnums
    }
}
