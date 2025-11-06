import { assert, describe, test } from "poku";
import * as fs from 'fs'
import { join } from 'path'
import { Pack } from "../../../packages/builder/src/Pack/Pack";
import { getProjectPath } from "../../../packages/builder/src/Builder/Util";

const test_01 = () => {
    return new Promise((resolve, reject) => {
        test('测试拷贝', async () => {
            const assetPath = 'assets/bundle_factory/item_views/textUiItems/toast_item'
            const res = await Pack.packItem(assetPath)

            assert.equal(res.success, true, 'packItem 应返回 success=true')

            const projectPath = getProjectPath()
            const targetRoot = join(projectPath, 'extensions', 'pack_demo', 'packages', 'textUiItems', 'toast_item')
            const targetItemDir = join(targetRoot, 'bundle_factory', 'item_views', 'textUiItems', 'toast_item')

            assert.equal(fs.existsSync(targetRoot), true, '目标根目录已创建')
            assert.equal(fs.existsSync(targetItemDir), true, '目标内部 item 目录已创建')

            // 验证目录内文件
            const expectedFiles = [
                'toast_item.prefab',
                'toast_item.prefab.meta',
                'toast_item_res.png',
                'toast_item_res.png.meta',
                'toast_item_res.anim',
                'toast_item_res.anim.meta',
            ]
            for (const f of expectedFiles) {
                assert.equal(fs.existsSync(join(targetItemDir, f)), true, `已复制文件: ${f}`)
            }

            // 验证同级 meta
            const itemMetaPath = join(projectPath, 'extensions', 'pack_demo', 'packages', 'textUiItems', 'toast_item', 'bundle_factory', 'item_views', 'textUiItems', 'toast_item.meta')
            assert.equal(fs.existsSync(itemMetaPath), true, '同级 toast_item.meta 已复制')

            // 返回值校验
            assert.equal(res.targetPath, targetRoot, '返回的 targetPath 正确')
            for (const f of expectedFiles) {
                const rel = join('bundle_factory', 'item_views', 'textUiItems', 'toast_item', f)
                assert.equal(res.copiedFiles?.includes(rel), true, `copiedFiles 包含: ${rel}`)
            }
            const relMeta = join('bundle_factory', 'item_views', 'textUiItems', 'toast_item.meta')
            assert.equal(res.copiedFiles?.includes(relMeta), true, `copiedFiles 包含: ${relMeta}`)

            resolve(true)
        })
    })
}

let functions = [
    test_01,
    // test_02
]

describe('Pack功能', async () => {
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
