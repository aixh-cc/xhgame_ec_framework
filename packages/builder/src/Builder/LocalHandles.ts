import * as fs from 'fs';
import { join, basename, dirname } from 'path';
import AdmZip from 'adm-zip';
import { IComponentInfo, IComponentInfoWithStatus, IGetGroupComponentListRes, ILocalInstalledInfoRes, IInstallRes, IUninstallRes, InstalledComponentMeta } from './Defined';
import { getGroupPath, getProjectPath } from './Util';
import { InstallInfoManager } from './InstallInfoManager';

export class LocalHandles {

    static managerMap: Map<string, InstallInfoManager> = new Map();

    static getInstallInfoManager(pluginName: string): InstallInfoManager {
        if (!LocalHandles.managerMap.has(pluginName)) {
            LocalHandles.managerMap.set(pluginName, new InstallInfoManager(pluginName));
        }
        return LocalHandles.managerMap.get(pluginName)!;
    }


    /**
     * 读取插件安装信息
     * @param param 包含插件名的参数对象
     * @returns 包含安装信息或错误信息的响应对象
     */
    static async readInstallInfo(param: { pluginName: string }): Promise<ILocalInstalledInfoRes> {
        const { pluginName } = param;
        if (!pluginName) {
            return {
                success: false,
                error: '插件名不能为空',
            };
        }
        const installInfoManager = LocalHandles.getInstallInfoManager(pluginName);
        const installInfo = await installInfoManager.readInstallInfo();
        if (!installInfoManager.exists()) {
            installInfoManager.writeInstallInfo(installInfo);
        }
        return {
            success: true,
            localInstalledInfo: installInfo
        };
    }

