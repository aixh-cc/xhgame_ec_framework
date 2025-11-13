import * as fs from 'fs';
import { join, dirname } from 'path';
import AdmZip from 'adm-zip';
import { AppendScript } from './AppendScript';
import { IAppendFactory, IAppendTable, IAppendGui, IAppendComp, InstalledComponentMeta } from './Defined';
import { getProjectPath } from './Util';
import { MetaManager, MetaType } from './MetaManager';

/**
 * 备份管理：在组件卸载前打包备份，并支持回滚恢复
 * 备份目录：extensions/<pluginName>/backups
 * 产物：<componentCode>.zip、<componentCode>.backup.json
 */
export class BackupManager {
    projectPath: string;
    pluginName: string;
    backupDir: string;
    backupMetaManager: MetaManager;

    constructor(pluginName: string) {
        this.projectPath = getProjectPath();
        this.pluginName = pluginName;
        this.backupDir = join(this.projectPath, 'extensions', pluginName, 'backups');
        this.backupMetaManager = new MetaManager(this.projectPath, pluginName, MetaType.backup);
    }

    private async ensureDir(): Promise<void> {
        await fs.promises.mkdir(this.backupDir, { recursive: true });
    }

    /**
     * 基于当前安装记录，生成备份包与备份描述文件
     * 在卸载删除文件之前调用
     */
    async backupInstalledComponent(componentInfo: InstalledComponentMeta): Promise<{ success: boolean; error?: string; zipPath?: string; jsonPath?: string; }>
    {
        try {
            await this.ensureDir();
            const assetsPath = join(this.projectPath, 'assets');
            const zipPath = join(this.backupDir, `${componentInfo.componentCode}.zip`);
            const jsonPath = join(this.backupDir, `${componentInfo.componentCode}.backup.json`);

            const zip = new AdmZip();
            let addedCount = 0;
            for (const rel of componentInfo.copiedFiles || []) {
                const full = join(assetsPath, rel);
                try {
                    await fs.promises.access(full, fs.constants.F_OK);
                    // 将相对路径作为 zip 内的路径，保持层级
                    zip.addLocalFile(full, '', rel);
                    addedCount++;
                } catch {
                    // 文件缺失则跳过
                }
            }
            // 仅当有文件时才写 zip
            if (addedCount > 0) {
                zip.writeZip(zipPath);
            } else {
                // 没有任何文件可备份也仍然写描述文件，方便回滚逻辑知晓 appendScripts
            }

            const backupJson = {
                componentCode: componentInfo.componentCode,
                componentName: componentInfo.componentName,
                componentVersion: componentInfo.componentVersion,
                backedUpAt: new Date().toISOString(),
                files: componentInfo.copiedFiles || [],
                appendScripts: componentInfo.appendScripts || []
            } as {
                componentCode: string;
                componentName: string;
                componentVersion: string;
                backedUpAt: string;
                files: string[];
                appendScripts: Array<IAppendFactory | IAppendTable | IAppendGui | IAppendComp>;
            };

            await fs.promises.writeFile(jsonPath, JSON.stringify(backupJson, null, 2), 'utf-8');

            return { success: true, zipPath, jsonPath };
        } catch (e) {
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    }

    /**
     * 回滚指定组件：从备份包恢复文件，并恢复追加脚本与安装信息
     */
    async rollback(componentCode: string): Promise<{ success: boolean; error?: string; }>
    {
        if (!componentCode) {
            return { success: false, error: '缺少组件标识 componentCode' };
        }
        try {
            await this.ensureDir();
            const assetsPath = join(this.projectPath, 'assets');
            const zipPath = join(this.backupDir, `${componentCode}.zip`);
            const jsonPath = join(this.backupDir, `${componentCode}.backup.json`);

            // 读取备份描述
            let backupDescRaw = '';
            try {
                backupDescRaw = await fs.promises.readFile(jsonPath, 'utf-8');
            } catch {
                return { success: false, error: `未找到备份描述文件: ${jsonPath}` };
            }
            const backupDesc = JSON.parse(backupDescRaw) as {
                componentCode: string;
                componentName: string;
                componentVersion: string;
                files: string[];
                appendScripts: Array<IAppendFactory | IAppendTable | IAppendGui | IAppendComp>;
            };

            // 优先从 zip 恢复文件；若 zip 不存在，则跳过文件恢复，仅恢复追加脚本与安装信息
            if (fs.existsSync(zipPath)) {
                const zip = new AdmZip(zipPath);
                const entries = zip.getEntries();
                for (const entry of entries) {
                    if (entry.isDirectory) continue;
                    const relPath = entry.entryName;
                    const destPath = join(assetsPath, relPath);
                    await fs.promises.mkdir(dirname(destPath), { recursive: true });
                    const data = entry.getData();
                    await fs.promises.writeFile(destPath, data);
                }
            }

            // 恢复追加脚本（幂等处理）
            const appendScripts = backupDesc.appendScripts || [];
            for (const el of appendScripts) {
                if (el.type === 'factory') {
                    await AppendScript.addFactoryType(el.factoryType);
                    await AppendScript.addFactory({
                        sourceFilePath: el.sourceFilePath,
                        factoryType: el.factoryType,
                        itemClassName: el.itemClassName,
                        driveClassName: el.driveClassName,
                        factoryClassName: el.factoryClassName,
                    });
                } else if (el.type === 'table') {
                    await AppendScript.addTableType(el.tableType);
                    await AppendScript.addTable({
                        sourceFilePath: el.sourceFilePath,
                        tableType: el.tableType,
                        itemIName: el.itemIName,
                        tableClassName: el.tableClassName,
                    });
                } else if (el.type === 'gui') {
                    await AppendScript.addGuiType(el.guiName, el.guiPath);
                } else if (el.type === 'comp') {
                    await AppendScript.addComp({
                        sourceFilePath: el.sourceFilePath,
                        compName: el.compName,
                        compPath: el.compPath,
                    });
                }
            }

            // 恢复安装信息
            const installMeta = new MetaManager(this.projectPath, this.pluginName, MetaType.install);
            await installMeta.updateInstalledComponentMetas(
                backupDesc.componentCode,
                backupDesc.componentName,
                backupDesc.componentVersion,
                backupDesc.files || [],
                backupDesc.appendScripts || []
            );

            return { success: true };
        } catch (e) {
            return { success: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
}