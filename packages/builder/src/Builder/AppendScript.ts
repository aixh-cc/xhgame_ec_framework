import { Project } from 'ts-morph';
import * as fs from 'fs';
import { basename, join } from 'path';
import { getProjectPath } from './Util';

export class AppendScript {

    static async addFactoryType(factoryType: string) {
        return await this.addBaseType(factoryType, 'FactoryType', 'MyFactoryManager');
    }
    static async addTableType(factoryType: string) {
        return await this.addBaseType(factoryType, 'TableType', 'MyTableManager');
    }

    private static async addBaseType(type: string, typeKey: string, managerName: string) {
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
                enumDecl.addMember({ name: type, initializer: `'${type}'` });
            }

            await sourceFile.save();
            return { success: true };
        } catch (err) {
            return { success: false, error: '添加 ' + typeKey + ' 失败: ' + (err as Error)?.message };
        }
    }

    static async removeFactoryType(factoryType: string): Promise<{ success: boolean, error?: string }> {
        const sourceFilePath = join(getProjectPath(), 'assets', 'script', 'managers', 'MyFactoryManager.ts');
        let processed = false;
        try {
            await fs.promises.access(sourceFilePath, fs.constants.F_OK);
        } catch {
            return { success: false, error: sourceFilePath + '文件不存在' };
        }
        try {
            const project = new Project();
            const sourceFile = project.addSourceFileAtPath(sourceFilePath);
            const enumDecl = sourceFile.getEnum('FactoryType');
            const member = enumDecl.getMember(factoryType) || enumDecl.getMembers().find(m => m.getName() === factoryType);
            if (member) {
                member.remove();
                await sourceFile.save();
                processed = true;
            } else {
                // 没有该成员也视为幂等成功
                processed = true;
            }
        } catch (err) {
            return { success: false, error: '移除 FactoryType 失败: ' + (err as Error)?.message };
        }

        if (!processed) {
            return { success: false, error: '未找到包含 FactoryType 的目标文件' };
        }
        return { success: true };
    }
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