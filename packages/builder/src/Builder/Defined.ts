export interface IgetGroupComponentListRes {
    success: boolean,
    error?: string,
    groupPath: string
    list: IComponentInfoWithStatus[]
}
export interface IInstallRes {
    success: boolean,
    error?: string,
}
export interface IUninstallRes {
    success: boolean,
    error?: string,
}
export interface IInstallInfoRes {
    success: boolean;
    error?: string;
    installInfo?: IInstallInfo
}
export interface IInstallInfo {
    version: string;
    installedComponents: InstalledComp[];
    lastUpdated: string;
}
export interface InstalledComp {
    componentCode: string;
    componentName: string;
    componentVersion: string;
    installedAt: string;
    copiedFiles: string[];
}
// 组件信息接口定义
export interface IComponentInfo {
    /** 组件code标识 */
    componentCode: string;
    /** 包显示名,中文字符 */
    componentName: string;
    /** 版本号 */
    componentVersion: string;
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
    /** 评分 */
    stars?: number;
}

export interface IComponentInfoWithStatus extends IComponentInfo {
    /** 安装状态 */
    installStatus: string
    /** 备份状态 */
    backupStatus: string
}