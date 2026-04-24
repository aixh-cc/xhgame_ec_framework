import { ISocket, ISocketOptions } from "./Socket";

export class Websocket implements ISocket {
    private _options: ISocketOptions | null = null
    private _socket: WebSocket | null = null
    private listenMsgMap: Map<string, Function> = new Map();
    private socket_close_try_max_num: number = 3 // 断开连接后,尝试连接数
    private socket_close_try_cur_num: number = 0 // 断开连接后,尝试连接数
    private _onSocketErrorCallback: Function | undefined
    private _onSocketOpenCallback: Function | undefined
    private _onSocketCloseCallback: Function | undefined
    private _isCloseByClient: boolean = false

    connectSocket(options: ISocketOptions) {
        return new Promise<boolean>((resolve, reject) => {
            this._options = options
            this._socket = new WebSocket(options.url);
            this.socket_close_try_max_num = options.socket_close_try_max_num ?? 3
            this.socket_close_try_cur_num = options.socket_close_try_cur_num ?? 0
            this._socket.addEventListener("open", (event) => {
                console.log('连接成功。开始监听消息')
                resolve(true)
                this.socket_close_try_cur_num = 0
                this._onSocketOpenCallback && this._onSocketOpenCallback(event)
            });
            this._socket.onclose = (event) => {
                console.warn('连接关闭')
                this.socket_close_try_cur_num++
                if (this.socket_close_try_cur_num <= this.socket_close_try_max_num) {
                    console.log('连接断开了,开始尝试重新连接,' + this.socket_close_try_cur_num + '/' + this.socket_close_try_max_num)
                    this.connectSocket(this._options!)
                } else {
                    if (this._isCloseByClient) {
                        console.log('客户端主动关闭')
                    } else {
                        console.log('服务端异常,不请求连接')
                    }
                }
                this._onSocketCloseCallback && this._onSocketCloseCallback(event)
            };
            this._socket.addEventListener("error", (event) => {
                resolve(false)
                console.error('socket连接错误', event)
                this._onSocketErrorCallback && this._onSocketErrorCallback(event)
            });
            this._socket.addEventListener("message", (event: MessageEvent) => {
                if (event.type == 'message') {
                    let wsData = JSON.parse(event.data)
                    let onListenCallback = this.listenMsgMap.get(wsData.type)
                    if (onListenCallback) {
                        onListenCallback && onListenCallback(wsData.data)
                    }
                }
            });
        })
    }
    onSocketMessage(key: string, callback: Function): void {
        this.listenMsgMap.set(key, callback)
    }
    sendSocketMessage(key: string, msgData: any): void {
        if (!this._socket) {
            console.error('[Websocket] sendSocketMessage 失败: socket 未创建');
            return;
        }
        if (this._socket.readyState !== WebSocket.OPEN) {
            console.error(`[Websocket] sendSocketMessage 失败: socket 状态为 ${this._socket.readyState} (期望 OPEN=1)`);
            return;
        }
        let data = { type: key, data: msgData }
        this._socket.send(JSON.stringify(data))
    }

    onSocketError(callback: Function): void {
        if (this._socket != null) {
            return console.error('onSocketError需在connectSocket前监听')
        }
        this._onSocketErrorCallback = callback
    }

    onSocketOpen(callback: Function): void {
        if (this._socket != null) {
            return console.error('onSocketOpen需在connectSocket前监听')
        }
        this._onSocketOpenCallback = callback
    }

    onSocketClose(callback: Function): void {
        if (this._socket != null) {
            return console.error('onSocketClose需在connectSocket前监听')
        }
        this._onSocketCloseCallback = callback
    }
    closeSocket(): void {
        this._isCloseByClient = true
        if (this._socket) {
            this._socket.close()
        }
    }
}