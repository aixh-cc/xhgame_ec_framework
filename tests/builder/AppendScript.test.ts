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
                cocosVersions: ['3'],
                images: [],
                description: '特效项模板',
                author: 'hd',
                group: 'ItemTemplate',
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
                cocosVersions: ['3'],
                images: [],
                description: '技能表格项模板',
                author: 'hd',
                group: 'Table',
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
                cocosVersions: ['3'],
                images: [],
                description: '网关组任务模板',
                author: 'hd',
                group: 'Gui',
                tags: ['Gui'],
                dependencies: ['script/managers/MyUiManager.ts'],
                files: [],
                stars: 4,
                appendScripts: [
                    {
                        type: 'gui',
                        sourceFilePath: 'script/managers/MyUiManager.ts',
                        guiName: 'gate_group_mission',
                        guiPath: 'bundle_game://gui/battle/dialog/gate_group_mission'
                    }
                ]
            }
            if (guiItemComponentInfo.appendScripts && guiItemComponentInfo.appendScripts?.length > 0) {
                for (let i = 0; i < guiItemComponentInfo.appendScripts.length; i++) {
                    const element = guiItemComponentInfo.appendScripts[i];
                    if (element.type === 'gui') {
                        let res_add_type = await AppendScript.addGuiType(element.guiName, element.guiPath)
                        assert.equal(res_add_type.success, true, '新增guiType成功')
                    }
                }
            }

            // // 移除
            setTimeout(async () => {
                if (guiItemComponentInfo.appendScripts && guiItemComponentInfo.appendScripts?.length > 0) {
                    for (let i = 0; i < guiItemComponentInfo.appendScripts.length; i++) {
                        const element = guiItemComponentInfo.appendScripts[i];
                        if (element.type == 'gui') {
                            let res_add_type = await AppendScript.removeGuiType(element.guiName)
                            assert.equal(res_add_type.success, true, '移除guiType成功')
                        }
                    }
                }
                resolve(true)
            }, 500)

        })
    })
}

