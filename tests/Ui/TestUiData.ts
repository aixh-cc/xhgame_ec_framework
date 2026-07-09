import { BaseModelComp } from "../../src/EC/BaseModelComp"
import { ISystemStatic, System } from "../../src/EC/System"
import { SimpleBaseView } from "../../src/Ui/View"
import { INode, IUiDrive, IUiOpenOptions } from "../../src/Ui/UiDrive"
import { autoBindForDI, DI } from "../../src/DI/DI";

@autoBindForDI('TestView')
export class TestView extends SimpleBaseView implements ITestViewVM {
    name: string = 'TestView'
    tips: string = 'tips_default'
    person: {
        name: string,
        age: number,
        books: string[]
    } = {
            name: '',
            age: 0,
            books: []
        }
    personName: string = ''
    personAge: number = 0
    personBooks: string[] = []
    reset(): void {
        this.tips = ''
        this.personAge = 0
        this.personBooks = []
    }
    onLoad() {
        this.setBindAttrMap({
            "tips": 'TestViewComp::tips',
            "personName": 'TestViewComp::viewVM.person.name',
            "personAge": 'TestViewComp::viewVM.person.age',
            "personBooks": 'TestViewComp::viewVM.person.books',
        })
    }
    constructor() {
        super()
        this.onLoad()
    }
}

interface ITestViewVM {
    person: { name: string, age: number, books: string[] }
}

@autoBindForDI('TestViewComp')
export class TestViewComp extends BaseModelComp {
    compName: string = 'TestViewComp'
    initBySystems: ISystemStatic[] = []

    tips: string = 'tips_TestViewComp'

    viewVM: ITestViewVM | null = null
    actions = {

    }
    reset() {
        this.tips = 'wwww'
        this.viewVM = null
    }
    onDetach() {

    }
}

// 全局 ModelComp（模拟 PlayerAtlasModelComp 等全局数据组件）
@autoBindForDI('GlobalModelComp')
export class GlobalModelComp extends BaseModelComp {
    compName: string = 'GlobalModelComp'
    initBySystems: ISystemStatic[] = []

    globalData: string = 'global_default'
    count: number = 0

    reset() {
        this.globalData = 'global_default'
        this.count = 0
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
    compName: string = 'TestUiDrive'
    lastOpenOptions?: IUiOpenOptions
    getFirstUIView() {
        return new TestView()
    }
    mock_gui_root: INode = new TestNode('gui_root')
    mock_world_root: INode = new TestNode('world_root')
    openUIAsyncByDrive(uiid: string, comp: BaseModelComp, options?: IUiOpenOptions) {
        this.lastOpenOptions = options
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
