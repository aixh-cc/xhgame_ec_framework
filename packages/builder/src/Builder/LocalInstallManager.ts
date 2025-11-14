import * as fs from 'fs';
import { join, basename, dirname } from 'path';
import AdmZip from 'adm-zip';
import { IComponentInfo, IComponentInfoWithStatus, IGetGroupComponentListRes, ILocalInstalledInfoRes, IInstallRes, IUninstallRes, InstalledComponentMeta, ILocalInstalledInfo } from './Defined';
import { checkConflicts, cleanupEmptyDirs, getGroupPath, getProjectPath, checkConflictsByList, copyFilesByList } from './Util';
import { MetaManager, MetaType } from './MetaManager';
import { BackupManager } from './BackupManager';
import { AppendScript } from './AppendScript';
/**
 * 本地组件安装
 */
export class LocalInstallManager {

    // static managerMap: Map<string, MetaManager> = new Map();

    // static getMetaManager(projectPath: string, pluginName: string, metaType: MetaType): MetaManager {
    //     if (!LocalInstallManager.managerMap.has(pluginName)) {
    //         LocalInstallManager.managerMap.set(pluginName, new MetaManager(projectPath, pluginName, metaType));
    //     }
    //     return LocalInstallManager.managerMap.get(pluginName)!;
    // }

    // installMetaManager: MetaManager
    // backMetaManager: MetaManager
    // metaManagerMap: Map<MetaType, MetaManager> = new Map()
    projectPath: string
    pluginName: string
    metaManager: MetaManager
    constructor(pluginName: string) {
        this.projectPath = getProjectPath()
        this.pluginName = pluginName
        this.metaManager = new MetaManager(this.projectPath, pluginName, MetaType.install)
        // this.metaManagerMap.set(MetaType.install, new MetaManager(projectPath, pluginName, MetaType.install))
        // this.metaManagerMap.set(MetaType.backup, new MetaManager(projectPath, pluginName, MetaType.backup))
    }

    getMetaManager() {
        return this.metaManager
    }

    /**
     * 读取插件meta信息
     * @param param 包含插件名的参数对象
     * @returns 包含安装信息或错误信息的响应对象
     */
    async readMateInfo(): Promise<ILocalInstalledInfoRes> {
        const metaManager = this.getMetaManager();
        const metaInfo = await metaManager.readMateInfo();
        if (!metaManager.exists()) {
            metaManager.writeInstallInfo(metaInfo);
        }
        return {
            success: true,
            localInstalledInfo: metaInfo
        };
    }

