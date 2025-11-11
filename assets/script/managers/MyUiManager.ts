import { DI, INode, IUiDrive, UiManager } from "@aixh-cc/xhgame_ec_framework"

export class MyUiManager<T extends IUiDrive, NT extends INode> extends UiManager<T, NT> {

    constructor() {
        super(DI.make('IUiDrive'))
    }

    get enums() {
        return UIEnums
    }
}

export enum UIEnums {
}