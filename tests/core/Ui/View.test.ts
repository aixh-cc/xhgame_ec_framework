import { assert, describe, test } from "poku";
import { TestView, TestViewComp } from "./TestUiData";
import { Entity } from "../../../packages/core/src/EC/Entity";
import { GameEntity } from "../EC/TestECData";
import { DI } from "../../../packages/core/src/DI/DI";


const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试View功能', async () => {

            let mygameEntiy = Entity.createEntity<GameEntity>(GameEntity)
            let arr: number[] = []
            let testViewComp = await mygameEntiy.attachComponent(TestViewComp).done() as TestViewComp
            // console.log(testViewComp)
            let testView = new TestView()
            console.log('TestView 默认的tips=', testView.tips)
            testView.setViewComp(testViewComp)

            testView.bindModelMap = {
                "tips": 'TestViewComp::tips'
            }
            testViewComp.notify()
            console.log('testViewComp.notify 后，testView.tips值为：', testView.tips)

            testViewComp.tips = 'sss'
            testViewComp.notify()
            console.log(' sss 后 testViewComp.notify 后，testView.tips值为：', testView.tips)

            console.log(testView.tips)

        })
    })
}

let functions = [test_00]

describe('View功能', async () => {
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
