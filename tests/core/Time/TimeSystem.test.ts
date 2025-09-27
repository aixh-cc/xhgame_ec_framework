import { assert, describe, test } from "poku";
import { TestUtil } from "../../TestUtil";
import { TimeSystem } from "../../../packages/core/src/Time/TimeSystem";

const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试时间功能', async () => {
            TestUtil.getInstance().setTimePassDt(10)
            assert.equal(TimeSystem.getInstance().getPassTime(), 0, '游戏时间流逝0秒正常')
            TimeSystem.getInstance().timePlay()
            await TimeSystem.getInstance().waitTimeSystemXms(200)
            assert.equal(TimeSystem.getInstance().getPassTime(), 200, '游戏时间流逝0.2秒正常')

            let uuid_01 = ''
            uuid_01 = TimeSystem.getInstance().scheduleOnce(() => {
                assert.equal(TimeSystem.getInstance().getPassTime(), 350, '等待0.15秒(1),uuid_01=' + uuid_01)
            }, 150)
            console.log('loop before time:' + TimeSystem.getInstance().getPassTime())
            let loop_count = 0;
            let loop_uuid = TimeSystem.getInstance().schedule(() => {
                loop_count++
                console.log('loop in time:' + TimeSystem.getInstance().getPassTime())
                if (loop_count == 1) {
                    assert.equal(TimeSystem.getInstance().getPassTime(), 1200, '第一次是执行在1200')
                }
            }, 1000)
            let uuid_02 = ''
            uuid_02 = TimeSystem.getInstance().scheduleOnce(() => {
                assert.equal(TimeSystem.getInstance().getPassTime(), 350, '等待0.15秒(2),uuid_02=' + uuid_02)
            }, 150)
            TimeSystem.getInstance().scheduleOnce(() => {
                TimeSystem.getInstance().unschedule(loop_uuid)
            }, 5000)
            await TimeSystem.getInstance().waitTimeSystemXms(7000)
            TimeSystem.getInstance().timeStop()
        })
    })
}

let functions = [test_00]

describe('时间功能TimeSystem', async () => {
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
