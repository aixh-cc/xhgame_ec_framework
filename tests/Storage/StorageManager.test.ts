import { describe, test, expect, beforeEach } from "bun:test";
import { StorageManager } from "../../src/Storage/StorageManager";
import { CryptoManager } from "../../src/Crypto/CryptoManager";
import { CryptoAES } from "../../src/Crypto/Crypto";
import CryptoJS from "crypto-js";

const getLocalStorage = () => {
    const LocalStorage = require('node-localstorage').LocalStorage;
    let localStorage = new LocalStorage('./scratch', { quota: 10 * 1024 * 1024 }); // 设置为 10MB
    return localStorage
}

describe("StorageManager功能", () => {
    test("测试StorageManager", () => {
        let storageManager = new StorageManager('xh', getLocalStorage())
        storageManager.origin_set('tt', 'tt001')
        expect(storageManager.origin_get('tt')).toBe('tt001')

        storageManager.set('object_json', { name: '张三', age: 12 })
        expect(storageManager.getJson('object_json').name).toBe('张三')
        storageManager.set('test_boolen', true)
        expect(storageManager.getBoolean('test_boolen')).toBe(true)

        storageManager.set('test_number', 123444)
        expect(storageManager.getNumber('test_number')).toBe(123444)

        storageManager.remove('test_number')
        expect(storageManager.getNumber('test_number')).toBe(0)

        storageManager.clear()
        expect(storageManager.get('test_boolen')).toBe(null)
        expect(storageManager.get('tt')).toBe(null)
    });

    test("测试StorageManager的加密存储", () => {
        let cryptoManager = new CryptoManager('60060fd13c501133d3b94a800c827d95', new CryptoAES(CryptoJS))
        let storageManager = new StorageManager('xh', getLocalStorage(), cryptoManager)
        storageManager.origin_set('tt', 'tt001')
        expect(storageManager.origin_get('tt')).toBe('tt001')

        storageManager.set('object_json', { name: '张三', age: 12 })
        expect(storageManager.getJson('object_json').name).toBe('张三')
        storageManager.set('test_boolen', true)
        expect(storageManager.getBoolean('test_boolen')).toBe(true)

        storageManager.set('test_number', 123444)
        expect(storageManager.getNumber('test_number')).toBe(123444)

        storageManager.remove('test_number')
        expect(storageManager.getNumber('test_number')).toBe(0)

        storageManager.clear()
        expect(storageManager.get('test_boolen')).toBe(null)
        expect(storageManager.get('tt')).toBe(null)
    });
});
