import { IHttp } from "./Http"

export class FetchHttp implements IHttp {
    async get(url: any, reqData: any, headers: Array<string[]> = [['Content-Type', 'application/json']]): Promise<any> {
        return this.baseRequest('GET', url, reqData, headers);
    }
    async post(url: any, reqData: any, headers: Array<string[]> = [['Content-Type', 'application/json']]): Promise<any> {
        return this.baseRequest('POST', url, reqData, headers);
    }
    async baseRequest(method: 'GET' | 'POST', url: any, reqData: any, headers: Array<string[]> = [['Content-Type', 'application/json']]): Promise<any> {
        let headersObject: any = {}
        headers.forEach(header => {
            headersObject[header[0]] = header[1];
        });
        return new Promise(async (resolve, reject) => {
            if (headersObject['Content-Type'] == 'application/json') {
                reqData = JSON.stringify(reqData)
            }
            let response = await fetch(url, {
                method: method,
                headers: headersObject,
                body: reqData,
            })
            const ret = await response.json();
            resolve(ret)
        })
    }

}