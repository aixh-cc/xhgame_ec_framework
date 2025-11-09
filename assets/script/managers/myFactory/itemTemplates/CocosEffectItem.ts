import { _decorator, Component, instantiate, Label, Node, Prefab, v3 } from "cc"
import { Animation } from "cc";
import { BaseCocosItem } from "./BaseCocosItem";
import { IBundle, IItemProduceDrive } from "@aixh-cc/xhgame_ec_framework";
import { IEffectItem } from "./consts/Interfaces";
import { xhgame } from "db://assets/script/xhgame";

const { ccclass, property } = _decorator;


@ccclass('CocosEffectItem')
export class CocosEffectItem extends BaseCocosItem implements IEffectItem {
    static className = 'CocosEffectItem'
    node: Node = null
    /** 特效时间，单位秒 */
    effectTime: number = 0  // 特效持续时间
    onToScene: Function = null
    reset() {
        this.effectTime = 0
        this.onToScene = null
    }
    clone() {

    }
    toScene(): void {
        this.node.active = true
        const world_root = xhgame.gui.world_root as Node
        world_root.getChildByPath('CenterNode/UnitsNode').addChild(this.node)
        // 下一帧播放触发onToScene
        requestAnimationFrame(() => {
            this.onToScene && this.onToScene()
            // 特效基本播放完就回收了
            xhgame.timer.scheduleOnce(() => {
                this.toPool()
            }, this.effectTime * 1000)
        })
    }
    toPool(): void {
        let anis = this.node.getComponentsInChildren(Animation)
        for (let i = 0; i < anis.length; i++) {
            const _ani = anis[i];
            _ani.resume()
        }
        xhgame.factory.actions.removeEffectItem(this)
    }
}
export class CocosEffectItemProduceDrive extends Component implements IItemProduceDrive {
    name: string = 'CocosEffectItemProduceDrive'
    private _prefab: Prefab
    private _modelPrefabsMap: Map<string, Prefab> = new Map();
    // protected onLoad(): void {
    //     this.preloadItemsResource()
    // }
    constructor() {
        super()
    }
    releaseItemsResource(itemNos?: string[]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(true)
        })
    }

    async preloadItemsResource(): Promise<boolean> {
        console.log('CocosEffectItemFactoryDrive preloadItemsResource 11')
        return new Promise((resolve, reject) => {
            xhgame.asset.loadBundle('bundle_factory', (err, bundle: IBundle) => {
                bundle.load<Prefab>('item_templates/cocosEffectItem', (errp, prefab: Prefab) => {
                    if (errp) {
                        console.error(errp)
                        reject(false)
                        return
                    }
                    this._prefab = prefab
                    console.log('this.prefab', this._prefab)
                    bundle.loadDir<Prefab>('item_views/effectItems', (errp, prefabs: Prefab[]) => {
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
                        //console.log('this._modelPrefabsMap', this._modelPrefabsMap)
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
        // let anis = node.getChildByPath('modelBody').getComponentsInChildren(Animation)
        // console.log('effect anis', anis)
        // for (let i = 0; i < anis.length; i++) {
        //     const _ani = anis[i];
        //     _ani.play()
        // }
        return node.getComponent(CocosEffectItem)
    }
    removeItem(item: CocosEffectItem) {
        // console.log('removeItem(item: CocosEffectItem)')
        item.node.removeFromParent()
    }
}