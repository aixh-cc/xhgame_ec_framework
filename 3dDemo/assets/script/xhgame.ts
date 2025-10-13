
import { DI, IGame, IManagers, IUiDrive, TimeSystem } from "@aixh-cc/xhgame_ec_framework";
// import { CocosGameManagers } from "./CocosGameManagers";
// import { CocosGame } from "./CocosGame";
import { CocosUiDrive } from "./drives/CocosUiDrive";
import { TestGameManagers } from "../../tests/myTestGame/test/TestGameManagers";
import { TestGame } from "../../tests/myTestGame/TestGame";
// import { TestGameManagers } from "../../tests/myTestGame/test/TestGameManagers";
// import { TestGame } from "../../tests/myTestGame/TestGame";


// DI.bind<CocosGameManagers>('GameManagers', CocosGameManagers);
// DI.bind<TestGameManagers>('GameManagers', new TestGameManagers());

class xhgame<T> {
    // private static _managers: any = null
    // static get managers() {
    //     return DI.make<IManagers>('CocosGameManagers');

    //     return xhgame.getManagers()
    // }
    // private static _game: IGame = null
    static get game() {
        return this.getGame();
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
        return DI.make<IManagers>('IManagers') as TestGameManagers;
        // if (this._managers == null) {
        //     this._managers = new CocosGameManagers()
        // }
        // return this._managers as CocosGameManagers
    }
    static getGame<T extends IGame>() {
        return DI.make<TestGame>('IGame') as TestGame;
        // return this._game as CocosGame
    }
    /**
     * ==== cocos end ====
     */
    // static async initManagers(game: IGame) {
    //     this._game = game as T
    //     this.getManagers().init(game.node)
    // }
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

export { xhgame }
