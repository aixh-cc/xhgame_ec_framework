import { assert, describe, test } from "poku";
import { UiManager } from "../../../packages/core/src/Ui/UiManager";
import { TestUiDrive } from "../../../packages/core/src/Ui/TestUiDrive";
import { TestViewComp } from "./TestUiData";

const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试UiManager功能', async () => {
            let uiManager = new UiManager<TestUiDrive>(new TestUiDrive())
            console.log(uiManager)
            assert.equal(uiManager.getGuiRoot().name, 'gui_root', 'getGuiRoot正常')
            assert.equal(uiManager.getWorldRoot().name, 'world_root', 'getWorldRoot正常')
            uiManager.openUIAsync('test_view', new TestViewComp()).then(() => {
                assert.equal(uiManager.checkOpening('test_view'), false, 'checkOpening=false正常')
                assert.equal(uiManager.checkOpened('test_view'), true, 'checkOpened=true正常')
                // 移除
                uiManager.removeUI('test_view')
                assert.equal(uiManager.checkOpened('test_view'), false, 'removeUI正常')
                resolve(true)
            })
            assert.equal(uiManager.checkOpening('test_view'), true, 'checkOpening=true正常')
        })
    })
}

let functions = [test_00]

describe('UiManager功能', async () => {
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
