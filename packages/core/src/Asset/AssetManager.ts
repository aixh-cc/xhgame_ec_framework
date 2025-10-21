import { IAssetDrive, IBundle } from "./AssetDrive"

export class AssetManager<T extends IAssetDrive> implements IAssetDrive {
    private _drive: T
    constructor(drive: T) {
        this._drive = drive
    }
    loadBundle<T extends IBundle>(nameOrUrl: string, onComplete?: (err: Error, data: T) => void) {
        return this._drive.loadBundle(nameOrUrl, onComplete)
    }
}