import { assert, describe, test } from "poku";
import { InstallInfoManager } from "../../../packages/builder/src/builder/InstallInfoManager";

const test_01 = () => {
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

let functions = [
    test_01,
    // test_02
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
