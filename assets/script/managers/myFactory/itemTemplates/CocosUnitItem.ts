import { _decorator, Component, instantiate, Label, Node, Prefab, SkeletalAnimation, v3 } from "cc"
import { CCBoolean } from "cc";
import { BaseCocosItem } from "./BaseCocosItem";
import { IItemProduceDrive } from "@aixh-cc/xhgame_ec_framework";
import { xhgame } from "db://assets/script/xhgame";
import { IUnitItem, IUnitUiItem } from "./consts/Interfaces";

const { ccclass, property } = _decorator;


@ccclass('CocosUnitItem')
export class CocosUnitItem extends BaseCocosItem implements IUnitItem {
    static className = 'CocosUnitItem'
    unitUiItemCode: string = 'blood'
    // unique_code: string = ''
    /** 是否是玩家单位 */
    @property
    _owner_is_player: boolean = false
    @property({ type: CCBoolean, visible: true })
    get owner_is_player() {
        return this._owner_is_player
    }
    set owner_is_player(val) {
        this._owner_is_player = val
    }

    /** 是否显示 */
    _active: boolean = true
    get active() {
        return this._active
    }
    set active(val) {
        this._active = val
        this.node.active = val
        this.bloodUnitUiItem.active = val
    }
    /** 当前hp */
    _hp: number = 0
    get hp() {
        return this._hp
    }
    set hp(val) {
        if (val < 0) {
            val = 0
        }
        this._hp = val
        this.bloodUnitUiItem.content = val.toString()
    }
    /** 最大hp */
    _maxHp: number = 0
    get maxHp() {
        return this._maxHp
    }
    set maxHp(val) {
        this._maxHp = val
    }
    // /** 单位编号 */
    // _code: number = 0
    // get code() {
    //     return this._code
    // }
    // set code(val) {
    //     this._code = val
    // }
    idle(): void {
        // this.state.stand()
    }
    die(): void {
        // this.state.die()
    }
    /** 当前单位状态(只能通过方法修改) */
    private _bloodUnitUiItem: IUnitUiItem = null
    get bloodUnitUiItem() {
        if (this._bloodUnitUiItem == null) {
            this._bloodUnitUiItem = xhgame.factory.actions.createUnitUiItem(this.unitUiItemCode)
            this._bloodUnitUiItem.atUnitItem = this
            this._bloodUnitUiItem.offsetPositions = [-10, 30, 0]
        }
        return this._bloodUnitUiItem
    }

