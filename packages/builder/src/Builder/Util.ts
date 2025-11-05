import { join, resolve } from 'path';
import * as fs from 'fs';

export const getProjectPath = () => {
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

export const getExtensionsPath = () => {
    let projectPath = getProjectPath()
    return join(projectPath, 'extensions');
};

export const getPluginPath = (pluginName: string) => {
    let projectPath = getProjectPath()
    return join(projectPath, 'extensions', pluginName);
};

// 获取项目根目录下的 packages 路径
export const getPackagesPath = (pluginName: string, target: string) => {
    let projectPath = getProjectPath()
    return join(projectPath, 'extensions', pluginName, 'assets', target);
};


