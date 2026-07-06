import { IHttp } from "./Http";
import { ISocket } from "./Socket";

/** 网络管理器标记接口。业务可扩展它以声明额外网络服务。 */
export interface INetManager {}

/**
 * 网络管理器
 * - 聚合 `Http` 与 `Socket` 的具体实现
 * @example
 * ```ts
 * const net = new NetManager(new FetchHttp(), new Websocket())
 * const profile = await net.http.get('/profile', { id: 1 }, [])
 * await net.socket.connectSocket({ url: 'wss://example.com/ws' })
 * ```
 */
export class NetManager<T extends IHttp, TS extends ISocket> implements INetManager {

    private _http: T;
    private _socket: TS;

    /** HTTP 实现。 */
    get http(): T {
        return this._http
    }
    /** Socket 实现。 */
    get socket(): TS {
        return this._socket
    }

    /** 使用具体实现实例构造 */
    constructor(http: T, socket: TS) {
        this._http = http
        this._socket = socket
    }
}
