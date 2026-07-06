import { BaseModelComp } from "../EC/BaseModelComp"
import { IView } from "./View"

/** UI 驱动所需的最小节点能力。可由 Cocos `Node` 或其他 UI 节点类型扩展。 */
export interface INode {
    name: string
}

/**
 * UI 平台适配接口。
 *
 * `UiManager` 只负责打开状态和调用顺序，资源加载、节点实例化、层级挂载及销毁
 * 均由驱动实现。`openUIAsyncByDrive` 应在 UI 已可用时 resolve；失败时 reject
 * 或返回 `false`。
 */
export interface IUiDrive {
    /** 创建并显示 UI，同时将 `comp` 绑定到对应 View。 */
    openUIAsyncByDrive: (uiid: string, comp: BaseModelComp) => Promise<boolean>
    /** 从场景树中移除并释放指定 UI。 */
    removeUI: (uiid: string) => void
    /** 返回普通界面层根节点。 */
    getGuiRoot: () => INode
    /** 返回世界空间 UI 根节点。 */
    getWorldRoot: () => INode
    /** 返回当前最上层/首个 UI View。 */
    getFirstUIView: () => IView
    /** 按业务 UI id 查询节点。 */
    getUI: (uiid: string) => INode
    /** 显示短提示。 */
    toast: (msg: string) => void
    /** 显示加载状态；应与 `loaded` 成对调用。 */
    loading: () => void
    /** 结束加载状态。 */
    loaded: () => void
}
