import { join, resolve, dirname } from 'path';
import * as fs from 'fs';

/**
 * 获取 Cocos Creator 版本号
 * @returns Cocos Creator 版本号
 */
export async function getCocosVersion(): Promise<string> {
    const projectPath = getProjectPath();
    const packagePath = join(projectPath, 'package.json');
    const hasFile = fs.existsSync(packagePath);
    if (hasFile) {
        const packageInfo = JSON.parse(await fs.promises.readFile(packagePath, 'utf-8'));
        if (typeof packageInfo.creator != 'undefined') {
            return packageInfo.creator.version
        }
    }
    return 'unknown'
}

/**
 * 获取项目路径
 * @returns 项目路径
 */
export const getProjectPath = (): string => {
    if (typeof Editor != 'undefined' && Editor.Project) {
        return Editor.Project.path;
    } else {
        // 基于当前工作目录向上查找存在的“extensions”目录
        let current = resolve('./');
        while (true) {
            const extensionsDir = join(current, 'extensions');
            try {
                const stat = fs.statSync(extensionsDir);
                if (stat.isDirectory()) {
                    // 找到“extensions”，其父目录即为项目根目录
                    return current;
                }
            } catch (_) {
                // 未找到该目录，继续向上
            }

            const parent = resolve(current, '..');
            if (parent === current) {
                // 已到达文件系统根目录仍未找到
                break;
            }
            current = parent;
        }
        throw new Error('未找到项目根目录：未检测到“extensions”目录');
    }
};

/**
 * 获取 extensions 目录路径
 * @returns extensions 目录路径
 */
export const getExtensionsPath = () => {
    let projectPath = getProjectPath()
    return join(projectPath, 'extensions');
};

/**
 * 获取插件目录路径
 * @param pluginName 插件名称
 * @returns 插件目录路径
 */
export const getPluginPath = (pluginName: string) => {
    let projectPath = getProjectPath()
    return join(projectPath, 'extensions', pluginName);
};

/**
 * 获取插件的 packages 目录路径
 * @param pluginName 插件名称
 * @returns packages 目录路径
 */
export const getPackagesPath = (pluginName: string) => {
    let projectPath = getProjectPath()
    return join(projectPath, 'extensions', pluginName, 'packages');
};

/**
 * 获取插件的目标目录路径
 * @param pluginName 插件名称
 * @param group 目标目录名称
 * @returns 目标目录路径
 */
export const getGroupPath = (pluginName: string, group: string) => {
    let projectPath = getProjectPath()
    return join(projectPath, 'extensions', pluginName, 'packages', group);
};


// 先检查是否有同名文件冲突,去除.DS_Store的检测
export async function checkConflicts(conflictFiles: string[], srcDir: string, destDir: string, relativePath: string = '') {
    const items = await fs.promises.readdir(srcDir, { withFileTypes: true });

    for (const item of items) {
        const destPath = join(destDir, item.name);
        const relPath = join(relativePath, item.name);

        // 跳过所有 .meta 文件和文件夹,以及.DS_Store文件
        if (item.name.endsWith('.meta') || item.name === '.DS_Store') {
            continue;
        }

        if (item.isDirectory()) {
            // 检查目录下的文件
            const srcSubDir = join(srcDir, item.name);
            await checkConflicts(conflictFiles, srcSubDir, destPath, relPath);
        } else {
            // 检查文件是否已存在
            try {
                await fs.promises.access(destPath);
                conflictFiles.push(relPath);
            } catch (error) {
                // 文件不存在，没有冲突
            }
        }
    }
}

// 清理空目录
export const cleanupEmptyDirs = async (dirPath: string) => {
    try {
        const items = await fs.promises.readdir(dirPath);

        // 递归清理子目录
        for (const item of items) {
            const itemPath = join(dirPath, item);
            const stat = await fs.promises.stat(itemPath);
            if (stat.isDirectory()) {
                await cleanupEmptyDirs(itemPath);
            }
        }

        // 检查目录是否为空
        const remainingItems = await fs.promises.readdir(dirPath);
        if (remainingItems.length === 0) {
            await fs.promises.rmdir(dirPath);
            console.log(`[xhgame_builder] 删除空目录: ${dirPath}`);
        }
    } catch (error) {
        // 忽略清理目录时的错误
    }
};
export async function checkConflictsByList(conflictFiles: string[], srcRoot: string, destRoot: string, relPaths: string[]) {
    for (const rel of relPaths) {
        if (rel.endsWith('.meta') || rel.endsWith('.DS_Store')) continue;
        const destPath = join(destRoot, rel);
        try {
            await fs.promises.access(destPath);
            conflictFiles.push(rel);
        } catch { }
    }
}

export async function copyFilesByList(copiedFiles: string[], srcRoot: string, destRoot: string, relPaths: string[]) {
    for (const rel of relPaths) {
        const srcPath = join(srcRoot, rel);
        const destPath = join(destRoot, rel);
        try {
            await fs.promises.access(srcPath);
        } catch {
            console.error('未找到srcPath=' + srcPath)
            continue;
        }
        await fs.promises.mkdir(dirname(destPath), { recursive: true });
        await fs.promises.copyFile(srcPath, destPath);
        copiedFiles.push(rel);
        console.log(`[xhgame_builder] 复制文件: ${rel}`);
    }
}