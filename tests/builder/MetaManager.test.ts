import { assert, describe, test } from "poku";
import { MetaManager, MetaType } from "../../packages/builder/src/Builder/MetaManager";
import * as fs from 'fs';
import { join } from 'path';
import { getProjectPath, getExtensionsPath } from "../../packages/builder/src/Builder/Util";
import { IComponentInfo, IAppendScripts } from "../../packages/builder/src/Builder/Defined";

const projectPath = getProjectPath();
const extensionPath = getExtensionsPath();

const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试MetaManager的从未安装过', async () => {
            let notInstalledInfoManager = new MetaManager(
                projectPath,
                'xhgame_plugin_not_exists',
                MetaType.install)
            let is_exists = notInstalledInfoManager.exists()
            assert.equal(is_exists, false, 'notInstalledInfoManager的exists正常')
            let installInfo = await notInstalledInfoManager.readMateInfo()
            assert.equal(installInfo.version, '1.0.0', 'notInstalledInfoManager的获取默认版本号正常')
            assert.equal(installInfo.installedComponentMetas.length, 0, 'notInstalledInfoManager的获取已安装组件列表正常')
            resolve(true)
        })
    })
}
const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试MetaManager的有安装过', async () => {
            let installedInfoManager = new MetaManager(
                projectPath,
                'test_01',
                MetaType.install)
            let is_exists = installedInfoManager.exists()
            assert.equal(is_exists, true, 'installedInfoManager的exists正常')
            let installInfo = await installedInfoManager.readMateInfo()
            assert.equal(installInfo.version, '1.0.1', 'installedInfoManager的获取默认版本号正常')
            assert.equal(installInfo.installedComponentMetas.length, 0, 'installedInfoManager的获取已安装组件列表正常')
            resolve(true)
        })
    })
}
const test_02 = () => {
    return new Promise((resolve, reject) => {
        test('测试MetaManager的写入', async () => {
            let installedInfoManager = new MetaManager(
                projectPath,
                'test_02',
                MetaType.install)
            let is_write_success = await installedInfoManager.writeInstallInfo({
                version: '1.0.2',
                installedComponentMetas: [],
                lastUpdated: new Date().toISOString()
            })
            assert.equal(is_write_success, true, 'installedInfoManager的写入正常')
            // 检查写入的文件内容是否正确
            let installInfo = await installedInfoManager.readMateInfo()
            if (installInfo) {
                assert.equal(installInfo.version, '1.0.2', 'installedInfoManager的获取版本号正常')
                assert.equal(installInfo.installedComponentMetas.length, 0, 'installedInfoManager的获取已安装组件列表正常')
                assert.equal(JSON.stringify(installedInfoManager.getLogs()), '["[test_02] 安装信息已写入: /temp/test_02-installInfo.json"]', 'installedInfoManager的logs正常')
            } else {
                assert.equal(installInfo, '错误', 'installedInfoManager的获取安装信息失败')
            }
            resolve(true)
        })
    })
}

const test_03 = () => {
    return new Promise((resolve, reject) => {
        test('测试MetaManager的安装记录与查询', async () => {
            const pluginName = 'test_03';
            const iim = new MetaManager(
                projectPath,
                pluginName,
                MetaType.install)

            // 准备一个伪造
            const groupPath = join(projectPath, 'extensions', pluginName, 'packages', 'textUiItems');
            await fs.promises.mkdir(groupPath, { recursive: true });
            const componentCode = 'toast_item';
            const zipFilePath = join(groupPath, `${componentCode}.zip`);
            const metaPath = join(groupPath, `${componentCode}.setup.json`);
            const setupComponentInfo: IComponentInfo = {
                // 支持顶层结构或 userData 结构
                componentCode: componentCode,
                componentName: '吐司提示',
                componentVersion: '1.2.3',
                description: '显示一个简单的文本提示',
                author: '测试作者',
                group: 'UI',
                tags: ['提示', '文本'],
                dependencies: [],
                files: [
                    join('bundle_factory', 'item_views', 'textUiItems', componentCode, 'toast_item.prefab')
                ],
            };
            await fs.promises.writeFile(metaPath, JSON.stringify(setupComponentInfo, null, 2), 'utf-8');
            const copiedFiles = [
                join('bundle_factory', 'item_views', 'textUiItems', componentCode, 'toast_item.prefab')
            ];
            let appendScripts: IAppendScripts = []
            // 记录安装信息
            await iim.updateInstalledComponentMetas(componentCode, setupComponentInfo.componentName, setupComponentInfo.componentVersion, copiedFiles, appendScripts, setupComponentInfo.group);

            // 验证 
            const codes = await iim.getInstalledComponentCodes();
            assert.equal(Array.isArray(codes), true, 'getInstalledComponentCodes返回数组');
            assert.equal(codes.includes(componentCode), true, '组件代码已包含在已安装列表中');

            const installed = await iim.isComponentInstalled(componentCode);
            assert.equal(installed, true, 'isComponentInstalled判断正确');

            const info = await iim.getInstalledComponentInfo(componentCode);
            assert.equal(!!info, true, 'getInstalledComponentInfo能获取到组件信息');
            if (info) {
                assert.equal(info.componentName, '吐司提示', '组件显示名正确');
                assert.equal(info.componentCode, componentCode, '组件code正确');
                assert.equal(info.componentVersion, '1.2.3', '组件版本正确');
                assert.equal(JSON.stringify(info.copiedFiles), JSON.stringify(copiedFiles), '已安装文件列表正确');
            }

            // 验证 removeComponent 后状态
            await iim.removeComponentRecord(componentCode);
            const installedAfterRemove = await iim.isComponentInstalled(componentCode);
            assert.equal(installedAfterRemove, false, '组件移除后未安装');

            // 日志包含写入记录（不做严格等值比较，以免受其他测试影响）
            const logs = iim.getLogs();
            assert.equal(logs.some(l => l.includes(`/temp/${pluginName}-installInfo.json`)), true, '写入日志包含目标文件');

            resolve(true);
        });
    });
}

let functions = [
    test_00,
    test_01,
    test_02,
    test_03
]

describe('MetaManager功能', async () => {
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
