import { BaseTable } from "@aixh-cc/xhgame_ec_framework";
import { TableType } from "../../MyTableManager";


export class SkillTable<T> extends BaseTable<T> {
    name = TableType.skill;
    // 技能有特殊的需求（融合技能值）
    getSkillItem(skill_id: number): ISkillTableItem {
        let skill_id_str = skill_id.toString()
        let a_level_str = skill_id_str.substring(4, 5)
        let b_level_str = skill_id_str.substring(5, 6)
        if (a_level_str == '0' || b_level_str == '0') {
            console.log('非融合技能')
            return this.getInfo(skill_id) as ISkillTableItem
        }
        // 获取混合后的技能值，主要取最大的skill_point,skill_values取最大的倍数
        let a = skill_id - parseInt(skill_id_str.substring(5, 6))
        let b = skill_id - parseInt(skill_id_str.substring(4, 5)) * 10
        let a_skill: ISkillTableItem = JSON.parse(JSON.stringify(this.getInfo(a)))
        let b_skill: ISkillTableItem = JSON.parse(JSON.stringify(this.getInfo(b)))
        // 默认合并到a上面
        if (b_skill.skill_points.length > a_skill.skill_points.length) {
            a_skill.skill_points = b_skill.skill_points
            console.log('取了b的最大的范围')
        } else {
            console.log('取了a的最大的范围')
        }
        if (b_skill.skill_values.sum() > a_skill.skill_values.sum()) {
            a_skill.skill_values = b_skill.skill_values
            console.log('取了b的最大的values', a_skill.skill_values.sum(), b_skill.skill_values.sum())
        } else {
            console.log('取了a的最大的values', a_skill.skill_values.sum(), b_skill.skill_values.sum())
        }
        if (b_skill.skill_multiple > a_skill.skill_multiple) {
            a_skill.skill_multiple = b_skill.skill_multiple
            console.log('取了b的最大的倍数')
        } else {
            console.log('取了a的最大的倍数')
        }
        if (b_skill.skill_nums > a_skill.skill_nums) {
            a_skill.skill_nums = b_skill.skill_nums
            console.log('取了b的最大skill_nums')
        } else {
            console.log('取了a的最大skill_nums')
        }
        for (let i = 0; i < a_skill.skill_values.length; i++) {
            // 计算最终的伤害
            a_skill.skill_values[i] = Math.round(a_skill.skill_values[i] * a_skill.skill_multiple) // 四舍五入取整
        }
        a_skill.id = skill_id
        console.log('融合后的技能', a_skill)
        return a_skill as ISkillTableItem;
    }
}
export interface ISkillTableItem {
    id: number,
    name: string,
    describe: string,
    icon_no: string,
    effect_no: string,
    val: number,
    skill_type: number,
    skill_nums: number,
    skill_values: number[],
    skill_points: number[][],
    audio_no: string,
    /** 技能伤害倍数 */
    skill_multiple: number
}
