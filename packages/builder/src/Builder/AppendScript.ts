import { Project } from 'ts-morph';

export class AppendScript {

    static async addFactory(config: {
        factoryType: string;
        importPath: string;
        itemClassName: string;
        driveClassName: string;
        factoryClassName: string;
    }) {
        const project = new Project();
        const sourceFile = project.addSourceFileAtPath('/Users/hd/website/aixh/xhgame_kits/3dDemo/assets/script/managers/myFactory/MyCocosFactoryConfig.ts');

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
    }


}