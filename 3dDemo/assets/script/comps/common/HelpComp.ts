
import { System } from "@aixh-cc/xhgame_ec_framework"
import { xhgame } from "../../xhgame"
import { BaseModelComp } from "@aixh-cc/xhgame_ec_framework"
import { HelpChatViewComp, IHelpChatView } from "./HelpChatViewComp"
import { HelpGuideComp, IHelpGuideViewVM } from "./HelpGuideComp"
// import { BattleGameBoxComp } from "../battle/BattleGameBoxComp"

export class HelpSystem extends System {

    static async initComp(comp: HelpComp) {
        return new Promise((resolve, reject) => {
            this.tmpGetHelpItems(comp)
            for (let i = 0; i < comp.helpItems.length; i++) {
                const helpItem = comp.helpItems[i];
                let str = helpItem.eventName + JSON.stringify(helpItem.param)
                if (comp.strNames.indexOf(str) > -1) {
                    console.error('已存在str的事件,请合并')
                }
                comp.strNames.push(str)
                xhgame.event.setTag('helpComp').on(helpItem.eventName, async (event, obj) => {
                    console.log('zzzzzz ', helpItem.eventName, helpItem.chatItems, JSON.stringify(obj), JSON.stringify(helpItem.param))
                    await HelpSystem.doChat(comp, helpItem, obj)
                    await HelpSystem.doGuide(comp, helpItem, obj)
                })
            }
            resolve(true)
        })
    }

    static async doChat(comp: HelpComp, helpItem: IHelpItem, obj: any) {
        return new Promise<boolean>((resolve, reject) => {
            if (helpItem.chatItems.length > 0 && JSON.stringify(obj) == JSON.stringify(helpItem.param)) {
                console.log('xhgame.gameEntity.attachComponent(HelpChatViewComp')
                xhgame.gameEntity.attachComponent(HelpChatViewComp).setup({
                    items: helpItem.chatItems,
                    onComplete: () => {
                        comp.resolveCallback && comp.resolveCallback(true)
                        // const battleGameBoxComp = xhgame.gameEntity.getComponent(BattleGameBoxComp)
                        // battleGameBoxComp.gameBox.resume()

                        xhgame.gameEntity.detachComponent(HelpChatViewComp)
                        resolve(true)
                    }
                })
            } else {
                resolve(true)
            }
        })
    }

    static async doGuide(comp: HelpComp, helpItem: IHelpItem, obj: any) {
        return new Promise<boolean>((resolve, reject) => {
            if (helpItem.guideItems.length > 0 && JSON.stringify(obj) == JSON.stringify(helpItem.param)) {
                console.log('xhgame.gameEntity.attachComponent(HelpChatViewComp')
                xhgame.gameEntity.attachComponent(HelpGuideComp).setup({
                    items: helpItem.guideItems,
                    onComplete: () => {
                        comp.resolveCallback && comp.resolveCallback(true)
                        // const battleGameBoxComp = xhgame.gameEntity.getComponent(BattleGameBoxComp)
                        // battleGameBoxComp.gameBox.resume()
                        xhgame.gameEntity.detachComponent(HelpGuideComp)
                    }
                })
            } else {
                resolve(true)
            }
        })
    }

    static getResolveCallback(comp: HelpComp, eventName: string, eventObj: any) {
        return new Promise<boolean>((resolve, reject) => {
            let str = eventName + JSON.stringify(eventObj)
            if (comp.strNames.indexOf(str) > -1) {
                console.log('comp.resolveCallback = resolve')
                // const battleGameBoxComp = xhgame.gameEntity.getComponent(BattleGameBoxComp)
                // battleGameBoxComp.gameBox.pause()
                comp.resolveCallback = resolve
            } else {
                resolve(true) // 没有直接返回
            }
        })
    }


