import { assert, describe, test } from "poku";
import { FactoryManager } from "../../../packages/core/src/Factory/FactoryManager";
import { FactoryType, MyTestFactoryConfig } from "./TestFacotryData";

const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试FactoryManager', async () => {
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

describe('FactoryManager功能', async () => {
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
