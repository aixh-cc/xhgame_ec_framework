import { IAssetDrive, IBundle } from "./AssetDrive"

/**
 * 资源驱动门面，用于在业务代码中隔离具体引擎的资源 API。
 * @example
 * ```ts
 * const assets = new AssetManager(new CocosAssetDrive())
 * assets.loadBundle('game', (err, bundle) => { if (!err) console.log(bundle) })
 * ```
 */
export class AssetManager<T extends IAssetDrive> implements IAssetDrive {
    private _drive: T
    constructor(drive: T) {
        this._drive = drive
    }
    /** 获取底层驱动，供业务调用驱动扩展的方法。 */
    getDrive() {
        return this._drive
    }
    loadBundle<T extends IBundle>(nameOrUrl: string, onComplete?: (err: Error, data: T) => void) {
        return this._drive.loadBundle(nameOrUrl, onComplete)
    }
}
