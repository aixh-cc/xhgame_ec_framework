'use strict';

var fs = require('fs');
var path = require('path');
var AdmZip = require('adm-zip');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs);

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const getProjectPath = () => {
    if (typeof Editor != 'undefined' && Editor.Project) {
        return Editor.Project.path;
    }
    else {
        // 基于当前工作目录向上查找存在的“extensions”目录
        let current = path.resolve('./');
        while (true) {
            const extensionsDir = path.join(current, 'extensions');
            try {
                const stat = fs__namespace.statSync(extensionsDir);
                if (stat.isDirectory()) {
                    // 找到“extensions”，其父目录即为项目根目录
                    console.log('getProjectPath:' + current);
                    return current;
                }
            }
            catch (_) {
                // 未找到该目录，继续向上
            }
            const parent = path.resolve(current, '..');
            if (parent === current) {
                // 已到达文件系统根目录仍未找到
                break;
            }
            current = parent;
        }
        throw new Error('未找到项目根目录：未检测到“extensions”目录');
    }
};
const getExtensionsPath = () => {
    let projectPath = getProjectPath();
    return path.join(projectPath, 'extensions');
};
const getPluginPath = (pluginName) => {
    let projectPath = getProjectPath();
    return path.join(projectPath, 'extensions', pluginName);
};
const getPackagesPath = (pluginName) => {
    let projectPath = getProjectPath();
    return path.join(projectPath, 'extensions', pluginName, 'packages');
};
const getGroupPath = (pluginName, target) => {
    let projectPath = getProjectPath();
    return path.join(projectPath, 'extensions', pluginName, 'packages', target);
};

