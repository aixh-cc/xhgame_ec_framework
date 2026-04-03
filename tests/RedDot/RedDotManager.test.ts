import { describe, test, expect, beforeEach } from "bun:test";
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

describe("RedDot功能", () => {
    let drive: MockRedDotDrive;
    let manager: RedDotManager;

    beforeEach(() => {
        drive = new MockRedDotDrive();
        manager = new RedDotManager(drive);
    });

    test("数据层 - 注册和获取红点", () => {
        manager.register('shop');
        manager.register('shop.weapon');
        manager.register('shop.armor');

        expect(manager.getCount('shop')).toBe(0);
        expect(manager.getShow('shop')).toBe(false);
    });

    test("数据层 - 设置和获取计数", () => {
        manager.setCount('shop.weapon', 5);
        expect(manager.getCount('shop.weapon')).toBe(5);
        expect(manager.getShow('shop.weapon')).toBe(true);

        // 父节点应该包含子节点计数
        expect(manager.getCount('shop')).toBe(5);

        manager.setCount('shop.armor', 3);
        expect(manager.getCount('shop')).toBe(8);
    });

    test("数据层 - 清空计数", () => {
        manager.setCount('shop.weapon', 5);
        expect(manager.getCount('shop.weapon')).toBe(5);

        manager.clear('shop.weapon');
        expect(manager.getCount('shop.weapon')).toBe(0);
        expect(manager.getShow('shop.weapon')).toBe(false);
    });

    test("事件系统 - 红点变化通知", () => {
        const eventManager = new EventManager<RedDotEventMap>();
        const managerWithEvent = new RedDotManager(drive, eventManager);

        let notifyCount = 0;
        let lastData: any = null;

        eventManager.on('redDot_shop.weapon', (event, data) => {
            notifyCount++;
            lastData = data;
        });

        managerWithEvent.setCount('shop.weapon', 5);
        managerWithEvent.flush(); // 需要调用 flush 触发事件
        expect(notifyCount).toBe(1);
        expect(lastData.count).toBe(5);
        expect(lastData.show).toBe(true);

        managerWithEvent.clear('shop.weapon');
        managerWithEvent.flush(); // 需要调用 flush 触发事件
        expect(notifyCount).toBe(2);
        expect(lastData.count).toBe(0);
        expect(lastData.show).toBe(false);
    });

    test("UI层 - 添加和移除红点", () => {
        const targetNode = new MockRedDotNode('Button');
        const redDot = manager.addRedDot(targetNode);

        expect(redDot).toBeTruthy();
        expect(redDot.node.parent).toBe(targetNode);

        const sameRedDot = manager.addRedDot(targetNode);
        expect(sameRedDot).toBe(redDot);

        manager.removeRedDot(targetNode);
        expect(redDot.node.parent).toBe(null);
    });

    test("UI层 - 设置红点数字", () => {
        const targetNode = new MockRedDotNode('Button');
        manager.addRedDot(targetNode);

        manager.setRedDotNumber(targetNode, 10);
        const redDot = manager.getRedDot(targetNode);
        expect(redDot.currentNumber).toBe(10);
    });

    test("对象池 - 红点复用", () => {
        const node1 = new MockRedDotNode('Button1');
        const node2 = new MockRedDotNode('Button2');

        const redDot1 = manager.addRedDot(node1);
        const firstInstance = redDot1;

        manager.removeRedDot(node1);

        const redDot2 = manager.addRedDot(node2);
        expect(redDot2).toBe(firstInstance);
    });

    test("UI层 - 清空所有红点", () => {
        const node1 = new MockRedDotNode('Button1');
        const node2 = new MockRedDotNode('Button2');

        manager.addRedDot(node1);
        manager.addRedDot(node2);

        manager.clearAll();

        expect(manager.getRedDot(node1)).toBe(null);
        expect(manager.getRedDot(node2)).toBe(null);
    });

    test("不使用事件管理器", () => {
        const managerNoEvent = new RedDotManager(drive);

        // 不应该抛出错误
        managerNoEvent.setCount('shop', 5);
        expect(managerNoEvent.getCount('shop')).toBe(5);
    });

    test("多层级红点 - 3层结构", () => {
        manager.setCount('shop.weapon.sword', 2);
        manager.setCount('shop.weapon.bow', 3);
        manager.setCount('shop.armor.helmet', 1);

        expect(manager.getCount('shop.weapon.sword')).toBe(2);
        expect(manager.getCount('shop.weapon.bow')).toBe(3);
        expect(manager.getCount('shop.weapon')).toBe(5);
        expect(manager.getCount('shop.armor')).toBe(1);
        expect(manager.getCount('shop')).toBe(6);
    });

    test("红点数字为0时不显示", () => {
        manager.setCount('shop.weapon', 5);
        expect(manager.getShow('shop.weapon')).toBe(true);

        manager.setCount('shop.weapon', 0);
        expect(manager.getShow('shop.weapon')).toBe(false);
    });

    test("force参数 - 强制触发通知", () => {
        const eventManager = new EventManager<RedDotEventMap>();
        const managerWithEvent = new RedDotManager(drive, eventManager);

        let notifyCount = 0;

        eventManager.on('redDot_shop', (event, data) => {
            notifyCount++;
        });

        managerWithEvent.setCount('shop', 5);
        managerWithEvent.flush();
        expect(notifyCount).toBe(1);

        // 相同值，force=false 不触发通知
        managerWithEvent.setCount('shop', 5, false);
        managerWithEvent.flush();
        expect(notifyCount).toBe(1);

        // force=true 强制触发通知
        managerWithEvent.setCount('shop', 5, true);
        managerWithEvent.flush();
        expect(notifyCount).toBe(2);
    });

    test("批处理 - flush 批量触发事件", () => {
        const eventManager = new EventManager<RedDotEventMap>();
        const managerWithEvent = new RedDotManager(drive, eventManager);

        let shopWeaponNotifyCount = 0;
        let shopArmorNotifyCount = 0;
        let shopNotifyCount = 0;

        eventManager.on('redDot_shop.weapon', (event, data) => {
            shopWeaponNotifyCount++;
        });

        eventManager.on('redDot_shop.armor', (event, data) => {
            shopArmorNotifyCount++;
        });

        eventManager.on('redDot_shop', (event, data) => {
            shopNotifyCount++;
        });

        // 设置多个子节点，但不会立即触发事件
        managerWithEvent.setCount('shop.weapon', 5);
        managerWithEvent.setCount('shop.armor', 3);
        managerWithEvent.setCount('shop.potion', 2);

        // 此时事件还未触发
        expect(shopWeaponNotifyCount).toBe(0);
        expect(shopArmorNotifyCount).toBe(0);
        expect(shopNotifyCount).toBe(0);

        // 调用 flush 批量触发
        managerWithEvent.flush();

        // 每个节点只触发一次
        expect(shopWeaponNotifyCount).toBe(1);
        expect(shopArmorNotifyCount).toBe(1);
        expect(shopNotifyCount).toBe(1);
    });

    test("批处理 - 同一节点多次修改只触发一次", () => {
        const eventManager = new EventManager<RedDotEventMap>();
        const managerWithEvent = new RedDotManager(drive, eventManager);

        let notifyCount = 0;
        let lastData: any = null;

        eventManager.on('redDot_shop', (event, data) => {
            notifyCount++;
            lastData = data;
        });

        // 同一帧内多次修改同一节点
        managerWithEvent.setCount('shop.weapon', 1);
        managerWithEvent.setCount('shop.weapon', 2);
        managerWithEvent.setCount('shop.weapon', 3);
        managerWithEvent.setCount('shop.armor', 5);

        // flush 前不触发
        expect(notifyCount).toBe(0);

        // flush 后只触发一次，使用最新数据
        managerWithEvent.flush();
        expect(notifyCount).toBe(1);
        expect(lastData.count).toBe(8); // 3 + 5
    });

    test("批处理 - flush 后队列清空", () => {
        const eventManager = new EventManager<RedDotEventMap>();
        const managerWithEvent = new RedDotManager(drive, eventManager);

        let notifyCount = 0;

        eventManager.on('redDot_shop', (event, data) => {
            notifyCount++;
        });

        managerWithEvent.setCount('shop', 5);
        managerWithEvent.flush();
        expect(notifyCount).toBe(1);

        // 再次 flush 不应该触发
        managerWithEvent.flush();
        expect(notifyCount).toBe(1);
    });

    test("批处理 - flush 过程中产生的新事件不影响当前批次", () => {
        const eventManager = new EventManager<RedDotEventMap>();
        const managerWithEvent = new RedDotManager(drive, eventManager);

        let notifyCount = 0;

        eventManager.on('redDot_shop', (event, data) => {
            notifyCount++;
            // 在事件处理中修改其他节点
            if (notifyCount === 1) {
                managerWithEvent.setCount('shop.weapon', 10);
            }
        });

        managerWithEvent.setCount('shop', 5);
        managerWithEvent.flush();

        // 第一次 flush 只触发一次
        expect(notifyCount).toBe(1);

        // 第二次 flush 触发新产生的事件
        managerWithEvent.flush();
        expect(notifyCount).toBe(2);
    });

    test("notifyImmediate - 立即触发绕过批处理", () => {
        const eventManager = new EventManager<RedDotEventMap>();
        const managerWithEvent = new RedDotManager(drive, eventManager);

        let notifyCount = 0;

        eventManager.on('redDot_shop', (event, data) => {
            notifyCount++;
        });

        // 使用 notifyImmediate 立即触发
        managerWithEvent.setCount('shop', 5);
        expect(notifyCount).toBe(0); // 还未触发

        managerWithEvent.notifyImmediate('shop');
        expect(notifyCount).toBe(1); // 立即触发

        // flush 仍会触发一次（因为 setCount 收集了）
        managerWithEvent.flush();
        expect(notifyCount).toBe(2);
    });

    test("批处理 - 树形冒泡去重", () => {
        const eventManager = new EventManager<RedDotEventMap>();
        const managerWithEvent = new RedDotManager(drive, eventManager);

        let shopNotifyCount = 0;

        eventManager.on('redDot_shop', (event, data) => {
            shopNotifyCount++;
        });

        // 设置10个子节点，每个都会向上冒泡到 shop
        for (let i = 1; i <= 10; i++) {
            managerWithEvent.setCount(`shop.item${i}`, i);
        }

        // flush 前不触发
        expect(shopNotifyCount).toBe(0);

        // flush 后父节点只触发一次（去重效果）
        managerWithEvent.flush();
        expect(shopNotifyCount).toBe(1);
    });
});
