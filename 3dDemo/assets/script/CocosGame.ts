import { GameEntity } from "./GameEntity";
import { xhgame } from "db://assets/script/xhgame";
// import { GateSenceComp } from "./severs/gate/GateSenceComp";
// import { HelpComp } from "./severs/common/HelpComp";
import { BYTEDANCE, DEBUG, WECHAT } from "cc/env";
// import { PlayerLoginComp } from "./severs/player/PlayerLoginComp";
// import { BattleGameBoxComp } from "./severs/battle/BattleGameBoxComp";
// import { SdkComp } from "./severs/common/SdkComp";
import { DI, Entity, IGame, Platform, TimeSystem } from "@aixh-cc/xhgame_ec_framework";
import { Game, Component, assetManager, game, director, profiler, _decorator } from "cc";
import { LoadResourceView } from "./cocos/view/ui/LoadResourceView";
import { IConfigTableItem } from "./managers/myTable/tables/ConfigTable";
import { LoadResourceViewComp } from "./comps/enter/LoadResourceViewComp";
import { GameEnterComp } from "./comps/enter/GameEnterComp";
import { CocosGameManagers } from "./CocosGameManagers";

const { ccclass, property } = _decorator;
@ccclass('CocosGame')
export class CocosGame extends Component implements IGame {
    private _gameEntity: GameEntity = null
    setGameEntity(gameEntity: GameEntity) {
        this._gameEntity = gameEntity
    }
    getGameEntity(): GameEntity {
        return this._gameEntity
    }
    serverNo: string = '0'
    config: IConfigTableItem = null
    at_platform: Platform = Platform.H5
    screen: { w: number, h: number } = { w: 640, h: 960 }
    testing: boolean = false

    protected async start() {
        if (WECHAT) {
            this.serverNo = 'wx_001'
            this.at_platform = Platform.Weixin
        } else if (BYTEDANCE) {
            this.serverNo = 'dy_001'
            this.at_platform = Platform.Douyin
        } else {
            this.serverNo = 'dev_001' // 0
            this.at_platform = Platform.H5
        }
        const managers = new CocosGameManagers()
        DI.bindInstance('IGame', this)
        DI.bindInstance('IManagers', managers)
        managers.init(this.node)
        await this.init()
        await this.play()
        console.log('等待玩家操作')
        assetManager.loadBundle('bundle_game') // 为了提取加载资源
    }

    async init() {
        this.onGameShowHide()
        this.setGameEntity(Entity.createEntity<GameEntity>(GameEntity))
        this.addComponent(LoadResourceView)
        await xhgame.gameEntity.attachComponent(LoadResourceViewComp).done()
        // 这个时候xhgame.table.config已经有值了
        this.config = xhgame.table.getTable(xhgame.table.enums.config).getInfo(this.serverNo)
    }

    async play() {
        xhgame.timer.timePlay()
        await xhgame.gameEntity.attachComponent(GameEnterComp).done()
    }

    // is_pause: boolean = false
    onGameShowHide() {
        // 游戏显示事件
        game.on(Game.EVENT_SHOW, () => {
            console.log("【系统】游戏前台显示");
            xhgame.timer.timeContinuePlay();
            xhgame.audio.resumeAll();
            director.resume();
            game.resume();
            xhgame.event.emit('GAME_EVENT_SHOW');
        });

        // 游戏隐藏事件
        game.on(Game.EVENT_HIDE, () => {
            console.log("【系统】游戏切到后台");
            xhgame.timer.timeStop();
            xhgame.audio.pauseAll();
            director.pause();
            game.pause();
            xhgame.event.emit('GAME_EVENT_HIDE');
        });

        // 游戏暂停事件
        xhgame.event.on('battle_game_pause', () => {
            console.log('【系统】游戏暂停');
            xhgame.timer.timeStop();
            xhgame.audio.pauseAll();
            director.pause();
            game.pause();
        });
        xhgame.event.on('battle_game_resume', () => {
            console.log('【系统】游戏恢复');
            xhgame.timer.timeContinuePlay();
            xhgame.audio.resumeAll();
            director.resume();
            game.resume();
        });
        // 引入xhgame全局变量以方便调试
        if (DEBUG) {
            window['xhgame'] = xhgame;
        }
        // debug
        if (DEBUG) profiler.showStats();
    }
    // xxx() {
    //     xhgame.gameEntity.getComponent(BattleGameBoxComp).gameBox.setDebug(true)
    //     return xhgame.gameEntity.getComponent(BattleGameBoxComp)
    // }
    protected update(dt: number): void {
        TimeSystem.getInstance().updateByDrive(dt * 1000)
    }
}

