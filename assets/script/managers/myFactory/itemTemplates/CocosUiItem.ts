import { Button, UITransform, Animation, _decorator, color, Component, instantiate, Label, Node, Prefab, Sprite, v3 } from "cc"
import { BaseCocosItem } from "./BaseCocosItem";
import { IItemProduceDrive } from "@aixh-cc/xhgame_ec_framework";
import { IUiItem } from "./consts/Interfaces";
import { xhgame } from "db://assets/script/xhgame";
import { CocosBaseItemView } from "db://assets/script/views/CocosBaseItemView";

const { ccclass, property } = _decorator;


@ccclass('CocosUiItem')
export class CocosUiItem extends BaseCocosItem implements IUiItem {
    static className = 'CocosUiItem'
    /** 部分ui用到的组里的index */
    itemsIndex: number = -1
    /** 大小信息 */
    _scales: number[] = [1, 1, 1]
    get scales() {
        return this._scales
    }
    set scales(val) {
        this._scales = val
        this.node.setScale(v3(...val))
    }
    _active: boolean = true
    get active() {
        return this._active
    }
    set active(val) {
        this._active = val
        this.node.active = val
    }
    _btnActive: boolean = true
    get btnActive() {
        return this._btnActive
    }
    set btnActive(val) {
        this._btnActive = val
        this.node.getComponent(Button).interactable = val
    }
    _nodeName: string = ''
    get nodeName() {
        if (this._nodeName == '') {
            this._nodeName = this.node.name
        }
        return this._nodeName
    }
    set nodeName(val) {
        this._nodeName = val
        this.node.name = val
    }
    onClickCallback: Function = null
    reset() {
        // 数据层
        this.itemsIndex = -1
        this.scales = [1, 1, 1] // 此处用this.scales
        this.active = true
        this.nodeName = CocosUiItem.className
        this.onClickCallback = null
    }
    clone() {

    }
    getModelView() {
        let _baseview = this.node.getComponentInChildren(CocosBaseItemView)
        if (_baseview) {
            return _baseview
        } else {
            console.error('【CocosUiItem】BaseView is null')
        }
    }

    // todo 移除，由模板驱动
    playAnim(animName: string): void {
        let _anim = this.node.getChildByName('modelBody').getComponentInChildren(Animation)
        if (_anim) {
            console.log('_anim', _anim, animName)
            _anim.play(animName)
        } else {
            console.error('【CocosUiItem】.playAnim anim is null')
        }
    }

    toScene(nodePath: string = ''): void {
        const gui_root = xhgame.gui.gui_root as Node
        if (nodePath != '') {
            gui_root.getChildByPath(nodePath).addChild(this.node)
            return
        }
        let toSceneNodePath = this.node.getComponentInChildren(CocosBaseItemView).toSceneNodePath
        if (toSceneNodePath == '') {
            gui_root.addChild(this.node)
        } else {
            gui_root.getChildByPath(toSceneNodePath).addChild(this.node)
        }
    }
    toPool(): void {
        xhgame.factory.actions.removeUiItem(this)
    }
    // todo 剥离
    moveToUiRootPath(sec: number = 1, path: string, children_index: number = -1, offsetX: number = 0, offsetY: number = 0) {
        return new Promise((resolve, reject) => {
            xhgame.timer.scheduleOnce(() => {
                resolve(true)
            }, sec * 1000)
        })
        // return new Promise((resolve, reject) => {
        //     let targetNode = find('root/UICanvas/' + path)
        //     if (targetNode) {
        //         if (children_index > -1) {
        //             targetNode = targetNode.children.length > 0 ? targetNode.children[children_index] : targetNode
        //         }
        //     }
        //     let new_position = NodeUtil.calculateASpaceToBSpacePos(targetNode.parent, this.node.parent, targetNode.position)
        //     tween(this.node).to(sec, { position: v3(new_position.x + offsetX, new_position.y + offsetY, 0) })
        //         .call(() => {
        //             // 动画完成后触发的事件
        //             resolve(true)
        //         }).start();
        // })
    }

    onClickItem() {
        console.log('onClickItem,this.itemNo=' + this.itemNo)
        this.onClickCallback && this.onClickCallback(this)
    }

}
export class CocosUiItemFactoryDrive extends Component implements IItemProduceDrive {
    private _prefab: Prefab
    private _modelPrefabsMap: Map<string, Prefab> = new Map();
    // protected onLoad(): void {
    //     this.preloadItemsResource()
    // }
    releaseItemsResource(itemNos?: string[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }
    async preloadItemsResource(): Promise<boolean> {
        console.log('CocosUiItemFactoryDrive preloadItemsResource 44')
        return new Promise((resolve, reject) => {
            xhgame.asset.loadBundle('bundle_factory', (err, bundle) => {
                bundle.load<Prefab>('item_templates/cocosUiItem', (errp, prefab: Prefab) => {
                    if (errp) {
                        console.error(errp)
                        reject(false)
                        return
                    }
                    this._prefab = prefab
                    // console.log('this.prefab', this._prefab)
                    bundle.loadDir<Prefab>('item_views/uiItems', (errp, prefabs: Prefab[]) => {
                        if (errp) {
                            console.error(errp)
                            reject(false)
                            return
                        }
                        prefabs.forEach((_prefab: Prefab) => {
                            if (_prefab instanceof Prefab && _prefab.name != '') {
                                this._modelPrefabsMap.set(_prefab.name, _prefab)
                            }
                        })
                        // console.log('this._modelPrefabsMap', this._modelPrefabsMap)
                        resolve(true)
                    })
                })

            })
        })
    }

    createItem(itemNo: string, itemId: number) {
        let node = instantiate(this._prefab);
        let modelNode = instantiate(this._modelPrefabsMap.get(itemNo))
        node.getChildByName('modelBody').addChild(modelNode)
        let itemUITransform = node.getComponent(UITransform)
        let bodyUITransform = modelNode.getComponent(UITransform)
        itemUITransform.setContentSize(bodyUITransform.contentSize)
        // console.log('【====真实创建====】.prefab node', node)
        return node.getComponent(CocosUiItem)
    }
    removeItem(item: CocosUiItem) {
        // console.log('removeItem(item: CocosUiItem)')
        item.node.removeFromParent()
    }
}