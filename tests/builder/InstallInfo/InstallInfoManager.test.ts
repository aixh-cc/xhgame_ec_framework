import { assert, describe, test } from "poku";
import { InstallInfoManager } from "../../../packages/builder/src/builder/InstallInfoManager";

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
            let installInfo = await installedInfoManager.readInstallInfo()
            assert.equal(installInfo.version, '1.0.2', 'installedInfoManager的获取版本号正常')
            assert.equal(installInfo.installedComponents.length, 0, 'installedInfoManager的获取已安装组件列表正常')
            assert.equal(JSON.stringify(installedInfoManager.getLogs()), '["[test_02] 安装信息已写入: /Users/hd/Documents/website/aixh/xhgame_ec_framework/extensions/test_02-installInfo.json"]', 'installedInfoManager的logs正常')
            resolve(true)
        })
    })
}

let functions = [
    test_00,
    test_01,
    test_02
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
