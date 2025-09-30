import { BaseModelComp } from "../../../packages/core/src/EC/BaseModelComp"
import { System } from "../../../packages/core/src/EC/System"
import { INode, IUiDrive } from "../../../packages/core/src/Ui/UiDrive"

export class TestViewComp extends BaseModelComp {
    compName: string = 'BattleOverViewComp'
    initBySystems: (typeof System)[] = []
    actions = {

    }
    reset() {

    }
    onDetach() {

    }
}

export class TestNode implements INode {
    name: string = ''
    constructor(name: string) {
        this.name = name
    }
}


export class TestUiDrive implements IUiDrive {

    mock_gui_root: INode = new TestNode('gui_root')
    mock_world_root: INode = new TestNode('world_root')
    openUIAsyncByDrive(uiid: string, comp: BaseModelComp) {
        return new Promise<boolean>((resolve, reject) => {
            setTimeout(() => {
                // console.log('0.1秒后模拟打开，uiid=' + uiid)
                resolve(true)
            }, 100)
        })
    }
    removeUI(uiid: string) {

    };
    getGuiRoot() {
        // console.log('模拟获取gui_root')
        return this.mock_gui_root
    }
    getWorldRoot() {
        // console.log('模拟获取world_root')
        return this.mock_world_root
    };
    getUI(uiid: string) {
        let _ui_node = new TestNode(uiid)
        return _ui_node
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