import { describe, test, expect, beforeEach } from "bun:test";
import { EventManager } from "../../src/Event/EventManager";

describe("Event功能", () => {
    let eventManager: EventManager;

    beforeEach(() => {
        eventManager = new EventManager();
    });

    test("发送与接受", () => {
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
        expect(emit_arr).toEqual(on_arr)
    });

    test("测试取消监听", () => {
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
        expect(emit_arr).not.toEqual(on_arr)
        expect(effective_emit_arr).toEqual(on_arr)
    });

    test("测试多个相同监听", () => {
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
        // 标准行为：3次 on() 绑定3个监听器，每次 emit 触发3次
        expect(on_arr.length).toBe(real_count * 3)
    });

    test("测试清除", () => {
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
        expect(emit_arr).not.toEqual(on_arr)
        expect(emit_arr.length).toBe(all_count)
        expect(on_arr.length).toBe(real_count)
    });

    test("测试多个不同监听(发送方是 空上下文)", () => {
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
        expect(on_arr.length).toBe(0)
        expect(effective_emit_arr.length).toBe(real_count)
        expect(emit_arr.length).toBe(all_count)
    });

    test("测试多个不同监听(发送方是 有上下文)", () => {
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
        expect(obj2_on_arr).toEqual(emit_arr)
        expect(obj1_on_arr).toEqual(effective_emit_arr)
    });

    test("按 name+context 去重（匿名函数场景）", () => {
        let callCount = 0
        const context = {}

        // 模拟 bindRedDot 场景：相同 name + context，每次传入新的匿名函数
        // 按 name+context 去重，后续调用会替换之前的监听器
        eventManager.onSingle('redDot_key1', (event, data) => { callCount++ }, context)
        eventManager.onSingle('redDot_key1', (event, data) => { callCount++ }, context)
        eventManager.onSingle('redDot_key1', (event, data) => { callCount++ }, context)

        eventManager.emit('redDot_key1', {}, context)

        // 只保留最后一个监听器，触发1次
        expect(callCount).toBe(1)
    });

    test("按 name+context 去重（同一函数引用）", () => {
        let callCount = 0
        const context = {}
        const callback = (event: any, data: any) => { callCount++ }

        eventManager.onSingle('redDot_key1', callback, context)
        eventManager.onSingle('redDot_key1', callback, context)
        eventManager.onSingle('redDot_key1', callback, context)

        eventManager.emit('redDot_key1', {}, context)

        // 只保留最后一个监听器，触发1次
        expect(callCount).toBe(1)
    });

    test("测试设置tag", () => {
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
        expect(obj1_on_arr).toEqual(emit_arr)
        expect(obj2_on_arr).toEqual(effective_emit_arr)
        expect(obj3_on_arr).toEqual(effective_emit_arr)
    });
});
