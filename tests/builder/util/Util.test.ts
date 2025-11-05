import { assert, describe, test } from "poku";
import { getPluginPath, getGroupPath, getExtensionsPath, getProjectPath } from "../../../packages/builder/src/builder/Util";

const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试几个路径的获取', async () => {
            let projectPath = getProjectPath()
            console.log(projectPath)
            let extensionsPath = getExtensionsPath()
            assert.equal(extensionsPath.replace(projectPath + '/', ''), 'extensions', 'getExtensionsPath正常')
            let pluginPath = getPluginPath('xhgame_plugin')
            assert.equal(pluginPath.replace(projectPath + '/', ''), 'extensions/xhgame_plugin', 'getPluginPath正常')
            let uiItemsPath = getGroupPath('xhgame_plugin', 'uiItems')
            assert.equal(uiItemsPath.replace(projectPath + '/', ''), 'extensions/xhgame_plugin/packages/uiItems', 'getGroupPath正常')
            resolve(true)
        })
    })
}

let functions = [
    test_01,
    // test_02
]

describe('Util功能', async () => {
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
