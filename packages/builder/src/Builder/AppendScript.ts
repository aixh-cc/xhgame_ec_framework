import { Project } from 'ts-morph';
import * as fs from 'fs';

export class AppendScript {

    static async addFactoryType(factoryType: string) {
        const sourceFilePath = 'assets/script/managers/myFactory/MyFactorys.ts';
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

            const enumDecl = sourceFile.getEnum('FactoryType');
            if (!enumDecl) {
                return { success: false, error: 'FactoryType 枚举未找到' };
            }

            const alreadyExists = enumDecl.getMembers().some(m => m.getName() === factoryType);
            if (!alreadyExists) {
                enumDecl.addMember({ name: factoryType, initializer: `'${factoryType}'` });
            }

            await sourceFile.save();
            return { success: true };
        } catch (err) {
            return { success: false, error: '添加 FactoryType 失败: ' + (err as Error)?.message };
        }
    }

    static async addFactory(sourceFilePath: string, config: {
        factoryType: string;
        importPath: string;
        itemClassName: string;
        driveClassName: string;
        factoryClassName: string;
    }): Promise<{ success: boolean, error?: string }> {
        // 检测sourceFilePath是否存在
        if (!sourceFilePath || sourceFilePath.trim().length === 0) {
            return { success: false };
        }
        try {
            await fs.promises.access(sourceFilePath, fs.constants.F_OK);
        } catch (e) {
            return { success: false, error: sourceFilePath + '文件不存在' };
        }

        try {
            const project = new Project();
            const sourceFile = project.addSourceFileAtPath(sourceFilePath);

            // 1. 添加 import 语句
            sourceFile.addImportDeclaration({
                namedImports: [config.itemClassName, config.driveClassName],
                moduleSpecifier: config.importPath
            });

            // 2. 获取类声明
            const myClass = sourceFile.getClass('MyCocosFactoryConfig');
            if (!myClass) throw new Error('MyCocosFactoryConfig class not found');

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
        try {
            await fs.promises.access(sourceFilePath, fs.constants.F_OK);
        } catch (e) {
            return { success: false, error: sourceFilePath + '文件不存在' };
        }
        try {
            const project = new Project();
            const sourceFile = project.addSourceFileAtPath(sourceFilePath);

            // 1. 查找并移除类属性
            const myClass = sourceFile.getClass('MyCocosFactoryConfig');
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