class InstallInfoManager {
    constructor(pluginName) {
        this.logs = [];
        this.extensionPath = '';
        this.projectPath = '';
        this.pluginName = pluginName;
        this.extensionPath = getExtensionsPath();
        this.projectPath = getProjectPath();
        this.installInfoPath = path.join(this.extensionPath, pluginName + '-installInfo.json');
    }
    /**
     * 检查安装信息文件是否存在
     */
    exists() {
        return fs__namespace.existsSync(this.installInfoPath);
    }
    /**
     * 读取安装信息文件
     */
    readInstallInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultInstallInfo = {
                version: '1.0.0',
                lastUpdated: new Date().toISOString(),
                installedComponents: []
            };
            try {
                if (fs__namespace.existsSync(this.installInfoPath)) {
                    const content = yield fs__namespace.promises.readFile(this.installInfoPath, 'utf-8');
                    const parsed = JSON.parse(content);
                    return Object.assign(defaultInstallInfo, parsed);
                }
            }
            catch (error) {
                console.warn(`[${this.pluginName}] 读取安装信息失败，将使用默认配置:`, error);
            }
            return defaultInstallInfo;
        });
    }
    /**
     * 写入安装信息文件
     */
    writeInstallInfo(installInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                installInfo.lastUpdated = new Date().toISOString();
                yield fs__namespace.promises.writeFile(this.installInfoPath, JSON.stringify(installInfo, null, 2), 'utf-8');
                this.logs.push(`[${this.pluginName}] 安装信息已写入: ${this.installInfoPath.replace(this.projectPath, '')}`);
                return true;
            }
            catch (error) {
                this.logs.push(`[${this.pluginName}] 写入安装信息失败: ${error}`);
                console.error(`[${this.pluginName}] 写入安装信息失败:`, error);
                return false;
            }
        });
    }
    /**
     * 获取安装信息写入日志
     * @returns 安装信息写入日志数组
     */
    getLogs() {
        return this.logs;
    }
    /**
       * 检查安装信息是否存在
       */
    checkInstallExists() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.exists()) {
                    return yield this.readInstallInfo();
                }
                return null;
            }
            catch (error) {
                console.warn(`[${this.pluginName}] 检查安装信息失败:`, error);
                return null;
            }
        });
    }
    /**
     * 获取已安装组件列表
     */
    getInstalledComponentCodes() {
        return __awaiter(this, void 0, void 0, function* () {
            const installInfo = yield this.readInstallInfo();
            return installInfo.installedComponents.map(comp => comp.componentCode);
        });
    }
    /**
     * 检查组件是否已安装
     */
    isComponentInstalled(componentCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const installedComponents = yield this.getInstalledComponentCodes();
            return installedComponents.indexOf(componentCode) > -1;
        });
    }
    /**
     * 获取组件的安装信息
     */
    getComponentInfo(componentCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const installInfo = yield this.readInstallInfo();
            return installInfo.installedComponents.find(comp => comp.componentCode === componentCode) || null;
        });
    }
    /**
     * 从 meta 文件中提取组件元数据
     */
    extractComponentMetadata(zipFilePath, compName) {
        return __awaiter(this, void 0, void 0, function* () {
            let componentCode = compName;
            let componentId = compName;
            let componentDisplayName = compName;
            let componentVersion = '1.0.0';
            try {
                const metaPath = zipFilePath + '.meta';
                if (fs__namespace.existsSync(metaPath)) {
                    const metaContent = yield fs__namespace.promises.readFile(metaPath, 'utf-8');
                    const metaData = JSON.parse(metaContent);
                    if (metaData === null || metaData === void 0 ? void 0 : metaData.userData) {
                        componentCode = metaData.userData.name || compName;
                        componentId = metaData.userData.name || compName;
                        componentDisplayName = metaData.userData.displayName || compName;
                        componentVersion = metaData.userData.version || componentVersion;
                    }
                }
            }
            catch (error) {
                console.warn(`[${this.pluginName}] 提取组件元数据失败:`, error);
            }
            return {
                componentCode,
                componentId,
                componentDisplayName,
                componentVersion
            };
        });
    }
    /**
     * 记录组件安装信息
     */
    recordInstallation(zipFilePath, compName, targetPath, copiedFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const installInfo = yield this.readInstallInfo();
                // 从 meta 中获取组件元数据
                const metadata = yield this.extractComponentMetadata(zipFilePath, compName);
                // 更新 installedComponents 列表（去重后追加）
                installInfo.installedComponents = installInfo.installedComponents.filter((c) => c.componentCode !== metadata.componentCode);
                installInfo.installedComponents.push({
                    componentName: metadata.componentDisplayName,
                    componentId: metadata.componentId,
                    componentCode: metadata.componentCode,
                    version: metadata.componentVersion,
                    copiedFiles: copiedFiles,
                    installedAt: new Date().toISOString()
                });
                yield this.writeInstallInfo(installInfo);
                console.log(`[${this.pluginName}] 组件安装信息已记录: ${metadata.componentCode}`);
            }
            catch (error) {
                console.warn(`[${this.pluginName}] 记录安装信息失败，但组件安装已完成:`, error);
                throw error;
            }
        });
    }
    /**
     * 移除组件记录
     */
    removeComponent(componentCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const installInfo = yield this.readInstallInfo();
                // 从 installedComponents 中移除组件记录
                if (installInfo.installedComponents && Array.isArray(installInfo.installedComponents)) {
                    const originalLength = installInfo.installedComponents.length;
                    installInfo.installedComponents = installInfo.installedComponents.filter((comp) => comp.componentCode !== componentCode);
                    if (installInfo.installedComponents.length < originalLength) {
                        console.log(`[${this.pluginName}] 已从 installedComponents 中移除组件: ${componentCode}`);
                    }
                }
                yield this.writeInstallInfo(installInfo);
                console.log(`[${this.pluginName}] 组件记录已从安装信息中移除: ${componentCode}`);
            }
            catch (error) {
                console.warn(`[${this.pluginName}] 移除组件记录失败:`, error);
                throw error;
            }
        });
    }
}

