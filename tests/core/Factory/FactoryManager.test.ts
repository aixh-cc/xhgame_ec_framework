import { assert, describe, test } from "poku";
import { FactoryManager } from "../../../packages/core/src/Factory/FactoryManager";
import { IItem, IItemProduceDrive } from "../../../packages/core/src/Factory/Item";
import { BaseFactory, IFactory, IFactoryConfig } from "../../../packages/core/src/Factory/Factory";

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

class MyTestFactoryConfig implements IFactoryConfig {
    [FactoryType.unitItem]: UnitItemFactory<IItemProduceDrive, IItem & IUnitItem> = new UnitItemFactory();
    [FactoryType.effectItem]: EffectItemFactory<IItemProduceDrive, IItem & IEffectItem> = new EffectItemFactory();
}

const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试Factory自动注册', async () => {
            let factoryManager = new FactoryManager<MyTestFactoryConfig, any>(new MyTestFactoryConfig())
            factoryManager.autoRegister()
            testCheck('自动注册正常', factoryManager.getFactorys().size, 2)
            let sss = factoryManager.getFactory(FactoryType.effectItem)
            resolve(true)
        })
    })
}

let functions = [
    test_01,
]

function testCheck(test_name: string, val: any, need: any) {
    let is_success = val === need
    assert(is_success, test_name);
    if (is_success == false) {
        console.error('测试【' + test_name + '】失败', "需要:\n", need, "实际:\n", val)
    }
    return is_success
}

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
