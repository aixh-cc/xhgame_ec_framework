export interface ISocket {
    connectSocket(options: ISocketOptions): void
    onSocketMessage(key: string, callback: Function): void
    sendSocketMessage(key: string, msgData: any): void
    onSocketError(callback: Function): void
    onSocketOpen(callback: Function): void
    onSocketClose(callback: Function): void
    closeSocket(): void
    // openResolve: Function
    // connectSocketWithRetryCallback: Function
}
export interface ISocketOptions {
    url: string
    /** 最大尝试连接数 */
    socket_close_try_max_num?: number
    /** 当前尝试连接数 */
    socket_close_try_cur_num?: number
}