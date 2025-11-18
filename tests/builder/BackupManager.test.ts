import { assert, describe, test } from "poku";
import * as fs from 'fs';
import { join } from 'path';
import { LocalInstallManager } from "../../packages/builder/src/Builder/LocalInstallManager";
import { BackupManager } from "../../packages/builder/src/Builder/BackupManager";
import { getCocosProjectName, getProjectPath } from "../../packages/builder/src/Builder/Util";
import { MetaManager, MetaType } from "../../packages/builder/src/Builder/MetaManager";

const projectPath = getProjectPath();
const projectName = await getCocosProjectName()

const pluginName = 'xhgame_plugin';
const group = 'uiItems';
const componentCode = 'mission_item';

const installedPrefab = join(projectPath, 'assets', 'bundle_factory', 'item_views', 'uiItems', 'mission_item', 'mission_item.prefab');
const installedMetaRoot = join(projectPath, 'assets', 'bundle_factory', 'item_views', 'uiItems');

const backupsDir = join(projectPath, 'extensions', pluginName, 'backups', projectName);
const backupZip = join(backupsDir, group, `${componentCode}.zip`);
const backupJson = join(backupsDir, group, `${componentCode}.setup.json`);

const waitXms = (ms: number = 0) => new Promise<void>(resolve => setTimeout(resolve, ms));

const test_01 = () => {
    return new Promise((resolve) => {
        test('卸载时生成备份文件并回滚恢复', async () => {
            const localInstallManager = new LocalInstallManager(pluginName);
            const metaManager = localInstallManager.getMetaManager();
            metaManager.resetMetaInfo()
            await waitXms(1000)
            // 安装组件
            const resInstall = await localInstallManager.installComponent(group, componentCode);
            assert.equal(resInstall.success, true, '安装组件-应成功');

            // 验证安装产物存在
            assert.equal(fs.existsSync(installedPrefab), true, '安装后的prefab存在');
            assert.equal(fs.existsSync(join(installedMetaRoot, 'mission_item.meta')), true, '安装后的meta存在');

            // 卸载
            const resUninstall = await localInstallManager.uninstallComponent(group, componentCode);
            assert.equal(resUninstall.success, true, '卸载组件-应成功');

            // 验证文件已被删除
            assert.equal(fs.existsSync(installedPrefab), false, '卸载后prefab不存在');

            // 验证备份产物存在
            assert.equal(fs.existsSync(backupsDir), true, '备份目录存在');
            console.log('backupZip', backupZip)
            assert.equal(fs.existsSync(backupZip), true, '备份zip存在');
            console.log('backupJson', backupJson)
            assert.equal(fs.existsSync(backupJson), true, '备份json存在');
            const projectName = await getCocosProjectName()
            const bmCheck = new BackupManager(pluginName, projectName);
            assert.equal(bmCheck.checkZipHasTopFolder(group, componentCode), true, '备份zip顶级目录为组件码');

            // 回滚恢复
            const bm = new BackupManager(pluginName, projectName);
            const resRollback = await bm.rollback(group, componentCode);
            assert.equal(resRollback.success, true, '回滚-应成功');

            // 验证文件已恢复
            assert.equal(fs.existsSync(installedPrefab), true, '回滚后prefab存在');

            // 验证安装记录已恢复
            const installMeta = new MetaManager(projectPath, pluginName, MetaType.install);
            const isInstalled = await installMeta.isComponentInstalled(componentCode);
            assert.equal(isInstalled, true, '回滚后安装记录存在');

            // 卸载，触发备份
            const resUninstallend = await localInstallManager.uninstallComponent(group, componentCode);
            assert.equal(resUninstallend.success, true, '卸载组件-应成功(清理数据)');

            resolve(true);
        });
    });
};

describe('BackupManager功能', async () => {
    const functions = [test_01];
    while (functions.length > 0) {
        const func = functions.shift();
        if (func) {
            await func();
            await waitXms();
        }
    }
});
