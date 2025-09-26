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
        test('测试取消监听', async () => {
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
const test_02 = () => {
    return new Promise((resolve, reject) => {
        test('测试多个相同监听', async () => {
            let eventManager = new EventManager()
            let emit_arr = []
            let effective_emit_arr = []
            let on_arr: any[] = []
            let callbackFn = (event: any, value: any) => {
                on_arr.push(value)
            }
            eventManager.on('test_val', callbackFn)
            eventManager.on('test_val', callbackFn)
            eventManager.on('test_val', callbackFn)
            let is_off = false
            let all_count = 10000;
            let real_count = 500;
            for (let i = 0; i < all_count; i++) {
                let _val = Math.floor(Math.random() * 1000)
                if (i >= real_count && is_off == false) {
                    is_off = true
                    eventManager.off('test_val', callbackFn)
                }
                if (i < real_count) {
                    effective_emit_arr.push(_val)
                }
                emit_arr.push(_val)
                eventManager.emit('test_val', _val)
            }
            // 断言
            testCheck('测试多个相同监听1', emit_arr[real_count - 1], on_arr[on_arr.length - 1])
            testCheck('测试多个相同监听2', emit_arr.length, all_count)
            testCheck('测试多个相同监听3', on_arr.length, real_count)
            resolve(true)
        })
    })
}
const test_03 = () => {
    return new Promise((resolve, reject) => {
        test('测试清除', async () => {
            let eventManager = new EventManager()

            let emit_arr = []
            let effective_emit_arr = []
            let on_arr: any[] = []
            let callbackFn = (event: any, value: any) => {
                on_arr.push(value)
            }
            eventManager.on('test_val', callbackFn)
            let is_off = false
            let all_count = 10000;
            let real_count = 500;
            for (let i = 0; i < all_count; i++) {
                let _val = Math.floor(Math.random() * 1000)
                if (i >= real_count && is_off == false) {
                    eventManager.clearByTag()
                    is_off = true
                }
                if (i < real_count) {
                    effective_emit_arr.push(_val)
                }
                emit_arr.push(_val)
                eventManager.emit('test_val', _val)
            }
            // 断言
            testCheck('测试清除1', JSON.stringify(emit_arr) == JSON.stringify(on_arr), false)
            testCheck('测试清除2', emit_arr.length, all_count)
            testCheck('测试清除3', on_arr.length, real_count)

            resolve(true)
        })
    })
}
const test_04 = () => {
    return new Promise((resolve, reject) => {
        test('测试多个不同监听(发送方是 空上下文)', async () => {
            let eventManager = new EventManager()
            let emit_arr = []
            let effective_emit_arr = []
            let on_arr: any[] = []
            let callbackFn = (event: any, value: any) => {
                on_arr.push(value)
            }
            let obj1 = new Object()
            let obj2 = new Object()
            eventManager.on('test_val', callbackFn, obj1)
            eventManager.on('test_val', callbackFn, obj2)
            let is_off = false
            let all_count = 10000;
            let real_count = 500;
            for (let i = 0; i < all_count; i++) {
                let _val = Math.floor(Math.random() * 1000)
                if (i >= real_count && is_off == false) {
                    eventManager.off('test_val', callbackFn, obj1)
                    is_off = true
                }
                if (i < real_count) {
                    effective_emit_arr.push(_val)
                }
                emit_arr.push(_val)
                eventManager.emit('test_val', _val)
            }
            // 断言
            testCheck('测试多个不同监听(发送方是 空上下文)1', on_arr.length, 0)
            testCheck('测试多个不同监听(发送方是 空上下文)2', effective_emit_arr.length, real_count)
            testCheck('测试多个不同监听(发送方是 空上下文)3', emit_arr.length, all_count)

            resolve(true)
        })
    })
}

const test_05 = () => {
    return new Promise((resolve, reject) => {
        test('测试多个不同监听(发送方是 有上下文)', async () => {
            let eventManager = new EventManager()

            let emit_arr = []
            let effective_emit_arr = []
            let obj1_on_arr: any[] = []
            let obj2_on_arr: any[] = []
            let callbackFn_1 = (event: any, value: any) => {
                obj1_on_arr.push(value)
            }
            let callbackFn_2 = (event: any, value: any) => {
                obj2_on_arr.push(value)
            }
            let obj1 = new Object()
            let obj2 = new Object()
            eventManager.on('test_val', callbackFn_1, obj1)
            eventManager.on('test_val', callbackFn_2, obj2)
            let is_off = false
            for (let i = 0; i < 10; i++) {
                let _val = Math.floor(Math.random() * 1000)
                if (i >= 5 && is_off == false) {
                    eventManager.off('test_val', callbackFn_1, obj1)
                    is_off = true
                }
                if (i < 5) {
                    effective_emit_arr.push(_val)
                }
                emit_arr.push(_val)
                eventManager.emit('test_val', _val, obj1)
                eventManager.emit('test_val', _val, obj2)
            }
            // 断言

            testCheck('测试多个不同监听(发送方是 有上下文)1', JSON.stringify(obj2_on_arr), JSON.stringify(emit_arr))
            testCheck('测试多个不同监听(发送方是 有上下文)2', JSON.stringify(obj1_on_arr), JSON.stringify(effective_emit_arr))

            resolve(true)
        })
    })
}

const test_06 = () => {
    return new Promise((resolve, reject) => {
        test('测试设置tag', async () => {
            let eventManager = new EventManager()
            let emit_arr = []
            let effective_emit_arr = []
            let obj1_on_arr: any[] = []
            let obj2_on_arr: any[] = []
            let obj3_on_arr: any[] = []
            let callbackFn_1 = (event: any, value: any) => {
                obj1_on_arr.push(value)
            }
            let callbackFn_2 = (event: any, value: any) => {
                obj2_on_arr.push(value)
            }
            let callbackFn_3 = (event: any, value: any) => {
                obj3_on_arr.push(value)
            }
            let obj1 = new Object()
            let obj2 = new Object()
            eventManager.on('test_val', callbackFn_1, obj1)
            eventManager.setTag('me').on('test_val2', callbackFn_2, obj2)
            eventManager.setTag('me').on('test_val3', callbackFn_3, obj2)
            let is_off = false
            for (let i = 0; i < 10; i++) {
                let _val = Math.floor(Math.random() * 1000)
                if (i >= 5 && is_off == false) {
                    eventManager.clearByTag('me')
                    is_off = true
                }
                if (i < 5) {
                    effective_emit_arr.push(_val)
                }
                emit_arr.push(_val)
                eventManager.emit('test_val', _val, obj1)
                eventManager.emit('test_val2', _val, obj2)
                eventManager.emit('test_val3', _val, obj2)
            }
            // 断言
            testCheck('测试设置tag1', JSON.stringify(obj1_on_arr), JSON.stringify(emit_arr))
            testCheck('测试删除tag2', JSON.stringify(obj2_on_arr), JSON.stringify(effective_emit_arr))
            testCheck('测试删除tag3', JSON.stringify(obj3_on_arr), JSON.stringify(effective_emit_arr))

            resolve(true)
        })
    })
}
let functions = [
    test_00,
    test_01,
    test_02,
    test_03,
    test_04,
    test_05,
    test_06,
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
