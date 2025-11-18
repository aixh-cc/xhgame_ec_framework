

import * as fs from 'fs';
import { join, basename } from 'path';
import { getProjectPath } from '../Builder/Util';
import { IComponentInfo } from '../Builder/Defined';

export interface IPackResult {
    success: boolean;
    error?: string;
    targetPath?: string;
    copiedFiles?: string[];
}

export class Pack {
    /**
     * 将指定的 assets 路径（例如：assets/bundle_factory/item_views/textUiItems/toast_item）
     * 打包复制到 extensions/pack_demo/packages/<group>/<item>/bundle_factory/item_views/<group>/<item>
     * 并包含同级的 <item>.meta 文件。
     */
    static async packItem(assetItemPath: string, pluginName: string = 'pack_demo'): Promise<IPackResult> {
        try {
            const projectPath = getProjectPath();

            // 校验输入并定位源目录
            if (!assetItemPath || !assetItemPath.startsWith('assets/')) {
                return { success: false, error: '请输入以 assets/ 开头的资源路径' };
            }

            const sourceItemAbs = join(projectPath, assetItemPath);
            const hasSourceDir = fs.existsSync(sourceItemAbs) && fs.statSync(sourceItemAbs).isDirectory();
            if (!hasSourceDir) {
                return { success: false, error: `源目录不存在：${assetItemPath}` };
            }

            const itemName = basename(sourceItemAbs);
            // 解析组名（父目录名）与内部相对路径（去掉 assets/ 前缀）
            const internalRelative = assetItemPath.replace(/^assets\//, '');
            const parts = internalRelative.split('/');
            if (parts.length < 2) {
                return { success: false, error: '资源路径格式不正确' };
            }
            // group 取 itemName 的上一级目录
            const group = parts[parts.length - 2];

            // 目标根：extensions/pack_demo/packages/<group>/<item>
            const targetRoot = join(projectPath, 'extensions', pluginName, 'packages', group, itemName);
            // 目标内部结构：bundle_factory/item_views/<group>/<item>
            const targetInternalBase = join(targetRoot, 'bundle_factory', 'item_views', group);
            const targetItemDir = join(targetInternalBase, itemName);

            // 如果已有旧内容，删除后重建
            await fs.promises.rm(targetRoot, { recursive: true, force: true }).catch(() => { });
            await fs.promises.mkdir(targetItemDir, { recursive: true });

            const copiedFiles: string[] = [];

            // 递归复制目录
            await Pack.copyDirectory(sourceItemAbs, targetItemDir, (rel) => {
                copiedFiles.push(join('bundle_factory', 'item_views', group, itemName, rel));
            });

            // 复制同级的 <item>.meta（如果存在）到 bundle_factory/item_views/<group>/<item>.meta
            const sourceMeta = sourceItemAbs + '.meta';
            if (fs.existsSync(sourceMeta) && fs.statSync(sourceMeta).isFile()) {
                const targetMeta = join(targetInternalBase, itemName + '.meta');
                await fs.promises.copyFile(sourceMeta, targetMeta);
                copiedFiles.push(join('bundle_factory', 'item_views', group, itemName + '.meta'));
            }

            // 生成或更新 setup.json（位于 group 目录下，如: extensions/<plugin>/packages/<group>/<item>.setup.json）
            const setupJsonPath = join(projectPath, 'extensions', pluginName, 'packages', group, `${itemName}.setup.json`);
            await Pack.writeSetupJson(setupJsonPath, {
                itemName,
                group,
                files: copiedFiles
            });

            return {
                success: true,
                targetPath: targetRoot,
                copiedFiles
            };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : String(err) };
        }
    }

    private static async copyDirectory(srcDir: string, destDir: string, onCopied?: (relativePath: string) => void) {
        await fs.promises.mkdir(destDir, { recursive: true });
        const items = await fs.promises.readdir(srcDir, { withFileTypes: true });
        for (const item of items) {
            const srcPath = join(srcDir, item.name);
            const destPath = join(destDir, item.name);
            if (item.isDirectory()) {
                await Pack.copyDirectory(srcPath, destPath, (rel) => {
                    onCopied && onCopied(join(item.name, rel));
                });
            } else {
                await fs.promises.copyFile(srcPath, destPath);
                onCopied && onCopied(item.name);
            }
        }
    }

    private static async writeSetupJson(setupPath: string, info: { itemName: string, group: string, files: string[] }) {
        const { itemName, group, files } = info;
        let setupComponentInfo: IComponentInfo | null = null;
        try {
            if (fs.existsSync(setupPath)) {
                const content = await fs.promises.readFile(setupPath, 'utf-8');
                const parsed = JSON.parse(content);
                // 仅更新 files 字段
                if (typeof parsed === 'object' && parsed) {
                    parsed.files = files;
                    setupComponentInfo = parsed as IComponentInfo;
                }
            }
        } catch (_) {
            // 解析失败则走默认
            setupComponentInfo = null;
        }

        if (!setupComponentInfo) {
            const defaultInfo: IComponentInfo = {
                componentCode: itemName,
                componentName: itemName,
                componentVersion: '1.0.0',
                cocosVersions: ['3'],
                images: [],
                description: '',
                author: 'auto',
                group: group,
                tags: [],
                dependencies: [],
                files: files,
            };
            setupComponentInfo = defaultInfo;
        }

        await fs.promises.writeFile(setupPath, JSON.stringify(setupComponentInfo, null, 2), 'utf-8');
    }
}