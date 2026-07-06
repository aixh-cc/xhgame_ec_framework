import { BaseModelComp } from "../EC/BaseModelComp"
import { INode, IUiDrive } from "./UiDrive"
import { IView } from "./View"

/**
 * UI 管理器
 * - 提供 UI 根节点访问、打开/移除 UI、状态查询、Toast/Loading 控制
 * - 依赖具体 UI 驱动实现（`IUiDrive`）
 *
 * @example
 * ```ts
 * const ui = new UiManager<MyUiDrive, Node>(new MyUiDrive())
 * const opened = await ui.openUIAsync('player-detail', playerModel)
 * if (opened) ui.toast('打开成功')
 * ui.removeUI('player-detail')
 * ```
 * @typeParam T UI 驱动的具体类型
 * @typeParam NT UI 节点的具体类型
 */
export class UiManager<T extends IUiDrive, NT extends INode> {

    private _uiDrive: T

    /** 创建管理器。一个管理器通常对应一个 UI 驱动和一组 UI 根节点。 */
    constructor(uiDrive: T) {
        this._uiDrive = uiDrive
    }
    /** 获取原始 UI 驱动，以调用业务扩展能力。 */
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

    /** 查询 UI 是否已经打开。 */
    checkOpened(uiid: string) {
        let index = this._openedUiids.indexOf(uiid)
        if (index > -1) {
            return true
        }
        return false
    }

    /** 查询 UI 是否正在异步打开。 */
    checkOpening(uiid: string) {
        let index = this._openingUiids.indexOf(uiid)
        if (index > -1) {
            return true
        }
        return false
    }

    /**
     * 异步打开 UI
     *
     * 同一个 `uiid` 正在打开时直接返回 `false`。驱动抛错时会清理 opening 状态。
     * @param uiid 业务定义的 UI 唯一标识
     * @param comp 与 View 绑定的模型组件
     * @returns 驱动调用未抛错时为 `true`，否则为 `false`
     */
    async openUIAsync(uiid: string, comp: BaseModelComp): Promise<boolean> {
        if (this.checkOpening(uiid)) {
            console.error('已经在打开中,uiid=' + uiid)
            return false;
        }
        this._openingUiids.push(uiid)
        try {
            await this._uiDrive.openUIAsyncByDrive(uiid, comp);
            let _index = this._openingUiids.indexOf(uiid);
            if (_index > -1) {
                this._openingUiids.splice(_index, 1);
            }
            this._openedUiids.push(uiid);
            return true;
        } catch (err) {
            let _index = this._openingUiids.indexOf(uiid);
            if (_index > -1) {
                this._openingUiids.splice(_index, 1);
            }
            console.error(`[UiManager] 打开 UI "${uiid}" 失败:`, err);
            return false;
        }
    }

    /** 移除已打开的 UI，并同步更新管理器中的 opened 状态。 */
    removeUI(uiid: string) {
        this._uiDrive.removeUI(uiid)
        let _index = this._openedUiids.indexOf(uiid)
        if (_index > -1) {
            this._openedUiids.splice(_index, 1);
        }
    }
}
