import { assert, describe, test } from "poku";
import { LocalInstallManager } from "../../packages/builder/src/Builder/LocalInstallManager";
import * as fs from 'fs';
import { join } from 'path';
import { getProjectPath } from "../../packages/builder/src/Builder/Util";


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
const test_03 = () => {
    return new Promise((resolve, reject) => {
        test('依赖校验与 replaceUuid 行为', async () => {
            const pluginName = 'localhandles_test_03';
            const group = 'uiItems';
            const componentCode = 'ui_item_01';

            const groupPath = join(getProjectPath(), 'extensions', pluginName, 'packages', group);
            const setupPath = join(groupPath, `${componentCode}.setup.json`);
            const extMetaPath = join(groupPath, componentCode, 'bundle_factory', 'item_views', 'uiItems', 'ui_item_01.meta');

            // 备份原始 setup 内容
            const original = await fs.promises.readFile(setupPath, 'utf-8');
            const setupJson = JSON.parse(original);
            const extMetaOriginal = await fs.promises.readFile(extMetaPath, 'utf-8');
            const extMetaJson = JSON.parse(extMetaOriginal);

            // 读取一个已存在的 .meta 文件，获取 uuid
            const depMetaPath = join(getProjectPath(), 'assets', 'bundle_factory', 'item_views', 'textUiItems', 'toast_item.meta');
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

                // 4) uuid 不一致但提供正确 replaceUuid，应当安装成功且安装包内 uuid 被替换
                const wrongUuid = '11111111-1111-1111-1111-111111111111';
                // 将扩展包中的 meta 写入一个错误的 uuid，以便测试替换
                const editedExtMeta = { ...extMetaJson, uuid: wrongUuid };
                await fs.promises.writeFile(extMetaPath, JSON.stringify(editedExtMeta, null, 2), 'utf-8');

                const replaceSetup = {
                    ...setupJson,
                    dependencies: [{
                        path: 'bundle_factory/item_views/textUiItems/toast_item',
                        requireUuid: wrongUuid,
                        replaceUuid: uuid
                    }]
                };
                await fs.promises.writeFile(setupPath, JSON.stringify(replaceSetup, null, 2), 'utf-8');

                const resReplace = await LocalInstallManager.installComponent(pluginName, group, componentCode);
                assert.equal(resReplace.success, true, '提供replaceUuid-安装成功');

                // 验证安装到项目后的 meta uuid 已经替换为项目实际值
                const installedMetaPath = join(getProjectPath(), 'assets', 'bundle_factory', 'item_views', 'uiItems', 'ui_item_01.meta');
                const installedMetaContent = await fs.promises.readFile(installedMetaPath, 'utf-8');
                const installedMetaJson = JSON.parse(installedMetaContent);
                assert.equal(installedMetaJson.uuid, uuid, '安装包内uuid已替换为项目实际值');

                // 卸载，清理安装产物
                const resUn2 = await LocalInstallManager.uninstallComponent(pluginName, componentCode);
                assert.equal(resUn2.success, true, '卸载成功');
            } finally {
                // 还原原始 setup 内容，避免影响其他用例
                await fs.promises.writeFile(setupPath, JSON.stringify(setupJson, null, 2), 'utf-8');
                await fs.promises.writeFile(extMetaPath, JSON.stringify(extMetaJson, null, 2), 'utf-8');
            }

            resolve(true);
        })
    })
}

const test_04 = () => {
    return new Promise((resolve, reject) => {
        test('componentCode 依赖-安装前后状态校验', async () => {
            const pluginName = 'localhandles_test_03';
            const group = 'uiItems';
            const depCode = 'ui_item_dep';
            const targetCode = 'ui_item_01';

            const groupPath = join(process.cwd(), 'extensions', pluginName, 'packages', group);
            const targetSetupPath = join(groupPath, `${targetCode}.setup.json`);

            // 备份目标 setup
            const original = await fs.promises.readFile(targetSetupPath, 'utf-8');
            const setupJson = JSON.parse(original);

            try {
                // 1) 设置目标组件依赖：{ componentCode: ui_item_dep }
                const depSetup = {
                    ...setupJson,
                    dependencies: [{ componentCode: depCode }]
                };
                await fs.promises.writeFile(targetSetupPath, JSON.stringify(depSetup, null, 2), 'utf-8');

                // 2) 未安装依赖时，安装目标组件应失败
                const resFail = await LocalInstallManager.installComponent(pluginName, group, targetCode);
                assert.equal(resFail.success, false, '未安装依赖组件-安装失败');

                // 3) 安装依赖组件
                const resDep = await LocalInstallManager.installComponent(pluginName, group, depCode);
                assert.equal(resDep.success, true, '安装依赖组件-成功');

                // 4) 再次安装目标组件，应成功
                const resOk = await LocalInstallManager.installComponent(pluginName, group, targetCode);
                assert.equal(resOk.success, true, '依赖已安装-目标安装成功');

                // 清理：卸载目标与依赖
                const resUnTarget = await LocalInstallManager.uninstallComponent(pluginName, targetCode);
                assert.equal(resUnTarget.success, true, '卸载目标组件-成功');

                const resUnDep = await LocalInstallManager.uninstallComponent(pluginName, depCode);
                assert.equal(resUnDep.success, true, '卸载依赖组件-成功');
            } finally {
                // 还原目标 setup 内容
                await fs.promises.writeFile(targetSetupPath, JSON.stringify(setupJson, null, 2), 'utf-8');
            }

            resolve(true);
        })
    })
}

let functions = [
    test_01,
    test_02,
    test_03,
    test_04
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
