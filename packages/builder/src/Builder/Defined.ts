/**
 * 接口返回
 * 获取组件列表
 */
export interface IGetGroupComponentListRes {
    success: boolean,
    error?: string,
    groupPath: string
    list: IComponentInfoWithStatus[]
}
/**
 * 接口返回
 * 安装结果
 */
export interface IInstallRes {
    success: boolean,
    error?: string,
}
/**
 * 接口返回
 * 卸载结果
 */
export interface IUninstallRes {
    success: boolean,
    error?: string,
}
/**
 * 接口返回
 * 本地安装接口结果
 */
export interface ILocalInstalledInfoRes {
    success: boolean;
    error?: string;
    localInstalledInfo?: ILocalInstalledInfo
}
/**
 * 本地安装结果
 */
export interface ILocalInstalledInfo {
    version: string;
    installedComponentMetas: InstalledComponentMeta[];
    lastUpdated: string;
}
/**
 * 已安装组件元数据
 */
export interface InstalledComponentMeta {
    componentCode: string;
    componentName: string;
    componentVersion: string;
    installedAt: string;
    copiedFiles: string[];
}
/**
 * 组件信息
 */
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
/**
 * 组件信息 With 安装状态
 */
export interface IComponentInfoWithStatus extends IComponentInfo {
    /** 安装状态 */
    installStatus: string
    /** 备份状态 */
    backupStatus: string
}