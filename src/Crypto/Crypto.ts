export interface ICrypto {
    /**
     * md5
     * @param msg 信息
     */
    md5(msg: string): string
    /**
     * 加密
     * @param msg 加密信息
     * @param key 加密的key 
     */
    encrypt(msg: string, key: string): string
    /**
     * 解密
     * @param str 解密字符串
     * @param key 解密的key 
     */
    decrypt(str: string, key: string): string
}

/** 不加密,测试时使用 */
export class CryptoEmpty implements ICrypto {
    /** 无效果，直接返回的原文 */
    md5(msg: string): string {
        return msg;
    }

    /** 无效果，直接返回的原文 */
    encrypt(msg: string, key: string): string {
        return msg
    }

    /** 无效果，直接返回的原文 */
    decrypt(str: string, key: string): string {
        return str
    }
}
export class CryptoAES implements ICrypto {

    cryptoJS: any
    constructor(cryptoJS: any) {
        this.cryptoJS = cryptoJS
    }

    /**
     * MD5加密
     * @param msg 加密信息
     */
    md5(msg: string): string {
        return this.cryptoJS.MD5(msg).toString();
    }

    // v2 格式版本标识（Encrypt-then-MAC）
    private static readonly V2_VERSION_BYTE = 0x02;
    // HMAC 输出长度（SHA256 = 32 字节）
    private static readonly HMAC_SIZE = 32;

    /**
     * 从主密钥派生 HMAC 密钥
     * 使用与加密密钥不同的派生路径确保密钥独立性
     */
    private deriveMacKey(key: string): string {
        return this.cryptoJS.MD5('auth:' + key).toString();
    }

    /**
     * 计算 HMAC-SHA256(IV || ciphertext)
     */
    private computeHmac(iv: any, ciphertext: any, macKey: string): any {
        const hmacData = iv.clone().concat(ciphertext);
        const hmac = this.cryptoJS.HmacSHA256(hmacData, macKey);
        return hmac;
    }

    /**
     * AES 加密（v2 格式：Encrypt-then-MAC）
     * 输出格式: Base64(version_byte || IV || ciphertext || HMAC)
     * @param msg 加密信息
     * @param key 加密密钥（必须是32字节）
     * @returns Base64编码的加密字符串
     */
    encrypt(msg: string, key: string): string {
        // 验证密钥长度
        if (key.length !== 32) {
            throw new Error(`密钥必须是32字节(AES-256),当前: ${key.length}`);
        }

        const macKey = this.deriveMacKey(key);

        // 生成随机初始化向量 (16字节)
        const iv = this.cryptoJS.lib.WordArray.random(16);

        // 使用AES-256-CBC模式加密（使用原始密钥）
        const encrypted = this.cryptoJS.AES.encrypt(msg, this.cryptoJS.enc.Utf8.parse(key), {
            iv: iv,
            mode: this.cryptoJS.mode.CBC,
            padding: this.cryptoJS.pad.Pkcs7
        });

        // 计算 HMAC(IV || ciphertext)
        const hmac = this.computeHmac(iv, encrypted.ciphertext, macKey);

        // 组合: version_byte || IV || ciphertext || HMAC
        const versionWord = this.cryptoJS.lib.WordArray.create([CryptoAES.V2_VERSION_BYTE << 24], 1);
        const combined = versionWord.concat(iv).concat(encrypted.ciphertext).concat(hmac);
        return combined.toString(this.cryptoJS.enc.Base64);
    }

    /**
     * AES 解密（自动检测 v1/v2 格式）
     * @param str Base64编码的加密字符串
     * @param key 解密密钥（必须是32字节）
     * @returns 解密后的原文
     */
    decrypt(str: string, key: string): string {
        // 验证密钥长度
        if (key.length !== 32) {
            throw new Error(`密钥必须是32字节(AES-256),当前: ${key.length}`);
        }

        // Base64解码
        const data = this.cryptoJS.enc.Base64.parse(str);

        // 检测版本：第一个字节
        const firstByte = data.words[0] >>> 24; // 取最高 8 位（第一个字节）
        if (firstByte === CryptoAES.V2_VERSION_BYTE) {
            return this.decryptV2(data, key);
        }
        // 否则使用 v1 旧格式解密（向后兼容）
        return this.decryptV1(data, key);
    }

