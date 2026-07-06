/** 资源包的最小能力，签名兼容 Cocos AssetManager Bundle。 */
export interface IBundle {
    /** 加载目录中的全部资源。 */
    loadDir<T>(dir: string, onComplete: (err: Error | null, data: T[]) => void): void
    /** 加载目录中的全部资源，并接收加载进度。 */
    loadDir<T>(dir: string, onProgress: ((finished: number, total: number, item: any) => void) | null, onComplete: (err: Error | null, data: T[]) => void): void
    /** 加载单个资源。 */
    load<T>(paths: string, onComplete?: ((err: Error | null, data: T) => void) | null): void;
    /** 释放包内指定路径的资源。 */
    release(path: string): void;
}

/** 资源系统平台适配接口。 */
export interface IAssetDrive {
    /**
     * 加载资源包。
     * @param nameOrUrl 已注册的 bundle 名称或远程 URL
     * @param onComplete 完成回调；失败时 `err` 非空
     */
    loadBundle<T extends IBundle>(nameOrUrl: string, onComplete?: (err: Error, data: T) => void): void
}
