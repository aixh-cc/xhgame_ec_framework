import { IAssetDrive, IBundle } from "./AssetDrive"

export class AssetManager<T extends IAssetDrive> implements IAssetDrive {
    private _drive: T
    constructor(drive: T) {
        this._drive = drive
    }
    loadBundle(nameOrUrl: string, onComplete?: (err: Error, data: IBundle) => void) {
        return this._drive.loadBundle(nameOrUrl, onComplete)
    }
}