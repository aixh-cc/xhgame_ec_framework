import { describe, test, expect } from "bun:test";
import { UiManager } from "../../src/Ui/UiManager";
import { TestNode, TestViewComp, TestUiDrive } from "./TestUiData";

describe("UiManager功能", () => {
    test("测试UiManager功能", async () => {
        let uiManager = new UiManager<TestUiDrive, TestNode>(new TestUiDrive())
        expect(uiManager.getGuiRoot().name).toBe('gui_root')
        expect(uiManager.getWorldRoot().name).toBe('world_root')
        expect(uiManager.checkOpening('test_view')).toBe(false)

        await uiManager.openUIAsync('test_view', new TestViewComp())

        expect(uiManager.checkOpening('test_view')).toBe(false)
        expect(uiManager.checkOpened('test_view')).toBe(true)

        uiManager.removeUI('test_view')
        expect(uiManager.checkOpened('test_view')).toBe(false)
    });
});
