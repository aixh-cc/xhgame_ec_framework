import * as fs from 'fs';
import { join } from 'path';
import { IAppendFactory, IAppendTable, IAppendGui, IAppendComp, ILocalInstalledInfo, InstalledComponentMeta } from './Defined';

export enum MetaType {
    install = 'installInfo',
    backup = 'backupInfo'
}

export class MetaManager {
    private pluginName: string;
    private metaPath: string;
    private logs: string[] = []
    private projectPath: string = ''

    constructor(projectPath: string, pluginName: string, metaType: MetaType) {
        this.projectPath = projectPath;//getProjectPath();
        this.pluginName = pluginName;
        this.metaPath = join(projectPath, 'extensions', pluginName + '-' + metaType + '.json');
    }
    /**
     * 检查安装信息文件是否存在
     */
    exists(): boolean {
        return fs.existsSync(this.metaPath);
    }

    /**
     * 读取安装信息文件
     */
    async readMateInfo(): Promise<ILocalInstalledInfo> {
        const defaultInstallInfo: ILocalInstalledInfo = {
            version: '1.0.0',
            lastUpdated: '',
            installedComponentMetas: []
        };

        try {
            if (fs.existsSync(this.metaPath)) {
                const content = await fs.promises.readFile(this.metaPath, 'utf-8');
                const parsed = JSON.parse(content);
                return Object.assign(defaultInstallInfo, parsed);
            }
        } catch (error) {
            console.warn(`[${this.pluginName}] 读取安装信息失败，将使用默认配置:`, error);
        }

        return defaultInstallInfo;
    }

    /**
     * 写入安装信息文件
     */
    async writeInstallInfo(installInfo: ILocalInstalledInfo): Promise<boolean> {
        try {
            installInfo.lastUpdated = new Date().toISOString();
            await fs.promises.writeFile(this.metaPath, JSON.stringify(installInfo, null, 2), 'utf-8');
            this.logs.push(`[${this.pluginName}] 安装信息已写入: ${this.metaPath.replace(this.projectPath, '')}`)
            // console.log(`[${this.pluginName}] 安装信息已写入: ${this.metaPath.replace(this.projectPath, '')}`)
            return true;
        } catch (error) {
            this.logs.push(`[${this.pluginName}] 写入安装信息失败: ${error}`)
            console.error(`[${this.pluginName}] 写入安装信息失败:`, error);
            return false;
        }
    }
    /**
     * 获取安装信息写入日志
     * @returns 安装信息写入日志数组
     */
    getLogs(): string[] {
        return this.logs
    }
    /**
     * 获取已安装组件列表
     */
    async getInstalledComponentCodes(): Promise<string[]> {
        const installInfo = await this.readMateInfo();
        return installInfo.installedComponentMetas.map(comp => comp.componentCode);
    }
    /**
     * 检查组件是否已安装
     */
    async isComponentInstalled(componentCode: string): Promise<boolean> {
        const installedComponents = await this.getInstalledComponentCodes();
        return installedComponents.indexOf(componentCode) > -1;
    }

    /**
     * 获取组件的安装信息
     */
    async getInstalledComponentInfo(componentCode: string): Promise<InstalledComponentMeta | null> {
        const installInfo = await this.readMateInfo();
        return installInfo.installedComponentMetas.find(comp => comp.componentCode === componentCode) || null;
    }
    /**
     * 更新组件安装信息
     */
    async updateInstalledComponentMetas(
        componentCode: string,
        componentName: string,
        componentVersion: string,
        copiedFiles: string[],
        appendScripts: Array<IAppendFactory | IAppendTable | IAppendGui | IAppendComp>
    ): Promise<void> {
        try {
            const installInfo = await this.readMateInfo();
            // 更新 installedComponents 列表（去重后追加）
            installInfo.installedComponentMetas = installInfo.installedComponentMetas.filter(
                (c: any) => c.componentCode !== componentCode
            );
            installInfo.installedComponentMetas.push({
                componentName: componentName,
                componentCode: componentCode,
                componentVersion: componentVersion,
                copiedFiles: copiedFiles,
                appendScripts: appendScripts,
                installedAt: new Date().toISOString()
            });
            await this.writeInstallInfo(installInfo);
            console.log(`[${this.pluginName}] 组件安装信息已记录: ${componentCode}`);
        } catch (error) {
            console.warn(`[${this.pluginName}] 记录安装信息失败，但组件安装已完成:`, error);
            throw error;
        }
    }

    /**
     * 移除组件记录
     */
    async removeComponentRecord(componentCode: string): Promise<void> {
        try {
            const installInfo = await this.readMateInfo();
            // 从 installedComponents 中移除组件记录
            if (installInfo.installedComponentMetas && Array.isArray(installInfo.installedComponentMetas)) {
                const originalLength = installInfo.installedComponentMetas.length;
                installInfo.installedComponentMetas = installInfo.installedComponentMetas.filter(
                    (comp: any) => comp.componentCode !== componentCode
                );
                if (installInfo.installedComponentMetas.length < originalLength) {
                    console.log(`[${this.pluginName}] 已从 installedComponents 中移除组件: ${componentCode}`);
                }
            }

            await this.writeInstallInfo(installInfo);
            console.log(`[${this.pluginName}] 组件记录已从安装信息中移除: ${componentCode}`);
        } catch (error) {
            console.warn(`[${this.pluginName}] 移除组件记录失败:`, error);
            throw error;
        }
    }


}