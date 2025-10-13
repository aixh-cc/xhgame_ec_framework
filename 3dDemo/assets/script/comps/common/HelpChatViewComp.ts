
import { System } from "@aixh-cc/xhgame_ec_framework"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"

export interface IHelpChatView {
    content: string
    rightAvatarNo: string
    leftAvatarNo: string
    picNo: string
}
export class HelpChatViewSystem extends System {

    static async initComp(comp: HelpChatViewComp) {
        await xhgame.gui.openUIAsync(xhgame.gui.enums.Help_Chat, comp)
        this.startShow(comp)
    }

    static startShow(comp: HelpChatViewComp) {
        let chatItem = this.getChatItem(comp)
        if (chatItem) {
            comp.chatItem = chatItem
            comp.clickCallback = () => {
                comp.item_index++
                this.startShow(comp)
            }
            comp.notify();
        } else {
            comp.onComplete && comp.onComplete()
        }
    }

    static getChatItem(comp: HelpChatViewComp) {
        if (comp.item_index > comp.items.length - 1) {
            return null
        }
        return comp.items[comp.item_index]
    }
}

export class HelpChatViewComp extends BaseModelComp {
    compName: string = 'HelpChatViewComp'
    initBySystems: (typeof System)[] = [HelpChatViewSystem]
    onComplete: Function = null
    items: IHelpChatView[] = []
    item_index: number = 0
    setup(obj: { items: IHelpChatView[], onComplete: Function }) {
        this.items = obj.items
        this.onComplete = obj.onComplete
        return this
    }
    chatItem: IHelpChatView = null
    clickCallback: Function = null

    reset() {

        this.onComplete = null
        this.items = []
        this.item_index = 0
        this.chatItem = null
        this.clickCallback = null
    }

    onDetach() {
        xhgame.gui.removeUI(xhgame.gui.enums.Help_Chat)
    }
}