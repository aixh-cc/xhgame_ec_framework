import { describe, test, expect } from "bun:test";
import { FactoryManager } from "../../src/Factory/FactoryManager";
import { FactoryType, MyTestFactoryConfig } from "./TestFacotryData";

let factoryManager = new FactoryManager<MyTestFactoryConfig>(new MyTestFactoryConfig())
factoryManager.autoRegister()

describe("Factory功能", () => {
    test("测试Factory", () => {
        let effectItemFactory = factoryManager.getFactory(FactoryType.effectItem)
        expect(effectItemFactory!.getItemProduceDrive().name).toBe('TestEffectItemProduceDrive')
    });

    test("测试批量生产和回收", () => {
        let effectItemFactory = factoryManager.getFactory(FactoryType.effectItem)
        if (effectItemFactory) {
            for (let i = 0; i < 100; i++) {
                let itemNo = 'effect' + i % 10
                effectItemFactory?.produceItem(itemNo)
            }
            expect(effectItemFactory?.getItemPools().size).toBe(10)
            expect(effectItemFactory?.getItemHistorys().size).toBe(100)
            for (let [_item] of effectItemFactory.getItemHistorys()) {
                if (_item.itemNo == 'effect1') {
                    effectItemFactory.recycleItem(_item)
                }
            }
            expect(effectItemFactory?.getAliveCount()).toBe(90)
            effectItemFactory.recycleAllItems()
            expect(effectItemFactory?.getAliveCount()).toBe(0)
            expect(effectItemFactory?.getItemHistorys().size).toBe(0)
            expect(effectItemFactory?.getItemPools().size).toBe(0)
        }
    });
});
