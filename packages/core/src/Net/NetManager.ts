import { IHttp } from "./Http";
import { ISocket } from "./Socket";

export interface INetManager {

}

/**
 * 网络管理器
 * - 聚合 `Http` 与 `Socket` 的具体实现
 * 使用示例：`tests/core/Net/NetManager.test.ts`
 */
export class NetManager<T extends IHttp, TS extends ISocket> implements INetManager {

    private _http: T;
    private _socket: TS;

    get http(): T {
        return this._http
    }
    get socket(): TS {
        return this._socket
    }

    /** 使用具体实现实例构造 */
    constructor(http: T, socket: TS) {
        this._http = http
        this._socket = socket
    }
}