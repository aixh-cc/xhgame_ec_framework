import { assert, describe, test } from "poku";
import { LocalHandles } from "../../../packages/builder/src/Builder/LocalHandles";


const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试读取插件安装信息', async () => {
            let pluginName = 'localhandles_test_01'
            let installInfo = await LocalHandles.readInstallInfo({ pluginName })
            assert.equal(installInfo.installInfo?.version, '1.0.0', '获取版本号正常')

            let componentList = await LocalHandles.getGroupComponentList(pluginName, 'uiItems')
            assert.equal(componentList.list.length, 1, '获取组件列表正常')
            resolve(true)
        })
    })
}

let functions = [
    test_01,
    // test_02
]

describe('LocalHandles功能', async () => {
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
