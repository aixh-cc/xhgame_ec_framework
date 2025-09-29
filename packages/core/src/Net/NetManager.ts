import { IHttp } from "./Http";
import { ISocket } from "./Socket";

export interface INetManager {

}

export class NetManager<T extends IHttp, TS extends ISocket> implements INetManager {

    private _http: T;
    private _socket: TS;

    get http(): T {
        return this._http
    }
    get socket(): TS {
        return this._socket
    }

    constructor(http: T, socket: TS) {
        this._http = http
        this._socket = socket
    }
}