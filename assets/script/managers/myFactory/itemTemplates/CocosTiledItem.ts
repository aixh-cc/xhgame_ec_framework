import { _decorator, Component, instantiate, Label, Node, Prefab, v3 } from "cc"
import { BaseCocosItem } from "./BaseCocosItem";
import { IItemProduceDrive } from "@aixh-cc/xhgame_ec_framework";
import { xhgame } from "db://assets/script/xhgame";
import { ITiledItem } from "./consts/Interfaces";

const { ccclass, property } = _decorator;

@ccclass('CocosTiledItem')
export class CocosTiledItem extends BaseCocosItem implements ITiledItem {
    static className = 'CocosTiledItem'
    /** 部分ui用到的组里的index */
    itemsIndex: number = 0
    reset() {
        this.itemsIndex = 0
    }
    clone() {

    }
    toScene(): void {
        const world_root = xhgame.gui.world_root as Node
        world_root.getChildByPath('CenterNode/TiledsNode').addChild(this.node)
    }
    toPool(): void {
        xhgame.factory.actions.removeTiledItem(this)
    }
}
export class CocosTiledItemFactoryDrive extends Component implements IItemProduceDrive {
    private _prefab: Prefab
    private _modelPrefabsMap: Map<string, Prefab> = new Map();

    protected onLoad(): void {
        // this.preloadItemsResource()
    }
    releaseItemsResource(itemNos?: string[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }
    async preloadItemsResource(): Promise<boolean> {
        console.log('CocosTiledItemFactoryDrive preloadItemsResource 33')
        return new Promise((resolve, reject) => {
            xhgame.asset.loadBundle('bundle_factory', (err, bundle) => {
                bundle.load<Prefab>('item_templates/cocosTiledItem', (errp, prefab: Prefab) => {
                    if (errp) {
                        console.error(errp)
                        reject(false)
                        return
                    }
                    this._prefab = prefab
                    // console.log('this.prefab', this._prefab)
                    bundle.loadDir<Prefab>('item_views/tiledItems', (errp, prefabs: Prefab[]) => {
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
        // console.log('【====真实创建====】.prefab node', node)
        return node.getComponent(CocosTiledItem)
    }
    removeItem(item: CocosTiledItem) {
        // console.log('removeItem(item: CocosTiledItem)')
        item.node.removeFromParent()
    }
}