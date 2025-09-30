import { BaseModelComp } from "../EC/BaseModelComp"

export interface IUiDrive {
    openUIAsyncByDrive: (uiid: string, comp: BaseModelComp) => Promise<boolean>
    removeUI: (uiid: string) => void
    getGuiRoot: () => any
    getWorldRoot: () => any
    getUI: (uiid: string) => any
    toast: (msg: string) => void
    loading: () => void
    loaded: () => void
}