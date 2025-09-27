import { assert, describe, test } from "poku";
import { FactoryManager } from "../../../packages/core/src/Factory/FactoryManager";
import { IItem, IItemProduceDrive } from "../../../packages/core/src/Factory/Item";
import { BaseFactory, FactoryConfig } from "../../../packages/core/src/Factory/Factory";

enum FactoryType {
    unitItem = "unitItem",
    effectItem = 'effectItem',
}
interface IUnitItem {
    owner_is_player: boolean
}
interface IEffectItem {
    showTime: number
}

class UnitItemFactory<T extends IItemProduceDrive, TT extends IItem & IUnitItem> extends BaseFactory<T, TT> {
    name = FactoryType.unitItem;
}
class EffectItemFactory<T extends IItemProduceDrive, TT extends IItem & IEffectItem> extends BaseFactory<T, TT> {
    name = FactoryType.effectItem;
}

class MyTestFactoryConfig extends FactoryConfig {
    [FactoryType.unitItem]: typeof UnitItemFactory<IItemProduceDrive, IItem & IUnitItem> = UnitItemFactory;
    [FactoryType.effectItem]: typeof EffectItemFactory<IItemProduceDrive, IItem & IEffectItem> = EffectItemFactory;
}

const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试Factory', async () => {
            let factoryManager = new FactoryManager<MyTestFactoryConfig, any>(new MyTestFactoryConfig())
            factoryManager.autoRegister()
            assert.equal(factoryManager.getFactorys().size, 2, '自动注册正常')
            let effectItemFactory = factoryManager.getFactory(FactoryType.effectItem)
            assert.equal(effectItemFactory?.name, 'effectItem', 'getFactory正常')
            resolve(true)
        })
    })
}
let functions = [
    test_01
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
