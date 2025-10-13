import { FetchHttp, NetManager, Websocket } from "@aixh-cc/xhgame_ec_framework"
import { TsrpcHttp } from "../../../extensions/xhgame_plugin/assets/net/TsrpcHttp"

export class MyNetManager extends NetManager<TsrpcHttp, Websocket> {
    constructor() {
        super(new TsrpcHttp(), new Websocket())
    }

    get enums() {
        return ApiEnums
    }
}


export enum ApiEnums {
    GetRoomList = 'atHall/GetRoomList',
    EnterRoom = 'atHall/EnterRoom',
    //
    GetServerInfo = 'atAccount/GetServerInfo',
    PlayerEnter = 'atHall/PlayerEnter',
    GetPlayerMission = 'atHall/PlayerMission', //'atHall/getPlayerMissions',
    WinBattle = 'atHall/PlayerWinBattle',
    GetDoubleReward = 'atHall/PlayerGetDoubleReward',
    GetPackageInfo = 'atHall/PlayerGetPackageInfo',
    UseGoods = 'atHall/PlayerUseGoods',
    BuyGoods = 'atHall/PlayerBuyStoreGoods',
    ReviveBattle = 'atHall/PlayerReviveBattle',
    PostLocalPackageHandle = 'atHall/PostLocalPackageHandle',
}