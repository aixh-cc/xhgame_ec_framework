import { describe, test, expect } from "bun:test";
import { CryptoManager } from "../../src/Crypto/CryptoManager";
import { CryptoAES, CryptoEmpty } from "../../src/Crypto/Crypto";
import CryptoJS from "crypto-js";

const TEST_KEY_32 = '60060fd13c501133d3b94a800c827d95';

describe("CryptoManager功能", () => {
    test("测试CryptoManager的CryptoEmpty", () => {
        let cryptoManager = new CryptoManager('ssdsd', new CryptoEmpty())
        expect(cryptoManager.md5('aixh-cc')).toBe('aixh-cc')
        expect(cryptoManager.encrypt('aixh-cc')).toBe('aixh-cc')
        expect(cryptoManager.decrypt('aixh-cc')).toBe('aixh-cc')
    });

    test("测试CryptoManager的CryptoAES", () => {
        let cryptoManager = new CryptoManager(TEST_KEY_32, new CryptoAES(CryptoJS))
        expect(cryptoManager.md5('aixh-cc')).toBe('6f39f4a117d4f352cf33cd6827343815')
        let xxx_content = cryptoManager.encrypt('aixh-cc')
        expect(cryptoManager.decrypt(xxx_content)).toBe('aixh-cc')
    });
});

describe("CryptoAES v2 安全加固", () => {
    test("v2 加密→解密往返正确", () => {
        const crypto = new CryptoAES(CryptoJS);
        const plaintext = '测试中文内容 Hello World 123!@#';
        const encrypted = crypto.encrypt(plaintext, TEST_KEY_32);
        const decrypted = crypto.decrypt(encrypted, TEST_KEY_32);
        expect(decrypted).toBe(plaintext);
    });

    test("每次加密产生不同密文（随机 IV）", () => {
        const crypto = new CryptoAES(CryptoJS);
        const plaintext = 'same content';
        const enc1 = crypto.encrypt(plaintext, TEST_KEY_32);
        const enc2 = crypto.encrypt(plaintext, TEST_KEY_32);
        expect(enc1).not.toBe(enc2);
        // 但解密结果相同
        expect(crypto.decrypt(enc1, TEST_KEY_32)).toBe(plaintext);
        expect(crypto.decrypt(enc2, TEST_KEY_32)).toBe(plaintext);
    });

    test("HMAC 篡改检测：修改密文后解密应 throw", () => {
        const crypto = new CryptoAES(CryptoJS);
        const encrypted = crypto.encrypt('secret data', TEST_KEY_32);

        // 篡改 Base64 密文中间部分
        const chars = encrypted.split('');
        const midIndex = Math.floor(chars.length / 2);
        chars[midIndex] = chars[midIndex] === 'A' ? 'B' : 'A';
        const tampered = chars.join('');

        expect(() => crypto.decrypt(tampered, TEST_KEY_32)).toThrow();
    });

    test("密钥长度校验", () => {
        const crypto = new CryptoAES(CryptoJS);
        expect(() => crypto.encrypt('test', 'short')).toThrow('密钥必须是32字节');
        expect(() => crypto.decrypt('test', 'short')).toThrow('密钥必须是32字节');
    });

    test("strictV2 模式拒绝 v1 格式", () => {
        // 用非 strictV2 模式加密（默认 v2），然后手动构造 v1 数据
        const normalCrypto = new CryptoAES(CryptoJS);
        const strictCrypto = new CryptoAES(CryptoJS, true);

        // v2 数据在 strictV2 下可以正常解密
        const v2Encrypted = normalCrypto.encrypt('test', TEST_KEY_32);
        expect(strictCrypto.decrypt(v2Encrypted, TEST_KEY_32)).toBe('test');

        // 构造一个 v1 格式数据（IV + ciphertext，首字节不是 0x02）
        const iv = CryptoJS.lib.WordArray.random(16);
        const encrypted = CryptoJS.AES.encrypt('v1 data', CryptoJS.enc.Utf8.parse(TEST_KEY_32), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        const v1Data = iv.concat(encrypted.ciphertext);
        const v1Base64 = v1Data.toString(CryptoJS.enc.Base64);

        // 非 strict 模式可以解密 v1
        expect(normalCrypto.decrypt(v1Base64, TEST_KEY_32)).toBe('v1 data');

        // strict 模式拒绝 v1
        expect(() => strictCrypto.decrypt(v1Base64, TEST_KEY_32)).toThrow('strictV2');
    });
});
