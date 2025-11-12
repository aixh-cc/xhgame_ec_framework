import { assert, describe, test } from "poku";
import { TestView, TestViewComp } from "./TestUiData";
import { Entity } from "../../../packages/core/src/EC/Entity";
import { GameEntity } from "../EC/TestECData";
import { Comp } from "../../../packages/core/src/EC/Comp";

const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试View功能', async () => {
            let mygameEntiy = Entity.createEntity<GameEntity>(GameEntity)
            let testViewComp = await mygameEntiy.attachComponent(TestViewComp).done() as TestViewComp
            let testView = new TestView()
            assert.equal(testView.tips, 'tips_default', 'testView.tips原默认正确')
            assert.equal(testView.personAge, 0, 'testView.personAge原默认正确')
            assert.equal(testView.personBooks.length, 0, 'testView.personBooks原默认正确')
            testView.setViewComp(testViewComp)
            testViewComp.notify(true)
            assert.equal(testView.tips, 'tips_TestViewComp', 'testViewComp.notify后testView.tips正确')
            assert.equal(testView.personAge, 0, 'testViewComp.notify后testView.personAge正确')
            assert.equal(testView.personBooks.length, 0, 'testViewComp.notify后testView.personBooks正确')
            testViewComp.tips = 'sss'
            testViewComp.viewVM = {
                person: {
                    name: '张三',
                    age: 23,
                    books: ['j', 'k']
                }
            };
            testViewComp.notify(true)
            assert.equal(testView.tips, 'sss', '再次testViewComp.notify后testView.tips正确')
            assert.equal(testView.personAge, 23, '再次testViewComp.notify后testView.personAge正确')
            assert.equal(testView.personName, '张三', '再次testViewComp.notify后testView.personName正确')
            assert.equal(JSON.stringify(testView.personBooks), '["j","k"]', '再次testViewComp.notify后testView.personBooks正确')
            // 
            testViewComp.tips = 'www'
            testViewComp.viewVM = {
                person: {
                    name: '李四',
                    age: 25,
                    books: ['l', 's']
                }
            };
            testViewComp.notify(true)
            assert.equal(testView.tips, 'www', '再再次testViewComp.notify后testView.tips正确')
            assert.equal(testView.personAge, 25, '再再次testViewComp.notify后testView.personAge正确')
            assert.equal(testView.personName, '李四', '再再次testViewComp.notify后testView.personName正确')
            assert.equal(JSON.stringify(testView.personBooks), '["l","s"]', '再再次testViewComp.notify后testView.personBooks正确')

            assert.equal(Comp.isDirtyComp(testViewComp), false, '赃标记=false正确')

            // 多次notify
            testViewComp.tips = 'wwwqq'
            testViewComp.viewVM = {
                person: {
                    name: '李四ww',
                    age: 28,
                    books: ['l', 's', 'w']
                }
            };
            testViewComp.notify()
            assert.equal(testView.tips, 'www', '(下一帧生效)testViewComp.notify后testView.tips正确')
            assert.equal(testView.personAge, 25, '(下一帧生效)testViewComp.notify后testView.personAge正确')
            assert.equal(testView.personName, '李四', '(下一帧生效)testViewComp.notify后testView.personName正确')
            assert.equal(JSON.stringify(testView.personBooks), '["l","s"]', '(下一帧生效)testViewComp.notify后testView.personBooks正确')

            assert.equal(Comp.isDirtyComp(testViewComp), true, '赃标记正确')

            Comp.doNotifyAllDirtyComps()
            assert.equal(testView.tips, 'wwwqq', '(下一帧生效)testViewComp.notify(true)后testView.tips正确')
            assert.equal(testView.personAge, 28, '(下一帧生效)testViewComp.notify(true)后testView.personAge正确')
            assert.equal(testView.personName, '李四ww', '(下一帧生效)testViewComp.notify(true)后testView.personName正确')
            assert.equal(JSON.stringify(testView.personBooks), '["l","s","w"]', '(下一帧生效)testViewComp.notify(true)后testView.personBooks正确')
            assert.equal(Comp.isDirtyComp(testViewComp), false, '赃标记=false正确')



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
