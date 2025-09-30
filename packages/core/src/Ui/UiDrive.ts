import { BaseModelComp } from "../EC/BaseModelComp"

export interface INode {
    name: string
}

export interface IUiDrive {
    openUIAsyncByDrive: (uiid: string, comp: BaseModelComp) => Promise<boolean>
    removeUI: (uiid: string) => void
    getGuiRoot: () => INode
    getWorldRoot: () => INode
    getUI: (uiid: string) => INode
    toast: (msg: string) => void
    loading: () => void
    loaded: () => void
}