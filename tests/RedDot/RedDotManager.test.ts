import { assert, describe, test } from "poku";
import { RedDotManager, RedDotNode } from "../../src/RedDot/RedDotManager";
import { IRedDotDrive, IRedDotNode, IRedDotConfig, IRedDotInstance } from "../../src/RedDot/IRedDotDrive";
import { EventManager } from "../../src/Event/EventManager";
import { RedDotEventMap } from "../../src/RedDot/RedDotEvents";

// Mock 节点实现
class MockRedDotNode implements IRedDotNode {
    name: string;
    active: boolean = true;
    layer: number = 0;
    parent: IRedDotNode | null = null;
    private _position = { x: 0, y: 0, z: 0 };

    constructor(name: string) {
        this.name = name;
    }

    setPosition(x: number, y: number, z: number): void {
        this._position = { x, y, z };
    }

    removeFromParent(): void {
        this.parent = null;
    }
}

// Mock 红点实例实现
class MockRedDotInstance implements IRedDotInstance {
    node: IRedDotNode;
    targetNode: IRedDotNode | null = null;
    currentNumber: number = 0;

    constructor(node: IRedDotNode) {
        this.node = node;
    }

    setNumber(num: number): void {
        this.currentNumber = num;
        this.node.active = num > 0;
    }

    reset(): void {
        this.node.active = false;
        this.targetNode = null;
        this.currentNumber = 0;
    }
}

// Mock Drive 实现
class MockRedDotDrive implements IRedDotDrive {
    createRedDot(config: IRedDotConfig): IRedDotInstance {
        const node = new MockRedDotNode('RedDot');
        return new MockRedDotInstance(node);
    }

    updateRedDotConfig(instance: IRedDotInstance, config: IRedDotConfig): void {
        // Mock 实现，不做实际更新
    }

    attachRedDot(instance: IRedDotInstance, targetNode: IRedDotNode, config: IRedDotConfig): void {
        instance.node.parent = targetNode;
        instance.node.layer = targetNode.layer;
    }

    detachRedDot(instance: IRedDotInstance): void {
        instance.node.removeFromParent();
    }
}

const test_00 = () => {
    return new Promise((resolve) => {
        test('数据层 - 注册和获取红点', async () => {
            const drive = new MockRedDotDrive();
            const manager = new RedDotManager(drive);

            manager.register('shop');
            manager.register('shop.weapon');
            manager.register('shop.armor');

            assert.equal(manager.getCount('shop'), 0, '初始计数为0');
            assert.equal(manager.getShow('shop'), false, '初始不显示');

            resolve(true);
        });
    });
};

const test_01 = () => {
    return new Promise((resolve) => {
        test('数据层 - 设置和获取计数', async () => {
            const drive = new MockRedDotDrive();
            const manager = new RedDotManager(drive);

            manager.setCount('shop.weapon', 5);
            assert.equal(manager.getCount('shop.weapon'), 5, '武器计数为5');
            assert.equal(manager.getShow('shop.weapon'), true, '武器显示红点');

            // 父节点应该包含子节点计数
            assert.equal(manager.getCount('shop'), 5, '商店计数包含武器');

            manager.setCount('shop.armor', 3);
            assert.equal(manager.getCount('shop'), 8, '商店计数包含武器和护甲');

            resolve(true);
        });
    });
};

const test_02 = () => {
    return new Promise((resolve) => {
        test('数据层 - 清空计数', async () => {
            const drive = new MockRedDotDrive();
            const manager = new RedDotManager(drive);

            manager.setCount('shop.weapon', 5);
            assert.equal(manager.getCount('shop.weapon'), 5, '设置计数为5');

            manager.clear('shop.weapon');
            assert.equal(manager.getCount('shop.weapon'), 0, '清空后计数为0');
            assert.equal(manager.getShow('shop.weapon'), false, '清空后不显示');

            resolve(true);
        });
    });
};

