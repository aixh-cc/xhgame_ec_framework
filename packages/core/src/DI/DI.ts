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
     * 绑定服务
     * @param identifier 服务标识符
     * @param implementation 服务实现
     */
    static bind<T>(identifier: string | symbol | NewableFunction, implementation: any) {
        const container = this.getContainer();
        container.bind<T>(identifier).to(implementation);
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
}

// 2. 定义Service装饰器
function autoBindForDI(identifier?: string | symbol) {
    return function (target: any) {
        // 确保Application容器在装饰器执行时就可用
        const id = identifier || target;
        // 绑定服务
        DI.bind(id, target);
    };
}

// 3. 导出类和装饰器，供其他文件使用
export { DI, autoBindForDI, inject, injectable };