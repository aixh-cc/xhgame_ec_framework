import { assert, describe, test } from "poku";
import { AppendScript } from "../../../packages/builder/src/Builder/AppendScript";
import { getProjectPath } from "../../../packages/builder/src/Builder/Util";

const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试AppendScript的addFactory', async () => {
            console.log(1111)
            let sourceFilePath = getProjectPath() + '/assets/script/managers/myFactory/MyCocosFactoryConfig.ts';
            let res_add_type = await AppendScript.addFactoryType('xhgame_plugin_not_exists')
            assert.equal(res_add_type.success, true, '新增factoryType成功')

            let res_add = await AppendScript.addFactory(
                sourceFilePath,
                {
                    factoryType: 'effectItem',
                    importPath: 'effectItem',
                    itemClassName: 'CocosEffectItem',
                    driveClassName: 'CocosEffectItemFactoryDrive',
                    factoryClassName: 'EffectItemFactory',
                })
            assert.equal(res_add.success, true, '新增factory成功')

            // // 移除
            // let res_remove = await AppendScript.removeFactory(sourceFilePath, 'xhgame_plugin_not_exists')

            // console.log(res_remove)
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