const test_03 = () => {
    return new Promise((resolve) => {
        test('事件系统 - 红点变化通知', async () => {
            const drive = new MockRedDotDrive();
            const eventManager = new EventManager<RedDotEventMap>();
            const manager = new RedDotManager(drive, eventManager);

            let notifyCount = 0;
            let lastData: any = null;

            eventManager.on('redDot_shop.weapon', (event, data) => {
                notifyCount++;
                lastData = data;
            });

            manager.setCount('shop.weapon', 5);
            assert.equal(notifyCount, 1, '触发一次通知');
            assert.equal(lastData.count, 5, '通知数据正确');
            assert.equal(lastData.show, true, '显示状态正确');

            manager.clear('shop.weapon');
            assert.equal(notifyCount, 2, '清空触发通知');
            assert.equal(lastData.count, 0, '清空后计数为0');
            assert.equal(lastData.show, false, '清空后不显示');

            resolve(true);
        });
    });
};

const test_04 = () => {
    return new Promise((resolve) => {
        test('UI层 - 添加和移除红点', async () => {
            const drive = new MockRedDotDrive();
            const manager = new RedDotManager(drive);

            const targetNode = new MockRedDotNode('Button');
            const redDot = manager.addRedDot(targetNode);

            assert.ok(redDot, '成功添加红点');
            assert.equal(redDot.node.parent, targetNode, '红点附加到目标节点');

            const sameRedDot = manager.addRedDot(targetNode);
            assert.equal(sameRedDot, redDot, '重复添加返回同一实例');

            manager.removeRedDot(targetNode);
            assert.equal(redDot.node.parent, null, '红点已分离');

            resolve(true);
        });
    });
};

const test_05 = () => {
    return new Promise((resolve) => {
        test('UI层 - 设置红点数字', async () => {
            const drive = new MockRedDotDrive();
            const manager = new RedDotManager(drive);

            const targetNode = new MockRedDotNode('Button');
            manager.addRedDot(targetNode);

            manager.setRedDotNumber(targetNode, 10);
            const redDot = manager.getRedDot(targetNode);
            assert.equal(redDot.currentNumber, 10, '红点数字设置正确');

            resolve(true);
        });
    });
};

const test_06 = () => {
    return new Promise((resolve) => {
        test('对象池 - 红点复用', async () => {
            const drive = new MockRedDotDrive();
            const manager = new RedDotManager(drive);

            const node1 = new MockRedDotNode('Button1');
            const node2 = new MockRedDotNode('Button2');

            const redDot1 = manager.addRedDot(node1);
            const firstInstance = redDot1;

            manager.removeRedDot(node1);

            const redDot2 = manager.addRedDot(node2);
            assert.equal(redDot2, firstInstance, '对象池复用实例');

            resolve(true);
        });
    });
};

const test_07 = () => {
    return new Promise((resolve) => {
        test('UI层 - 清空所有红点', async () => {
            const drive = new MockRedDotDrive();
            const manager = new RedDotManager(drive);

            const node1 = new MockRedDotNode('Button1');
            const node2 = new MockRedDotNode('Button2');

            manager.addRedDot(node1);
            manager.addRedDot(node2);

            manager.clearAll();

            assert.equal(manager.getRedDot(node1), null, '红点1已清除');
            assert.equal(manager.getRedDot(node2), null, '红点2已清除');

            resolve(true);
        });
    });
};

const test_08 = () => {
    return new Promise((resolve) => {
        test('不使用事件管理器', async () => {
            const drive = new MockRedDotDrive();
            const manager = new RedDotManager(drive); // 不传 eventManager

            // 不应该抛出错误
            manager.setCount('shop', 5);
            assert.equal(manager.getCount('shop'), 5, '不使用事件也能正常工作');

            resolve(true);
        });
    });
};

let functions = [
    test_00,
    test_01,
    test_02,
    test_03,
    test_04,
    test_05,
    test_06,
    test_07,
    test_08,
];

describe('RedDot功能', async () => {
    while (functions.length > 0) {
        let func = functions.shift();
        if (func) {
            await func();
            await waitXms();
        }
    }
});

const waitXms = (ms: number = 0) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};
