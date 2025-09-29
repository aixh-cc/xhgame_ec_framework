import { assert, describe, test } from "poku";
import { CryptoManager } from "../../../packages/core/src/Crypto/CryptoManager";
import { CryptoAES, CryptoEmpty } from "../../../packages/core/src/Crypto/Crypto";

const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试CryptoManager的CryptoEmpty', async () => {
            let cryptoManager = new CryptoManager('ssdsd', new CryptoEmpty())
            assert.equal(cryptoManager.md5('aixh-cc'), 'aixh-cc', 'CryptoEmpty的md5正常')
            assert.equal(cryptoManager.encrypt('aixh-cc'), 'aixh-cc', 'CryptoEmpty的encrypt正常')
            assert.equal(cryptoManager.decrypt('aixh-cc'), 'aixh-cc', 'CryptoEmpty的decrypt正常')
            resolve(true)
        })
    })
}
const test_02 = () => {
    return new Promise((resolve, reject) => {
        test('测试CryptoManager的CryptoAES', async () => {
            let cryptoManager = new CryptoManager('60060fd13c501133d3b94a800c827d95', new CryptoAES())
            assert.equal(cryptoManager.md5('aixh-cc'), '6f39f4a117d4f352cf33cd6827343815', 'CryptoAES的md5正常')
            let xxx_content = cryptoManager.encrypt('aixh-cc')
            assert.equal(cryptoManager.decrypt(xxx_content), 'aixh-cc', 'CryptoAES的加密解密正常')
            resolve(true)
        })
    })
}
let functions = [
    test_01,
    test_02
]

describe('CryptoManager功能', async () => {
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