    /** 获取单位状态 */
    state: any
    // private _state: IUnitState
    // get state(): IUnitState {
    //     if (this._state == null) {
    //         this.state = new StandingState()
    //     }
    //     return this._state;
    // }
    // /** 设置单位状态 */
    // set state(state: IUnitState) {
    //     this._state = state;
    //     state.enterState(this);
    // }
    getModelName() {
        return this.itemNo
    }
    /** 单位动画 */
    public animator: any
    // UnitAnimator = UnitAnimator.getInstance()
    /** 部分单位状态动态没有很快达到，需要onToScene来实现 */
    onToScene: Function = null
    reset() {
        this.idle()
        // this.unique_code = ''
        this._owner_is_player = false
        this.positions = [0, 0, 0]
        this._hp = 0
        this._maxHp = 0
        this._active = true
        this.onToScene = null
        this._bloodUnitUiItem = null
    }
    lookAt(x: number = 0, y: number = 0, z: number = 0) {

    }
    clone() {

    }
    toScene(): void {
        const world_root = xhgame.gui.world_root as Node
        world_root.getChildByPath('CenterNode/UnitsNode').addChild(this.node)
        this.onToScene && this.onToScene()
        this.bloodUnitUiItem.toScene()
        // 下一帧播放触发onToScene
        requestAnimationFrame(() => {
            this.onToScene && this.onToScene()
        })
    }
    toPool(): void {
        xhgame.factory.actions.removeUnitItem(this)
    }
}
export class CocosUnitItemFactoryDrive extends Component implements IItemProduceDrive {
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
        console.log('CocosUnitItemFactoryDrive preloadItemsResource 55')
        return new Promise((resolve, reject) => {
            xhgame.asset.loadBundle('bundle_factory', (err, bundle) => {
                bundle.load<Prefab>('item_templates/cocosUnitItem', (errp, prefab: Prefab) => {
                    if (errp) {
                        console.error(errp)
                        reject(false)
                        return
                    }
                    this._prefab = prefab
                    // console.log('this.prefab', this._prefab)
                    bundle.loadDir<Prefab>('item_views/unitItems', (errp, prefabs: Prefab[]) => {
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
                        console.log('this._modelPrefabsMap', this._modelPrefabsMap)
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
        node.name = node.name + '_' + itemId
        // console.log('【====真实创建====】.prefab node', node)
        return node.getComponent(CocosUnitItem)
    }
    removeItem(item: CocosUnitItem) {
        // console.log('removeItem(item: CocosUnitItem)')
        item.node.removeFromParent()
    }
}



// export class UnitAnimator implements IUnitAnimator {
//     private static _instance: UnitAnimator = new this()
//     static get instance(): UnitAnimator {
//         return this._instance
//     }
//     static getInstance() {
//         return this._instance
//     }
//     // 待机动作
//     idle(bodyNode: Node): void {
//         // let animator = bodyNode.getComponent(SkeletalAnimation);
//         // let state_name = 'idle'
//         // let alias = bodyNode.getComponent(AnimatorAlias);
//         // if (alias) {
//         //     state_name = alias.idleAlias
//         // }
//         // if (animator) {
//         //     let aniState = animator.getState(state_name);
//         //     if (aniState) {
//         //         aniState.speed = 1;
//         //     }
//         //     animator.play(state_name);
//         // }
//     }
//     // 跑步动作
//     run(bodyNode: Node): void {
//         console.log('run')
//         // let animator = bodyNode.getComponent(SkeletalAnimation);
//         // let state_name = 'run'
//         // let alias = bodyNode.getComponent(AnimatorAlias);
//         // if (alias) {
//         //     state_name = alias.runAlias
//         // }
//         // if (animator) {
//         //     let aniState = animator.getState(state_name);
//         //     if (aniState) {
//         //         aniState.speed = 1;
//         //     }
//         //     animator.play(state_name);
//         // }
//     }
//     attack(bodyNode: Node): void {
//         console.log('attack 0000000')
//         // let animator = bodyNode.getComponent(SkeletalAnimation);
//         // let state_name = 'attack'
//         // let alias = bodyNode.getComponent(AnimatorAlias);
//         // if (alias) {
//         //     state_name = alias.attackAlias
//         // }
//         // if (animator) {
//         //     let aniState = animator.getState(state_name);
//         //     if (aniState) {
//         //         aniState.speed = 1;
//         //     }
//         //     animator.play(state_name);
//         // }
//     }
//     skill(bodyNode: Node): void {
//         // let animator = bodyNode.getComponent(SkeletalAnimation);
//         // let state_name = 'skill'
//         // let alias = bodyNode.getComponent(AnimatorAlias);
//         // if (alias) {
//         //     state_name = alias.skillAlias
//         // }
//         // if (animator) {
//         //     let aniState = animator.getState(state_name);
//         //     if (aniState) {
//         //         aniState.speed = 1;
//         //     }
//         //     animator.play(state_name);
//         // }
//     }
//     stun(bodyNode: Node): void {
//         // let animator = bodyNode.getComponent(SkeletalAnimation);
//         // let state_name = 'stun'
//         // let alias = bodyNode.getComponent(AnimatorAlias);
//         // if (alias) {
//         //     state_name = alias.stunAlias
//         // }
//         // if (animator) {
//         //     let aniState = animator.getState(state_name);
//         //     if (aniState) {
//         //         aniState.speed = 1;
//         //     }
//         //     animator.play(state_name);
//         // }
//     }
//     die(bodyNode: Node): void {
//         // let animator = bodyNode.getComponent(SkeletalAnimation);
//         // let state_name = 'die'
//         // let alias = bodyNode.getComponent(AnimatorAlias);
//         // if (alias) {
//         //     state_name = alias.dieAlias
//         // }
//         // if (animator) {
//         //     let aniState = animator.getState(state_name);
//         //     if (aniState) {
//         //         aniState.speed = 1;
//         //     }
//         //     animator.play(state_name);
//         // }
//     }
// }
// 单位动画
// export interface IUnitAnimator {
//     idle(bodyNode: Node): void
//     run(bodyNode: Node): void
//     attack(bodyNode: Node): void
//     skill(bodyNode: Node): void
//     stun(bodyNode: Node): void
//     die(bodyNode: Node): void
// }