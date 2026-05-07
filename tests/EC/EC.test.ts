import { describe, test, expect, beforeEach } from "bun:test";
import { Entity } from "../../src/EC/Entity";
import { GameEntity, TestSenceComp, TestViewComp } from "./TestECData";
import { DI } from "../../src/DI/DI";
import { Comp } from "../../src/EC/Comp";
import { ISystemStatic } from "../../src/EC/System";
import { BaseModelComp } from "../../src/EC/BaseModelComp";

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

    test("getComponent 和 getComponentByName O(1) 查找", () => {
        let entity = Entity.createEntity<GameEntity>(GameEntity)
        entity.attachComponent(TestSenceComp)

        // 按类查找
        let byClass = entity.getComponent(TestSenceComp)
        expect(byClass).toBeDefined()
        expect(byClass!.compName).toBe('TestSenceComp')

        // 按名称查找
        let byName = entity.getComponentByName('TestSenceComp')
        expect(byName).toBeDefined()
        expect(byName!.compName).toBe('TestSenceComp')

        // 同一引用
        expect(byClass).toBe(byName)

        // 不存在的查找返回 undefined
        expect(entity.getComponent(TestViewComp)).toBeUndefined()
        expect(entity.getComponentByName('NotExist')).toBeUndefined()

        Entity.removeEntity(entity)
    });

    test("detach 后 Map 与数组保持同步", () => {
        let entity = Entity.createEntity<GameEntity>(GameEntity)
        entity.attachComponent(TestSenceComp)
        entity.attachComponent(TestViewComp)
        expect(entity.components.length).toBe(3) // GameModelComp + TestSenceComp + TestViewComp

        // 按类卸载
        entity.detachComponent(TestSenceComp)
        expect(entity.components.length).toBe(2)
        expect(entity.getComponent(TestSenceComp)).toBeUndefined()
        expect(entity.getComponentByName('TestSenceComp')).toBeUndefined()

        // 按名称卸载
        entity.detachComponentByName('TestViewComp')
        expect(entity.components.length).toBe(1)
        expect(entity.getComponentByName('TestViewComp')).toBeUndefined()

        Entity.removeEntity(entity)
    });

    // test("removeEntity 异常隔离：单个组件移除失败不阻塞其他组件", async () => {
    //     // 创建一个 onDetach 会抛异常的组件
    //     class BadComp extends BaseModelComp {
    //         compName = 'BadComp'
    //         initBySystems: ISystemStatic[] = []
    //         reset() { }
    //         onDetach() { throw new Error('BadComp detach error') }
    //     }

    //     let entity = Entity.createEntity<GameEntity>(GameEntity)
    //     entity.attachComponent(TestSenceComp)
    //     entity.attachComponent(BadComp)
    //     expect(entity.components.length).toBe(3)

    //     // removeEntity 不应 throw，即使某个组件 onDetach 异常
    //     expect(() => Entity.removeEntity(entity)).not.toThrow()
    //     expect(Entity.entities.size).toBe(0)
    // });

    // test("done() 初始化失败时 reject 而非 resolve(null)", async () => {
    //     // 创建一个 initComp 会失败的系统
    //     class FailSystem {
    //         static async initComp(_comp: Comp) {
    //             throw new Error('init failed')
    //         }
    //     }
    //     class FailComp extends BaseModelComp {
    //         compName = 'FailComp'
    //         initBySystems: ISystemStatic[] = [FailSystem as any]
    //         reset() { }
    //         onDetach() { }
    //     }

    //     let entity = Entity.createEntity<GameEntity>(GameEntity)
    //     let comp = entity.attachComponent(FailComp)

    //     // done() 应该 reject 而非 resolve(null)
    //     try {
    //         await comp.done()
    //         // 不应该到达这里
    //         expect(true).toBe(false)
    //     } catch (e) {
    //         expect(e).toBeInstanceOf(Error)
    //         expect((e as Error).message).toBe('init failed')
    //     }

    //     Entity.removeEntity(entity)
    // });
});