const test_03 = () => {
    return new Promise((resolve, reject) => {
        test('测试添加compItemComponentInfo', async () => {
            let compItemComponentInfo: IComponentInfo = {
                componentCode: 'gate_group_mission',
                componentName: 'gate_group_mission',
                componentVersion: '1.0.0',
                cocosVersions: ['3'],
                images: [],
                description: '网关组任务模板',
                author: 'hd',
                group: 'Comp',
                tags: ['Comp'],
                dependencies: ['script/RegisterComps.ts'],
                files: [],
                stars: 4,
                appendScripts: [
                    {
                        type: 'comp',
                        sourceFilePath: 'script/RegisterComps.ts',
                        compName: 'PlayerModelComp',
                        compPath: 'script/comps/models/PlayerModelComp'
                    }
                ]
            }
            if (compItemComponentInfo.appendScripts && compItemComponentInfo.appendScripts?.length > 0) {
                for (let i = 0; i < compItemComponentInfo.appendScripts.length; i++) {
                    const element = compItemComponentInfo.appendScripts[i];
                    if (element.type === 'comp') {
                        let res_add = await AppendScript.addComp(
                            {
                                sourceFilePath: element.sourceFilePath,
                                compName: element.compName,
                                compPath: element.compPath,
                            })
                        assert.equal(res_add.success, true, '新增comp成功')
                    }
                }
            }

            // // 移除
            setTimeout(async () => {
                if (compItemComponentInfo.appendScripts && compItemComponentInfo.appendScripts?.length > 0) {
                    for (let i = 0; i < compItemComponentInfo.appendScripts.length; i++) {
                        const element = compItemComponentInfo.appendScripts[i];
                        if (element.type == 'comp') {
                            let res_add_type = await AppendScript.removeComp(
                                element.sourceFilePath,
                                element.compName
                            )
                            assert.equal(res_add_type.success, true, '移除comp成功')
                        }
                    }
                }
                resolve(true)
            }, 1000)

        })
    })
}
const test_04 = () => {
    return new Promise((resolve, reject) => {
        test('测试添加audioItemComponentInfo', async () => {
            let audioItemComponentInfo: IComponentInfo = {
                componentCode: 'gate_group_mission',
                componentName: 'gate_group_mission',
                componentVersion: '1.0.0',
                cocosVersions: ['3'],
                images: [],
                description: '网关组任务模板',
                author: 'hd',
                group: 'Audio',
                tags: ['Audio'],
                dependencies: ['script/RegisterComps.ts'],
                files: [],
                stars: 4,
                appendScripts: [
                    {
                        type: 'audio',
                        sourceFilePath: 'script/managers/MyAudioManager.ts',
                        audioName: 'bgm3',
                        audioPath: 'bundle_gate://audio/qingbg'
                    }
                ]
            }
            if (audioItemComponentInfo.appendScripts && audioItemComponentInfo.appendScripts?.length > 0) {
                for (let i = 0; i < audioItemComponentInfo.appendScripts.length; i++) {
                    const element = audioItemComponentInfo.appendScripts[i];
                    if (element.type === 'audio') {
                        let res_add_type = await AppendScript.addAudioType(element.audioName, element.audioPath)
                        assert.equal(res_add_type.success, true, '新增audioType成功')
                    }
                }
            }

            // 移除
            setTimeout(async () => {
                if (audioItemComponentInfo.appendScripts && audioItemComponentInfo.appendScripts?.length > 0) {
                    for (let i = 0; i < audioItemComponentInfo.appendScripts.length; i++) {
                        const element = audioItemComponentInfo.appendScripts[i];
                        if (element.type == 'audio') {
                            let res_add_type = await AppendScript.removeAudioType(
                                element.audioName
                            )
                            assert.equal(res_add_type.success, true, '移除audioType成功')
                        }
                    }
                }
                resolve(true)
            }, 1000)

        })
    })
}
const test_05 = () => {
    return new Promise((resolve, reject) => {
        test('测试添加audioItemComponentInfo', async () => {
            let audioItemComponentInfo: IComponentInfo = {
                componentCode: 'gate_group_mission',
                componentName: 'gate_group_mission',
                componentVersion: '1.0.0',
                cocosVersions: ['3'],
                images: [],
                description: '网关组任务模板',
                author: 'hd',
                group: 'Audio',
                tags: ['Audio'],
                dependencies: ['script/RegisterComps.ts'],
                files: [],
                stars: 4,
                appendScripts: [
                    {
                        type: 'enum',
                        sourceFilePath: 'script/managers/MyEventManager.ts',
                        className: 'MyEventManager',
                        enumName: 'EventEnums',
                        enumKey: 'bgm5',
                        enumValue: 'bgm5_value'
                    }
                ]
            }
            if (audioItemComponentInfo.appendScripts && audioItemComponentInfo.appendScripts?.length > 0) {
                for (let i = 0; i < audioItemComponentInfo.appendScripts.length; i++) {
                    const element = audioItemComponentInfo.appendScripts[i];
                    if (element.type === 'enum') {
                        let res_add_type = await AppendScript.addEnum(element.className, element.enumName, element.enumKey, element.enumValue, element.sourceFilePath)
                        assert.equal(res_add_type.success, true, '新增' + element.enumName + '成功')
                    }
                }
            }

            // 移除
            setTimeout(async () => {
                if (audioItemComponentInfo.appendScripts && audioItemComponentInfo.appendScripts?.length > 0) {
                    for (let i = 0; i < audioItemComponentInfo.appendScripts.length; i++) {
                        const element = audioItemComponentInfo.appendScripts[i];
                        if (element.type == 'enum') {
                            let res_add_type = await AppendScript.removeEnum(
                                element.className,
                                element.enumName,
                                element.enumKey,
                                element.sourceFilePath
                            )
                            assert.equal(res_add_type.success, true, '移除' + element.enumName + '成功')
                        }
                    }
                }
                resolve(true)
            }, 1000)

        })
    })
}
let functions = [
    test_00,
    test_01,
    test_02,
    test_03,
    test_04,
    test_05
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
