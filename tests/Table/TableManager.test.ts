import { describe, test, expect } from "bun:test";
import { TableManager } from "../../src/Table/TableManager";
import { BaseTable, ITableConfig } from "../../src/Table/Table";


enum TableType {
    skill = "skill",
    unit = "unit",
}
class SkillTable extends BaseTable<ISkillTableItem> {
    name = TableType.skill;
}
interface ISkillTableItem {
    id: number,
    name: string,
}
class UnitTable extends BaseTable<IUnitTableItem> {
    name = TableType.unit;
}
interface IUnitTableItem {
    id: number,
    name: string,
}
class TestTableConfig implements ITableConfig {
    [TableType.skill]: SkillTable = new SkillTable();
    [TableType.unit]: UnitTable = new UnitTable();
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

describe("table功能", () => {
    test("测试table功能", () => {
        let tableManager = new TableManager<TestTableConfig>(new TestTableConfig())
        tableManager.autoRegister()
        expect(tableManager.getTables().length).toBe(2)
        let skillTable = tableManager.getTable(TableType.skill);
        expect(skillTable != null).toBe(true)

        if (skillTable) {
            let itemv1 = skillTable.getInfo(1)
            expect(itemv1).toBe(undefined)
            skillTable.init(json_data)
            let itemv2 = skillTable.getInfo(2)
            expect(itemv2).toEqual({"id":2,"name":"name2"})
            let skilllist = skillTable.getList()
            expect(skilllist).toEqual([{"id":1,"name":"name1"},{"id":2,"name":"name2"}])
        }
    });
});
