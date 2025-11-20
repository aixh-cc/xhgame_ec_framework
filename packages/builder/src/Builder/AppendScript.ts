import { Project } from 'ts-morph';
import * as fs from 'fs';
import { basename, join } from 'path';
import { getProjectPath } from './Util';

/**
 * 自动追加/移除脚本片段（基于 ts-morph 修改枚举与类）
 * - 支持 FactoryType/TableType/UIEnums/AudioEnums 的枚举增删
 * - 支持向类追加组件引用属性、表类属性、工厂属性等
 * 使用示例：`tests/builder/AppendScript.test.ts`
 */
export class AppendScript {

    /** 向 FactoryType 枚举添加成员（若不存在） */
    static async addFactoryType(factoryType: string) {
        return await this._addBaseType(factoryType, 'FactoryType', 'MyFactoryManager');
    }
    /** 向 TableType 枚举添加成员（若不存在） */
    static async addTableType(factoryType: string) {
        return await this._addBaseType(factoryType, 'TableType', 'MyTableManager');
    }
    /** 向 UIEnums 枚举添加成员（若不存在），initializer 为 GUI 路径 */
    static async addGuiType(guiType: string, guiPath: string) {
        return await this._addBaseType(guiType, 'UIEnums', 'MyUiManager', guiPath);
    }
    /** 向 AudioEnums 枚举添加成员（若不存在），initializer 为音频路径 */
    static async addAudioType(audioType: string, audioPath: string) {
        return await this._addBaseType(audioType, 'AudioEnums', 'MyAudioManager', audioPath);
    }
    private static async _addBaseType(type: string, typeKey: string, managerName: string, initializer?: string) {
        const sourceFilePath = join(getProjectPath(), 'assets', 'script', 'managers', managerName + '.ts');

        // 检测sourceFilePath是否存在
        try {
            await fs.promises.access(sourceFilePath, fs.constants.F_OK);
        } catch (e) {
            return { success: false, error: sourceFilePath + '文件不存在' };
        }
        // 使用 ts-morph 修改枚举
        try {
            const project = new Project();
            const sourceFile = project.addSourceFileAtPath(sourceFilePath);

            const enumDecl = sourceFile.getEnum(typeKey);
            if (!enumDecl) {
                return { success: false, error: typeKey + ' 枚举未找到' };
            }

            const alreadyExists = enumDecl.getMembers().some(m => m.getName() === type);
            if (!alreadyExists) {
                if (initializer) {
                    enumDecl.addMember({ name: type, initializer: `'${initializer}'` });
                } else {
                    enumDecl.addMember({ name: type, initializer: `'${type}'` });
                }
            }

            await sourceFile.save();
            return { success: true };
        } catch (err) {
            return { success: false, error: '添加 ' + typeKey + ' 失败: ' + (err as Error)?.message };
        }
    }

