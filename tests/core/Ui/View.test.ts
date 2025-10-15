import { assert, describe, test } from "poku";
import { TestView, TestViewComp } from "./TestUiData";
import { Entity } from "../../../packages/core/src/EC/Entity";
import { GameEntity } from "../EC/TestECData";
import { DI } from "../../../packages/core/src/DI/DI";


const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试View功能', async () => {
            let mygameEntiy = Entity.createEntity<GameEntity>(GameEntity)
            let testViewComp = await mygameEntiy.attachComponent(TestViewComp).done() as TestViewComp
            let testView = new TestView()
            assert.equal(testView.tips, 'tips_default', '原默认正确')
            testView.setViewComp(testViewComp)
            testView.bindModelMap = {
                "tips": 'TestViewComp::tips'
            }
            testViewComp.notify()
            assert.equal(testView.tips, 'tips_TestViewComp', 'testViewComp.notify后正确')
            testViewComp.tips = 'sss'
            testViewComp.notify()
            assert.equal(testView.tips, 'sss', '修改后，再次testViewComp.notify后正确')
            // console.log(DI.getContainer().getAll('TestViewComp'))
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
