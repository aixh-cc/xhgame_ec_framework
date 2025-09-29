import { assert, describe, test } from "poku";
import { StorageManager } from "../../../packages/core/src/Storage/StorageManager";
const getLocalStorage = () => {
    const LocalStorage = require('node-localstorage').LocalStorage;
    let localStorage = new LocalStorage('./scratch', { quota: 10 * 1024 * 1024 }); // 设置为 10MB
    return localStorage
}

const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试StorageManager', async () => {
            let factoryManager = new StorageManager('xh', getLocalStorage())
            factoryManager.origin_set('tt', 'tt001')
            assert.equal(factoryManager.origin_get('tt'), 'tt001', 'origin_set和origin_get正常')
            //
            factoryManager.set('object_json', { name: '张三', age: 12 })
            assert.equal(factoryManager.getJson('object_json').name, '张三', 'getJson正常')
            factoryManager.set('test_boolen', true)
            assert.equal(factoryManager.getBoolean('test_boolen'), true, 'getBoolean正常')
            //
            factoryManager.set('test_number', 123444)
            assert.equal(factoryManager.getNumber('test_number'), 123444, 'getNumber正常')
            // 
            factoryManager.remove('test_number')
            assert.equal(factoryManager.getNumber('test_number'), 0, 'remove正常')
            //
            factoryManager.clear()
            assert.equal(factoryManager.get('test_boolen'), null, 'clear1正常')
            assert.equal(factoryManager.get('tt'), null, 'clear2正常')

            resolve(true)
        })
    })
}
let functions = [
    test_01
]

describe('StorageManager功能', async () => {
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
