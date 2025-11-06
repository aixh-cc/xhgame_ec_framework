import { assert, describe, test } from "poku";
import { InstallInfoManager } from "../../../packages/builder/src/Builder/InstallInfoManager";
import * as fs from 'fs';
import { join } from 'path';
import { getProjectPath } from "../../../packages/builder/src/Builder/Util";

const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试InstallInfoManager的从未安装过', async () => {
            let notInstalledInfoManager = new InstallInfoManager('xhgame_plugin_not_exists')
            let is_exists = notInstalledInfoManager.exists()
            assert.equal(is_exists, false, 'notInstalledInfoManager的exists正常')
            let installInfo = await notInstalledInfoManager.readInstallInfo()
            assert.equal(installInfo.version, '1.0.0', 'notInstalledInfoManager的获取默认版本号正常')
            assert.equal(installInfo.installedComponents.length, 0, 'notInstalledInfoManager的获取已安装组件列表正常')
            resolve(true)
        })
    })
}
const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试InstallInfoManager的有安装过', async () => {
            let installedInfoManager = new InstallInfoManager('test_01')
            let is_exists = installedInfoManager.exists()
            assert.equal(is_exists, true, 'installedInfoManager的exists正常')
            let installInfo = await installedInfoManager.readInstallInfo()
            assert.equal(installInfo.version, '1.0.1', 'installedInfoManager的获取默认版本号正常')
            assert.equal(installInfo.installedComponents.length, 0, 'installedInfoManager的获取已安装组件列表正常')
            resolve(true)
        })
    })
}
const test_02 = () => {
    return new Promise((resolve, reject) => {
        test('测试InstallInfoManager的写入', async () => {
            let installedInfoManager = new InstallInfoManager('test_02')
            let is_write_success = await installedInfoManager.writeInstallInfo({
                version: '1.0.2',
                installedComponents: [],
                lastUpdated: new Date().toISOString()
            })
            assert.equal(is_write_success, true, 'installedInfoManager的写入正常')
            // 检查写入的文件内容是否正确
            let installInfo = await installedInfoManager.checkInstallExists()
            if (installInfo) {
                assert.equal(installInfo.version, '1.0.2', 'installedInfoManager的获取版本号正常')
                assert.equal(installInfo.installedComponents.length, 0, 'installedInfoManager的获取已安装组件列表正常')
                assert.equal(JSON.stringify(installedInfoManager.getLogs()), '["[test_02] 安装信息已写入: /extensions/test_02-installInfo.json"]', 'installedInfoManager的logs正常')
            } else {
                assert.equal(installInfo, '错误', 'installedInfoManager的获取安装信息失败')
            }
            resolve(true)
        })
    })
}

let functions = [
    test_00,
    test_01,
    test_02,
    test_03,
    test_04
]

describe('InstallInfoManager功能', async () => {
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

function test_03() {
    return new Promise((resolve, reject) => {
        test('测试InstallInfoManager的安装记录与查询', async () => {
            const pluginName = 'test_03';
            const iim = new InstallInfoManager(pluginName);
            const projectPath = getProjectPath();

            // 准备一个伪造的 zip 路径和对应的 .meta 文件
            const groupPath = join(projectPath, 'extensions', pluginName, 'packages', 'textUiItems');
            await fs.promises.mkdir(groupPath, { recursive: true });
            const compName = 'toast_item';
            const zipFilePath = join(groupPath, `${compName}.zip`);
            const metaPath = join(groupPath, `${compName}.setup.json`);
            const metaData = {
                // 支持顶层结构或 userData 结构
                code: compName,
                displayName: '吐司提示',
                version: '1.2.3'
            };
            await fs.promises.writeFile(metaPath, JSON.stringify(metaData, null, 2), 'utf-8');

            const targetPath = join(projectPath, 'assets');
            const copiedFiles = [
                join('bundle_factory', 'item_views', 'textUiItems', compName, 'toast_item.prefab')
            ];

            // 记录安装信息
            await iim.recordInstallation(zipFilePath, compName, targetPath, copiedFiles);

            // 验证 getInstalledComponentCodes / isComponentInstalled / getComponentInfo
            const codes = await iim.getInstalledComponentCodes();
            assert.equal(Array.isArray(codes), true, 'getInstalledComponentCodes返回数组');
            assert.equal(codes.includes(compName), true, '组件代码已包含在已安装列表中');

            const installed = await iim.isComponentInstalled(compName);
            assert.equal(installed, true, 'isComponentInstalled判断正确');

            const info = await iim.getComponentInfo(compName);
            assert.equal(!!info, true, 'getComponentInfo能获取到组件信息');
            if (info) {
                assert.equal(info.componentName, '吐司提示', '组件显示名正确');
                assert.equal(info.componentCode, compName, '组件code正确');
                assert.equal(info.version, '1.2.3', '组件版本正确');
                assert.equal(JSON.stringify(info.copiedFiles), JSON.stringify(copiedFiles), '已安装文件列表正确');
            }

            // 验证 removeComponent 后状态
            await iim.removeComponent(compName);
            const installedAfterRemove = await iim.isComponentInstalled(compName);
            assert.equal(installedAfterRemove, false, '组件移除后未安装');

            // 日志包含写入记录（不做严格等值比较，以免受其他测试影响）
            const logs = iim.getLogs();
            assert.equal(logs.some(l => l.includes(`/extensions/${pluginName}-installInfo.json`)), true, '写入日志包含目标文件');

            resolve(true);
        });
    });
}

function test_04() {
    return new Promise((resolve, reject) => {
        test('测试InstallInfoManager的元数据提取（有/无meta）', async () => {
            const pluginName = 'test_04';
            const iim = new InstallInfoManager(pluginName);
            const projectPath = getProjectPath();

            // 有 meta 的情况
            const groupPath = join(projectPath, 'extensions', pluginName, 'packages', 'textUiItems');
            await fs.promises.mkdir(groupPath, { recursive: true });
            const compName = 'alert_item';
            const zipFilePath = join(groupPath, `${compName}.zip`);
            const metaPath = join(groupPath, `${compName}.setup.json`);
            const metaData = {
                code: compName,
                displayName: '警告提示',
                version: '2.0.0'
            };
            await fs.promises.writeFile(metaPath, JSON.stringify(metaData, null, 2), 'utf-8');

            const metadata = await iim.extractComponentMetadata(zipFilePath, compName);
            assert.equal(metadata.componentCode, compName, '提取的code正确');
            assert.equal(metadata.componentDisplayName, '警告提示', '提取的显示名正确');
            assert.equal(metadata.componentVersion, '2.0.0', '提取的版本正确');

            // 无 meta 的情况
            const noMetaComp = 'no_meta_item';
            const noMetaZip = join(groupPath, `${noMetaComp}.zip`);
            const metadataNoMeta = await iim.extractComponentMetadata(noMetaZip, noMetaComp);
            assert.equal(metadataNoMeta.componentCode, noMetaComp, '无meta时code回落到组件名');
            assert.equal(metadataNoMeta.componentDisplayName, noMetaComp, '无meta时显示名回落到组件名');
            assert.equal(metadataNoMeta.componentVersion, '1.0.0', '无meta时版本为默认值');

            resolve(true);
        });
    });
}
