import { GatePackagePanelComp } from "db://assets/script/severs/gate/PackagePanel/GatePackagePanelComp";
import { GateSignViewComp } from "db://assets/script/severs/gate/GateSignViewComp";
import { PackageType } from "../../../extensions/xhgame_plugin/assets/tsshared/defined/Interface";
import { xhgame } from "db://assets/script/xhgame";
import { assert, describe, test } from "poku";
import { TestGame } from "../TestGame";
import { GateGroupMissionComp } from "db://assets/script/severs/gate/GateGroupMissionComp";

const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试时间系统是否正常', async () => {
            let time1 = Date.now()
            xhgame.timer.scheduleOnce(() => {
                let time2 = Date.now()
                console.log('time2 - time1', time2 - time1)
                assert(time2 - time1 >= 1000, '相差1000ms以上');
                resolve(true)
            }, 1000)
        })
    })
}

const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试查看关卡信息', async () => {
            await xhgame.gameEntity.attachComponent(GateGroupMissionComp).done()
            console.log(xhgame.gameEntity.playerMissionModel.curGroupMissionInfo)
            assert(xhgame.gameEntity.playerMissionModel.curGroupMissionInfo.missionItems.length == 10, '关卡长度正常');
            xhgame.gameEntity.detachComponent(GateGroupMissionComp)
            resolve(true)
        })
    })
}

const test_02 = () => {
    return new Promise((resolve, reject) => {
        test('测试包裹获得签到奖励', async () => {
            let comp = await xhgame.gameEntity.attachComponent(GateGroupMissionComp).done() as GateGroupMissionComp
            comp.actions.clickMissionItem(1)
            // console.log(xhgame.gameEntity.playerModel)
            assert(xhgame.gameEntity.playerModel.selectedBattleId == 2, '关卡选择第二关' + xhgame.gameEntity.playerModel.selectedBattleId);
            resolve(true)
        })
    })
}

// const test_03 = () => {
//     return new Promise((resolve, reject) => {
//         test('测试物品栏0与1格子内容互换', async () => {
//             const comp = await xhgame.gameEntity.attachComponent(GatePackagePanelComp).done() as GatePackagePanelComp
//             let packageInfo_old = await xhgame.gameEntity.playerPackageModel.actions.getPackageInfo()
//             let the_0_goodsItem = packageInfo_old.packageItems[0].goodsItem
//             let the_1_goodsItem = packageInfo_old.packageItems[1].goodsItem
//             comp.actions.fromItemToItem(0, 1)
//             let packageInfo_new = await xhgame.gameEntity.playerPackageModel.actions.getPackageInfo()
//             assert(packageInfo_new.packageItems[0].goodsItem === the_1_goodsItem, '第一格')
//             assert(packageInfo_new.packageItems[1].goodsItem === the_0_goodsItem, '第二格')
//             xhgame.gameEntity.detachComponent(GatePackagePanelComp)
//             resolve(true)
//         })
//     })
// }

let functions = [test_00, test_01, test_02]

const wait0ms = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, 0)
    })
}

// 初始化及开始
let testGame = new TestGame()
testGame.start().then(() => {
    describe('关卡测试', async () => {
        while (functions.length > 0) {
            await functions.shift()()
            await wait0ms() // 为了输出字幕顺序正常(poku的问题)
            if (functions.length == 0) {
                xhgame.timer.timeStop()
            }
        }
    });
})


