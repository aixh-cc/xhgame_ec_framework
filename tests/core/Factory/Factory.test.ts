import { assert, describe, test } from "poku";
import { FactoryManager } from "../../../packages/core/src/Factory/FactoryManager";
import { FactoryType, MyTestDriveConfig, MyTestFactoryConfig } from "./TestFacotryData";

let factoryManager = new FactoryManager<MyTestFactoryConfig, MyTestDriveConfig, any>(new MyTestFactoryConfig(), new MyTestDriveConfig())
factoryManager.autoRegister()

const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试Factory', async () => {
            let effectItemFactory = factoryManager.getFactory(FactoryType.effectItem)
            assert.equal(effectItemFactory!.getItemProduceDrive().name, 'TestEffectItemProduceDrive', '获取驱动成功')
            resolve(true)
        })
    })
}
const test_02 = () => {
    return new Promise((resolve, reject) => {
        test('测试批量生产和回收', async () => {
            let effectItemFactory = factoryManager.getFactory(FactoryType.effectItem)
            if (effectItemFactory) {
                for (let i = 0; i < 100; i++) {
                    let itemNo = 'effect' + i % 10
                    effectItemFactory?.produceItem(itemNo)
                }
                assert.equal(effectItemFactory?.getItemPools().size, 10, '批量创建成功,getItemPools().size正确')
                assert.equal(effectItemFactory?.getItemHistorys().size, 100, '批量创建成功,getItemHistorys().size正确')
                for (let [_item] of effectItemFactory.getItemHistorys()) {
                    if (_item.itemNo == 'effect1') {
                        effectItemFactory.recycleItem(_item)
                    }
                }
                assert.equal(effectItemFactory?.getAliveCount(), 90, '回收成功,getAliveCount正确')
                effectItemFactory.recycleAllItems()
                assert.equal(effectItemFactory?.getAliveCount(), 0, '回收成功,recycleAllItems正确')
                assert.equal(effectItemFactory?.getItemHistorys().size, 0, '回收成功,historyMap已清空正确')
                assert.equal(effectItemFactory?.getItemPools().size, 0, '回收成功,pool已清空正确')
            }
            resolve(true)
        })
    })
}
let functions = [
    test_01,
    test_02
]

describe('Factory功能', async () => {
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