    /**
     * 获取插件分组下的组件列表
     * @param pluginName 插件名称
     * @param group 分组名称
     * @returns 包含组件列表或错误信息的响应对象
     */
    static async getGroupComponentList(pluginName: string, group: string): Promise<IGetGroupComponentListRes> {
        console.log('getGroupComponentList', pluginName, group)
        try {
            const groupPath = getGroupPath(pluginName, group);
            if (!fs.existsSync(groupPath)) {
                return {
                    success: false,
                    error: 'Packages directory not found',
                    groupPath: '',
                    list: []
                };
            }
            // 当前组件安装情况
            const installInfoManager = LocalHandles.getInstallInfoManager(pluginName);
            const installInfo = await installInfoManager.readInstallInfo();
            const installedLists = installInfo?.installedComponentMetas?.map((item: InstalledComponentMeta) => item.componentCode) || []
            const items = fs.readdirSync(groupPath);
            const list: IComponentInfoWithStatus[] = [];
            // 新逻辑：检测并读取 *.setup.json 文件，取消从 .meta 中读取
            for (const item of items) {
                // 仅处理以 .setup.json 结尾的文件（例如：toast_item.setup.json）
                if (!item.endsWith('.setup.json')) continue;
                const setupFilePath = join(groupPath, item);
                try {
                    const content = await fs.promises.readFile(setupFilePath, 'utf-8');
                    const json: IComponentInfo = JSON.parse(content);
                    if (json && typeof json === 'object') {
                        // 带上 installStatus 和 backupStatus
                        const info: IComponentInfoWithStatus = {
                            ...json,
                            // 状态字段
                            installStatus: installedLists.indexOf(json.componentCode || basename(item, '.setup.json')) > -1 ? 'has' : 'none',
                            backupStatus: 'none'
                        };
                        list.push(info);
                    }
                } catch (error) {
                    console.error(`读取或解析 ${item} 失败:`, error);
                }
            }
            return {
                success: true,
                groupPath,
                list
            };
        } catch (error) {
            return {
                success: false,
                error: 'Failed to get items',
                groupPath: '',
                list: []
            };
        }
    }
    static async installComponent(param: { componentCode: string, pluginName: string, group: string }): Promise<IInstallRes> {

        const { componentCode, pluginName, group } = param;
        if (!componentCode || !pluginName || !group) {
            return {
                success: false,
                error: '组件名或插件名或者分组不能为空'
            };
        }
        let extractTempDir = '';
        try {
            let groupPath = getGroupPath(pluginName, group)
            console.log(`[xhgame_builder] 组件安装目录: ${groupPath}`);

            const zipFilePath = join(groupPath, `${componentCode}.zip`);
            const legacyDirPath = join(groupPath, componentCode);

            // 解压源目录（如果是zip）或使用旧目录模式
            let assetsSourcePath = legacyDirPath;
            if (fs.existsSync(zipFilePath)) {
                console.log(`[xhgame_builder] 发现zip包，准备解压: ${zipFilePath}`);
                extractTempDir = join(groupPath, '__extract', componentCode);
                await fs.promises.mkdir(extractTempDir, { recursive: true });

                const zip = new AdmZip(zipFilePath);
                zip.extractAllTo(extractTempDir, true);
                console.log(`[xhgame_builder] 解压完成到: ${extractTempDir}`);

                // 选择正确的根目录：
                // 1) 若存在单个顶级目录（排除 __MACOSX），以该目录为根
                // 2) 若根目录下存在 assets，则以 assets 作为源
                // 3) 否则使用解压根目录
                const topEntries = await fs.promises.readdir(extractTempDir, { withFileTypes: true });
                const candidateDirs = topEntries.filter(e => e.isDirectory() && e.name !== '__MACOSX');
                let baseRoot = extractTempDir;
                if (candidateDirs.length === 1) {
                    baseRoot = join(extractTempDir, candidateDirs[0].name);
                }
                const extractedAssetsDir = join(baseRoot, 'assets');
                assetsSourcePath = fs.existsSync(extractedAssetsDir) ? extractedAssetsDir : baseRoot;
            } else if (fs.existsSync(legacyDirPath)) {
                console.log(`[xhgame_builder] 使用旧目录模式: ${legacyDirPath}`);
                assetsSourcePath = legacyDirPath;
            } else {
                return {
                    success: false,
                    error: `未找到组件资源：${zipFilePath} 或 ${legacyDirPath}`
                };
            }

            // 获取项目assets/script目录路径
            const projectPath = getProjectPath();
            const targetPath = join(projectPath, 'assets');

            // 确保目标目录存在
            await fs.promises.mkdir(targetPath, { recursive: true });

            console.log(`[xhgame_builder] 源路径: ${assetsSourcePath}`);
            console.log(`[xhgame_builder] 目标路径: ${targetPath}`);

            // 复制所需文件到项目 assets 目录
            const copiedFiles: string[] = [];
            const conflictFiles: string[] = [];
            const missingFiles: string[] = [];

            // 先检查是否有同名文件冲突
            async function checkConflicts(srcDir: string, destDir: string, relativePath: string = '') {
                const items = await fs.promises.readdir(srcDir, { withFileTypes: true });

                for (const item of items) {
                    const destPath = join(destDir, item.name);
                    const relPath = join(relativePath, item.name);

                    // 跳过所有 .meta 文件和文件夹
                    if (item.name.endsWith('.meta')) {
                        continue;
                    }

                    if (item.isDirectory()) {
                        // 检查目录下的文件
                        const srcSubDir = join(srcDir, item.name);
                        await checkConflicts(srcSubDir, destPath, relPath);
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

            // 旧模式或无meta：复制整个源目录（保持兼容）
            await checkConflicts(assetsSourcePath, targetPath);
            if (conflictFiles.length > 0) {
                console.log(`[xhgame_builder] 检测到冲突文件: ${conflictFiles.join('\n')}`);
                return {
                    success: false,
                    error: `安装失败：检测到以下文件已存在，请先删除或备份这些文件：\n${conflictFiles.join('\n')}`,
                };
            }
            console.log(`[xhgame_builder] 没有冲突文件，开始复制整个目录...`);
            await copyDirectory(assetsSourcePath, targetPath);


            async function copyDirectory(srcDir: string, destDir: string, relativePath: string = '') {
                const items = await fs.promises.readdir(srcDir, { withFileTypes: true });

                for (const item of items) {
                    const srcPath = join(srcDir, item.name);
                    const destPath = join(destDir, item.name);
                    const relPath = join(relativePath, item.name);



                    if (item.isDirectory()) {
                        // 所有 .meta 文件夹可以跳过
                        if (item.name.endsWith('.meta')) {
                            continue;
                        }
                        // 创建目录
                        await fs.promises.mkdir(destPath, { recursive: true });
                        await copyDirectory(srcPath, destPath, relPath);
                    } else {
                        // 复制文件
                        await fs.promises.copyFile(srcPath, destPath);
                        copiedFiles.push(relPath);
                        console.log(`[xhgame_builder] 复制文件: ${relPath}`);
                    }
                }
            }

            console.log(`[xhgame_builder] 组件安装完成，共复制 ${copiedFiles.length} 个文件`);

            // 记录安装信息到配置文件 copiedFiles等到xhgame_builder-installInfo.json中的 installedComponents
            try {
                const installInfoManager = LocalHandles.getInstallInfoManager(pluginName);
                const setupPath = join(groupPath, componentCode);
                const content = await fs.promises.readFile(setupPath, 'utf-8');
                const json: IComponentInfoWithStatus = JSON.parse(content);
                await installInfoManager.updateComponentRecord(componentCode, json.componentName, json.componentVersion, copiedFiles);
            } catch (writeErr) {
                console.warn(`[xhgame_builder] 写入安装信息失败，但组件安装已完成:`, writeErr);
            }

            // 记录安装信息到配置文件 copiedFiles等到xhgame_builder-installInfo.json中的 installedComponents



            return {
                success: true,
                error: `组件 ${componentCode} 从内置资源安装成功！`,
                // copiedFiles: copiedFiles
            };

        } catch (error) {
            console.error(`[xhgame_builder] 从内置资源安装组件失败: `, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        } finally {
            // 清理临时解压目录
            if (extractTempDir && fs.existsSync(extractTempDir)) {
                try {
                    await fs.promises.rm(extractTempDir, { recursive: true, force: true });
                    const parentExtractDir = join(getGroupPath(pluginName, group), '__extract');
                    // 若父目录为空则清理
                    try {
                        const remain = await fs.promises.readdir(parentExtractDir);
                        if (remain.length === 0) {
                            await fs.promises.rm(parentExtractDir, { recursive: true, force: true });
                        }
                    } catch { }
                } catch (cleanupErr) {
                    console.warn(`[xhgame_builder] 清理临时目录失败: ${extractTempDir}`, cleanupErr);
                }
            }
        }
    }
    static async uninstallComponent(param: { componentCode: string; pluginName: string; }): Promise<IUninstallRes> {
        console.log('uninstallComponent', param)
        const { componentCode, pluginName } = param;
        if (!componentCode || !pluginName) {
            return {
                success: false,
                error: '组件名或插件名不能为空'
            };
        }

        console.log(`[xhgame_builder] 安装卸载组件请求: ${componentCode}`, param);

        try {
            // 获取项目路径
            const projectPath = getProjectPath()
            const assetsPath = join(projectPath, 'assets');

            const installInfoManager = LocalHandles.getInstallInfoManager(pluginName);
            const installInfo = await installInfoManager.readInstallInfo();
            if (!installInfo) {
                return {
                    success: false,
                    error: '未找到组件安装信息文件'
                };
            }
            // 查找组件信息
            const component = installInfo.installedComponentMetas?.find((c: { componentCode: any; }) => c.componentCode === componentCode);
            if (!component) {
                return {
                    success: false,
                    error: `未找到组件 ${componentCode} 的安装记录`
                };
            }

            // 备份和删除文件
            // const backedUpFiles: string[] = [];
            const deletedFiles: string[] = [];
            const notFoundFiles: string[] = [];

            for (const relativeFilePath of component.copiedFiles) {
                const fullFilePath = join(assetsPath, relativeFilePath);
                const metaFilePath = fullFilePath + '.meta';
                const relativeMetaFilePath = relativeFilePath + '.meta';

                try {
                    // 检查文件是否存在
                    await fs.promises.access(fullFilePath);
                    // 删除原文件
                    await fs.promises.unlink(fullFilePath);
                    deletedFiles.push(relativeFilePath);
                    console.log(`[xhgame_builder] 删除文件: ${relativeFilePath}`);

                } catch (error) {
                    console.warn(`[xhgame_builder] 文件不存在或处理失败: ${relativeFilePath}`, error);
                    notFoundFiles.push(relativeFilePath);
                }
            }

            // 清理空目录
            const cleanupEmptyDirs = async (dirPath: string) => {
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

            // 从assets目录开始清理空目录
            await cleanupEmptyDirs(assetsPath);

            // 从配置中移除组件记录 
            try {
                const installInfoManager = LocalHandles.getInstallInfoManager(pluginName);
                await installInfoManager.removeComponentRecord(componentCode);
            } catch (error) {
                console.warn(`[xhgame_builder] 移除组件记录失败:`, error);
                // 不影响卸载结果，只是记录移除失败
            }

            console.log(`[xhgame_builder] 组件卸载完成: ${component.componentName}`);

            return {
                success: true,
                // error: `组件 ${component.componentName} 卸载成功！\n备份位置: ${backupFolderName}`,
                // backupPath: componentBackupDir,
                // backedUpFiles: backedUpFiles,
                // deletedFiles: deletedFiles,
                // notFoundFiles: notFoundFiles
            };

        } catch (error) {
            console.error(`[xhgame_builder] 卸载组件失败: `, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

}