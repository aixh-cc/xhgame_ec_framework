/** HTTP 抽象接口 */
/** 可由 `FetchHttp`、`XMLHttp` 或业务自定义实现提供的 HTTP 能力。 */
export interface IHttp {
    /** 发送 GET 请求。请求和响应的数据格式由实现决定。 */
    get(url: string, reqData: any, headers: Array<string[]>): Promise<any>
    /** 发送 POST 请求。请求和响应的数据格式由实现决定。 */
    post(url: string, reqData: any, headers: Array<string[]>): Promise<any>
}
