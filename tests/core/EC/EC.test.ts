import { assert, describe, test } from "poku";
import { Entity } from "../../../packages/core/src/EC/Entity";
import { GameEntity, TestSenceComp, TestViewComp } from "./TestECData";


const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试实体', async () => {
            let mygameEntiy = Entity.createEntity<GameEntity>(GameEntity)
            // 断言
            assert.equal(Entity.entities.size, 1, '创建成功')
            assert.equal(mygameEntiy.model !== null, true, 'init成功')
            let find = Entity.getEntity(mygameEntiy.id)
            assert.equal(find?.id, mygameEntiy.id, 'getEntity正常')
            Entity.removeEntity(mygameEntiy)
            assert.equal(Entity.entities.size, 0, '移除成功')
            resolve(true)
        })
    })
}
const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('挂载组件', async () => {
            let mygameEntiy = Entity.createEntity<GameEntity>(GameEntity)
            mygameEntiy.attachComponent(TestSenceComp)
            // 断言
            assert.equal(mygameEntiy.getComponent(TestSenceComp)?.compName, 'TestSenceComp', 'attachComponent,getComponent正常')
            mygameEntiy.attachComponent(TestSenceComp)
            assert.equal(mygameEntiy.components.length, 2, '不重复挂载正常')

            mygameEntiy.detachComponent(TestSenceComp)
            //console.log(mygameEntiy)
            assert.equal(mygameEntiy.components.length, 1, 'detachComponent正常')

            let testSenceComp = mygameEntiy.attachComponent(TestSenceComp)
            assert.equal(mygameEntiy.components.length, 2, '再次挂载正常')
            let find = mygameEntiy.getComponentByName('TestSenceComp')
            assert.equal(find?.compName, 'TestSenceComp', 'getComponentByName正常')

            mygameEntiy.detachComponentByName(testSenceComp.compName)
            assert.equal(mygameEntiy.components.length, 1, 'detachComponentByName正常')
            Entity.removeEntity(mygameEntiy)
            resolve(true)
        })
    })
}
const test_02 = () => {
    return new Promise((resolve, reject) => {
        test('挂载组件并完成初始化', async () => {
            let mygameEntiy = Entity.createEntity<GameEntity>(GameEntity)
            let arr: number[] = []
            await mygameEntiy.attachComponent(TestSenceComp).setup({ arr: arr, add_value: 10 }).done()
            assert.equal(JSON.stringify(arr), '[121,232,343,454]', 'initComp正常1')
            await mygameEntiy.attachComponent(TestViewComp).setup({ arr: arr, add_value: 10 }).done()
            assert.equal(JSON.stringify(arr), '[131,242,353,464,565,676,787,898]', 'initComp正常2')
            Entity.removeEntity(mygameEntiy)
            resolve(true)
        })
    })
}


let functions = [
    test_00,
    test_01,
    test_02
]

describe('Entity功能', async () => {
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
