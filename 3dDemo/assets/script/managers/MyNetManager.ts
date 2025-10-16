import { FetchHttp, NetManager, Websocket } from "@aixh-cc/xhgame_ec_framework"
import { TsrpcHttp } from "../../../extensions/xhgame_plugin/assets/net/TsrpcHttp"
import { ApiEnums } from "./ApiEnums"

export class MyNetManager extends NetManager<TsrpcHttp, Websocket> {
    constructor() {
        super(new TsrpcHttp(), new Websocket())
    }

    get enums() {
        return ApiEnums
    }
}
