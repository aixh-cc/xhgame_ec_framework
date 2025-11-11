import { BaseModelComp, System } from "@aixh-cc/xhgame_ec_framework";
import { xhgame } from "db://assets/script/xhgame";
// import { IGoodsItem } from "../../tsshared/defined/Interface";
import { IBattleTableItem } from "../../managers/myTable/tables/BattleTable";

export class BattleModelSystem extends System {


}

export class BattleModelComp extends BaseModelComp {
    compName: string = 'BattleModelComp'
    initBySystems: (typeof System)[] = []
    /** 当前关卡 */
    private _curBattleTableItem: IBattleTableItem = null
    get curBattleTableItem() {
        return this._curBattleTableItem
    }
    set curBattleTableItem(val) {
        this._curBattleTableItem = val
        if (val) {
            this.maxRound = this._curBattleTableItem.max_step
            this.round = 0
        }
    }
    /** 当前回合 */
    private _round: number = 0
    get round() {
        return this._round
    }
    set round(val: number) {
        this._round = val
        this._remainStep = this.maxRound - this._round
    }
    /** 剩余出手次数 */
    private _remainStep: number = 0
    get remainStep() {
        return this._remainStep
    }
    /** 最大回合 */
    private _maxRound: number = -1
    get maxRound() {
        return this._maxRound
    }
    set maxRound(val) {
        this._maxRound = val
        this._remainStep = this._maxRound - this._round
    }
    // 游戏时间
    gameTime: number = 0
    score: number = 0
    star: number = 0
    // 
    canRuQiao: boolean = false
    ruQiaoActive: boolean = false
    magicValue: number = 0
    starValue: number = 0
    isStart: boolean = false
    isPlayerRound: boolean = false
    selectSkillDialogCount: number = 0

    actions = {

    }

    reset() {

        this.round = 0
        this.maxRound = 0
        this.curBattleTableItem = null
        // 
        this.gameTime = 0
        this.score = 0
        this.star = 0
        this.canRuQiao = false
        this.ruQiaoActive = false
        this.magicValue = 0
        this.starValue = 0
        this.isStart = false
        this.isPlayerRound = false
        this.selectSkillDialogCount = 0
    }
    onDetach(): void {

    }
}