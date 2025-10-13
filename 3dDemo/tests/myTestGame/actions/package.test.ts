// import { GatePackagePanelComp } from "db://assets/script/severs/gate/PackagePanel/GatePackagePanelComp";
// import { GateSignViewComp } from "db://assets/script/severs/gate/GateSignViewComp";
// import { PackageType } from "db://assets/script/tsshared/defined/Interface";
import { xhgame } from "db://assets/script/xhgame";
import { assert, describe, test } from "poku";
import { TestGame } from "../TestGame";
import { DI } from "@aixh-cc/xhgame_ec_framework";

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
        test('测试查看包裹内容', async () => {
            await xhgame.gameEntity.attachComponent(GatePackagePanelComp).done()
            console.log(xhgame.gameEntity.playerPackageModel.packageInfo)
            xhgame.gameEntity.detachComponent(GatePackagePanelComp)
            resolve(true)
        })
    })
}

const test_02 = () => {
    return new Promise((resolve, reject) => {
        test('测试包裹获得签到奖励', async () => {
            let comp = await xhgame.gameEntity.attachComponent(GateSignViewComp).done() as GateSignViewComp
            let goodsItem = await comp.actions.getLing()
            if (goodsItem.length > 0) {
                // 未签到
                assert(goodsItem.length == 1, '长度正确');
                assert(goodsItem[0].goodsNo == 'xc001', '物品正确');
                assert(goodsItem[0].num == 1, '数量正确');
            } else {
                console.log('今日已签到')
            }
            resolve(true)
        })
    })
}

const test_03 = () => {
    return new Promise((resolve, reject) => {
        test('测试物品栏0与1格子内容互换', async () => {
            const comp = await xhgame.gameEntity.attachComponent(GatePackagePanelComp).done() as GatePackagePanelComp
            let packageInfo_old = await xhgame.gameEntity.playerPackageModel.actions.getPackageInfo()
            let the_0_goodsItem = packageInfo_old.packageItems[0].goodsItem
            let the_1_goodsItem = packageInfo_old.packageItems[1].goodsItem
            comp.actions.fromItemToItem(0, 1)
            let packageInfo_new = await xhgame.gameEntity.playerPackageModel.actions.getPackageInfo()
            assert(packageInfo_new.packageItems[0].goodsItem === the_1_goodsItem, '第一格')
            assert(packageInfo_new.packageItems[1].goodsItem === the_0_goodsItem, '第二格')
            xhgame.gameEntity.detachComponent(GatePackagePanelComp)
            resolve(true)
        })
    })
}
// const test_04 = () => {
//     return new Promise((resolve, reject) => {
//         test('测试从技能栏移动到装备栏', async () => {
//             const comp = await xhgame.gameEntity.attachComponent(GatePackagePanelComp).setup({ curPackageType: PackageType.Skill, curShap: 'O' }).done() as GatePackagePanelComp
//             let packageInfo_old = xhgame.gameEntity.playerPackageModel.packageInfo
//             let the_0_goodsItem = packageInfo_old.packageItems[0].goodsItem
//             if (the_0_goodsItem == null) {
//                 comp.actions.fromItemToItem(0, 1) // 如果第一格为空，则与第二格换一下
//             }
//             // comp.actions.fromItemToItem(0, 31)
//             // let packageInfo_new = xhgame.gameEntity.playerPackageModel.packageInfo
//             // assert(packageInfo_new.packageItems[0].goodsItem === null, '第一格')
//             // assert(packageInfo_new.packageItems[31].goodsItem === the_0_goodsItem, '第31格')
//             xhgame.gameEntity.detachComponent(GatePackagePanelComp)
//             resolve(true)
//         })
//     })
// }

let functions = [
    test_00,
    // test_01,
    // test_02,
    // test_03
]


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
    describe('包裹测试', async () => {
        while (functions.length > 0) {
            await functions.shift()()
            await wait0ms() // 为了输出字幕顺序正常(poku的问题)
            if (functions.length == 0) {
                xhgame.timer.timeStop()
            }
        }
    });
})


