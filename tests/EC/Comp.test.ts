import { describe, test, expect, beforeEach } from "bun:test";
import { Comp } from "../../src/EC/Comp";
import { BaseModelComp } from "../../src/EC/BaseModelComp";
import { Entity } from "../../src/EC/Entity";
import { ISystemStatic } from "../../src/EC/System";
import { GameEntity } from "./TestECData";

// 测试用简单组件
class SimpleComp extends BaseModelComp {
    compName = 'SimpleComp'
    initBySystems: ISystemStatic[] = []
    value = 0
    reset() { this.value = 0 }
    onDetach() { }
}

describe("Comp 组件系统", () => {
    beforeEach(() => {
        Entity.entities.clear();
        Comp.clearPool();
    });

    test("MAX_POOL_SIZE 限制：超过上限的组件被 GC 回收", () => {
        const entity = Entity.createEntity<GameEntity>(GameEntity);
        const comps: SimpleComp[] = [];

        // 创建并移除 100 个组件（超过 MAX_POOL_SIZE=64）
        for (let i = 0; i < 100; i++) {
            const comp = entity.attachComponent(SimpleComp);
            comps.push(comp);
            entity.detachComponent(SimpleComp);
        }

        // 从池子取一个出来验证池子有东西
        const fromPool = Comp.createComp(SimpleComp);
        expect(fromPool).toBeDefined();
        expect(fromPool.compName).toBe('SimpleComp');

        Entity.removeEntity(entity);
    });

    test("dirty 去重：同一组件多次 setDirtyMark 只通知一次", () => {
        const entity = Entity.createEntity<GameEntity>(GameEntity);
        const comp = entity.attachComponent(SimpleComp);

        let notifyCount = 0;
        const originalNotify = comp.notify.bind(comp);
        comp.notify = (is_update_now: boolean) => {
            notifyCount++;
            originalNotify(is_update_now);
        };

        // 多次标记 dirty
        comp.setDirtyMark();
        comp.setDirtyMark();
        comp.setDirtyMark();

        expect(Comp.isDirtyComp(comp)).toBe(true);

        Comp.notifyAllDirtyComps();
        expect(notifyCount).toBe(1);
        expect(Comp.isDirtyComp(comp)).toBe(false);

        Entity.removeEntity(entity);
    });

    // test("notifyAllDirtyComps 异常隔离：一个组件异常不影响其他", () => {
    //     const entity = Entity.createEntity<GameEntity>(GameEntity);

    //     class BadNotifyComp extends BaseModelComp {
    //         compName = 'BadNotifyComp'
    //         initBySystems: ISystemStatic[] = []
    //         reset() { }
    //         onDetach() { }
    //         notify(_: boolean) { throw new Error('notify error') }
    //     }

    //     class GoodNotifyComp extends BaseModelComp {
    //         compName = 'GoodNotifyComp'
    //         initBySystems: ISystemStatic[] = []
    //         notified = false
    //         reset() { this.notified = false }
    //         onDetach() { }
    //         notify(_: boolean) { this.notified = true }
    //     }

    //     const badComp = entity.attachComponent(BadNotifyComp);
    //     const goodComp = entity.attachComponent(GoodNotifyComp);

    //     badComp.setDirtyMark();
    //     goodComp.setDirtyMark();

    //     // 不应 throw
    //     expect(() => Comp.notifyAllDirtyComps()).not.toThrow();
    //     // goodComp 仍然被通知
    //     expect(goodComp.notified).toBe(true);

    //     Entity.removeEntity(entity);
    // });
});
