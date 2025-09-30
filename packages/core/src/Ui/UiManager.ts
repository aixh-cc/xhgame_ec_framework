import { BaseModelComp } from "../EC/BaseModelComp"
import { IUiDrive } from "./UiDrive"

export class UiManager<T extends IUiDrive, NT> {

    private _uiDrive: T

    constructor(uiDrive: T) {
        this._uiDrive = uiDrive
    }
    get gui_root(): NT {
        return this._uiDrive.getGuiRoot() as NT
    }
    getGuiRoot(): NT {
        return this._uiDrive.getGuiRoot() as NT
    }
    get world_root(): NT {
        return this._uiDrive.getWorldRoot() as NT
    }
    getWorldRoot(): NT {
        return this._uiDrive.getWorldRoot() as NT
    }
    getUI(uiid: string): NT {
        return this._uiDrive.getUI(uiid) as NT
    }

    toast(msg: string) {
        this._uiDrive.toast(msg)
        // let item = xhgame.factory.actions.createTextUiItem('toast')
        // item.content = msg
        // item.playTime = 1
        // item.toScene()
    }

    // private loading_ui_item: IUiItem = null
    loading() {
        this._uiDrive.loading()
        // if (this.loading_ui_item) {
        //     this.loading_ui_item.toPool()
        // }
        // this.loading_ui_item = xhgame.factory.actions.createUiItem('loading_tips_item')
        // this.loading_ui_item.toScene()
    }
    loaded() {
        this._uiDrive.loaded()
        // this.loading_ui_item.toPool()
        // this.loading_ui_item = null
    }

    private _openingUiids: string[] = []
    private _openedUiids: string[] = []

    checkOpened(uiid: string) {
        let index = this._openedUiids.indexOf(uiid)
        if (index > -1) {
            return true
        }
        return false
    }

    checkOpening(uiid: string) {
        let index = this._openingUiids.indexOf(uiid)
        if (index > -1) {
            return true
        }
        return false
    }

    /** 打开一个UI */
    async openUIAsync(uiid: string, comp: BaseModelComp): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (this.checkOpening(uiid)) {
                console.error('已经在打开中,uiid=' + uiid)
                resolve(false)
            } else {
                this._openingUiids.push(uiid)
                this._uiDrive.openUIAsyncByDrive(uiid, comp).then(() => {
                    let _index = this._openingUiids.indexOf(uiid)
                    this._openingUiids.splice(_index, 1);
                    this._openedUiids.push(uiid)
                    resolve(true)
                }).catch(() => {
                    resolve(false)
                })
            }
        });
    }

    /** 移除ui */
    removeUI(uiid: string) {
        this._uiDrive.removeUI(uiid)
        let _index = this._openedUiids.indexOf(uiid)
        this._openedUiids.splice(_index, 1);
    }
}