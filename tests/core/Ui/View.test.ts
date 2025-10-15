import { assert, describe, test } from "poku";
import { BaseView } from "../../../packages/core/src/Ui/BaseView";

class GateView extends BaseView {
    name: string = 'GateView'
    reset(): void {

    }
}


const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试View功能', async () => {
            let gateView = new GateView()

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
