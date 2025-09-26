import { EventManager } from "../../extensions/xhgame-plugin-framework/assets/libs/event/EventManager"

class EventManagerTest {

    debug: boolean = false



    /** 测试清除 */
    public test_4() {
        let mgr = new EventManager()
        mgr.setDebug(this.debug)
        let emit_arr = []
        let effective_emit_arr = []
        let on_arr = []
        let callbackFn = (event, value) => {
            on_arr.push(value)
        }
        mgr.on('test_val', callbackFn)
        let is_off = false
        for (let i = 0; i < 10; i++) {
            let _val = Math.floor(Math.random() * 1000)
            if (i >= 5 && is_off == false) {
                mgr.clear()
                is_off = true
            }
            if (i < 5) {
                effective_emit_arr.push(_val)
            }
            emit_arr.push(_val)
            mgr.emit('test_val', _val)
        }
        // 断言
        console.assert(this._testCheck('测试清除1', JSON.stringify(emit_arr) == JSON.stringify(on_arr), false))

    }

    /** 测试多个不同监听(发送方是 空上下文) */
    public test_5() {
        let mgr = new EventManager()
        mgr.setDebug(this.debug)
        let emit_arr = []
        let effective_emit_arr = []
        let on_arr = []
        let callbackFn = (event, value) => {
            on_arr.push(value)
        }
        let obj1 = new Object()
        let obj2 = new Object()
        mgr.on('test_val', callbackFn, obj1)
        mgr.on('test_val', callbackFn, obj2)
        let is_off = false
        for (let i = 0; i < 10; i++) {
            let _val = Math.floor(Math.random() * 1000)
            if (i >= 5 && is_off == false) {
                mgr.off('test_val', callbackFn, obj1)
                is_off = true
            }
            if (i < 5) {
                effective_emit_arr.push(_val)
            }
            emit_arr.push(_val)
            mgr.emit('test_val', _val)
        }
        // 断言
        console.assert(this._testCheck('测试多个不同监听(发送方是 空上下文)1', on_arr.length == 0, true))
        console.assert(this._testCheck('测试多个不同监听(发送方是 空上下文)2', effective_emit_arr.length == 5, true))
        console.assert(this._testCheck('测试多个不同监听(发送方是 空上下文)3', emit_arr.length == 10, true))
    }

    /** 测试多个不同监听(发送方是 有上下文) */
    public test_6() {
        let mgr = new EventManager()
        mgr.setDebug(this.debug)
        let emit_arr = []
        let effective_emit_arr = []
        let obj1_on_arr = []
        let obj2_on_arr = []
        let callbackFn_1 = (event, value) => {
            obj1_on_arr.push(value)
        }
        let callbackFn_2 = (event, value) => {
            obj2_on_arr.push(value)
        }
        let obj1 = new Object()
        let obj2 = new Object()
        mgr.on('test_val', callbackFn_1, obj1)
        mgr.on('test_val', callbackFn_2, obj2)
        let is_off = false
        for (let i = 0; i < 10; i++) {
            let _val = Math.floor(Math.random() * 1000)
            if (i >= 5 && is_off == false) {
                mgr.off('test_val', callbackFn_1, obj1)
                is_off = true
            }
            if (i < 5) {
                effective_emit_arr.push(_val)
            }
            emit_arr.push(_val)
            mgr.emit('test_val', _val, obj1)
            mgr.emit('test_val', _val, obj2)
        }
        // 断言

        console.assert(this._testCheck('测试多个不同监听(发送方是 有上下文)1', JSON.stringify(obj2_on_arr), JSON.stringify(emit_arr)))
        console.assert(this._testCheck('测试多个不同监听(发送方是 有上下文)2', JSON.stringify(obj1_on_arr), JSON.stringify(effective_emit_arr)))

    }
    /** 测试设置tag */
    public test_7() {
        let mgr = new EventManager()
        mgr.setDebug(this.debug)
        let emit_arr = []
        let effective_emit_arr = []
        let obj1_on_arr = []
        let obj2_on_arr = []
        let obj3_on_arr = []
        let callbackFn_1 = (event, value) => {
            obj1_on_arr.push(value)
        }
        let callbackFn_2 = (event, value) => {
            obj2_on_arr.push(value)
        }
        let callbackFn_3 = (event, value) => {
            obj3_on_arr.push(value)
        }
        let obj1 = new Object()
        let obj2 = new Object()
        mgr.on('test_val', callbackFn_1, obj1)
        mgr.setTag('me').on('test_val2', callbackFn_2, obj2)
        mgr.setTag('me').on('test_val3', callbackFn_3, obj2)
        let is_off = false
        for (let i = 0; i < 10; i++) {
            let _val = Math.floor(Math.random() * 1000)
            if (i >= 5 && is_off == false) {
                mgr.clear('me')
                is_off = true
            }
            if (i < 5) {
                effective_emit_arr.push(_val)
            }
            emit_arr.push(_val)
            mgr.emit('test_val', _val, obj1)
            mgr.emit('test_val2', _val, obj2)
            mgr.emit('test_val3', _val, obj2)
        }
        // 断言
        console.assert(this._testCheck('测试设置tag1', JSON.stringify(obj1_on_arr), JSON.stringify(emit_arr)))
        console.assert(this._testCheck('测试删除tag2', JSON.stringify(obj2_on_arr), JSON.stringify(effective_emit_arr)))
        console.assert(this._testCheck('测试删除tag3', JSON.stringify(obj3_on_arr), JSON.stringify(effective_emit_arr)))
    }

    // // 结果预测
    // private _booleanCheck(test_name: string, boolean_val: boolean, boolean_need: boolean, at_obj: any = null) {
    //     let is_success = boolean_val == boolean_need
    //     if (is_success == false) {
    //         console.error('测试【' + test_name + '】失败，需要:', boolean_need, '实际:', boolean_val, at_obj)
    //     } else {
    //         console.log('测试【' + test_name + '】成功');
    //     }
    //     return is_success
    // }

    // 结果预测
    private _testCheck(test_name: string, val: any, need: any) {
        let is_success = val == need
        if (is_success == false) {
            console.error('测试【' + test_name + '】失败', '需要:', need, '实际:', val)
        } else {
            console.log('测试【' + test_name + '】成功');
        }
        return is_success
    }
}

let test = new EventManagerTest()
test.debug = false
test.test_1()
test.debug = false
test.test_2()
test.debug = false
test.test_3()
test.debug = false
test.test_4()
test.debug = false
test.test_5()
test.debug = false
test.test_6()
test.debug = false
test.test_7()