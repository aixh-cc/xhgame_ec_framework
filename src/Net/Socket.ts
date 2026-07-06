/** 长连接平台适配接口。消息 `key` 通常对应业务协议号或事件名。 */
export interface ISocket {
    /** 建立连接，成功后 resolve `true`。 */
    connectSocket(options: ISocketOptions): Promise<boolean>
    /** 监听指定业务消息。 */
    onSocketMessage(key: string, callback: Function): void
    /** 发送带业务 key 的消息。 */
    sendSocketMessage(key: string, msgData: any): void
    /** 注册连接错误回调。 */
    onSocketError(callback: Function): void
    /** 注册连接成功回调。 */
    onSocketOpen(callback: Function): void
    /** 注册连接关闭回调。 */
    onSocketClose(callback: Function): void
    /** 主动关闭连接。 */
    closeSocket(): void
}
/** WebSocket 连接参数。 */
export interface ISocketOptions {
    /** WebSocket 地址，例如 `wss://example.com/ws`。 */
    url: string
    /** 最大尝试连接数 */
    socket_close_try_max_num?: number
    /** 当前尝试连接数 */
    socket_close_try_cur_num?: number
}
