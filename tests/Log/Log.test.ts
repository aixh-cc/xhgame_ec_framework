import { assert, describe, test } from "poku";
import { ColorLogger } from "../../src/Log/Index";

const test_00 = () => {
    return new Promise((resolve, reject) => {
        test('测试Log功能', async () => {
            let logger = ColorLogger.getInstance({ level: 'debug' })
            logger.debug('测试log', { a: 1 })
            logger.info('测试log', { a: 1 })
            logger.warn('测试log', { a: 1 })
            logger.error('测试log', { a: 1 })
            logger.verbose('测试log', { a: 1 })
            logger.success('测试log', { a: 1 })
            logger.custom('red', '测试log', { a: 1 })
            logger.setLevel('warn')
            logger.success('setLevel:warn')
            logger.debug('测试log', { a: 2 })
            logger.info('测试log', { a: 2 })
            logger.warn('测试log', { a: 2 })
            logger.error('测试log', { a: 2 })
            logger.verbose('测试log', { a: 2 })
            logger.success('测试log', { a: 2 })
            logger.custom('red', '测试log', { a: 2 })
            logger.custom('green', '测试log', { a: 2 })
            logger.enableColors(false)
            logger.custom('green', '测试log', { a: 3 })
            logger.enableTimestamp(false)
            logger.warn('测试log', { a: 4 })
            assert.equal(logger.getLevel(), 'warn')
        })
    })
}

let functions = [test_00]

describe('Log功能', async () => {
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
