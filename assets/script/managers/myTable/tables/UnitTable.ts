import { BaseTable } from "@aixh-cc/xhgame_ec_framework";
import { TableType } from "../../MyTableManager";

export class UnitTable<T> extends BaseTable<T> {
    name = TableType.unit;
}
export interface IUnitTableItem {
    id: number
    name: string // 单位名称
    describe: string // 说明
    unit_type: number // 单位类型
    skills: number[] // 技能ids
    model_no: string // 模型编号
    icon_no: string
    scale: number // 单位缩放比例
}