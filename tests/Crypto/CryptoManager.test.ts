import { describe, test, expect } from "bun:test";
import { CryptoManager } from "../../src/Crypto/CryptoManager";
import { CryptoAES, CryptoEmpty } from "../../src/Crypto/Crypto";
import CryptoJS from "crypto-js";

describe("CryptoManager功能", () => {
    test("测试CryptoManager的CryptoEmpty", () => {
        let cryptoManager = new CryptoManager('ssdsd', new CryptoEmpty())
        expect(cryptoManager.md5('aixh-cc')).toBe('aixh-cc')
        expect(cryptoManager.encrypt('aixh-cc')).toBe('aixh-cc')
        expect(cryptoManager.decrypt('aixh-cc')).toBe('aixh-cc')
    });

    test("测试CryptoManager的CryptoAES", () => {
        let cryptoManager = new CryptoManager('60060fd13c501133d3b94a800c827d95', new CryptoAES(CryptoJS))
        expect(cryptoManager.md5('aixh-cc')).toBe('6f39f4a117d4f352cf33cd6827343815')
        let xxx_content = cryptoManager.encrypt('aixh-cc')
        expect(cryptoManager.decrypt(xxx_content)).toBe('aixh-cc')
    });
});
