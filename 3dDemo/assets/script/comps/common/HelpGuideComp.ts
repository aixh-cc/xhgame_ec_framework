
import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"

export interface IHelpGuideViewVM {
    group: string,
    targetNodePath: string,
    text: string,
    text_size: string,
    text_pos_index: number,
    delay_time: number // 毫秒
}

export class HelpGuideSystem extends System {

    static async initComp(comp: HelpGuideComp) {
        await xhgame.gui.openUIAsync(xhgame.gui.enums.Help_Guide, comp)
        this.startShow(comp)
    }

    static startShow(comp: HelpGuideComp) {
        let guideItem = this.getGuideItem(comp)
        if (guideItem) {
            console.log('777777')
            if (guideItem.delay_time > 0) {
                xhgame.event.clearByTag('help_guild')
                xhgame.gui.removeUI(xhgame.gui.enums.Help_Guide)
                xhgame.timer.scheduleOnce(async () => {
                    await xhgame.gui.openUIAsync(xhgame.gui.enums.Help_Guide, comp)
                    this._show(comp, guideItem)
                }, guideItem.delay_time)
            } else {
                this._show(comp, guideItem)
            }
        } else {
            comp.onComplete && comp.onComplete()
        }
    }
    static _show(comp: HelpGuideComp, guideItem: IHelpGuideViewVM) {
        comp.viewVM = guideItem
        xhgame.event.setTag('help_guild').on('help_guide_btn_click_by_uuid', (event, path: string) => {
            if (path == comp.viewVM.targetNodePath) {
                console.log('指定按钮位置')
                comp.clickCallback && comp.clickCallback()
            } else {
                console.log('非指定按钮位置，目标位置：', comp.viewVM.targetNodePath, path)
            }
        })
        comp.clickCallback = () => {
            comp.item_index++
            this.startShow(comp)
        }
        comp.notify();
    }

    static getGuideItem(comp: HelpGuideComp) {
        if (comp.item_index > comp.items.length - 1) {
            return null
        }
        return comp.items[comp.item_index]
    }
}

export class HelpGuideComp extends BaseModelComp {
    compName: string = 'HelpGuideComp'
    initBySystems: (typeof System)[] = [HelpGuideSystem]
    onComplete: Function = null
    items: IHelpGuideViewVM[] = []
    item_index: number = 0
    setup(obj: { items: IHelpGuideViewVM[], onComplete: Function }) {
        this.items = obj.items
        this.onComplete = obj.onComplete
        return this
    }
    viewVM: IHelpGuideViewVM = {
        group: '',
        targetNodePath: '',
        text: '',
        text_size: '100,100',
        text_pos_index: 0,
        delay_time: 0
    }
    clickCallback: Function = null

    reset() {
        this.onComplete = null
        this.items = []
        this.item_index = 0
        this.viewVM = {
            group: '',
            targetNodePath: '',
            text: '',
            text_size: '100,100',
            text_pos_index: 0,
            delay_time: 0
        }
        this.clickCallback = null
    }

    onDetach() {
        xhgame.event.clearByTag('help_guild')
        xhgame.gui.removeUI(xhgame.gui.enums.Help_Guide)
    }
}