import { describe, test, expect, beforeEach } from "bun:test";
import { Entity } from "../../src/EC/Entity";
import { GameEntity, TestSenceComp, TestViewComp } from "./TestECData";
import { DI } from "../../src/DI/DI";
import { Comp } from "../../src/EC/Comp";

describe("Entity功能", () => {
    beforeEach(() => {
        // 清理所有实体，确保测试隔离
        Entity.entities.clear();
        // 清理组件对象池，防止状态污染
        Comp.clearPool();
    });

    test("测试实体", () => {
        let mygameEntiy = Entity.createEntity<GameEntity>(GameEntity)
        expect(Entity.entities.size).toBe(1)
        expect(mygameEntiy.model !== null).toBe(true)
        let find = Entity.getEntity(mygameEntiy.id)
        expect(find?.id).toBe(mygameEntiy.id)
        Entity.removeEntity(mygameEntiy)
        expect(Entity.entities.size).toBe(0)
    });

    test("挂载组件", () => {
        let mygameEntiy = Entity.createEntity<GameEntity>(GameEntity)
        mygameEntiy.attachComponent(TestSenceComp)
        expect(mygameEntiy.getComponent(TestSenceComp)?.compName).toBe('TestSenceComp')
        // 重复挂载：应被去重保护，不会新增（GameModelComp + TestSenceComp = 2）
        mygameEntiy.attachComponent(TestSenceComp)
        expect(mygameEntiy.components.length).toBe(2)

        mygameEntiy.detachComponent(TestSenceComp)
        expect(mygameEntiy.components.length).toBe(1)

        let testSenceComp = mygameEntiy.attachComponent(TestSenceComp)
        expect(mygameEntiy.components.length).toBe(2)
        let find = mygameEntiy.getComponentByName('TestSenceComp')
        expect(find?.compName).toBe('TestSenceComp')

        mygameEntiy.detachComponentByName(testSenceComp.compName)
        expect(mygameEntiy.components.length).toBe(1)
        Entity.removeEntity(mygameEntiy)
    });

    test("挂载组件并完成初始化", async () => {
        let mygameEntiy = Entity.createEntity<GameEntity>(GameEntity)
        let arr: number[] = []
        await mygameEntiy.attachComponent(TestSenceComp).setup({ arr: arr, add_value: 10 }).done()
        expect(arr).toEqual([121, 232, 343, 454])
        await mygameEntiy.attachComponent(TestViewComp).setup({ arr: arr, add_value: 10 }).done()
        expect(arr).toEqual([131, 242, 353, 464, 565, 676, 787, 898])
        Entity.removeEntity(mygameEntiy)
    });
});
