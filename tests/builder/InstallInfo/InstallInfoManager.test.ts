import { assert, describe, test } from "poku";
import { InstallInfoManager } from "../../../packages/builder/src/builder/InstallInfoManager";

const test_01 = () => {
    return new Promise((resolve, reject) => {
        // test('测试InstallInfoManager的CryptoEmpty', async () => {
        //     let cryptoManager = new CryptoManager('ssdsd', new CryptoEmpty())
        //     assert.equal(cryptoManager.md5('aixh-cc'), 'aixh-cc', 'CryptoEmpty的md5正常')
        //     assert.equal(cryptoManager.encrypt('aixh-cc'), 'aixh-cc', 'CryptoEmpty的encrypt正常')
        //     assert.equal(cryptoManager.decrypt('aixh-cc'), 'aixh-cc', 'CryptoEmpty的decrypt正常')
        //     resolve(true)
        // })
    })
}

let functions = [
    test_01,
    // test_02
]

describe('InstallInfoManager功能', async () => {
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
