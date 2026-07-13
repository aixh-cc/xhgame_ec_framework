export type HttpHeaders = Array<[string, string]>;

export interface IHttp {
    get(url: string, reqData?: any, headers?: HttpHeaders): Promise<any>;
    post(url: string, reqData?: any, headers?: HttpHeaders): Promise<any>;
}
