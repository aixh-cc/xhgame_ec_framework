import { assert, describe, test } from "poku";
import { AppendScript } from "../../packages/builder/src/Builder/AppendScript";
import { IComponentInfo } from "../../packages/builder/src/Builder/Defined";

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
                dependencies: ['script/managers/myFactory/MyCocosFactoryConfig.ts'],
                files: [],
                stars: 4,
                appendScripts: [
                    {
                        type: 'factory',
                        sourceFilePath: 'script/managers/myFactory/MyCocosFactoryConfig.ts',
                        factoryType: 'effectItem',
                        factoryClassName: 'EffectItemFactory',
                        itemClassName: 'CocosEffectItem',
                        driveClassName: 'CocosEffectItemProduceDrive',
                    }
                ]
            }
            if (effectItemComponentInfo.appendScripts && effectItemComponentInfo.appendScripts?.length > 0) {
                for (let i = 0; i < effectItemComponentInfo.appendScripts.length; i++) {
                    const element = effectItemComponentInfo.appendScripts[i];
                    if (element.type === 'factory') {
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

            // 移除
            if (effectItemComponentInfo.appendScripts && effectItemComponentInfo.appendScripts?.length > 0) {
                for (let i = 0; i < effectItemComponentInfo.appendScripts.length; i++) {
                    const element = effectItemComponentInfo.appendScripts[i];
                    if (element.type === 'factory') {
                        let res_remove = await AppendScript.removeFactory(element.sourceFilePath, element.factoryType)
                        assert.equal(res_remove.success, true, '移除factory成功')
                        let res_add_type = await AppendScript.removeFactoryType(element.factoryType)
                        assert.equal(res_add_type.success, true, '新增factoryType成功')
                    }
                }
            }
            resolve(true)
        })
    })
}
const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试添加tableItemComponentInfo', async () => {
            let tableItemComponentInfo: IComponentInfo = {
                componentCode: 'TableItemTemplate',
                componentName: 'TableItemTemplate',
                componentVersion: '1.0.0',
                description: '表格项模板',
                author: 'hd',
                category: 'ItemTemplate',
                tags: ['ItemTemplate'],
                dependencies: ['script/managers/myFactory/MyCocosFactoryConfig.ts'],
                files: [],
                stars: 4,
                appendScripts: [
                    {
                        sourceFilePath: 'script/managers/myTable/MyTableConfig.ts',
                        tableType: 'skill',
                        itemClassName: 'SkillTableItem',
                        driveClassName: 'SkillTableItemProduceDrive',
                    }
                ]
            }
            if (tableItemComponentInfo.appendScripts && tableItemComponentInfo.appendScripts?.length > 0) {
                for (let i = 0; i < tableItemComponentInfo.appendScripts.length; i++) {
                    const element = tableItemComponentInfo.appendScripts[i];
                    if (typeof element.factoryType === 'string') {
                        let res_add_type = await AppendScript.addTableType(element.factoryType)
                        assert.equal(res_add_type.success, true, '新增tableType成功')
                        let res_add = await AppendScript.addTable(
                            {
                                sourceFilePath: element.sourceFilePath,
                                tableType: element.factoryType,
                                itemClassName: element.itemClassName,
                                driveClassName: element.driveClassName,
                                factoryClassName: element.factoryClassName,
                            })
                        assert.equal(res_add.success, true, '新增factory成功')
                    }
                }
            }

            // // 移除
            // if (tableItemComponentInfo.appendScripts && tableItemComponentInfo.appendScripts?.length > 0) {
            //     for (let i = 0; i < tableItemComponentInfo.appendScripts.length; i++) {
            //         const element = tableItemComponentInfo.appendScripts[i];
            //         let res_remove = await AppendScript.removeTable(element.sourceFilePath, element.factoryType)
            //         assert.equal(res_remove.success, true, '移除table成功')
            //         let res_add_type = await AppendScript.removeTableType(element.factoryType)
            //         assert.equal(res_add_type.success, true, '移除tableType成功')
            //     }
            // }
            resolve(true)
        })
    })
}

let functions = [
    test_00,
    test_01,
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
