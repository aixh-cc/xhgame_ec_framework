export interface IHttp {
    get(url: string, reqData: any, headers: Array<string[]>): Promise<any>
    post(url: string, reqData: any, headers: Array<string[]>): Promise<any>
}