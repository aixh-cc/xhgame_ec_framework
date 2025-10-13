
import { HttpClient as HttpClient_Miniapp } from 'tsrpc-miniapp';
import { ApiReturn } from 'tsrpc-proto';
import { HttpClient as HttpClient_Browser } from 'tsrpc-browser';
import { serviceProto as ServiceProtoAccount, ServiceType as ServiceTypeAccount } from "../tsshared/protocols/ServiceProtoAccount";
import { serviceProto as ServiceProtoHall, ServiceType as ServiceTypeHall } from "../tsshared/protocols/ServiceProtoHall";
import { PREVIEW } from "cc/env";
import { IHttp } from '@aixh-cc/xhgame_ec_framework';

/**
 * 设计模式8:适配器模式
 * 意图:希望游戏框架里面请求方式是类似xhgame.net.post('/api/userInfo')，无论我们如何换后端开发框架(有些是返回code=200表示成功，有些是success表示成功)，前端都是不用改。
 */
export class TsrpcHttp implements IHttp {
    private accountTsrpc: HttpClient_Miniapp<ServiceTypeAccount> | HttpClient_Browser<ServiceTypeAccount> = null
    private hallTsrpc: HttpClient_Miniapp<ServiceTypeHall> | HttpClient_Browser<ServiceTypeHall> = null


    async get<T extends keyof ServiceTypeAccount['api'], T2 extends keyof ServiceTypeHall['api']>(url: T | T2, reqData: any) {
        return this.post(url, reqData) // tsrpc中无get和post的区别
    }

    /** 
     * 注意:此方法,vscode只有接口提示,无参数提示
     * 使用示例：xhgame.net.http.post('api') 
     * 建议用下面的accountPost 或 hallPost
     * 使用示例：xhgame.net.http.accountPost('api') )
     * 
     * 也可以调试的时候，用xhgame.net.http.accountPost
     * 功能确定后用xhgame.net.post
     */
    async post<T extends keyof ServiceTypeAccount['api'], T2 extends keyof ServiceTypeHall['api']>(url: T | T2, reqData: any) {
        let api: any = url
        if (api.indexOf('atAccount') > -1) {
            return this.accountPost(api, reqData)
        }
        return this.hallPost(api, reqData)
    }

    /** 
     * 有提示的接口请求方法
     * 前提是需知道是account接口
     * 使用示例：xhgame.net.http.accountPost('api') )
     */
    async accountPost<T extends keyof ServiceTypeAccount['api']>(url: T, reqData: ServiceTypeAccount['api'][T]['req']): Promise<ApiReturn<ServiceTypeAccount['api'][T]['res']>['res']> {
        return new Promise(async (resolve, reject) => {
            let httpClient = this._getAccountHttpClient(url)
            let ret = await httpClient.callApi(url, reqData)
            if (ret.isSucc) {
                resolve(ret.res)
            } else {
                reject(ret.err)
            }
        })
    }
    /** 
     * 有提示的接口请求方法
     * 前提是需知道是hall接口
     * 使用示例：xhgame.net.http.hallPost('api') )
     */
    async hallPost<T extends keyof ServiceTypeHall['api']>(url: T, reqData: ServiceTypeHall['api'][T]['req']): Promise<ApiReturn<ServiceTypeHall['api'][T]['res']>['res']> {
        return new Promise(async (resolve, reject) => {
            let httpClient = this._getHallHttpClient(url)
            let ret = await httpClient.callApi(url, reqData)
            if (ret.isSucc) {
                resolve(ret.res)
            } else {
                console.error('22222', ret.err.message)
                reject(ret.err.message)
                throw Error(ret.err.message)
            }
        })
    }



    private _getAccountHttpClient(url: string) {
        if (!this.accountTsrpc) {
            this.accountTsrpc = new (PREVIEW ? HttpClient_Browser : HttpClient_Miniapp)(ServiceProtoAccount, {
                server: xhgame.game.config.account_domain, // 账号的请求域名是项目一开始就决定的
                json: true,
                logger: console,
            });
        }
        return this.accountTsrpc
    }

    private _getHallHttpClient(url: string) {
        if (!this.hallTsrpc) {
            this.hallTsrpc = new (PREVIEW ? HttpClient_Browser : HttpClient_Miniapp)(ServiceProtoHall, {
                server: xhgame.gameEntity.playerModel.accountInfo.hallDomain, // 大厅的请求域名在登录后才知道
                json: true,
                logger: console,
            });
        }
        return this.hallTsrpc
    }

}