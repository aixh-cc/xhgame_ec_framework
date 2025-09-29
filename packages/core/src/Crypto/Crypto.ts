import CryptoJS from "crypto-js";

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
    /**
     * MD5加密
     * @param msg 加密信息
     */
    md5(msg: string): string {
        return CryptoJS.MD5(msg).toString();
    }

    /**
     * AES 加密 - 与PHP的xx_content_small_aes方法功能一致
     * @param msg 加密信息
     * @param key 加密密钥（必须是32字节）
     * @returns Base64编码的加密字符串
     */
    encrypt(msg: string, key: string): string {
        // 验证密钥长度
        if (key.length !== 32) {
            throw new Error(`密钥必须是32字节(AES-256),当前: ${key.length}`);
        }

        // 生成随机初始化向量 (16字节)
        const iv = CryptoJS.lib.WordArray.random(16);

        // 使用AES-256-CBC模式加密
        const encrypted = CryptoJS.AES.encrypt(msg, CryptoJS.enc.Utf8.parse(key), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        // 组合IV和加密数据，然后进行Base64编码
        const combined = iv.concat(encrypted.ciphertext);
        return combined.toString(CryptoJS.enc.Base64);
    }

    /**
     * AES 解密 - 与PHP的vv_content_small_aes方法功能一致
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
        const data = CryptoJS.enc.Base64.parse(str);

        // 提取IV（前16字节）和加密数据
        const iv = data.clone();
        iv.sigBytes = 16;
        iv.words = iv.words.slice(0, 4); // 4 words = 16 bytes

        const encrypted = data.clone();
        encrypted.sigBytes = data.sigBytes - 16;
        encrypted.words = encrypted.words.slice(4); // 跳过前4个words (16字节)

        // 解密数据
        const decrypted = CryptoJS.AES.decrypt(
            CryptoJS.lib.CipherParams.create({
                ciphertext: encrypted
            }),
            CryptoJS.enc.Utf8.parse(key), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        // 返回UTF-8格式的解密结果
        return decrypted.toString(CryptoJS.enc.Utf8);
    }
}