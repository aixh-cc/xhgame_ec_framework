export interface IGetComponentInfosRes {
    success: boolean,
    error?: string,
    groupPath: string
    componentInfos: IComponentInfoWithStatus[]
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
    installInfo?: IInstallInfo
}

export interface IComponentMetadata {
    componentCode: string;
    // componentId: string;
    componentDisplayName: string;
    componentVersion: string;
}

export interface InstalledComp {
    componentName: string;
    // componentId: string;
    componentCode: string;
    version: string;
    installedAt: string;
    copiedFiles: string[];
}
// 组件信息接口定义
export interface IComponentInfo {
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

export interface IComponentInfoWithStatus extends IComponentInfo {
    /** 安装状态 */
    installStatus: string
    /** 备份状态 */
    backupStatus: string
}