    /** 从 FactoryType 枚举移除成员（幂等） */
    static async removeFactoryType(factoryType: string): Promise<{ success: boolean, error?: string }> {
        return await this._removeBaseType(factoryType, 'FactoryType', 'MyFactoryManager');
    }
    /** 从 TableType 枚举移除成员（幂等） */
    static async removeTableType(tableType: string): Promise<{ success: boolean, error?: string }> {
        return await this._removeBaseType(tableType, 'TableType', 'MyTableManager');
    }
    /** 从 UIEnums 枚举移除成员（幂等） */
    static async removeGuiType(guiType: string): Promise<{ success: boolean, error?: string }> {
        return await this._removeBaseType(guiType, 'UIEnums', 'MyUiManager');
    }
    /** 从 AudioEnums 枚举移除成员（幂等） */
    static async removeAudioType(audioType: string): Promise<{ success: boolean, error?: string }> {
        return await this._removeBaseType(audioType, 'AudioEnums', 'MyAudioManager');
    }
    private static async _removeBaseType(type: string, typeKey: string, managerName: string): Promise<{ success: boolean, error?: string }> {
        const sourceFilePath = join(getProjectPath(), 'assets', 'script', 'managers', managerName + '.ts');
        let processed = false;
        try {
            await fs.promises.access(sourceFilePath, fs.constants.F_OK);
        } catch {
            return { success: false, error: sourceFilePath + '文件不存在' };
        }
        try {
            const project = new Project();
            const sourceFile = project.addSourceFileAtPath(sourceFilePath);
            const enumDecl = sourceFile.getEnum(typeKey);
            const member = enumDecl.getMember(type) || enumDecl.getMembers().find(m => m.getName() === type);
            if (member) {
                member.remove();
                await sourceFile.save();
                processed = true;
            } else {
                // 没有该成员也视为幂等成功
                processed = true;
            }
        } catch (err) {
            return { success: false, error: '移除 ' + typeKey + ' 失败: ' + (err as Error)?.message };
        }

        if (!processed) {
            return { success: false, error: '未找到包含 ' + typeKey + ' 的目标文件' };
        }
        return { success: true };
    }
    /**
     * 向类追加组件引用属性与 import
     * - config.sourceFilePath 类源文件相对路径（相对于 `assets`）
     */
    static async addComp(config: {
        sourceFilePath: string;
        compName: string;
        compPath: string;
    }): Promise<{ success: boolean, error?: string }> {
        // 检测sourceFilePath是否存在
        let sourceFilePath = join(getProjectPath(), 'assets', config.sourceFilePath);
        try {
            await fs.promises.access(sourceFilePath, fs.constants.F_OK);
        } catch (e) {
            return { success: false, error: sourceFilePath + '文件不存在' };
        }
        let sourceFileClassName = basename(sourceFilePath).replace('.ts', '');

        try {
            const project = new Project();
            const sourceFile = project.addSourceFileAtPath(sourceFilePath);
            config.compPath = config.compPath.replace('.ts', ''); // 可能用户会不小心加入ts后缀
            let compPath = 'db://assets/' + config.compPath;
            // 1. 添加 import 语句
            sourceFile.addImportDeclaration({
                namedImports: [config.compName],
                moduleSpecifier: compPath
            });

            // 2. 获取类声明
            const myClass = sourceFile.getClass(sourceFileClassName);
            if (!myClass) throw new Error(`${sourceFileClassName} class not found`);

            // 3. 添加属性
            myClass.addProperty({
                name: `['${config.compName}']`,
                type: `typeof ${config.compName}`,
                initializer: `${config.compName}`
            });

            await sourceFile.save();

            return { success: true }
        } catch (error) {
            return { success: false }
        }
    }
    /**
     * 向类追加表属性与 import
     * - `TableType.<type>` 作为属性名，类型为 `TableClass<ItemIName>`
     */
    static async addTable(config: {
        sourceFilePath: string;
        tableType: string;
        itemIName: string;
        tableClassName: string;
    }): Promise<{ success: boolean, error?: string }> {
        // 检测sourceFilePath是否存在
        let sourceFilePath = join(getProjectPath(), 'assets', config.sourceFilePath);
        try {
            await fs.promises.access(sourceFilePath, fs.constants.F_OK);
        } catch (e) {
            return { success: false, error: sourceFilePath + '文件不存在' };
        }
        let sourceFileClassName = basename(sourceFilePath).replace('.ts', '');

        try {
            const project = new Project();
            const sourceFile = project.addSourceFileAtPath(sourceFilePath);

            // 1. 添加 import 语句
            sourceFile.addImportDeclaration({
                namedImports: [config.itemIName, config.tableClassName],
                moduleSpecifier: './tables/' + config.tableClassName
            });

            // 2. 获取类声明
            const myClass = sourceFile.getClass(sourceFileClassName);
            if (!myClass) throw new Error(`${sourceFileClassName} class not found`);

            // 3. 添加属性
            myClass.addProperty({
                name: `[TableType.${config.tableType}]`,
                type: `${config.tableClassName}<${config.itemIName}>`,
                initializer: `(new ${config.tableClassName}<${config.itemIName}>())`
            });

            await sourceFile.save();

            return { success: true }
        } catch (error) {
            return { success: false }
        }
    }

