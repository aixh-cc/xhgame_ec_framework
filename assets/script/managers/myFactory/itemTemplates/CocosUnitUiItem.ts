import { _decorator, CCString, Camera, Component, instantiate, Label, Node, Prefab, v3, Vec3 } from "cc"
import { BaseCocosItem } from "./BaseCocosItem";
import { IItemProduceDrive } from "@aixh-cc/xhgame_ec_framework";
import { IUnitItem, IUnitUiItem } from "./consts/Interfaces";
import { xhgame } from "db://assets/script/xhgame";
const { ccclass, property } = _decorator;


@ccclass('CocosUnitUiItem')
export class CocosUnitUiItem extends BaseCocosItem implements IUnitUiItem {
    static className = 'CocosUnitUiItem'
    //
    private _atUnitItem: IUnitItem = null
    get atUnitItem() {
        return this._atUnitItem
    }
    set atUnitItem(val) {
        this._atUnitItem = val
    }
    offsetPositions: number[] = [0, 0, 0]
    _active: boolean = true
    get active() {
        return this._active
    }
    set active(val) {
        this._active = val
        this.node.active = val
    }
    @property
    _content: string = ''
    @property({ type: CCString, visible: true })
    get content() {
        return this._content
    }
    set content(val) {
        this._content = val
        if (this.getComponentInChildren(Label)) {
            this.getComponentInChildren(Label).string = val
        }
    }
    reset() {
        this._atUnitItem = null
        this.offsetPositions = [0, 0, 0]
        this.active = true
        this.content = ''
    }
    clone() {

    }
    toScene(): void {
        const gui_root = xhgame.gui.gui_root as Node
        gui_root.getChildByName('unitUiItems').addChild(this.node)
        this.refreshHP()
    }
    toPool(): void {
        xhgame.factory.actions.removeUnitUiItem(this)
    }

    /** 当位置或者初始化时更新一下 */
    refreshHP(): void {
        if (this.atUnitItem && this.atUnitItem.node) {
            var outPos: Vec3 = v3(0, 0, 0);
            let atUnitItemNode: Node = this.atUnitItem.node
            const world_root = xhgame.gui.world_root as Node
            const gui_root = xhgame.gui.gui_root as Node
            world_root.getChildByName('CenterNode').getChildByName('CameraNode').getComponentInChildren(Camera).convertToUINode(atUnitItemNode.worldPosition, gui_root, outPos);
            outPos.add(v3(...this.offsetPositions));
            // this.node.setPosition(outPos);
            this.positions = [outPos.x, outPos.y, outPos.z]
        }
    }
    protected update(dt: number): void {
        this.refreshHP() // todo 
    }

}
export class CocosUnitUiItemFactoryDrive extends Component implements IItemProduceDrive {
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
        console.log('CocosUnitUiItemFactoryDrive preloadItemsResource 66')
        return new Promise((resolve, reject) => {
            xhgame.asset.loadBundle('bundle_factory', (err, bundle) => {
                bundle.load<Prefab>('item_templates/cocosUnitUiItem', (errp, prefab: Prefab) => {
                    if (errp) {
                        console.error(errp)
                    }
                    this._prefab = prefab
                    // console.log('this.prefab', this._prefab)
                    bundle.loadDir<Prefab>('item_views/unitUiItems', (errp, prefabs: Prefab[]) => {
                        if (errp) {
                            console.error(errp)
                        }
                        prefabs.forEach((_prefab: Prefab) => {
                            if (_prefab instanceof Prefab && _prefab.name != '') {
                                this._modelPrefabsMap.set(_prefab.name, _prefab)
                            }
                        })
                        resolve(true)
                        // console.log('this._modelPrefabsMap', this._modelPrefabsMap)
                    })
                })

            })
        })
    }

    createItem(itemNo: string, itemId: number) {
        let node = instantiate(this._prefab);
        let modelNode = instantiate(this._modelPrefabsMap.get(itemNo))
        node.getChildByName('modelBody').addChild(modelNode)
        // console.log('【====真实创建====】.prefab node', node)
        return node.getComponent(CocosUnitUiItem)
    }
    removeItem(item: CocosUnitUiItem) {
        // console.log('removeItem(item: CocosUnitUiItem)')
        item.node.removeFromParent()
    }
}