    /**
     * 获取插件分组下的组件列表
     * @param pluginName 插件名称
     * @param group 分组名称
     * @returns 包含组件列表或错误信息的响应对象
     */
    async getGroupComponentList(group: string): Promise<IGetGroupComponentListRes> {
        try {
            const groupPath = getGroupPath(this.pluginName, group);
            if (!fs.existsSync(groupPath)) {
                return {
                    success: false,
                    error: 'Packages directory not found',
                    groupPath: '',
                    list: []
                };
            }
            // 当前组件安装情况
            const metaManager = this.getMetaManager();
            const installMeta = await metaManager.readMateInfo();
            const backupManager = new BackupManager(this.pluginName);
            const backupCodes = await backupManager.listBackupCodes();
            const installedLists = installMeta?.installedComponentMetas?.map((item: InstalledComponentMeta) => item.componentCode) || []
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
                        const code = json.componentCode || basename(item, '.setup.json');
                        const info: IComponentInfoWithStatus = {
                            ...json,
                            // 状态字段
                            isInstalled: installedLists.indexOf(code) > -1,
                            // 安装时间
                            installedAt: installMeta?.installedComponentMetas?.find((item: InstalledComponentMeta) => item.componentCode === json.componentCode)?.installedAt || '',
                            // 是否备份
                            isBackedUp: backupCodes.has(code),
                            // 是否可更新，先默认false
                            isUpdatable: false
                        };
                        if (info.isInstalled && json.componentVersion != installMeta?.installedComponentMetas?.find((item: InstalledComponentMeta) => item.componentCode === json.componentCode)?.componentVersion) {
                            info.isUpdatable = true; // 版本对比，是否可更新(当前为最简单的版本不一致作为判断)
                        }
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
    /**
     * 安装组件
     * @param param 包含组件码、插件名和分组的参数对象
     * @returns 包含安装结果或错误信息的响应对象
     */
    async installComponent(group: string, componentCode: string): Promise<IInstallRes> {
        let extractTempDir = '';
        try {
            if (!componentCode || !group) {
                return {
                    success: false,
                    error: 'Component code, plugin name, and group are required'
                };
            }
            let groupPath = getGroupPath(this.pluginName, group)
            console.log(`[xhgame_builder] 组件安装目录: ${groupPath}`);

            const zipFilePath = join(groupPath, `${componentCode}.zip`);
            const legacyDirPath = join(groupPath, componentCode);

            // 解压源目录（如果是zip）或使用旧目录模式
            let assetsSourcePath = legacyDirPath;
            // 如果存在已手动解压的文件夹,优先使用
            if (fs.existsSync(legacyDirPath)) {
                console.log(`[xhgame_builder] 使用目录模式: ${legacyDirPath}`);
                assetsSourcePath = legacyDirPath;
            } else if (fs.existsSync(zipFilePath)) {
                console.log(`[xhgame_builder] 发现zip包，准备解压: ${zipFilePath}`);
                extractTempDir = join(groupPath, '__extract', componentCode);
                await fs.promises.mkdir(extractTempDir, { recursive: true });

                const zip = new AdmZip(zipFilePath);
                zip.extractAllTo(extractTempDir, true);
                console.log(`[xhgame_builder] 解压完成到: ${extractTempDir}`);

                // todo 排查这段
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
            } else {
                return {
                    success: false,
                    error: `未找到组件资源：${zipFilePath} 或 ${legacyDirPath}`
                };
            }

            // 获取项目assets/script目录路径
            const projectPath = getProjectPath();
            const assetsPath = join(projectPath, 'assets');
            const targetPath = join(projectPath, 'assets');

            // 确保目标目录存在
            await fs.promises.mkdir(targetPath, { recursive: true });

            console.log(`[xhgame_builder] 源路径: ${assetsSourcePath}`);
            console.log(`[xhgame_builder] 目标路径: ${targetPath}`);

            // 复制所需文件到项目 assets 目录
            const copiedFiles: string[] = [];
            const conflictFiles: string[] = [];

            // 在复制之前，读取 setup 并校验依赖
            const setupFilePath = join(groupPath, `${componentCode}.setup.json`);
            const rawContent = await fs.promises.readFile(setupFilePath, 'utf-8');
            const componentInfo: IComponentInfo = JSON.parse(rawContent);

            // 归一化字段
            const normalized = {
                componentCode: componentInfo.componentCode || componentCode,
                componentName: componentInfo.componentName || componentCode,
                componentVersion: componentInfo.componentVersion || '1.0.0',
                dependencies: componentInfo.dependencies || [],
                files: componentInfo.files || []
            } as IComponentInfo;

            await checkConflictsByList(conflictFiles, assetsSourcePath, targetPath, normalized.files);
            if (conflictFiles.length > 0) {
                console.log(`[xhgame_builder] 检测到冲突文件: ${conflictFiles.join('\n')}`);
                return {
                    success: false,
                    error: `安装失败：检测到以下文件已存在，请先删除或备份这些文件：\n${conflictFiles.join('\n')}`,
                };
            }

            // 校验依赖：存在性 + 可选 uuid 一致性（支持 replaceUuid 解决冲突）+ 组件安装依赖（componentCode）
            // const projectPath = getProjectPath()
            const missingDeps: string[] = [];
            const unresolvedUuidMismatchDeps: { depPath: string; expected: string; actual?: string }[] = [];
            const missingComponentDeps: string[] = [];
            // 需要替换的 uuid 对
            const uuidReplacements: { from: string; to: string }[] = [];
            // 已安装组件列表（同插件）
            const metaManager = this.getMetaManager();
            const installedCodes = await metaManager.getInstalledComponentCodes();

            const deps: any[] = Array.isArray(normalized.dependencies) ? normalized.dependencies : [];
            for (const dep of deps) {
                let depPath: string = '';
                let expectedUuid: string | undefined;

                if (typeof dep === 'string') {
                    depPath = dep;
                } else if (dep && typeof dep === 'object') {
                    // 组件安装依赖
                    if (dep.componentCode) {
                        const needCode: string = dep.componentCode;
                        if (!installedCodes.includes(needCode)) {
                            missingComponentDeps.push(needCode);
                        }
                        continue; // 该分支不再进行文件路径校验
                    }
                    // 文件依赖
                    depPath = dep.path;
                    expectedUuid = dep.requireUuid;
                }

                if (!depPath) continue;
                const fullPath = join(assetsPath, depPath);
                if (!fs.existsSync(fullPath)) {
                    console.log(`[xhgame_builder] 丢失依赖文件: ${depPath},fullPath: ${fullPath}`)
                    missingDeps.push(depPath);
                    continue;
                }
                if (expectedUuid) {
                    const metaPath = depPath.endsWith('.meta') ? fullPath : `${fullPath}.meta`;
                    try {
                        const metaContent = await fs.promises.readFile(metaPath, 'utf-8');
                        const metaJson = JSON.parse(metaContent);
                        const actualUuid = metaJson?.uuid;
                        if (!actualUuid || actualUuid !== expectedUuid) {
                            const replaceUuid: string | undefined = typeof dep === 'object' ? dep.replaceUuid : undefined;
                            if (replaceUuid) {
                                // 始终信任用户提供的 replaceUuid，在安装包中进行替换，不修改项目 .meta
                                uuidReplacements.push({ from: expectedUuid, to: replaceUuid });
                                if (actualUuid && replaceUuid !== actualUuid) {
                                    console.warn(`[xhgame_builder] 提示：依赖 ${depPath} 的项目UUID=${actualUuid} 与 replaceUuid=${replaceUuid} 不一致，将以 replaceUuid 进行安装包替换。`);
                                }
                            } else {
                                unresolvedUuidMismatchDeps.push({ depPath: depPath.endsWith('.meta') ? depPath : `${depPath}.meta`, expected: expectedUuid, actual: actualUuid });
                            }
                        }
                    } catch (e) {
                        const replaceUuid: string | undefined = typeof dep === 'object' ? dep.replaceUuid : undefined;
                        if (replaceUuid) {
                            // 无法读取 meta，但提供了 replaceUuid，仍尝试替换安装包中的 uuid
                            uuidReplacements.push({ from: expectedUuid, to: replaceUuid });
                        } else {
                            unresolvedUuidMismatchDeps.push({ depPath: depPath.endsWith('.meta') ? depPath : `${depPath}.meta`, expected: expectedUuid });
                        }
                    }
                }
            }

            if (missingDeps.length > 0 || unresolvedUuidMismatchDeps.length > 0 || missingComponentDeps.length > 0) {
                const messages: string[] = [];
                if (missingDeps.length > 0) {
                    messages.push(`缺少依赖文件：\n${missingDeps.map(p => `- ${p}`).join('\n')}`);
                }
                if (unresolvedUuidMismatchDeps.length > 0) {
                    messages.push(`UUID 不匹配且未提供 replaceUuid：\n${unresolvedUuidMismatchDeps.map(m => `- ${m.depPath} 期望=${m.expected} 实际=${m.actual ?? '未知'}`).join('\n')}`);
                }
                if (missingComponentDeps.length > 0) {
                    messages.push(`未安装依赖组件（同插件）：\n${missingComponentDeps.map(c => `- ${c}`).join('\n')}`);
                }
                return {
                    success: false,
                    error: `安装失败：依赖校验未通过。\n${messages.join('\n')}`
                };
            }

            // 若存在可替换的 uuid，先在安装包源目录中进行替换，然后再复制
            if (uuidReplacements.length > 0) {
                const metaFilesToProcess: string[] = [];
                const collectMetaFiles = async (dir: string) => {
                    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        const p = join(dir, entry.name);
                        if (entry.isDirectory()) {
                            await collectMetaFiles(p);
                        } else if (entry.isFile() && entry.name.endsWith('.meta')) {
                            metaFilesToProcess.push(p);
                        }
                    }
                };
                await collectMetaFiles(assetsSourcePath);

                for (const filePath of metaFilesToProcess) {
                    try {
                        let content = await fs.promises.readFile(filePath, 'utf-8');
                        let replaced = false;
                        for (const { from, to } of uuidReplacements) {
                            if (content.includes(from)) {
                                content = content.split(from).join(to);
                                replaced = true;
                            }
                        }
                        if (replaced) {
                            await fs.promises.writeFile(filePath, content, 'utf-8');
                            console.log(`[xhgame_builder] 已在安装包中替换 UUID: ${filePath}`);
                        }
                    } catch (e) {
                        console.warn(`[xhgame_builder] 替换安装包 UUID 失败: ${filePath}`, e);
                    }
                }
            }

            console.log(`[xhgame_builder] 没有冲突文件，按清单复制文件...`);
            await copyFilesByList(copiedFiles, assetsSourcePath, targetPath, normalized.files);
            console.log(`[xhgame_builder] 组件安装完成，共复制 ${copiedFiles.length} 个文件`);

            // 有些组件安装还需要appendScript
            if (componentInfo.appendScripts && componentInfo.appendScripts?.length > 0) {
                for (let i = 0; i < componentInfo.appendScripts.length; i++) {
                    const element = componentInfo.appendScripts[i];
                    if (element.type === 'factory') {
                        let res_add_type = await AppendScript.addFactoryType(element.factoryType)
                        if (res_add_type.success) {
                            console.log(`[xhgame_builder] 新增factoryType成功: ${element.factoryType}`)
                        } else {
                            console.warn(`[xhgame_builder] 新增factoryType失败: ${element.factoryType}`)
                        }
                        // assert.equal(res_add_type.success, true, '新增factoryType成功')
                        let res_add = await AppendScript.addFactory(
                            {
                                sourceFilePath: element.sourceFilePath,
                                factoryType: element.factoryType,
                                itemClassName: element.itemClassName,
                                driveClassName: element.driveClassName,
                                factoryClassName: element.factoryClassName,
                            })
                        if (res_add.success) {
                            console.log(`[xhgame_builder] 新增factory成功: ${element.factoryClassName}`)
                        } else {
                            console.warn(`[xhgame_builder] 新增factory失败: ${element.factoryClassName}`)
                        }
                        // assert.equal(res_add.success, true, '新增factory成功')
                    }
                    if (element.type === 'table') {
                        let res_add_type = await AppendScript.addTableType(element.tableType)
                        if (res_add_type.success) {
                            console.log(`[xhgame_builder] 新增tableType成功: ${element.tableType}`)
                        } else {
                            console.warn(`[xhgame_builder] 新增tableType失败: ${element.tableType}`)
                        }
                        let res_add = await AppendScript.addTable(
                            {
                                sourceFilePath: element.sourceFilePath,
                                tableType: element.tableType,
                                itemIName: element.itemIName,
                                tableClassName: element.tableClassName,
                            })
                        if (res_add.success) {
                            console.log(`[xhgame_builder] 新增table成功: ${element.tableType}`)
                        } else {
                            console.warn(`[xhgame_builder] 新增table失败: ${element.tableType}`)
                        }
                    }
                    if (element.type === 'gui') {
                        let res_add_type = await AppendScript.addGuiType(element.guiName, element.guiPath)
                        if (res_add_type.success) {
                            console.log(`[xhgame_builder] 新增guiType成功: ${element.guiName}`)
                        } else {
                            console.warn(`[xhgame_builder] 新增guiType失败: ${element.guiName}`)
                        }
                    }
                    if (element.type === 'comp') {
                        let res_add = await AppendScript.addComp(
                            {
                                sourceFilePath: element.sourceFilePath,
                                compName: element.compName,
                                compPath: element.compPath,
                            })
                        if (res_add.success) {
                            console.log(`[xhgame_builder] 新增comp成功: ${element.compName}`)
                        } else {
                            console.warn(`[xhgame_builder] 新增comp失败: ${element.compName}`)
                        }
                    }
                }
            }
            // 记录安装信息到配置文件 copiedFiles等到xxx-installInfo.json中
            try {
                const metaManager = this.getMetaManager();
                await metaManager.updateInstalledComponentMetas(
                    normalized.componentCode,
                    normalized.componentName,
                    normalized.componentVersion,
                    copiedFiles,
                    componentInfo.appendScripts || []
                );
            } catch (writeErr) {
                console.warn(`[xhgame_builder] 写入安装信息失败，但组件安装已完成:`, writeErr);
            }
            return {
                success: true,
                error: `组件 ${componentCode} 安装成功！`,
            };
        } catch (error) {
            console.error(`[xhgame_builder] 组件失败: `, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        } finally {
            // 清理临时解压目录
            if (extractTempDir && fs.existsSync(extractTempDir)) {
                try {
                    await fs.promises.rm(extractTempDir, { recursive: true, force: true });
                    const parentExtractDir = join(getGroupPath(this.pluginName, group), '__extract');
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
    async uninstallComponent(componentCode: string): Promise<IUninstallRes> {
        if (!componentCode) {
            return {
                success: false,
                error: 'Component code, plugin name are required'
            };
        }
        try {
            // 获取项目路径
            const projectPath = getProjectPath()
            const assetsPath = join(projectPath, 'assets');

            const metaManager = this.getMetaManager();
            const installInfo: ILocalInstalledInfo = await metaManager.readMateInfo();
            if (!installInfo) {
                return {
                    success: false,
                    error: '未找到组件安装信息文件'
                };
            }
            // 查找组件信息
            const componentInfo: InstalledComponentMeta = installInfo.installedComponentMetas?.find((c: { componentCode: any; }) => c.componentCode === componentCode);
            if (!componentInfo) {
                return {
                    success: false,
                    error: `未找到组件 ${componentCode} 的安装记录`
                };
            }
            // 在删除前生成备份
            try {
                const backupManager = new BackupManager(this.pluginName);
                const backupRes = await backupManager.backupInstalledComponent(componentInfo);
                if (!backupRes.success) {
                    console.warn(`[xhgame_builder] 生成备份失败:`, backupRes.error);
                } else {
                    console.log(`[xhgame_builder] 备份完成: zip=${backupRes.zipPath} json=${backupRes.jsonPath}`);
                }
            } catch (e) {
                console.warn(`[xhgame_builder] 备份过程发生异常但继续卸载:`, e);
            }
            // 删除文件
            const deletedFiles: string[] = [];
            const notFoundFiles: string[] = [];

            for (const relativeFilePath of componentInfo.copiedFiles) {
                const fullFilePath = join(assetsPath, relativeFilePath);
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
            // 从assets目录开始清理空目录
            await cleanupEmptyDirs(assetsPath);
            // 移除appendScript
            if (componentInfo.appendScripts && componentInfo.appendScripts?.length > 0) {
                for (let i = 0; i < componentInfo.appendScripts.length; i++) {
                    const element = componentInfo.appendScripts[i];
                    if (element.type === 'factory') {
                        let res_remove = await AppendScript.removeFactory(element.sourceFilePath, element.factoryType)
                        if (res_remove.success) {
                            console.log(`[xhgame_builder] 移除factory成功: ${element.factoryType}`)
                        } else {
                            console.warn(`[xhgame_builder] 移除factory失败: ${element.factoryType}`)
                        }
                        let res_add_type = await AppendScript.removeFactoryType(element.factoryType)
                        if (res_add_type.success) {
                            console.log(`[xhgame_builder] 移除factoryType成功: ${element.factoryType}`)
                        } else {
                            console.warn(`[xhgame_builder] 移除factoryType失败: ${element.factoryType}`)
                        }
                    }
                    if (element.type === 'table') {
                        let res_remove = await AppendScript.removeTable(element.sourceFilePath, element.tableType)
                        if (res_remove.success) {
                            console.log(`[xhgame_builder] 移除table成功: ${element.tableType}`)
                        } else {
                            console.warn(`[xhgame_builder] 移除table失败: ${element.tableType}`)
                        }
                        let res_add_type = await AppendScript.removeTableType(element.tableType)
                        if (res_add_type.success) {
                            console.log(`[xhgame_builder] 移除tableType成功: ${element.tableType}`)
                        } else {
                            console.warn(`[xhgame_builder] 移除tableType失败: ${element.tableType}`)
                        }
                    }
                    if (element.type === 'gui') {
                        let res_add_type = await AppendScript.removeGuiType(element.guiName)
                        if (res_add_type.success) {
                            console.log(`[xhgame_builder] 移除guiType成功: ${element.guiName}`)
                        } else {
                            console.warn(`[xhgame_builder] 移除guiType失败: ${element.guiName}`)
                        }
                    }
                    if (element.type === 'comp') {
                        let res_remove = await AppendScript.removeComp(element.sourceFilePath, element.compName)
                        if (res_remove.success) {
                            console.log(`[xhgame_builder] 移除comp成功: ${element.compName}`)
                        } else {
                            console.warn(`[xhgame_builder] 移除comp失败: ${element.compName}`)
                        }
                    }
                }
            }


            // 从配置中移除组件记录 
            try {
                const metaManager = this.getMetaManager();
                await metaManager.removeComponentRecord(componentCode);
            } catch (error) {
                console.warn(`[xhgame_builder] 移除组件记录失败:`, error);
            }
            console.log(`[xhgame_builder] 组件卸载完成: ${componentInfo.componentName}`);
            return {
                success: true,
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