    /**
     * v2 解密（Encrypt-then-MAC，带完整性校验）
     * 格式: version_byte(1) || IV(16) || ciphertext || HMAC(32)
     */
    private decryptV2(data: any, key: string): string {
        const macKey = this.deriveMacKey(key);
        const totalBytes = data.sigBytes;

        // 最小长度: 1(version) + 16(IV) + 16(最少1个AES块) + 32(HMAC) = 65
        if (totalBytes < 65) {
            throw new Error('v2 解密失败: 密文数据长度不足');
        }

        // 通过 Hex 编码进行精确的字节操作
        const hexStr = data.toString(this.cryptoJS.enc.Hex);
        // 格式: version_byte(2hex) || IV(32hex) || ciphertext || HMAC(64hex)
        const ivHex = hexStr.substring(2, 34);              // 跳过 1 字节版本号(2hex)
        const hmacHex = hexStr.substring(hexStr.length - 64); // 最后 32 字节(64hex)
        const ciphertextHex = hexStr.substring(34, hexStr.length - 64);

        const iv = this.cryptoJS.enc.Hex.parse(ivHex);
        const ciphertext = this.cryptoJS.enc.Hex.parse(ciphertextHex);
        const expectedHmac = this.cryptoJS.enc.Hex.parse(hmacHex);

        // 验证 HMAC(IV || ciphertext)
        const computedHmac = this.computeHmac(iv, ciphertext, macKey);
        if (!this.hmacEqual(computedHmac, expectedHmac)) {
            throw new Error('v2 解密失败: HMAC 校验不通过，密文可能被篡改');
        }

        // 解密
        const decrypted = this.cryptoJS.AES.decrypt(
            this.cryptoJS.lib.CipherParams.create({ ciphertext }),
            this.cryptoJS.enc.Utf8.parse(key), {
            iv: iv,
            mode: this.cryptoJS.mode.CBC,
            padding: this.cryptoJS.pad.Pkcs7
        });

        const result = decrypted.toString(this.cryptoJS.enc.Utf8);
        if (!result) {
            throw new Error('v2 解密失败: 解密结果为空，密钥可能不正确');
        }
        return result;
    }

    /**
     * v1 旧格式解密（向后兼容，无完整性校验）
     * 格式: Base64(IV(16) || ciphertext)
     */
    private decryptV1(data: any, key: string): string {
        // 提取IV（前16字节）和加密数据
        const iv = data.clone();
        iv.sigBytes = 16;
        iv.words = iv.words.slice(0, 4); // 4 words = 16 bytes

        const encrypted = data.clone();
        encrypted.sigBytes = data.sigBytes - 16;
        encrypted.words = encrypted.words.slice(4); // 跳过前4个words (16字节)

        // 解密数据
        const decrypted = this.cryptoJS.AES.decrypt(
            this.cryptoJS.lib.CipherParams.create({
                ciphertext: encrypted
            }),
            this.cryptoJS.enc.Utf8.parse(key), {
            iv: iv,
            mode: this.cryptoJS.mode.CBC,
            padding: this.cryptoJS.pad.Pkcs7
        });

        // 返回UTF-8格式的解密结果
        return decrypted.toString(this.cryptoJS.enc.Utf8);
    }

    /**
     * 常数时间 HMAC 比较（防止时序攻击）
     */
    private hmacEqual(a: any, b: any): boolean {
        const aWords = a.words;
        const bWords = b.words;
        if (a.sigBytes !== b.sigBytes) return false;

        let diff = 0;
        const wordCount = Math.ceil(a.sigBytes / 4);
        for (let i = 0; i < wordCount; i++) {
            diff |= (aWords[i] || 0) ^ (bWords[i] || 0);
        }
        return diff === 0;
    }
}