class Handles {
    static getInstallInfoManager(pluginName) {
        return new InstallInfoManager(pluginName);
    }
    static getVersion(pluginName) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectPath = getProjectPath();
            // 检查备份信息文件是否存在
            const packagePath = path.join(projectPath, 'package.json');
            const hasFile = fs__namespace.existsSync(packagePath);
            if (hasFile) {
                const packageInfo = JSON.parse(yield fs__namespace.promises.readFile(packagePath, 'utf-8'));
                if (typeof packageInfo.creator != 'undefined') {
                    return {
                        success: true,
                        version: packageInfo.creator.version
                    };
                }
            }
            return {
                success: true,
                version: '未知版本'
            };
        });
    }
    static getComponentInfos(pluginName, group) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log('getComponentInfos', pluginName, group);
            try {
                const groupPath = getGroupPath(pluginName, group);
                if (!fs__namespace.existsSync(groupPath)) {
                    return {
                        success: false,
                        error: 'Packages directory not found',
                        groupPath: '',
                        componentInfos: []
                    };
                }
                // 当前组件安装情况
                const installInfoManager = Handles.getInstallInfoManager(pluginName);
                const installInfo = yield installInfoManager.checkInstallExists();
                let installedLists = ((_a = installInfo === null || installInfo === void 0 ? void 0 : installInfo.installedComponents) === null || _a === void 0 ? void 0 : _a.map((item) => item.componentCode)) || [];
                console.log('installedLists', installedLists);
                const items = fs__namespace.readdirSync(groupPath);
                const componentInfos = [];
                // 新逻辑：检测并读取 *.setup.json 文件，取消从 .meta 中读取
                for (const item of items) {
                    // 仅处理以 .setup.json 结尾的文件（例如：toast_item.setup.json）
                    if (!item.endsWith('.setup.json'))
                        continue;
                    const setupPath = path.join(groupPath, item);
                    try {
                        const content = yield fs__namespace.promises.readFile(setupPath, 'utf-8');
                        const json = JSON.parse(content);
                        if (json && typeof json === 'object') {
                            const info = {
                                // 直接使用 setup.json 中的字段
                                code: json.code || path.basename(item, '.setup.json'),
                                displayName: json.displayName || path.basename(item, '.setup.json'),
                                version: json.version || '1.0.0',
                                description: json.description || '',
                                author: json.author || '',
                                category: json.category || group,
                                tags: Array.isArray(json.tags) ? json.tags : [],
                                path: json.path || '',
                                dependencies: Array.isArray(json.dependencies) ? json.dependencies : [],
                                files: Array.isArray(json.files) ? json.files : [],
                                // 状态字段
                                installStatus: installedLists.indexOf(json.code || path.basename(item, '.setup.json')) > -1 ? 'has' : 'none',
                                backupStatus: 'none'
                            };
                            componentInfos.push(info);
                        }
                    }
                    catch (error) {
                        console.error(`读取或解析 ${item} 失败:`, error);
                    }
                }
                return {
                    success: true,
                    groupPath,
                    componentInfos
                };
            }
            catch (error) {
                return {
                    success: false,
                    error: 'Failed to get items',
                    groupPath: '',
                    componentInfos: []
                };
            }
        });
    }
    static installComponent(param) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { compName, pluginName, group } = param;
            if (!compName || !pluginName || !group) {
                return {
                    success: false,
                    error: '组件名或插件名或者分组不能为空'
                };
            }
            console.log(`[xhgame_builder] 安装组件请求: ${compName}`, param);
            let extractTempDir = '';
            try {
                let groupPath = getGroupPath(pluginName, group);
                console.log(`[xhgame_builder] 组件安装目录: ${groupPath}`);
                const zipFilePath = path.join(groupPath, `${compName}.zip`);
                const legacyDirPath = path.join(groupPath, compName);
                // 解压源目录（如果是zip）或使用旧目录模式
                let assetsSourcePath = legacyDirPath;
                if (fs__namespace.existsSync(zipFilePath)) {
                    console.log(`[xhgame_builder] 发现zip包，准备解压: ${zipFilePath}`);
                    extractTempDir = path.join(groupPath, '__extract', compName);
                    yield fs__namespace.promises.mkdir(extractTempDir, { recursive: true });
                    const zip = new AdmZip(zipFilePath);
                    zip.extractAllTo(extractTempDir, true);
                    console.log(`[xhgame_builder] 解压完成到: ${extractTempDir}`);
                    // 选择正确的根目录：
                    // 1) 若存在单个顶级目录（排除 __MACOSX），以该目录为根
                    // 2) 若根目录下存在 assets，则以 assets 作为源
                    // 3) 否则使用解压根目录
                    const topEntries = yield fs__namespace.promises.readdir(extractTempDir, { withFileTypes: true });
                    const candidateDirs = topEntries.filter(e => e.isDirectory() && e.name !== '__MACOSX');
                    let baseRoot = extractTempDir;
                    if (candidateDirs.length === 1) {
                        baseRoot = path.join(extractTempDir, candidateDirs[0].name);
                    }
                    const extractedAssetsDir = path.join(baseRoot, 'assets');
                    assetsSourcePath = fs__namespace.existsSync(extractedAssetsDir) ? extractedAssetsDir : baseRoot;
                }
                else if (fs__namespace.existsSync(legacyDirPath)) {
                    console.log(`[xhgame_builder] 使用旧目录模式: ${legacyDirPath}`);
                    assetsSourcePath = legacyDirPath;
                }
                else {
                    return {
                        success: false,
                        error: `未找到组件资源：${zipFilePath} 或 ${legacyDirPath}`
                    };
                }
                // 获取项目assets/script目录路径
                const projectPath = getProjectPath();
                const targetPath = path.join(projectPath, 'assets');
                // 确保目标目录存在
                yield fs__namespace.promises.mkdir(targetPath, { recursive: true });
                console.log(`[xhgame_builder] 源路径: ${assetsSourcePath}`);
                console.log(`[xhgame_builder] 目标路径: ${targetPath}`);
                // 复制所需文件到项目 assets 目录
                const copiedFiles = [];
                const conflictFiles = [];
                const missingFiles = [];
                // 先检查是否有同名文件冲突
                function checkConflicts(srcDir_1, destDir_1) {
                    return __awaiter(this, arguments, void 0, function* (srcDir, destDir, relativePath = '') {
                        const items = yield fs__namespace.promises.readdir(srcDir, { withFileTypes: true });
                        for (const item of items) {
                            const destPath = path.join(destDir, item.name);
                            const relPath = path.join(relativePath, item.name);
                            // 跳过所有 .meta 文件和文件夹
                            if (item.name.endsWith('.meta')) {
                                continue;
                            }
                            if (item.isDirectory()) {
                                // 检查目录下的文件
                                const srcSubDir = path.join(srcDir, item.name);
                                yield checkConflicts(srcSubDir, destPath, relPath);
                            }
                            else {
                                // 检查文件是否已存在
                                try {
                                    yield fs__namespace.promises.access(destPath);
                                    conflictFiles.push(relPath);
                                }
                                catch (error) {
                                    // 文件不存在，没有冲突
                                }
                            }
                        }
                    });
                }
                // 若为zip并存在meta，则按meta中的userData.files进行安装
                const metaPath = zipFilePath + '.meta';
                const useMetaList = fs__namespace.existsSync(zipFilePath) && fs__namespace.existsSync(metaPath);
                if (useMetaList) {
                    try {
                        const metaContent = yield fs__namespace.promises.readFile(metaPath, 'utf-8');
                        const metaData = JSON.parse(metaContent);
                        const filesList = Array.isArray((_a = metaData === null || metaData === void 0 ? void 0 : metaData.userData) === null || _a === void 0 ? void 0 : _a.files) ? metaData.userData.files : [];
                        console.log('需要进行copy的filesList', filesList);
                        if (!filesList.length) {
                            return {
                                success: false,
                                error: `安装失败：组件 ${compName} 的 meta 未声明要安装的 files`,
                            };
                        }
                        // 检查冲突（仅针对列出的文件）
                        for (const fileRel of filesList) {
                            if (fileRel.endsWith('.meta'))
                                continue;
                            const destPath = path.join(targetPath, fileRel);
                            try {
                                yield fs__namespace.promises.access(destPath);
                                conflictFiles.push(fileRel);
                            }
                            catch (_b) { }
                        }
                        if (conflictFiles.length > 0) {
                            console.log(`[xhgame_builder] 检测到冲突文件: ${conflictFiles.join('\n')}`);
                            return {
                                success: false,
                                error: `安装失败：检测到以下文件已存在，请先删除或备份这些文件：\n${conflictFiles.join('\n')}`,
                            };
                        }
                        console.log(`[xhgame_builder] 使用meta files列表进行复制，文件数量: ${filesList.length}`);
                        // 复制列出的文件
                        function copySelectedFiles(files) {
                            return __awaiter(this, void 0, void 0, function* () {
                                for (const fileRel of files) {
                                    const srcPath = path.join(assetsSourcePath, fileRel);
                                    const destPath = path.join(targetPath, fileRel);
                                    try {
                                        const stat = yield fs__namespace.promises.stat(srcPath);
                                        if (stat.isDirectory()) {
                                            yield fs__namespace.promises.mkdir(destPath, { recursive: true });
                                            yield copyDirectory(srcPath, destPath, fileRel);
                                        }
                                        else {
                                            yield fs__namespace.promises.mkdir(path.dirname(destPath), { recursive: true });
                                            yield fs__namespace.promises.copyFile(srcPath, destPath);
                                            copiedFiles.push(fileRel);
                                            console.log(`[xhgame_builder] 复制文件: ${fileRel}`);
                                        }
                                    }
                                    catch (e) {
                                        missingFiles.push(fileRel);
                                        console.warn(`[xhgame_builder] 缺失文件（未在压缩包中找到）: ${fileRel}`);
                                    }
                                }
                            });
                        }
                        yield copySelectedFiles(filesList);
                        if (missingFiles.length > 0) {
                            return {
                                success: false,
                                error: `安装失败：以下声明的文件在压缩包中未找到：\n${missingFiles.join('\n')}`,
                            };
                        }
                    }
                    catch (err) {
                        return {
                            success: false,
                            error: `安装失败：读取组件meta失败或格式错误（${String(err)}）`,
                        };
                    }
                }
                else {
                    // 旧模式或无meta：复制整个源目录（保持兼容）
                    yield checkConflicts(assetsSourcePath, targetPath);
                    if (conflictFiles.length > 0) {
                        console.log(`[xhgame_builder] 检测到冲突文件: ${conflictFiles.join('\n')}`);
                        return {
                            success: false,
                            error: `安装失败：检测到以下文件已存在，请先删除或备份这些文件：\n${conflictFiles.join('\n')}`,
                        };
                    }
                    console.log(`[xhgame_builder] 没有冲突文件，开始复制整个目录...`);
                    yield copyDirectory(assetsSourcePath, targetPath);
                }
                function copyDirectory(srcDir_1, destDir_1) {
                    return __awaiter(this, arguments, void 0, function* (srcDir, destDir, relativePath = '') {
                        const items = yield fs__namespace.promises.readdir(srcDir, { withFileTypes: true });
                        for (const item of items) {
                            const srcPath = path.join(srcDir, item.name);
                            const destPath = path.join(destDir, item.name);
                            const relPath = path.join(relativePath, item.name);
                            if (item.isDirectory()) {
                                // 所有 .meta 文件夹可以跳过
                                if (item.name.endsWith('.meta')) {
                                    continue;
                                }
                                // 创建目录
                                yield fs__namespace.promises.mkdir(destPath, { recursive: true });
                                yield copyDirectory(srcPath, destPath, relPath);
                            }
                            else {
                                // 复制文件
                                yield fs__namespace.promises.copyFile(srcPath, destPath);
                                copiedFiles.push(relPath);
                                console.log(`[xhgame_builder] 复制文件: ${relPath}`);
                            }
                        }
                    });
                }
                console.log(`[xhgame_builder] 组件安装完成，共复制 ${copiedFiles.length} 个文件`);
                // 记录安装信息到配置文件 copiedFiles等到xhgame_builder-installInfo.json中的 installedComponents
                try {
                    const installInfoManager = Handles.getInstallInfoManager(pluginName);
                    yield installInfoManager.recordInstallation(zipFilePath, compName, targetPath, copiedFiles);
                }
                catch (writeErr) {
                    console.warn(`[xhgame_builder] 写入安装信息失败，但组件安装已完成:`, writeErr);
                }
                // 记录安装信息到配置文件 copiedFiles等到xhgame_builder-installInfo.json中的 installedComponents
                return {
                    success: true,
                    error: `组件 ${compName} 从内置资源安装成功！`,
                    // copiedFiles: copiedFiles
                };
            }
            catch (error) {
                console.error(`[xhgame_builder] 从内置资源安装组件失败: `, error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                };
            }
            finally {
                // 清理临时解压目录
                if (extractTempDir && fs__namespace.existsSync(extractTempDir)) {
                    try {
                        yield fs__namespace.promises.rm(extractTempDir, { recursive: true, force: true });
                        const parentExtractDir = path.join(getGroupPath(pluginName, group), '__extract');
                        // 若父目录为空则清理
                        try {
                            const remain = yield fs__namespace.promises.readdir(parentExtractDir);
                            if (remain.length === 0) {
                                yield fs__namespace.promises.rm(parentExtractDir, { recursive: true, force: true });
                            }
                        }
                        catch (_c) { }
                    }
                    catch (cleanupErr) {
                        console.warn(`[xhgame_builder] 清理临时目录失败: ${extractTempDir}`, cleanupErr);
                    }
                }
            }
        });
    }
    static uninstallComponent(param) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log('uninstallComponent', param);
            const { compName, pluginName } = param;
            if (!compName || !pluginName) {
                return {
                    success: false,
                    error: '组件名或插件名不能为空'
                };
            }
            console.log(`[xhgame_builder] 安装卸载组件请求: ${compName}`, param);
            try {
                // 获取项目路径
                const projectPath = getProjectPath();
                const assetsPath = path.join(projectPath, 'assets');
                const installInfoManager = Handles.getInstallInfoManager(pluginName);
                const installInfo = yield installInfoManager.checkInstallExists();
                if (!installInfo) {
                    return {
                        success: false,
                        error: '未找到组件安装信息文件'
                    };
                }
                // 查找组件信息
                const component = (_a = installInfo.installedComponents) === null || _a === void 0 ? void 0 : _a.find((c) => c.componentCode === compName);
                if (!component) {
                    return {
                        success: false,
                        error: `未找到组件 ${compName} 的安装记录`
                    };
                }
                // 备份和删除文件
                // const backedUpFiles: string[] = [];
                const deletedFiles = [];
                const notFoundFiles = [];
                for (const relativeFilePath of component.copiedFiles) {
                    const fullFilePath = path.join(assetsPath, relativeFilePath);
                    const metaFilePath = fullFilePath + '.meta';
                    const relativeMetaFilePath = relativeFilePath + '.meta';
                    try {
                        // 检查文件是否存在
                        yield fs__namespace.promises.access(fullFilePath);
                        // 删除原文件
                        yield fs__namespace.promises.unlink(fullFilePath);
                        deletedFiles.push(relativeFilePath);
                        console.log(`[xhgame_builder] 删除文件: ${relativeFilePath}`);
                    }
                    catch (error) {
                        console.warn(`[xhgame_builder] 文件不存在或处理失败: ${relativeFilePath}`, error);
                        notFoundFiles.push(relativeFilePath);
                    }
                }
                // 清理空目录
                const cleanupEmptyDirs = (dirPath) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const items = yield fs__namespace.promises.readdir(dirPath);
                        // 递归清理子目录
                        for (const item of items) {
                            const itemPath = path.join(dirPath, item);
                            const stat = yield fs__namespace.promises.stat(itemPath);
                            if (stat.isDirectory()) {
                                yield cleanupEmptyDirs(itemPath);
                            }
                        }
                        // 检查目录是否为空
                        const remainingItems = yield fs__namespace.promises.readdir(dirPath);
                        if (remainingItems.length === 0) {
                            yield fs__namespace.promises.rmdir(dirPath);
                            console.log(`[xhgame_builder] 删除空目录: ${dirPath}`);
                        }
                    }
                    catch (error) {
                        // 忽略清理目录时的错误
                    }
                });
                // 从assets目录开始清理空目录
                yield cleanupEmptyDirs(assetsPath);
                // 从配置中移除组件记录 
                try {
                    const installInfoManager = Handles.getInstallInfoManager(pluginName);
                    yield installInfoManager.removeComponent(compName);
                }
                catch (error) {
                    console.warn(`[xhgame_builder] 移除组件记录失败:`, error);
                    // 不影响卸载结果，只是记录移除失败
                }
                console.log(`[xhgame_builder] 组件卸载完成: ${component.componentName}`);
                return {
                    success: true,
                    // error: `组件 ${component.componentName} 卸载成功！\n备份位置: ${backupFolderName}`,
                    // backupPath: componentBackupDir,
                    // backedUpFiles: backedUpFiles,
                    // deletedFiles: deletedFiles,
                    // notFoundFiles: notFoundFiles
                };
            }
            catch (error) {
                console.error(`[xhgame_builder] 卸载组件失败: `, error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                };
            }
        });
    }
    static checkInstallExists(param) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pluginName } = param;
            if (!pluginName) {
                return {
                    success: false,
                    error: '插件名不能为空',
                };
            }
            try {
                const installInfoManager = Handles.getInstallInfoManager(pluginName);
                const installInfo = yield installInfoManager.checkInstallExists();
                if (installInfo) {
                    return {
                        success: true,
                        installInfo: installInfo
                    };
                }
                else {
                    return {
                        success: true,
                        installInfo: []
                    };
                }
            }
            catch (error) {
                console.error(`[xhgame_builder] 检查备份文件失败:`, error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                };
            }
        });
    }
}

