import { ICrypto } from "./Crypto"

/** 加密管理者 */
export class CryptoManager<T extends ICrypto> {

    _crypto: T
    get crypto() {
        return this._crypto
    }

    private _key: string

    constructor(key: string, crypto: T = null) {
        this._key = key
        this._crypto = crypto
    }

    md5(str: string) {
        return this.crypto.md5(str)
    }

    encrypt(msg: string): string {
        return this.crypto.encrypt(msg, this._key)
    }

    decrypt(str: string) {
        return this.crypto.decrypt(str, this._key)
    }

}