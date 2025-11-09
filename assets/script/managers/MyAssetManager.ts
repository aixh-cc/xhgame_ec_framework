import { AssetManager, DI, IAssetDrive } from "@aixh-cc/xhgame_ec_framework"

export class MyAssetManager<T extends IAssetDrive> extends AssetManager<T> {
    constructor() {
        super(DI.make('IAssetDrive'))
    }
}