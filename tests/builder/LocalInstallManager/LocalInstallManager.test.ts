import { assert, describe, test } from "poku";
import { LocalInstallManager } from "../../../packages/builder/src/Builder/LocalInstallManager";


const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试读取插件安装信息', async () => {
            let pluginName = 'localhandles_test_01'
            let installInfo = await LocalInstallManager.readInstallInfo({ pluginName })
            assert.equal(installInfo.localInstalledInfo?.version, '1.0.0', '获取版本号正常')

            let componentList = await LocalInstallManager.getGroupComponentList(pluginName, 'uiItems')
            assert.equal(componentList.list.length, 1, '获取组件列表正常')
            resolve(true)
        })
    })
}
const test_02 = () => {
    return new Promise((resolve, reject) => {
        test('测试读取插件安装信息', async () => {
            let pluginName = 'localhandles_test_02'

            const installInfoManager = LocalInstallManager.getInstallMetaManager(pluginName);
            let codes = await installInfoManager.getInstalledComponentCodes()
            // assert.equal(codes.length, 0, '安装前组件数量=0正常')

            let installRes = await LocalInstallManager.installComponent({ componentCode: 'not_exist', pluginName, group: 'uiItems' })
            console.log(installRes)
            assert.equal(installRes.success, false, '安装不存在的组件-断言成功')
            let installRes2 = await LocalInstallManager.installComponent({ componentCode: 'ui_item_01', pluginName, group: 'uiItems' })
            console.log(installRes2)
            assert.equal(installRes2.success, true, '安装存在的组件-断言成功')

            let componentList = await LocalInstallManager.getGroupComponentList(pluginName, 'uiItems')
            assert.equal(componentList.list.length, 1, '获取组件列表正常')

            // 移除
            let uninstallRes = await LocalInstallManager.uninstallComponent({ componentCode: 'ui_item_01', pluginName })
            console.log(uninstallRes)
            assert.equal(uninstallRes.success, true, '移除组件-断言成功')


            let rmain_codes = await installInfoManager.getInstalledComponentCodes()
            assert.equal(rmain_codes.length, 0, '卸载后组件数量=0正常')
            resolve(true)
        })
    })
}

let functions = [
    test_01,
    test_02
]

describe('LocalInstallManager功能', async () => {
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
