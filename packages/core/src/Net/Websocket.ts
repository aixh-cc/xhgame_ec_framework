import { ISocket, ISocketOptions } from "./Socket";

export class Websocket implements ISocket {
    private _options: ISocketOptions = null
    private _socket: WebSocket = null
    private listenMsgMap: Map<string, Function> = new Map();
    private socket_close_try_max_num: number = 3 // 断开连接后,尝试连接数
    private socket_close_try_cur_num: number = 0 // 断开连接后,尝试连接数
    private _onSocketErrorCallback: Function
    private _onSocketOpenCallback: Function
    private _onSocketCloseCallback: Function
    // connectSocketWithRetryCallback: Function
    // openResolve: Function = null
    private _isCloseByClient: boolean = false

    // connectSocketWithRetry(options: ISocketOptions): Promise<boolean> {
    //     return new Promise<boolean>((resolve, reject) => {
    //         try {
    //             this.openResolve = resolve
    //             this.connectSocket(options)
    //             this.connectSocketWithRetryCallback = (_options: ISocketOptions) => {
    //                 this.connectSocketWithRetry(_options)
    //             }
    //         } catch (err) {
    //             resolve(false)
    //             console.error(err)
    //         }
    //     })
    // }

    connectSocket(options: ISocketOptions) {
        this._options = options
        this._socket = new WebSocket(options.url);
        this.socket_close_try_max_num = options.socket_close_try_max_num
        this.socket_close_try_cur_num = options.socket_close_try_cur_num
        this._socket.addEventListener("open", (event) => {
            console.log('连接成功。开始监听消息')
            this.socket_close_try_cur_num = 0 //
            // this.openResolve && this.openResolve(true)
            this._onSocketOpenCallback && this._onSocketOpenCallback(event)
        });
        this._socket.onclose = (event) => {
            console.warn('连接关闭')
            this.socket_close_try_cur_num++
            if (this.socket_close_try_cur_num <= this.socket_close_try_max_num) {
                console.log('连接断开了,开始尝试重新连接,' + this.socket_close_try_cur_num + '/' + this.socket_close_try_max_num)
                //this.connectSocketWithRetryCallback && this.connectSocketWithRetryCallback(this._options)
                this.connectSocket(this._options)
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
            console.error('socket连接错误', event)
            // this.openResolve && this.openResolve(false)
            this._onSocketErrorCallback && this._onSocketErrorCallback(event)
        });
        // Listen for messages
        this._socket.addEventListener("message", (event: MessageEvent) => {
            if (event.type == 'message') {
                let wsData = JSON.parse(event.data)
                let onListenCallback = this.listenMsgMap.get(wsData.type)
                if (onListenCallback) {
                    onListenCallback && onListenCallback(wsData.data)
                }
            }
        });
    }
    onSocketMessage(key: string, callback: Function): void {
        this.listenMsgMap.set(key, callback)
    }
    sendSocketMessage(key: string, msgData: any): void {
        let data = { type: key, data: msgData }
        this._socket.send(JSON.stringify(data)) // todo 改为多种类型
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
        this._socket.close()
    }
}