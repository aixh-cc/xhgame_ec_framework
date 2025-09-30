import { BaseModelComp } from "../EC/BaseModelComp"
import { IUiDrive } from "./UiDrive"

export class TestUiDrive implements IUiDrive {

    mock_gui_root: any = { name: 'gui_root' }
    mock_world_root: any = { name: 'world_root' }
    openUIAsyncByDrive(uiid: string, comp: BaseModelComp) {
        return new Promise<boolean>((resolve, reject) => {
            setTimeout(() => {
                console.log('1秒后模拟打开，uiid=' + uiid)
                resolve(true)
            }, 1000)
        })
    }
    removeUI(uiid: string) {

    };
    getGuiRoot() {
        console.log('模拟获取gui_root')
        return this.mock_gui_root
    }
    getWorldRoot() {
        console.log('模拟获取world_root')
        return this.mock_world_root
    };
    getUI() {
        console.error('xhgame.ui使用不当,不支持 getUI')
    }
    toast(msg: string) {
        console.log(msg)
    }
    isloading: boolean = false
    loading() {
        this.isloading = true
        console.log('loading')
    }
    loaded() {
        this.isloading = false
        console.log('loaded')
    }
}