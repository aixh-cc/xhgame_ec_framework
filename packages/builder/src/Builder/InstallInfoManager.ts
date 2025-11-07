import * as fs from 'fs';
import { join, dirname } from 'path';
import { getExtensionsPath, getProjectPath } from './Util';
import { IComponentMetadata, IInstallInfo } from './Defined';

export class InstallInfoManager {
    private pluginName: string;
    private installInfoPath: string;
    private logs: string[] = []
    private extensionPath: string = ''
    private projectPath: string = ''

    constructor(pluginName: string) {
        this.pluginName = pluginName;
        this.extensionPath = getExtensionsPath();
        this.projectPath = getProjectPath();
        this.installInfoPath = join(this.extensionPath, pluginName + '-installInfo.json');
    }
    /**
     * 检查安装信息文件是否存在
     */
    exists(): boolean {
        return fs.existsSync(this.installInfoPath);
    }

    /**
     * 读取安装信息文件
     */
    async readInstallInfo(): Promise<IInstallInfo> {
        const defaultInstallInfo: IInstallInfo = {
            version: '1.0.0',
            lastUpdated: '',
            installedComponents: []
        };

        try {
            if (fs.existsSync(this.installInfoPath)) {
                const content = await fs.promises.readFile(this.installInfoPath, 'utf-8');
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
    async writeInstallInfo(installInfo: IInstallInfo): Promise<boolean> {
        try {
            installInfo.lastUpdated = new Date().toISOString();
            await fs.promises.writeFile(this.installInfoPath, JSON.stringify(installInfo, null, 2), 'utf-8');
            this.logs.push(`[${this.pluginName}] 安装信息已写入: ${this.installInfoPath.replace(this.projectPath, '')}`)
            // console.log(`[${this.pluginName}] 安装信息已写入: ${this.installInfoPath.replace(this.projectPath, '')}`)
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
        const installInfo = await this.readInstallInfo();
        return installInfo.installedComponents.map(comp => comp.componentCode);
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
    async getComponentInfo(componentCode: string): Promise<any | null> {
        const installInfo = await this.readInstallInfo();
        return installInfo.installedComponents.find(comp => comp.componentCode === componentCode) || null;
    }

    /**
     * 从 setup.json 文件中提取组件元数据
     */
    async extractComponentMetadata(zipFilePath: string, compName: string): Promise<IComponentMetadata> {
        let componentCode = compName;
        // let componentId = compName;
        let componentDisplayName = compName;
        let componentVersion = '1.0.0';

        try {
            const baseDir = dirname(zipFilePath);
            // 优先读取 setup.json，其次兼容旧的 .zip.meta
            const setupJsonPath = join(baseDir, `${compName}.setup.json`);
            const legacyZipMetaPath = zipFilePath + '.meta';

            let raw: any = null;
            if (fs.existsSync(setupJsonPath)) {
                const content = await fs.promises.readFile(setupJsonPath, 'utf-8');
                raw = JSON.parse(content);
            } else if (fs.existsSync(legacyZipMetaPath)) {
                const content = await fs.promises.readFile(legacyZipMetaPath, 'utf-8');
                raw = JSON.parse(content);
            }

            if (raw) {
                const data = raw.userData || raw; // 兼容两种结构
                componentCode = data.code || data.name || componentCode;
                // componentId = data.code || data.name || componentId;
                componentDisplayName = data.displayName || componentDisplayName;
                componentVersion = data.version || componentVersion;
            }
        } catch (error) {
            console.warn(`[${this.pluginName}] 提取组件元数据失败:`, error);
        }

        return {
            componentCode,
            // componentId,
            componentDisplayName,
            componentVersion
        };
    }

    /**
     * 记录组件安装信息
     */
    async recordInstallation(
        zipFilePath: string,
        compName: string,
        copiedFiles: string[]
    ): Promise<void> {
        try {
            const installInfo = await this.readInstallInfo();

            // 从 meta 中获取组件元数据
            const metadata = await this.extractComponentMetadata(zipFilePath, compName);

            // 更新 installedComponents 列表（去重后追加）
            installInfo.installedComponents = installInfo.installedComponents.filter(
                (c: any) => c.componentCode !== metadata.componentCode
            );
            installInfo.installedComponents.push({
                componentName: metadata.componentDisplayName,
                // componentId: metadata.componentId,
                componentCode: metadata.componentCode,
                version: metadata.componentVersion,
                copiedFiles: copiedFiles,
                installedAt: new Date().toISOString()
            });

            await this.writeInstallInfo(installInfo);
            console.log(`[${this.pluginName}] 组件安装信息已记录: ${metadata.componentCode}`);
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
            const installInfo = await this.readInstallInfo();
            // 从 installedComponents 中移除组件记录
            if (installInfo.installedComponents && Array.isArray(installInfo.installedComponents)) {
                const originalLength = installInfo.installedComponents.length;
                installInfo.installedComponents = installInfo.installedComponents.filter(
                    (comp: any) => comp.componentCode !== componentCode
                );
                if (installInfo.installedComponents.length < originalLength) {
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