import { BaseModelComp } from "../EC/BaseModelComp"
import { INode, IUiDrive, IUiOpenOptions } from "./UiDrive"
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

    private _openingUiids = new Set<string>()
    private _openedUiids = new Set<string>()

    /** 查询 UI 是否已经打开。 */
    checkOpened(uiid: string) {
        return this._openedUiids.has(uiid)
    }

    /** 查询 UI 是否正在异步打开。 */
    checkOpening(uiid: string) {
        return this._openingUiids.has(uiid)
    }

    /**
     * 异步打开 UI
     *
     * 同一个 `uiid` 正在打开时直接返回 `false`。驱动抛错时会清理 opening 状态。
     * @param uiid 业务定义的 UI 唯一标识
     * @param comp 与 View 绑定的模型组件
     * @param options UI 打开行为配置，由具体驱动解释
     * @returns 驱动调用未抛错时为 `true`，否则为 `false`
     */
    async openUIAsync(uiid: string, comp: BaseModelComp, options?: IUiOpenOptions): Promise<boolean> {
        if (this.checkOpening(uiid)) {
            console.error('已经在打开中,uiid=' + uiid)
            return false;
        }
        this._openingUiids.add(uiid)
        try {
            const opened = await this._uiDrive.openUIAsyncByDrive(uiid, comp, options);
            if (!opened) return false;
            if (!this._openingUiids.has(uiid)) return false;
            this._openedUiids.add(uiid);
            return true;
        } catch (err) {
            console.error(`[UiManager] 打开 UI "${uiid}" 失败:`, err);
            return false;
        } finally {
            this._openingUiids.delete(uiid);
        }
    }

    /** 与 openUIAsync 相同，但保留驱动异常供上层统一处理。 */
    async openUIOrThrow(uiid: string, comp: BaseModelComp, options?: IUiOpenOptions): Promise<void> {
        if (this.checkOpening(uiid)) throw new Error(`UI ${uiid} 已在打开中`);
        this._openingUiids.add(uiid);
        try {
            const opened = await this._uiDrive.openUIAsyncByDrive(uiid, comp, options);
            if (!opened) throw new Error(`UI ${uiid} 驱动返回打开失败`);
            if (!this._openingUiids.has(uiid)) throw new Error(`UI ${uiid} 打开期间已被取消`);
            this._openedUiids.add(uiid);
        } finally {
            this._openingUiids.delete(uiid);
        }
    }

    /** 移除已打开的 UI，并同步更新管理器中的 opened 状态。 */
    removeUI(uiid: string) {
        this._openingUiids.delete(uiid)
        this._uiDrive.removeUI(uiid)
        this._openedUiids.delete(uiid)
    }
}
