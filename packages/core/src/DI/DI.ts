import 'reflect-metadata';
import { Container } from 'inversify';
import { inject, injectable } from 'inversify';

class DI {
    private static container: Container;
    /**
     * 初始化应用容器
     * 确保只初始化一次
     */
    static initialize() {
        if (!this.container) {
            this.container = new Container();
        }
        return this.container;
    }

    /**
     * 获取容器实例
     * 自动初始化（如果需要）
     */
    static getContainer(): Container {
        if (!this.container) {
            return this.initialize();
        }
        return this.container;
    }

    /**
     * 绑定服务（每次创建新实例）
     * @param identifier 服务标识符
     * @param implementation 服务实现
     */
    static bind<T>(identifier: string | symbol | NewableFunction, implementation: any) {
        const container = this.getContainer();
        // 如果已经绑定，先解绑避免冲突
        if (container.isBound(identifier)) {
            container.unbind(identifier);
        }
        container.bind<T>(identifier).to(implementation).inTransientScope();;
    }
    /**
     * 绑定单例服务（整个应用生命周期内同一实例）
     */
    static bindSingleton<T>(
        identifier: string | symbol | NewableFunction,
        implementation: any
    ): void {
        const container = this.getContainer();

        if (container.isBound(identifier)) {
            container.unbind(identifier);
        }

        container.bind<T>(identifier).to(implementation).inSingletonScope();
    }
    /**
     * 绑定服务实例（直接绑定已创建的实例）
     */
    static bindInstance<T>(
        identifier: string | symbol | NewableFunction,
        instance: T
    ): void {
        const container = this.getContainer();

        if (container.isBound(identifier)) {
            container.unbind(identifier);
        }

        container.bind<T>(identifier).toConstantValue(instance);
    }
    /**
     * 获取服务实例
     * @param identifier 服务标识符
     */
    static make<T>(identifier: string | symbol | NewableFunction): T {
        const idStr = typeof identifier === 'string' ? identifier : (identifier as any).name || 'unknown';
        const container = this.getContainer();
        try {
            const instance = container.get<T>(identifier);
            return instance;
        } catch (error) {
            console.error(`Application.make: Failed to resolve ${idStr}`, error);
            throw error;
        }
    }

    /**
     * 检查服务是否已绑定
     * @param identifier 服务标识符
     */
    static isBound(identifier: string | symbol | NewableFunction): boolean {
        return this.getContainer().isBound(identifier);
    }
    /**
     * 解绑服务
     */
    static unbind(identifier: string | symbol | NewableFunction): void {
        const container = this.getContainer();
        if (container.isBound(identifier)) {
            container.unbind(identifier);
        }
    }
}

// 2. 定义Service装饰器
function autoBindForDI(identifier?: string | symbol) {
    return function (target: any) {
        // 确保Application容器在装饰器执行时就可用
        const id = identifier || target;
        // 绑定服务
        DI.bindSingleton(id, target);
    };
}

// 3. 导出类和装饰器，供其他文件使用
export { DI, autoBindForDI, inject, injectable };