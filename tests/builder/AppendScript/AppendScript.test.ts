import { assert, describe, test } from "poku";
import { AppendScript } from "../../../packages/builder/src/Builder/AppendScript";

const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试AppendScript的addFactory', async () => {
            let appendScript = await AppendScript.addFactory({
                factoryType: 'xhgame_plugin_not_exists',
                importPath: 'xhgame_plugin_not_exists',
                itemClassName: 'MyItem',
                driveClassName: 'MyDrive',
                factoryClassName: 'MyFactory',
            })
            console.log(appendScript)
            resolve(true)
        })
    })
}

let functions = [
    test_00
]

describe('AppendScript功能', async () => {
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
