import { _decorator, CCBoolean, CCInteger, Label, Node } from "cc";
import { CocosBaseItemView } from "db://assets/script/uiViews/CocosBaseItemView";

const { ccclass, property, executeInEditMode } = _decorator;

export interface IMissionItemViewVM {
    starNum: number
    isFight: boolean // 相当于isSelected
    isActive: boolean
    battleId: number
    // isSelected: boolean
}

@ccclass('MissionItemView')
@executeInEditMode(true)
export class MissionItemView extends CocosBaseItemView implements IMissionItemViewVM {
    toSceneNodePath: string = 'gate_group_mission_dialog/items'
    /** 几星 */
    @property
    _starNum: number = 3;
    @property({ type: CCInteger, visible: true })
    get starNum() {
        return this._starNum
    }
    set starNum(val) {
        this._starNum = val
        if (this.starNum == 0) {
            this.node.getChildByName('stars').children.forEach((_node: Node) => {
                _node.getChildByName('xing').active = false
            })
        } else {
            this.node.getChildByName('stars').children.forEach((_node: Node, _index: number) => {
                if (_index <= (this.starNum - 1)) {
                    _node.getChildByName('xing').active = true
                } else {
                    _node.getChildByName('xing').active = false
                }
            })
        }
    }
    /** 是否正在战斗中 */
    @property
    _isFight: boolean = true;
    @property({ type: CCBoolean, visible: true })
    get isFight() {
        return this._isFight
    }
    set isFight(val) {
        this._isFight = val
        if (this.isFight) {
            this.node.getChildByName('fight').active = true
        } else {
            this.node.getChildByName('fight').active = false
        }
    }
    /** 是否可闯关 */
    @property
    _isActive: boolean = true;
    @property({ type: CCBoolean, visible: true })
    get isActive() {
        return this._isActive
    }
    set isActive(val) {
        this._isActive = val
        if (this.isActive) {
            this.node.getChildByName('body').getChildByName('zhan').active = true
            this.node.getChildByName('body').getChildByName('suo').active = false
            this.node.getChildByName('stars').active = true
        } else {
            this.node.getChildByName('body').getChildByName('zhan').active = false
            this.node.getChildByName('body').getChildByName('suo').active = true
            this.node.getChildByName('stars').active = false
        }
    }
    /** 文字第几关 */
    @property
    _battleId: number = 1;
    @property({ type: CCInteger, visible: true })
    get battleId() {
        return this._battleId
    }
    set battleId(val) {
        this._battleId = val
        this.node.getChildByName('battleInfo').getComponentInChildren(Label).string = this.battleId.toString()
    }

    reset(): void {
        this._starNum = 3
        this._isFight = false
        this._isActive = false
        this._battleId = 1
    }

}