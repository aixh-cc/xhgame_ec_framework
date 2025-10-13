import { _decorator, assetManager, Component, instantiate, math, Node, Prefab, ResolutionPolicy, screen, UITransform, view } from "cc";
import { BaseModelComp, DI, IUiDrive } from "@aixh-cc/xhgame_ec_framework";
import { xhgame } from "../xhgame";
import { IUiItem } from "../managers/myFactory/MyFactorys";
import { BaseView } from "../../../extensions/xhgame_plugin/assets/ccComponent/BaseView";

const { ccclass } = _decorator;

@ccclass('CocosUiDrive')
export class CocosUiDrive extends Component implements IUiDrive {
    /** map */
    nodeMap: Map<string, Node> = new Map();
    uuidCompNameMap: Map<string, string> = new Map();

    getGuiRoot(): Node {
        return this.node
    }
    getWorldRoot(): Node {
        return this.node!.parent!.getChildByName('3dWorld')!
    }
    getUI(uiid: string): Node {
        return this.nodeMap.get(uiid)!
    }

    removeUI(uiid: string) {
        let node: Node = this.nodeMap.get(uiid)!
        if (node) {
            node.active = false
            node.removeFromParent();
        }
    };
    toast(msg: string) {
        let item = xhgame.factory.actions.createTextUiItem('toast')
        item.content = msg
        item.playTime = 1
        item.toScene()
    }
    private loading_ui_item: IUiItem = null
    loading() {
        if (this.loading_ui_item) {
            this.loading_ui_item.toPool()
        }
        this.loading_ui_item = xhgame.factory.actions.createUiItem('loading_tips_item')
        this.loading_ui_item.toScene()
    }
    loaded() {
        if (this.loading_ui_item) {
            this.loading_ui_item.toPool()
        }
        this.loading_ui_item = null
    }

    openUIAsyncByDrive(uiid: string, comp: BaseModelComp) {
        return new Promise<boolean>((resolve, reject) => {
            let get_uuid_compname = this.uuidCompNameMap.get(uiid)
            if (!get_uuid_compname) {
                this.uuidCompNameMap.set(uiid, comp.compName)
            } else {
                if (get_uuid_compname != comp.compName) {
                    console.error('目前uiid只能对应唯一的comp')
                    reject(false)
                }
            }
            let node = this.nodeMap.get(uiid)
            if (!node) {
                let bundle_name = 'resources'
                let res_path = uiid
                if (uiid.indexOf('bundle_') > -1) {
                    let _arr = uiid.split('://')
                    bundle_name = _arr[0]
                    res_path = _arr[1]
                }
                assetManager.loadBundle(bundle_name, (err, bundle) => {
                    bundle.load(res_path, Prefab, (err, prefab) => {
                        if (err) {
                            console.error('Failed to load prefab:', err);
                            return;
                        }
                        let node = instantiate(prefab);
                        node.active = true
                        let ccview = node.getComponent(BaseView)!
                        // console.log('ccview', ccview)
                        ccview.setViewComp(comp)
                        this.nodeMap.set(uiid, node)
                        if (xhgame.gui.gui_root.children[xhgame.gui.gui_root.children.length - 1].name == 'loading') {
                            xhgame.gui.gui_root.insertChild(node, xhgame.gui.gui_root.children.length - 2)
                        } else {
                            xhgame.gui.gui_root.addChild(node) // 按先后add
                        }
                        resolve(true)
                    });
                });

            } else {
                node.active = true
                if (xhgame.gui.gui_root.children[xhgame.gui.gui_root.children.length - 1].name == 'loading') {
                    xhgame.gui.gui_root.insertChild(node, xhgame.gui.gui_root.children.length - 2)
                } else {
                    xhgame.gui.gui_root.addChild(node) // 按先后add
                }
                resolve(true)
            }
        });
    }

    /** 界面层矩形信息组件 */
    transform!: UITransform;

    /** 是否为竖屏显示 */
    portrait!: boolean;
    /** 竖屏设计尺寸 */
    private portraitDrz: math.Size = null!;
    /** 横屏设计尺寸 */
    private landscapeDrz: math.Size = null!;

    onLoad() {
        this.init();
        DI.bindInstance('IUiDrive', this)
    }

    /** 初始化引擎 */
    protected init() {
        this.transform = this.getComponent(UITransform)!;
        // this.camera = this.getComponentInChildren(Camera)!;

        if (view.getDesignResolutionSize().width > view.getDesignResolutionSize().height) {
            this.landscapeDrz = view.getDesignResolutionSize();
            this.portraitDrz = new math.Size(this.landscapeDrz.height, this.landscapeDrz.width);
        }
        else {
            this.portraitDrz = view.getDesignResolutionSize();
            this.landscapeDrz = new math.Size(this.portraitDrz.height, this.portraitDrz.width);
        }

        this.resize();
    }

    /** 游戏画布尺寸变化 */
    resize() {
        let dr;
        if (view.getDesignResolutionSize().width > view.getDesignResolutionSize().height) {
            dr = this.landscapeDrz;
        }
        else {
            dr = this.portraitDrz
        }

        var s = screen.windowSize;
        var rw = s.width;
        var rh = s.height;
        var finalW = rw;
        var finalH = rh;

        if ((rw / rh) > (dr.width / dr.height)) {
            // 如果更长，则用定高
            finalH = dr.height;
            finalW = finalH * rw / rh;
            this.portrait = false;
        }
        else {
            // 如果更短，则用定宽
            finalW = dr.width;
            finalH = finalW * rh / rw;
            this.portrait = true;
        }

        // 手工修改canvas和设计分辨率，这样反复调用也能生效。
        view.setDesignResolutionSize(finalW, finalH, ResolutionPolicy.UNKNOWN);
        this.transform!.width = finalW;
        this.transform!.height = finalH;
        xhgame.game.screen.w = finalW
        xhgame.game.screen.h = finalH

        console.log(dr, "设计尺寸");
        console.log(s, "屏幕尺寸");
    }


}