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
                componentCode: 'SkillTable',
                componentName: 'SkillTable',
                componentVersion: '1.0.0',
                description: '技能表格项模板',
                author: 'hd',
                category: 'Table',
                tags: ['Table'],
                dependencies: ['script/managers/myTable/MyTableConfig.ts'],
                files: [],
                stars: 4,
                appendScripts: [
                    {
                        type: 'table',
                        sourceFilePath: 'script/managers/myTable/MyTableConfig.ts',
                        tableType: 'skill',
                        itemIName: 'ISkillTableItem',
                        tableClassName: 'SkillTable',
                    }
                ]
            }
            if (tableItemComponentInfo.appendScripts && tableItemComponentInfo.appendScripts?.length > 0) {
                for (let i = 0; i < tableItemComponentInfo.appendScripts.length; i++) {
                    const element = tableItemComponentInfo.appendScripts[i];
                    if (element.type === 'table') {
                        let res_add_type = await AppendScript.addTableType(element.tableType)
                        assert.equal(res_add_type.success, true, '新增tableType成功')
                        let res_add = await AppendScript.addTable(
                            {
                                sourceFilePath: element.sourceFilePath,
                                tableType: element.tableType,
                                itemIName: element.itemIName,
                                tableClassName: element.tableClassName,
                            })
                        assert.equal(res_add.success, true, '新增table成功')
                    }
                }
            }

            // // 移除
            if (tableItemComponentInfo.appendScripts && tableItemComponentInfo.appendScripts?.length > 0) {
                for (let i = 0; i < tableItemComponentInfo.appendScripts.length; i++) {
                    const element = tableItemComponentInfo.appendScripts[i];
                    if (element.type == 'table') {
                        let res_remove = await AppendScript.removeTable(element.sourceFilePath, element.tableType)
                        assert.equal(res_remove.success, true, '移除table成功')
                        let res_add_type = await AppendScript.removeTableType(element.tableType)
                        assert.equal(res_add_type.success, true, '移除tableType成功')
                    }
                }
            }
            resolve(true)
        })
    })
}
const test_02 = () => {
    return new Promise((resolve, reject) => {
        test('测试添加guiItemComponentInfo', async () => {
            let guiItemComponentInfo: IComponentInfo = {
                componentCode: 'gate_group_mission',
                componentName: 'gate_group_mission',
                componentVersion: '1.0.0',
                description: '网关组任务模板',
                author: 'hd',
                category: 'Gui',
                tags: ['Gui'],
                dependencies: ['script/managers/MyUiManager.ts'],
                files: [],
                stars: 4,
                appendScripts: [
                    {
                        type: 'gui',
                        sourceFilePath: 'script/managers/MyUiManager.ts',
                        guiName: 'gate_group_mission',
                    }
                ]
            }
            if (guiItemComponentInfo.appendScripts && guiItemComponentInfo.appendScripts?.length > 0) {
                for (let i = 0; i < guiItemComponentInfo.appendScripts.length; i++) {
                    const element = guiItemComponentInfo.appendScripts[i];
                    if (element.type === 'gui') {
                        let res_add_type = await AppendScript.addGuiType(element.guiName)
                        assert.equal(res_add_type.success, true, '新增guiType成功')
                    }
                }
            }

            // // 移除
            // if (guiItemComponentInfo.appendScripts && guiItemComponentInfo.appendScripts?.length > 0) {
            //     for (let i = 0; i < guiItemComponentInfo.appendScripts.length; i++) {
            //         const element = guiItemComponentInfo.appendScripts[i];
            //         if (element.type == 'gui') {
            //             let res_add_type = await AppendScript.removeGuiType(element.guiName)
            //             assert.equal(res_add_type.success, true, '移除guiType成功')
            //         }
            //     }
            // }
            resolve(true)
        })
    })
}
let functions = [
    test_00,
    test_01,
    test_02
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