class Pack {
    /**
     * 将指定的 assets 路径（例如：assets/bundle_factory/item_views/textUiItems/toast_item）
     * 打包复制到 extensions/pack_demo/packages/<group>/<item>/bundle_factory/item_views/<group>/<item>
     * 并包含同级的 <item>.meta 文件。
     */
    static packItem(assetItemPath_1) {
        return __awaiter(this, arguments, void 0, function* (assetItemPath, pluginName = 'pack_demo') {
            try {
                const projectPath = getProjectPath();
                // 校验输入并定位源目录
                if (!assetItemPath || !assetItemPath.startsWith('assets/')) {
                    return { success: false, error: '请输入以 assets/ 开头的资源路径' };
                }
                const sourceItemAbs = path.join(projectPath, assetItemPath);
                const hasSourceDir = fs__namespace.existsSync(sourceItemAbs) && fs__namespace.statSync(sourceItemAbs).isDirectory();
                if (!hasSourceDir) {
                    return { success: false, error: `源目录不存在：${assetItemPath}` };
                }
                const itemName = path.basename(sourceItemAbs);
                // 解析组名（父目录名）与内部相对路径（去掉 assets/ 前缀）
                const internalRelative = assetItemPath.replace(/^assets\//, '');
                const parts = internalRelative.split('/');
                if (parts.length < 2) {
                    return { success: false, error: '资源路径格式不正确' };
                }
                // group 取 itemName 的上一级目录
                const group = parts[parts.length - 2];
                // 目标根：extensions/pack_demo/packages/<group>/<item>
                const targetRoot = path.join(projectPath, 'extensions', pluginName, 'packages', group, itemName);
                // 目标内部结构：bundle_factory/item_views/<group>/<item>
                const targetInternalBase = path.join(targetRoot, 'bundle_factory', 'item_views', group);
                const targetItemDir = path.join(targetInternalBase, itemName);
                // 如果已有旧内容，删除后重建
                yield fs__namespace.promises.rm(targetRoot, { recursive: true, force: true }).catch(() => { });
                yield fs__namespace.promises.mkdir(targetItemDir, { recursive: true });
                const copiedFiles = [];
                // 递归复制目录
                yield Pack.copyDirectory(sourceItemAbs, targetItemDir, (rel) => {
                    copiedFiles.push(path.join('bundle_factory', 'item_views', group, itemName, rel));
                });
                // 复制同级的 <item>.meta（如果存在）到 bundle_factory/item_views/<group>/<item>.meta
                const sourceMeta = sourceItemAbs + '.meta';
                if (fs__namespace.existsSync(sourceMeta) && fs__namespace.statSync(sourceMeta).isFile()) {
                    const targetMeta = path.join(targetInternalBase, itemName + '.meta');
                    yield fs__namespace.promises.copyFile(sourceMeta, targetMeta);
                    copiedFiles.push(path.join('bundle_factory', 'item_views', group, itemName + '.meta'));
                }
                // 生成或更新 setup.json（位于 group 目录下，如: extensions/<plugin>/packages/<group>/<item>.setup.json）
                const setupJsonPath = path.join(projectPath, 'extensions', pluginName, 'packages', group, `${itemName}.setup.json`);
                yield Pack.writeSetupJson(setupJsonPath, {
                    itemName,
                    group,
                    files: copiedFiles
                });
                return {
                    success: true,
                    targetPath: targetRoot,
                    copiedFiles
                };
            }
            catch (err) {
                return { success: false, error: err instanceof Error ? err.message : String(err) };
            }
        });
    }
    static copyDirectory(srcDir, destDir, onCopied) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs__namespace.promises.mkdir(destDir, { recursive: true });
            const items = yield fs__namespace.promises.readdir(srcDir, { withFileTypes: true });
            for (const item of items) {
                const srcPath = path.join(srcDir, item.name);
                const destPath = path.join(destDir, item.name);
                if (item.isDirectory()) {
                    yield Pack.copyDirectory(srcPath, destPath, (rel) => {
                        onCopied && onCopied(path.join(item.name, rel));
                    });
                }
                else {
                    yield fs__namespace.promises.copyFile(srcPath, destPath);
                    onCopied && onCopied(item.name);
                }
            }
        });
    }
    static writeSetupJson(setupPath, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const { itemName, group, files } = info;
            let data = null;
            try {
                if (fs__namespace.existsSync(setupPath)) {
                    const content = yield fs__namespace.promises.readFile(setupPath, 'utf-8');
                    const parsed = JSON.parse(content);
                    // 仅更新 files 字段
                    if (typeof parsed === 'object' && parsed) {
                        parsed.files = files;
                        data = parsed;
                    }
                }
            }
            catch (_) {
                // 解析失败则走默认
                data = null;
            }
            if (!data) {
                const defaultInfo = {
                    code: itemName,
                    displayName: itemName,
                    version: '1.0.0',
                    description: '',
                    author: 'auto',
                    category: group,
                    tags: [],
                    path: path.join('bundle_factory', 'item_views', group, itemName),
                    dependencies: [],
                    files: files,
                };
                data = defaultInfo;
            }
            yield fs__namespace.promises.writeFile(setupPath, JSON.stringify(data, null, 2), 'utf-8');
        });
    }
}

exports.Handles = Handles;
exports.InstallInfoManager = InstallInfoManager;
exports.Pack = Pack;
exports.getExtensionsPath = getExtensionsPath;
exports.getGroupPath = getGroupPath;
exports.getPackagesPath = getPackagesPath;
exports.getPluginPath = getPluginPath;
exports.getProjectPath = getProjectPath;
