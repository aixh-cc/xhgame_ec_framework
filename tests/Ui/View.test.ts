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
});
