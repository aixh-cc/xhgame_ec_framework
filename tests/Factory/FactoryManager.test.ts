import { describe, test, expect } from "bun:test";
import { FactoryManager } from "../../src/Factory/FactoryManager";
import { FactoryType, MyTestFactoryConfig } from "./TestFacotryData";

describe("FactoryManager功能", () => {
    test("测试FactoryManager", () => {
        let factoryManager = new FactoryManager<MyTestFactoryConfig>(new MyTestFactoryConfig())
        factoryManager.autoRegister()
        expect(factoryManager.getFactorys().size).toBe(3)
        let effectItemFactory = factoryManager.getFactory("effectItem" as any)
        expect(effectItemFactory?.name).toBe('effectItem')
    });
});