    /**
     * 向类追加工厂属性与 import，并设置生产驱动
     * - `FactoryType.<type>` 作为属性名
     */
    static async addFactory(config: {
        sourceFilePath: string;
        factoryType: string;
        itemClassName: string;
        driveClassName: string;
        factoryClassName: string;
    }): Promise<{ success: boolean, error?: string }> {
        // 检测sourceFilePath是否存在
        let sourceFilePath = join(getProjectPath(), 'assets', config.sourceFilePath);
        try {
            await fs.promises.access(sourceFilePath, fs.constants.F_OK);
        } catch (e) {
            return { success: false, error: sourceFilePath + '文件不存在' };
        }
        let sourceFileClassName = basename(sourceFilePath).replace('.ts', '');

        try {
            const project = new Project();
            const sourceFile = project.addSourceFileAtPath(sourceFilePath);

            // 1. 添加 import 语句
            sourceFile.addImportDeclaration({
                namedImports: [config.itemClassName, config.driveClassName],
                moduleSpecifier: 'db://assets/script/managers/myFactory/itemTemplates/' + config.itemClassName
            });

            sourceFile.addImportDeclaration({
                namedImports: [config.factoryClassName],
                moduleSpecifier: './factorys/' + config.factoryClassName
            });

            // 2. 获取类声明
            const myClass = sourceFile.getClass(sourceFileClassName);
            if (!myClass) throw new Error(`${sourceFileClassName} class not found`);

            // 3. 添加属性
            myClass.addProperty({
                name: `[FactoryType.${config.factoryType}]`,
                type: `${config.factoryClassName}<${config.driveClassName}, ${config.itemClassName}>`,
                initializer: `(new ${config.factoryClassName}<${config.driveClassName}, ${config.itemClassName}>()).setItemProduceDrive(new ${config.driveClassName}())`
            });

            await sourceFile.save();

            return { success: true }
        } catch (error) {
            return { success: false }
        }

    }
    /**
     * 从类移除组件引用属性与对应 import（幂等）
     */
    static async removeComp(
        sourceFilePath: string,
        compName: string
    ): Promise<{ success: boolean, error?: string }> {
        // 参数校验
        if (!sourceFilePath || sourceFilePath.trim().length === 0 || !compName || compName.trim().length === 0) {
            return { success: false };
        }
        // 检测sourceFilePath是否存在
        sourceFilePath = join(getProjectPath(), 'assets', sourceFilePath);
        try {
            await fs.promises.access(sourceFilePath, fs.constants.F_OK);
        } catch (e) {
            return { success: false, error: sourceFilePath + '文件不存在' };
        }

        const sourceFileClassName = basename(sourceFilePath).replace('.ts', '');

        try {
            const project = new Project();
            const sourceFile = project.addSourceFileAtPath(sourceFilePath);

            // 1. 查找并移除类属性
            const myClass = sourceFile.getClass(sourceFileClassName);
            const property = myClass?.getProperty(`['${compName}']`);
            if (property) {
                property.remove();
            }

            // 2. 清理 import 部分（移除该组件类的命名导入）
            const importDeclarations = sourceFile.getImportDeclarations();
            for (const imp of importDeclarations) {
                const namedImports = imp.getNamedImports();
                for (const spec of namedImports) {
                    if (spec.getName() === compName) {
                        spec.remove();
                    }
                }
                // 如果该 import 已无任何命名/默认导入，则移除整个声明
                if (imp.getNamedImports().length === 0 && !imp.getDefaultImport()) {
                    imp.remove();
                }
            }

            // 尝试进一步组织导入，清除可能的未使用导入
            try {
                sourceFile.organizeImports();
            } catch {
                // ignore organize errors
            }

            await sourceFile.save();

            return { success: true };
        } catch (error) {
            return { success: false };
        }
    }
    /**
     * 从类移除表属性与相关 import（幂等）
     */
    static async removeTable(
        sourceFilePath: string,
        factoryType: string
    ): Promise<{ success: boolean, error?: string }> {
        if (!sourceFilePath || sourceFilePath.trim().length === 0) {
            return { success: false };
        }
        // 检测sourceFilePath是否存在
        sourceFilePath = join(getProjectPath(), 'assets', sourceFilePath);
        try {
            await fs.promises.access(sourceFilePath, fs.constants.F_OK);
        } catch (e) {
            return { success: false, error: sourceFilePath + '文件不存在' };
        }
        let sourceFileClassName = basename(sourceFilePath).replace('.ts', '');

        try {
            const project = new Project();
            const sourceFile = project.addSourceFileAtPath(sourceFilePath);

            // 1. 查找并移除类属性
            const myClass = sourceFile.getClass(sourceFileClassName);
            const property = myClass?.getProperty(`[TableType.${factoryType}]`);

            // 在移除前解析引用到的类名，便于清理 import
            let tableClassName: string | undefined;
            let itemIName: string | undefined;
            if (property) {
                const typeText = property.getTypeNode()?.getText() ?? '';
                const initText = property.getInitializer()?.getText() ?? '';

                // 尝试通过类型解析: TableClass<ItemIName>
                const typeMatch = typeText.match(/([A-Za-z0-9_$.]+)\s*<\s*([A-Za-z0-9_$.]+)\s*>/);
                if (typeMatch) {
                    tableClassName = typeMatch[1];
                    itemIName = typeMatch[2];
                }
                // 若类型未解析成功，再尝试通过初始化表达式解析: new TableClass<ItemIName>()
                if (!tableClassName || !itemIName) {
                    const initMatch = initText.match(/new\s+([A-Za-z0-9_$.]+)\s*<\s*([A-Za-z0-9_$.]+)\s*>/);
                    if (initMatch) {
                        tableClassName = tableClassName ?? initMatch[1];
                        itemIName = itemIName ?? initMatch[2];
                    }
                }

                // 先移除属性
                property.remove();

                // 2. 清理 import 部分（两者都来自 './tables/<TableClass>'）
                const namesToRemove = new Set<string>();
                if (tableClassName) namesToRemove.add(tableClassName);
                if (itemIName) namesToRemove.add(itemIName);

                if (namesToRemove.size > 0) {
                    const importDeclarations = sourceFile.getImportDeclarations();
                    for (const imp of importDeclarations) {
                        const namedImports = imp.getNamedImports();
                        for (const spec of namedImports) {
                            const name = spec.getName();
                            if (namesToRemove.has(name)) {
                                spec.remove();
                            }
                        }
                        // 如果该 import 已无任何命名/默认导入，则移除整个声明
                        if (imp.getNamedImports().length === 0 && !imp.getDefaultImport()) {
                            imp.remove();
                        }
                    }
                }
            }

            // 尝试进一步组织导入，清除可能的未使用导入
            try {
                sourceFile.organizeImports();
            } catch {
                // ignore organize errors
            }

            await sourceFile.save();

            return { success: true }
        } catch (error) {
            return { success: false }
        }
    }

