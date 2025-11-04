
export interface IGetVersionRes {
    success: boolean
    version: string
}
export interface IGetPackagesRes {
    success: boolean,
    error?: string,
    packagesPath: string
    packages: IPackageInfoWithStatus[]
}
export interface IInstallRes {
    success: boolean,
    error?: string,
}
export interface IUninstallRes {
    success: boolean,
    error?: string,
}
export interface IInstallInfo {
    version: string;
    installedComponents: InstalledComp[];
    lastUpdated: string;
}
export interface IInstallInfoRes {
    success: boolean;
    error?: string;
    installInfo?: any
}

export interface IComponentMetadata {
    componentCode: string;
    componentId: string;
    componentDisplayName: string;
    componentVersion: string;
}

export interface InstalledComp {
    componentName: string;
    componentId: string;
    componentCode: string;
    version: string;
    installedAt: string;
    copiedFiles: string[];
}
// 包信息接口定义
export interface IPackageInfo {
    /** 包名,英文字母 */
    name: string;
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

export interface IPackageInfoWithStatus extends IPackageInfo {
    /** 安装状态 */
    installStatus: string
    /** 备份状态 */
    backupStatus: string
}