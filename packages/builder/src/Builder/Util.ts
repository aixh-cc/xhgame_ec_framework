import { join, resolve } from 'path';
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
                    console.log('getProjectPath:' + current)
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


