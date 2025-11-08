import { assert, describe, test } from "poku";
import { LocalInstallManager } from "../../../packages/builder/src/Builder/LocalInstallManager";
import * as fs from 'fs';
import { join } from 'path';


const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试读取插件安装信息', async () => {
            let pluginName = 'localhandles_test_01'
            let installInfo = await LocalInstallManager.readInstallInfo(pluginName)
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

            let installRes = await LocalInstallManager.installComponent(pluginName, 'uiItems', 'not_exist')
            console.log(installRes)
            assert.equal(installRes.success, false, '安装不存在的组件-断言成功')
            let installRes2 = await LocalInstallManager.installComponent(pluginName, 'uiItems', 'ui_item_01')
            console.log(installRes2)
            assert.equal(installRes2.success, true, '安装存在的组件-断言成功')

            let componentList = await LocalInstallManager.getGroupComponentList(pluginName, 'uiItems')
            assert.equal(componentList.list.length, 1, '获取组件列表正常')

            // 移除
            let uninstallRes = await LocalInstallManager.uninstallComponent(pluginName, 'ui_item_01')
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
    test_02,
    // 依赖校验：存在性与 .meta uuid 一致性
    () => new Promise((resolve) => {
        test('依赖校验-存在与UUID一致性', async () => {
            const pluginName = 'localhandles_test_02';
            const group = 'uiItems';
            const componentCode = 'ui_item_01';

            const groupPath = join(process.cwd(), 'extensions', pluginName, 'packages', group);
            const setupPath = join(groupPath, `${componentCode}.setup.json`);

            // 备份原始 setup 内容
            const original = await fs.promises.readFile(setupPath, 'utf-8');
            const setupJson = JSON.parse(original);

            // 读取一个已存在的 .meta 文件，获取 uuid
            const depMetaPath = join(process.cwd(), 'assets', 'bundle_factory', 'item_views', 'textUiItems', 'toast_item.meta');
            const depMetaContent = await fs.promises.readFile(depMetaPath, 'utf-8');
            const depMetaJson = JSON.parse(depMetaContent);
            const uuid = depMetaJson.uuid;

            try {
                // 1) 依赖存在且 uuid 一致，应该安装成功
                const okSetup = {
                    ...setupJson,
                    dependencies: [{
                        path: 'bundle_factory/item_views/textUiItems/toast_item',
                        requireUuid: uuid
                    }]
                };
                await fs.promises.writeFile(setupPath, JSON.stringify(okSetup, null, 2), 'utf-8');

                const resOk = await LocalInstallManager.installComponent(pluginName, group, componentCode);
                assert.equal(resOk.success, true, '依赖存在且uuid一致-安装成功');

                // 卸载，清理安装产物，避免后续冲突
                const resUn = await LocalInstallManager.uninstallComponent(pluginName, componentCode);
                assert.equal(resUn.success, true, '卸载成功');

                // 2) uuid 不一致，应当安装失败并提示
                const badUuidSetup = {
                    ...setupJson,
                    dependencies: [{
                        path: 'bundle_factory/item_views/textUiItems/toast_item',
                        requireUuid: '00000000-0000-0000-0000-000000000000'
                    }]
                };
                await fs.promises.writeFile(setupPath, JSON.stringify(badUuidSetup, null, 2), 'utf-8');

                const resBadUuid = await LocalInstallManager.installComponent(pluginName, group, componentCode);
                assert.equal(resBadUuid.success, false, 'uuid不一致-安装失败');

                // 3) 依赖路径不存在，应当安装失败并提示
                const missingDepSetup = {
                    ...setupJson,
                    dependencies: ['bundle_factory/item_views/not_exist_dir/not_exist_file']
                };
                await fs.promises.writeFile(setupPath, JSON.stringify(missingDepSetup, null, 2), 'utf-8');

                const resMissing = await LocalInstallManager.installComponent(pluginName, group, componentCode);
                assert.equal(resMissing.success, false, '依赖缺失-安装失败');
            } finally {
                // 还原原始 setup 内容，避免影响其他用例
                await fs.promises.writeFile(setupPath, JSON.stringify(setupJson, null, 2), 'utf-8');
            }

            resolve(true);
        })
    })
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
