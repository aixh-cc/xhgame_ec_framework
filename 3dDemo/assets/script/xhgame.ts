
import { IGame, TimeSystem } from "@aixh-cc/xhgame_ec_framework";
import { CocosGameManagers } from "db://assets/script/cocos/CocosGameManagers";
import { CocosGame } from "db://assets/script/CocosGame";
// import { TestGameManagers } from "../../tests/myTestGame/test/TestGameManagers";
// import { TestGame } from "../../tests/myTestGame/TestGame";

export class xhgame {
    private static _managers: any = null
    static get managers() {
        return xhgame.getManagers()
    }
    private static _game: IGame = null
    static get game() {
        return xhgame.getGame();
    }
    /**
    * test 时,打开下面的注释 
    * ==== test start ====
    */
    // static getManagers() {
    //     if (this._managers == null) {
    //         this._managers = new TestGameManagers()
    //     }
    //     return this._managers as TestGameManagers
    // }
    // static getGame() {
    //     return this._game as TestGame
    // }
    /**
     * ==== test end ====
     */
    /**
     * cocos 时,打开下面的注释 
     * ==== cocos start ====
     */
    static getManagers() {
        if (this._managers == null) {
            this._managers = new CocosGameManagers()
        }
        return this._managers as CocosGameManagers
    }
    static getGame() {
        return this._game as CocosGame
    }
    /**
     * ==== cocos end ====
     */
    static async initManagers(game: IGame) {
        this._game = game
        this.getManagers().init(game.node)
    }
    // 门面
    static get gameEntity() {
        return this.getGame().getGameEntity()
    }
    /**  网络通讯管理 */
    static get net() {
        return this.getManagers().getNetManager()
    };
    /**  加密管理 */
    static get crypto() {
        return this.getManagers().getCryptoManager()
    }
    /** gui管理 */
    static get gui() {
        return this.getManagers().getGuiManager()
    }
    /** 游戏音乐音效管理 */
    static get audio() {
        return this.getManagers().getAudioManager()
    }
    /** 事件管理 */
    static get event() {
        return this.getManagers().getEventManager()
    }

    /** 工厂管理 */
    static get factory() {
        return this.getManagers().getFactoryManager()
    }
    /** 配置管理 */
    static get table() {
        return this.getManagers().getTableManager()
    }
    /** 本地存储 */
    static get storage() {
        return this.getManagers().getStorageManager()
    }
    /** 游戏时间管理 */
    static get timer() {
        return TimeSystem.getInstance()
    }

}

