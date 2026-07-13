import { describe, test, expect, beforeEach } from "bun:test";
import { StorageManager } from "../../src/Storage/StorageManager";
import { CryptoManager } from "../../src/Crypto/CryptoManager";
import { CryptoAES } from "../../src/Crypto/Crypto";
import CryptoJS from "crypto-js";

const getLocalStorage = () => {
    const values = new Map<string, string>()
    return {
        get length() { return values.size },
        key(index: number) { return [...values.keys()][index] ?? null },
        getItem(key: string) { return values.get(key) ?? null },
        setItem(key: string, value: string) { values.set(key, String(value)) },
        removeItem(key: string) { values.delete(key) },
        clear() { values.clear() }
    }
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
        expect(storageManager.get('test_boolen')).toBe(null as any)
        expect(storageManager.get('tt')).toBe(null as any)
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
        expect(storageManager.get('test_boolen')).toBe(null as any)
        expect(storageManager.get('tt')).toBe(null as any)
    });

    test("空值删除不会重复添加 prefix", () => {
        const localStorage = getLocalStorage()
        const storageManager = new StorageManager('xh', localStorage)
        storageManager.set('key', 'value')
        storageManager.set('key', null)
        expect(storageManager.get('key')).toBeNull()
    });

    test("clearNamespace 不清理其他模块数据", () => {
        const localStorage = getLocalStorage()
        const storageManager = new StorageManager('xh', localStorage)
        storageManager.set('mine', '1')
        localStorage.setItem('other_key', '2')
        storageManager.clearNamespace()
        expect(storageManager.get('mine')).toBeNull()
        expect(localStorage.getItem('other_key')).toBe('2')
    });
});
