interface IGetVersionRes {
    success: boolean;
    version: string;
}
interface IGetComponentInfosRes {
    success: boolean;
    error?: string;
    groupPath: string;
    componentInfos: IComponentInfoWithStatus[];
}
interface IInstallRes {
    success: boolean;
    error?: string;
}
interface IUninstallRes {
    success: boolean;
    error?: string;
}
interface IInstallInfo {
    version: string;
    installedComponents: InstalledComp[];
    lastUpdated: string;
}
interface IInstallInfoRes {
    success: boolean;
    error?: string;
    installInfo?: any;
}
interface IComponentMetadata {
    componentCode: string;
    componentId: string;
    componentDisplayName: string;
    componentVersion: string;
}
interface InstalledComp {
    componentName: string;
    componentId: string;
    componentCode: string;
    version: string;
    installedAt: string;
    copiedFiles: string[];
}
interface IComponentInfo {
    /** 组件code标识 */
    code: string;
    /** 包显示名,中文字符 */
    displayName: string;
    /** 版本号 */
    version: string;
    /** 说明 */
    description: string;
    /** 作者 */
    author: string;
    /** 分类 */
    category: string;
    /** 标签 */
    tags: string[];
    /** 包所在路径 */
    path: string;
    /** 依赖 */
    dependencies: string[];
    /** 安装文件 */
    files: string[];
    /** 安装状态 */
    installStatus?: string;
    /** 备份状态 */
    backupStatus?: string;
    /** 是否需要更新 */
    needsUpdate?: boolean;
    /** 评分 */
    stars?: number;
    /** 包ID */
    id?: number;
    /** 使用方法 */
    usage?: string;
}
interface IComponentInfoWithStatus extends IComponentInfo {
    /** 安装状态 */
    installStatus: string;
    /** 备份状态 */
    backupStatus: string;
}

declare class Handles {
    private static getInstallInfoManager;
    static getVersion(pluginName: string): Promise<IGetVersionRes>;
    static getComponentInfos(pluginName: string, group: string): Promise<IGetComponentInfosRes>;
    static installComponent(param: any): Promise<IInstallRes>;
    static uninstallComponent(param: any): Promise<IUninstallRes>;
    static checkInstallExists(param: any): Promise<IInstallInfoRes>;
}

declare class InstallInfoManager {
    private pluginName;
    private installInfoPath;
    private logs;
    private extensionPath;
    private projectPath;
    constructor(pluginName: string);
    /**
     * 检查安装信息文件是否存在
     */
    exists(): boolean;
    /**
     * 读取安装信息文件
     */
    readInstallInfo(): Promise<IInstallInfo>;
    /**
     * 写入安装信息文件
     */
    writeInstallInfo(installInfo: IInstallInfo): Promise<boolean>;
    /**
     * 获取安装信息写入日志
     * @returns 安装信息写入日志数组
     */
    getLogs(): string[];
    /**
       * 检查安装信息是否存在
       */
    checkInstallExists(): Promise<IInstallInfo | null>;
    /**
     * 获取已安装组件列表
     */
    getInstalledComponentCodes(): Promise<string[]>;
    /**
     * 检查组件是否已安装
     */
    isComponentInstalled(componentCode: string): Promise<boolean>;
    /**
     * 获取组件的安装信息
     */
    getComponentInfo(componentCode: string): Promise<any | null>;
    /**
     * 从 meta 文件中提取组件元数据
     */
    extractComponentMetadata(zipFilePath: string, compName: string): Promise<IComponentMetadata>;
    /**
     * 记录组件安装信息
     */
    recordInstallation(zipFilePath: string, compName: string, targetPath: string, copiedFiles: string[]): Promise<void>;
    /**
     * 移除组件记录
     */
    removeComponent(componentCode: string): Promise<void>;
}

declare const getProjectPath: () => string;
declare const getExtensionsPath: () => string;
declare const getPluginPath: (pluginName: string) => string;
declare const getPackagesPath: (pluginName: string) => string;
declare const getGroupPath: (pluginName: string, target: string) => string;

interface IPackResult {
    success: boolean;
    error?: string;
    targetPath?: string;
    copiedFiles?: string[];
}
declare class Pack {
    /**
     * 将指定的 assets 路径（例如：assets/bundle_factory/item_views/textUiItems/toast_item）
     * 打包复制到 extensions/pack_demo/packages/<group>/<item>/bundle_factory/item_views/<group>/<item>
     * 并包含同级的 <item>.meta 文件。
     */
    static packItem(assetItemPath: string, pluginName?: string): Promise<IPackResult>;
    private static copyDirectory;
    private static writeSetupJson;
}

export { Handles, InstallInfoManager, Pack, getExtensionsPath, getGroupPath, getPackagesPath, getPluginPath, getProjectPath };
export type { IComponentInfo, IComponentInfoWithStatus, IComponentMetadata, IGetComponentInfosRes, IGetVersionRes, IInstallInfo, IInstallInfoRes, IInstallRes, IPackResult, IUninstallRes, InstalledComp };