    /**
     * 从类移除工厂属性与相关 import（幂等）
     */
    static async removeFactory(
        sourceFilePath: string,
        factoryType: string
    ): Promise<{ success: boolean, error?: string }> {
        // 检测sourceFilePath是否存在
        if (!sourceFilePath || sourceFilePath.trim().length === 0) {
            return { success: false };
        }
        // 检测sourceFilePath是否存在
        sourceFilePath = join(getProjectPath(), 'assets', sourceFilePath);
        try {
            await fs.promises.access(sourceFilePath, fs.constants.F_OK);
        } catch (e) {
            return { success: false, error: sourceFilePath + '文件不存在' };
        }
        let sourceFileClassName = basename(sourceFilePath).replace('.ts', '');

        try {
            const project = new Project();
            const sourceFile = project.addSourceFileAtPath(sourceFilePath);

            // 1. 查找并移除类属性
            const myClass = sourceFile.getClass(sourceFileClassName);
            const property = myClass?.getProperty(`[FactoryType.${factoryType}]`);

            if (property) {
                // 在移除前，解析初始化表达式以提取 driveClassName 与 itemClassName
                const initText = property.getInitializer()?.getText() ?? '';
                let driveClassName: string | undefined;
                let itemClassName: string | undefined;
                // 通过泛型参数解析：FactoryClass<DriveClass, ItemClass>
                const genericMatch = initText.match(/<\s*([A-Za-z0-9_$.]+)\s*,\s*([A-Za-z0-9_$.]+)\s*>/);
                if (genericMatch) {
                    driveClassName = genericMatch[1];
                    itemClassName = genericMatch[2];
                }
                // 再尝试通过 setItemProduceDrive(new DriveClass()) 捕获
                if (!driveClassName) {
                    const driveMatch = initText.match(/setItemProduceDrive\(\s*new\s+([A-Za-z0-9_$.]+)\s*\)/);
                    if (driveMatch) {
                        driveClassName = driveMatch[1];
                    }
                }

                // 先移除属性
                property.remove();

                // 2. 清理 import 部分，因为这个就是一对一的不会被其他引用
                const namesToRemove = new Set<string>();
                if (driveClassName) namesToRemove.add(driveClassName);
                if (itemClassName) namesToRemove.add(itemClassName);

                if (namesToRemove.size > 0) {
                    const importDeclarations = sourceFile.getImportDeclarations();
                    for (const imp of importDeclarations) {
                        const namedImports = imp.getNamedImports();
                        for (const spec of namedImports) {
                            const name = spec.getName();
                            if (namesToRemove.has(name)) {
                                spec.remove();
                            }
                        }
                        // 如果该 import 已无任何命名/默认导入，则移除整个声明
                        if (imp.getNamedImports().length === 0 && !imp.getDefaultImport()) {
                            imp.remove();
                        }
                    }
                }
            }

            // 尝试进一步组织导入，清除可能的未使用导入
            try {
                sourceFile.organizeImports();
            } catch {
                // ignore organize errors
            }

            await sourceFile.save();

            return { success: true }
        } catch (error) {
            return { success: false }
        }
    }

}