import { assert, describe, test } from "poku";
import { BaseTable, ITableMap, TableManager } from "../../../packages/core/src/Table/TableManager";


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
class TestTableMap implements ITableMap {
    [TableType.skill]!: SkillTable<ISkillTableItem>
    [TableType.unit]!: UnitTable<IUnitTableItem>
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
            let tableManager = new TableManager<TestTableMap>()
            tableManager.register(new SkillTable())
            tableManager.register(new UnitTable())
            testCheck('获取getTables正常', tableManager.getTables().length, 2)
            let skillTable = tableManager.getTable(TableType.skill);
            testCheck('获取getTable正常', skillTable != null, true)
            //
            if (skillTable) {
                let itemv1 = skillTable.getInfo(1)
                testCheck('未初始化前getInfo为undefined', itemv1, undefined)
                skillTable.init(json_data)
                let itemv2 = skillTable.getInfo(2)
                testCheck('初始化后getInfo获取正常', JSON.stringify(itemv2), '{"id":2,"name":"name2"}')
                let skilllist = skillTable.getList()
                testCheck('getList获取正常', JSON.stringify(skilllist), '[{"id":1,"name":"name1"},{"id":2,"name":"name2"}]')
            }
            resolve(true)
        })
    })
}

let functions = [test_00]

function testCheck(test_name: string, val: any, need: any) {
    let is_success = val == need
    assert(is_success, test_name);
    if (is_success == false) {
        console.error('测试【' + test_name + '】失败', '需要:', need, '实际:', val)
    }
    return is_success
}

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
