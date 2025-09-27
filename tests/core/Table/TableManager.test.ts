import { assert, describe, test } from "poku";
import { TableManager } from "../../../packages/core/src/Table/TableManager";
import { BaseTable, TableConfig } from "../../../packages/core/src/Table/Table";


enum TableType {
    skill = "skill",
    unit = "unit",
}
class SkillTable<T> extends BaseTable<T> {
    name = TableType.skill;
}
interface ISkillTableItem {
    id: number,
    name: string,
}
class UnitTable<T> extends BaseTable<T> {
    name = TableType.unit;
}
interface IUnitTableItem {
    id: number,
    name: string,
}
class TestTableConfig extends TableConfig {
    [TableType.skill]: typeof SkillTable = SkillTable;
    [TableType.unit]: typeof UnitTable = UnitTable;
}
let json_data = {
    "1": {
        "id": 1,
        "name": "name1",
    },
    "2": {
        "id": 2,
        "name": "name2",
    }
}

const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试table功能', async () => {
            let tableManager = new TableManager<TestTableConfig>(new TestTableConfig())
            tableManager.autoRegister()
            assert.equal(tableManager.getTables().length, 2, '获取getTables正常')
            let skillTable = tableManager.getTable(TableType.skill);
            assert.equal(skillTable != null, true, '获取getTable正常')
            //
            if (skillTable) {
                let itemv1 = skillTable.getInfo(1)
                assert.equal(itemv1, undefined, '未初始化前getInfo为undefined')
                skillTable.init(json_data)
                let itemv2 = skillTable.getInfo(2)
                assert.equal(JSON.stringify(itemv2), '{"id":2,"name":"name2"}', '初始化后getInfo获取正常')
                let skilllist = skillTable.getList()
                assert.equal(JSON.stringify(skilllist), '[{"id":1,"name":"name1"},{"id":2,"name":"name2"}]', 'getList获取正常')
            }
            resolve(true)
        })
    })
}

let functions = [test_00]

describe('table功能', async () => {
    while (functions.length > 0) {
        let func = functions.shift()
        if (func) {
            await func()
            await waitXms() // 为了输出字幕顺序正常(poku的问题)
        }
    }
});
const waitXms = (ms: number = 0) => {
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}