    static tmpGetHelpItems(comp: HelpComp) {
        let helpChatItem001: IHelpItem = {
            eventName: 'beforShowTarget',
            chatItems: [
                { content: '主人！您终于醒了！！！', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: '' },
                { content: '我是怎么了？我现在在哪？', leftAvatarNo: '', rightAvatarNo: 'ren256', picNo: '' },
                { content: '主人，上次仙魔大战时，您元神受重伤，昏迷了近百年,一直未苏醒,青云以为你再也醒不过来了‌(T_T)‌', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: '' },
                { content: '我？昏迷了近百年？（我记得我在刷手机,怎么就进入了这个修仙世界）', leftAvatarNo: '', rightAvatarNo: 'ren256', picNo: '' },
                { content: '你叫青云,我的...?', leftAvatarNo: '', rightAvatarNo: 'ren256', picNo: '' },
                { content: '主人,您真的什么都不记得了？我是你的剑灵~青云！', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: '' },
                { content: '上次仙魔大战太过激烈,陨落了无数的仙家,摧毁了无数的仙器法宝。', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: '' },
                { content: '我是主人的本命法宝“青云剑”的剑灵,在接下那致命一击后,也受损严重,现在只能发挥一层的威力', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: '' },
                { content: '头疼！！我好像记起了一些事情...', leftAvatarNo: '', rightAvatarNo: 'ren256', picNo: '' },
                { content: '有动静！！！', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: '' },
            ],
            guideItems: [],
            param: { round: 0, battle_id: 1, max_battle_id: 1 }
        }
        comp.helpItems.push(helpChatItem001)
        //
        let helpChatItem002: IHelpItem = {
            eventName: 'event_battle_player_round_start',
            chatItems: [
                { content: '不好,洞府的法阵已经失效,魔族已经发现了此洞府,主人快控制飞剑来击退它们', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: '' },
                { content: '控制...飞剑...?', leftAvatarNo: '', rightAvatarNo: 'ren256', picNo: '' },
                { content: '是的,每次主人可以通过剑诀控制4把飞剑,可左右滑动,到达预定攻击位置后,向上滑动', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: 'help_pic1' },
                { content: '如果飞剑所在行,形成“剑+怪”的满格时,可触发所在行的飞剑攻击,攻击力是“和运算“', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: 'help_pic2' },
            ],
            guideItems: [],
            param: { round: 0, battle_id: 1, max_battle_id: 1 }
        }
        comp.helpItems.push(helpChatItem002)
        // 
        let helpChatItem003: IHelpItem = {
            eventName: 'event_battle_player_round_start',
            chatItems: [
                { content: '主人还记得"念头通达"吗？集中精力控制一把飞剑到指定位置', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: '' },
            ],
            guideItems: [
                {
                    group: 'guides_start_now',
                    targetNodePath: "root/UICanvas/battle_index/bottom/skills/skill_0",
                    text: "点击‘念头通达’",
                    text_size: '200,200',
                    text_pos_index: 5,
                    delay_time: 0,
                },
                {
                    group: 'guides_start_now1',
                    targetNodePath: "root/UICanvas/battle_intention_grid/items/grid_item_6",
                    text: "点击选中",
                    text_size: '150,150',
                    text_pos_index: 5,
                    delay_time: 500
                },
                {
                    group: 'guides_start_now1',
                    targetNodePath: "root/UICanvas/battle_intention_grid/okBtn",
                    text: "点击确定",
                    text_size: '150,150',
                    text_pos_index: 5,
                    delay_time: 0
                },
            ],
            param: { round: 3, battle_id: 1, max_battle_id: 1 }
        }
        comp.helpItems.push(helpChatItem003)
        //
        let helpChatItem004: IHelpItem = {
            eventName: 'event_battle_next_round_start',
            chatItems: [
                { content: '干得不错', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: '' },
                { content: '接下来,点击空白处,可以改变剑决的方向。将剑诀滑动到指定的位置', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: '' },
            ],
            guideItems: [],
            param: { round: 1, battle_id: 1, max_battle_id: 1 }
        }
        comp.helpItems.push(helpChatItem004)
        //
        let helpChatItem005: IHelpItem = {
            eventName: 'event_battle_next_round_start',
            chatItems: [
                { content: '太棒了,接下来点击“入鞘”按钮,来回收飞剑', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: '' },
            ],
            guideItems: [],
            param: { round: 2, battle_id: 1, max_battle_id: 1 }
        }
        comp.helpItems.push(helpChatItem005)
        // 
        let helpGuideItem001: IHelpItem = {
            eventName: 'event_battle_player_round_start',
            chatItems: [],
            guideItems: [
                {
                    group: 'guides_start_now',
                    targetNodePath: "root/UICanvas/battle_index/bottom/skill_main",
                    text: "点击入鞘",
                    text_size: '200,200',
                    text_pos_index: 5,
                    delay_time: 0,
                }
            ],
            param: { round: 2, battle_id: 1, max_battle_id: 1 }
        }
        comp.helpItems.push(helpGuideItem001)
        // battle_dialog_choose_skill_view_show
        let helpGuideItem002: IHelpItem = {
            eventName: 'battle_dialog_choose_skill_view_show',
            chatItems: [],
            guideItems: [
                {
                    group: 'guides_start_now',
                    targetNodePath: "root/UICanvas/choose_skill_dialog/skills/learn_skill_0",
                    text: "点击“念头通达",
                    text_size: '200,200',
                    text_pos_index: 5,
                    delay_time: 0,
                }
            ],
            param: { round: 2, battle_id: 1, max_battle_id: 1 }
        }
        comp.helpItems.push(helpGuideItem002)
        //
        let helpChatItem006: IHelpItem = {
            eventName: 'event_battle_next_round_start',
            chatItems: [
                { content: '主人,这就是仙剑自带的被动技能,来看看它的威力吧', leftAvatarNo: 'jianling256', rightAvatarNo: '', picNo: '' },
            ],
            guideItems: [],
            param: { round: 4, battle_id: 1, max_battle_id: 1 }
        }
        comp.helpItems.push(helpChatItem006)
    }
}

interface IHelpItem {
    eventName: string
    chatItems: IHelpChatView[]
    guideItems: IHelpGuideViewVM[]
    param: any
}

export class HelpComp extends BaseModelComp {
    compName: string = 'HelpComp'
    initBySystems: (typeof System)[] = [HelpSystem]
    // 
    helpItems: IHelpItem[] = []
    strNames: String[] = []
    resolveCallback: (value: boolean) => void = null
    reset() {
        this.helpItems = []
        this.strNames = []
        this.resolveCallback = null
    }
    actions = {
        getResolveCallback: (eventName: string, eventObj: any) => {
            return HelpSystem.getResolveCallback(this, eventName, eventObj)
        }
    }

    onDetach() {

    }
}