import { assert, describe, test } from "poku";
import { AppendScript } from "../../../packages/builder/src/Builder/AppendScript";
import { getProjectPath } from "../../../packages/builder/src/Builder/Util";
import { IComponentInfo } from "../../../packages/builder/src/Builder/Defined";

const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试添加effectItemComponentInfo', async () => {
            let effectItemComponentInfo: IComponentInfo = {
                componentCode: 'EffectItemTemplate',
                componentName: 'EffectItemTemplate',
                componentVersion: '1.0.0',
                description: '特效项模板',
                author: 'hd',
                category: 'ItemTemplate',
                tags: ['ItemTemplate'],
                dependencies: ['/assets/script/managers/myFactory/MyCocosFactoryConfig.ts'],
                files: [],
                stars: 4,
                appendScripts: [
                    {
                        sourceFilePath: '/assets/script/managers/myFactory/MyCocosFactoryConfig.ts',
                        factoryType: 'effectItem',
                        itemClassName: 'CocosEffectItem',
                        driveClassName: 'CocosEffectItemFactoryDrive',
                        factoryClassName: 'EffectItemFactory',
                    }
                ]
            }
            if (effectItemComponentInfo.appendScripts && effectItemComponentInfo.appendScripts?.length > 0) {
                for (let i = 0; i < effectItemComponentInfo.appendScripts.length; i++) {
                    const element = effectItemComponentInfo.appendScripts[i];
                    if (typeof element.factoryType === 'string') {
                        let res_add_type = await AppendScript.addFactoryType(element.factoryType)
                        assert.equal(res_add_type.success, true, '新增factoryType成功')
                        let res_add = await AppendScript.addFactory(
                            {
                                sourceFilePath: element.sourceFilePath,
                                factoryType: element.factoryType,
                                itemClassName: element.itemClassName,
                                driveClassName: element.driveClassName,
                                factoryClassName: element.factoryClassName,
                            })
                        assert.equal(res_add.success, true, '新增factory成功')
                    }
                }
            }


            // let res_add_type = await AppendScript.addFactoryType(effectItemComponentInfo.appendScript?.factoryType)
            // assert.equal(res_add_type.success, true, '新增factoryType成功')



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
