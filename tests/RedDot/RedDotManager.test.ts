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
        expect(notifyCount).toBe(1);
        expect(lastData.count).toBe(5);
        expect(lastData.show).toBe(true);

        managerWithEvent.clear('shop.weapon');
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
});
