import { assert, describe, test } from "poku";
import { NetManager } from "../../../packages/core/src/Net/NetManager";
import { FetchHttp } from "../../../packages/core/src/Net/FetchHttp";
import { Websocket } from "../../../packages/core/src/Net/Websocket";
const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试NetManager的http', async () => {
            let netManager = new NetManager(new FetchHttp(), new Websocket())
            let res = await netManager.http.post('https://account.aixh.cc/v3.14.0/atAccount/GetServerInfo',
                { "code": "test", "platform": "h5", "anonymousCode": "", "version": "v1.0.1" })
            assert.equal(res.isSucc, true, '请求成功')
            resolve(true)
        })
    })
}
const test_02 = () => {
    return new Promise((resolve, reject) => {
        test('测试NetManager的socket', async () => {
            let websocket = new Websocket()
            let netManager = new NetManager(new FetchHttp(), websocket)
            websocket.onSocketOpen(() => {
                console.log('连接成功')
            })
            let res = await netManager.socket.connectSocket({ url: 'wss://shoushenv2.mysxjt.com/websocket/ws?type=admin&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIxMjcuMC4wLjEiLCJhdWQiOiIxMjcuMC4wLjEiLCJpYXQiOjE3NTkxMTM5OTUsIm5iZiI6MTc1OTExMzk5NSwiZXhwIjoxNzYxNzA1OTk1LCJqdGkiOnsiaWQiOjEsInR5cGUiOiJhZG1pbiJ9fQ.6sMeeNlBha9DS-PKbdNIyaAODDVVHrBJR9VIyBx_M0k' })
            assert.equal(res, true, '连接成功')
            websocket.sendSocketMessage('ping', {})
            websocket.onSocketMessage('ping', (data: any) => {
                assert.equal(data.now > 0, true, '获取到now')
                // 关闭
                websocket.closeSocket()
                resolve(true)
            })
        })
    })
}
let functions = [
    test_01,
    test_02
]

describe('NetManager功能', async () => {
    while (functions.length > 0) {
        let func = functions.shift()
        if (func) {
            await func()
            await waitXms() // 为了输出字幕顺序正常(poku的问题)
        }
    }
});
const waitXms = (ms: number = 0) => {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}
