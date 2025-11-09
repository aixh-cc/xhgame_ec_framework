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
    appendScripts: IAppendFactory[];
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
    /** 
     *  依赖（项目文件依赖）。支持三种写法：
     *  - 字符串：表示相对 `assets` 根目录的文件或目录路径，仅校验存在；
     *  - 对象：{ path, requireUuid?, replaceUuid? }：当提供 requireUuid 时，会读取同路径的 `.meta` 文件并校验 uuid 一致；
     *    若不一致且提供 replaceUuid，则在插件包内替换所有 `.meta` 中的 requireUuid 为 replaceUuid；
     *  - 对象：{ componentCode }：要求同插件中该组件已被安装（通过安装信息文件判断）。
     */
    dependencies: Array<string | IFileDependency | IComponentCodeDependency>;
    /** 安装文件 */
    files: string[];
    /** 评分 */
    stars?: number;
    appendScripts?: Array<IAppendFactory>;
}

export interface IAppendFactory {
    sourceFilePath: string,
    factoryType: string,
    itemClassName: string,
    driveClassName: string,
    factoryClassName: string,
}

/** 项目文件依赖描述 */
export interface IFileDependency {
    /** 相对项目 `assets` 根目录的文件或目录路径 */
    path: string;
    /** 要求该路径同名 `.meta` 文件中的 uuid 必须与此一致（可选） */
    requireUuid?: string;
    /** 
     * 替换uuid值,如果项目中存在相同的path值，但是requireUuid已经被修改,则将安装包中所有meta文件中包含requireUuid的替换为replaceUuid
     * 默认情况该值为空,如果按照时有冲突,提示用户修改replaceUuid为项目中的实际值可完成安装
     */
    replaceUuid?: string;
}

/** 组件安装依赖（同插件内） */
export interface IComponentCodeDependency {
    /** 依赖的组件代码（同插件内） */
    componentCode: string;
}
/**
 * 组件信息 With 安装状态
 */
export interface IComponentInfoWithStatus extends IComponentInfo {
    /** 安装状态 */
    isInstalled: boolean
    /** 安装时间 */
    installedAt: string
    /** 备份状态 */
    isBackedUp: boolean
    /** 可更新状态 */
    isUpdatable: boolean
}