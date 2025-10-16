import { IGoodsItem } from "../../../../../extensions/xhgame_plugin/assets/tsshared/defined/Interface";
import { BaseTable } from "@aixh-cc/xhgame_ec_framework";
import { TableType } from "../../MyTableManager";

export interface IWinCondition {
    unitNo: string
    num: number
}

export class BattleTable<T> extends BaseTable<T> {
    name = TableType.battle;
}

export interface IBattleTableItem {
    id: number
    name: string
    describe: string
    max_step: number
    win_conditions: IWinCondition[]
    init_grid: number[]
    fix_shap: string[]
    fix_grow: number[]
    goods_items: IGoodsItem[]
    star_score: number[]
    score_settings: number[]
}