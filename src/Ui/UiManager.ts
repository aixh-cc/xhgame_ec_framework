import { BaseModelComp } from "../EC/BaseModelComp"
import { INode, IUiDrive } from "./UiDrive"
import { IView } from "./View"

/**
 * UI 管理器
 * - 提供 UI 根节点访问、打开/移除 UI、状态查询、Toast/Loading 控制
 * - 依赖具体 UI 驱动实现（`IUiDrive`）
 * 使用示例：`tests/core/Ui/UiManager.test.ts`
 */
export class UiManager<T extends IUiDrive, NT extends INode> {

    private _uiDrive: T

    constructor(uiDrive: T) {
        this._uiDrive = uiDrive
    }
    getDrive() {
        return this._uiDrive
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
    getFirstUIView(): IView {
        return this._uiDrive.getFirstUIView() as IView
    }
    toast(msg: string) {
        this._uiDrive.toast(msg)
    }

    loading() {
        this._uiDrive.loading()
    }

    loaded() {
        this._uiDrive.loaded()
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
    /**
     * 异步打开 UI
     * - 避免重复打开：记录 opening/opened 状态
     */
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
    /** 移除已打开的 UI，并更新状态 */
    removeUI(uiid: string) {
        this._uiDrive.removeUI(uiid)
        let _index = this._openedUiids.indexOf(uiid)
        this._openedUiids.splice(_index, 1);
    }
}