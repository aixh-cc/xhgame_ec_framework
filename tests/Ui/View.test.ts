import { describe, test, expect } from "bun:test";
import { TestView, TestViewComp } from "./TestUiData";
import { Entity } from "../../src/EC/Entity";
import { GameEntity } from "../EC/TestECData";
import { Comp } from "../../src/EC/Comp";

describe("View功能", () => {
    test("测试View功能", async () => {
        let mygameEntiy = Entity.createEntity<GameEntity>(GameEntity)
        let testViewComp = await mygameEntiy.attachComponent(TestViewComp).done() as TestViewComp
        let testView = new TestView()
        expect(testView.tips).toBe('tips_default')
        expect(testView.personAge).toBe(0)
        expect(testView.personBooks.length).toBe(0)
        testView.setViewComp(testViewComp)
        testViewComp.notify(true)
        expect(testView.tips).toBe('tips_TestViewComp')
        expect(testView.personAge).toBe(0)
        expect(testView.personBooks.length).toBe(0)
        testViewComp.tips = 'sss'
        testViewComp.viewVM = {
            person: {
                name: '张三',
                age: 23,
                books: ['j', 'k']
            }
        };
        testViewComp.notify(true)
        expect(testView.tips).toBe('sss')
        expect(testView.personAge).toBe(23)
        expect(testView.personName).toBe('张三')
        expect(testView.personBooks).toEqual(['j', 'k'])

        testViewComp.tips = 'www'
        testViewComp.viewVM = {
            person: {
                name: '李四',
                age: 25,
                books: ['l', 's']
            }
        };
        testViewComp.notify(true)
        expect(testView.tips).toBe('www')
        expect(testView.personAge).toBe(25)
        expect(testView.personName).toBe('李四')
        expect(testView.personBooks).toEqual(['l', 's'])

        expect(Comp.isDirtyComp(testViewComp)).toBe(false)

        // 多次notify
        testViewComp.tips = 'wwwqq'
        testViewComp.viewVM = {
            person: {
                name: '李四ww',
                age: 28,
                books: ['l', 's', 'w']
            }
        };
        testViewComp.notify()
        expect(testView.tips).toBe('www')
        expect(testView.personAge).toBe(25)
        expect(testView.personName).toBe('李四')
        expect(testView.personBooks).toEqual(['l', 's'])

        expect(Comp.isDirtyComp(testViewComp)).toBe(true)

        Comp.notifyAllDirtyComps()
        expect(testView.tips).toBe('wwwqq')
        expect(testView.personAge).toBe(28)
        expect(testView.personName).toBe('李四ww')
        expect(testView.personBooks).toEqual(['l', 's', 'w'])
        expect(Comp.isDirtyComp(testViewComp)).toBe(false)
    });

    test("测试组件回收时清理 observers", async () => {
        Comp.clearPool();

        let mygameEntiy = Entity.createEntity<GameEntity>(GameEntity)
        let testViewComp = await mygameEntiy.attachComponent(TestViewComp).done() as TestViewComp

        // 创建 View 并绑定
        let testView = new TestView()
        testView.setViewComp(testViewComp)

        expect(testViewComp.getObservers().length).toBe(1)

        // 卸载组件（会回收到池子）
        testViewComp.detach()

        // 验证 observers 已清理（防止池子污染）
        expect(testViewComp.getObservers().length).toBe(0)

        Entity.removeEntity(mygameEntiy)
    });

    test("测试组件重用不会触发旧 View", async () => {
        Comp.clearPool();

        let mygameEntiy = Entity.createEntity<GameEntity>(GameEntity)

        // 第一次使用
        let testViewComp1 = await mygameEntiy.attachComponent(TestViewComp).done() as TestViewComp
        let testView1 = new TestView()
        testView1.setViewComp(testViewComp1)
        testViewComp1.tips = 'first'
        testViewComp1.notify(true)
        expect(testView1.tips).toBe('first')

        // 卸载组件（回收到池子）
        testViewComp1.detach()

        // 第二次使用（从池子取出）
        let testViewComp2 = await mygameEntiy.attachComponent(TestViewComp).done() as TestViewComp
        expect(testViewComp2).toBe(testViewComp1) // 应该是同一个实例（从池子取出）

        let testView2 = new TestView()
        testView2.setViewComp(testViewComp2)
        testViewComp2.tips = 'second'
        testViewComp2.notify(true)

        // 验证：testView1 不应该被更新（因为已经解绑）
        expect(testView1.tips).toBe('first') // 保持旧值
        expect(testView2.tips).toBe('second') // 新 View 正常更新

        testViewComp2.detach()
        Entity.removeEntity(mygameEntiy)
    });
});
