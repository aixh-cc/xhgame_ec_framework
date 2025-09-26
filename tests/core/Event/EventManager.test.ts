import { assert, describe, test } from "poku";
import { EventManager } from "../../../packages/core/src/Event/EventManager";


const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('发送与接受', async () => {
            let eventManager = new EventManager()
            // mgr.setDebug(this.debug)
            let emit_arr = []
            let on_arr: any[] = []
            eventManager.on('test_val', (event, value) => {
                on_arr.push(value)
            })
            for (let i = 0; i < 10000; i++) {
                let _val = Math.floor(Math.random() * 1000)
                emit_arr.push(_val)
                eventManager.emit('test_val', _val)
            }
            // 断言
            testCheck('发送与接受', JSON.stringify(emit_arr), JSON.stringify(on_arr))
            resolve(true)
        })
    })
}
const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试监听', async () => {
            let eventManager = new EventManager()

            // eventManager.setDebug(this.debug)
            let emit_arr = []
            let effective_emit_arr = []
            let on_arr: any[] = []
            let callbackFn = (event: any, value: any) => {
                on_arr.push(value)
            }
            eventManager.on('test_val', callbackFn)
            let is_off = false
            for (let i = 0; i < 10000; i++) {
                let _val = Math.floor(Math.random() * 1000)
                if (i >= 50 && is_off == false) {
                    eventManager.off('test_val', callbackFn)
                    is_off = true
                }
                if (i < 50) {
                    effective_emit_arr.push(_val)
                }
                emit_arr.push(_val)
                eventManager.emit('test_val', _val)
            }
            // 断言
            testCheck('测试取消监听1', JSON.stringify(emit_arr) == JSON.stringify(on_arr), false)
            testCheck('测试取消监听2', JSON.stringify(effective_emit_arr), JSON.stringify(on_arr))

            resolve(true)
        })
    })
}

let functions = [
    test_00,
    test_01,
]

function testCheck(test_name: string, val: any, need: any) {
    let is_success = val === need
    assert(is_success, test_name);
    if (is_success == false) {
        console.error('测试【' + test_name + '】失败', "需要:\n", need, "实际:\n", val)
    }
    return is_success
}

describe('Event功能', async () => {
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
