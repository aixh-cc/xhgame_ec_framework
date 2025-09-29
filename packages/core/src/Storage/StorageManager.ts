export class StorageManager {
    private _prefix: string
    get prefix() {
        return this._prefix
    }
    private _localStorage: any
    private _crypto: any
    constructor(prefix: string = 'xh', localStorage: any, crypto: any = null) {
        this._prefix = prefix
        this._localStorage = localStorage
        this._crypto = crypto
    }
    /**
     * 存储本地数据
     * @param key 存储key
     * @param value 存储值
     * @returns 
     */
    set(key: string, value: any) {
        if (null == key) {
            console.error("存储的key不能为空");
            return;
        }
        if (this._crypto) {
            key = this._crypto.md5(key);
        }
        key = `${this.prefix}_${key}`;

        if (null == value) {
            console.warn("存储的值为空，则直接移除该存储");
            this.remove(key);
            return;
        }
        if (typeof value === 'function') {
            console.error("储存的值不能为方法");
            return;
        }
        if (typeof value === 'object') {
            try {
                value = JSON.stringify(value);
            }
            catch (e) {
                console.error(`解析失败，str = ${value}`);
                return;
            }
        }
        else if (typeof value === 'number') {
            value = value + "";
        }
        if (typeof value === 'boolean') {
            value = String(value)
        }
        if (this._crypto) {
            value = this._crypto.encrypt(`${value}`);
        }
        this._localStorage.setItem(key, value);
    }
    /**
     * 原始get(不过加密)
     * @param key 
     * @param value 
     */
    origin_get(key: string) {
        return this._localStorage.getItem(key)
    }
    /**
     * 原始set(不过加密)
     * @param key 
     * @param value 
     */
    origin_set(key: string, value: string) {
        this._localStorage.setItem(key, value);
    }
    /**
     * 获取指定关键字的数据
     * @param key          获取的关键字
     * @param defaultValue 获取的默认值
     * @returns 
     */
    get(key: string, defaultValue: any = null): string {
        if (null == key) {
            console.error("存储的key不能为空");
            return null!;
        }
        if (this._crypto) {
            key = this._crypto.md5(key);
        }
        key = `${this.prefix}_${key}`;
        let str: string | null = this._localStorage.getItem(key);
        if (this._crypto && str) {
            str = this._crypto.decrypt(str);
        }
        if (null === str) {
            return defaultValue;
        }
        return str;
    }

    /** 获取指定关键字的数值 */
    getNumber(key: string, defaultValue: number = 0): number {
        var r = this.get(key);
        return Number(r) || defaultValue;
    }

    /** 获取指定关键字的布尔值 */
    getBoolean(key: string): boolean {
        var r = this.get(key);
        return r === 'true' || false;
    }

    /** 获取指定关键字的JSON对象 */
    getJson(key: string, defaultValue?: any): any {
        var r = this.get(key);
        return (r && JSON.parse(r)) || defaultValue;
    }

    /**
     * 删除指定关键字的数据
     * @param key 需要移除的关键字
     * @returns 
     */
    remove(key: string) {
        if (null == key) {
            console.error("存储的key不能为空");
            return;
        }
        if (this._crypto) {
            key = this._crypto.md5(key);
        }
        key = `${this.prefix}_${key}`;
        this._localStorage.removeItem(key);
    }

    /** 清空整个本地存储 */
    clear() {
        this._localStorage.clear();
    }
}