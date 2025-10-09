import { assert, describe, test } from "poku";
import { Entity } from "../../../packages/core/src/EC/Entity";
import { GameEntity } from "./TestECData";



const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('创建实体', async () => {
            let mygameEntiy = Entity.createEntity<GameEntity>(GameEntity)
            // 断言
            assert.equal(mygameEntiy.model?.platform, '', '是否已经有platform')
            resolve(true)
        })
    })
}
let functions = [
    test_00,
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
