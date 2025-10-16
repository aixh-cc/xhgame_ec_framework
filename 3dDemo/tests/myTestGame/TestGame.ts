import { DI, Entity, IGame, Platform } from "@aixh-cc/xhgame_ec_framework";
import { TestGameManagers, TestNode } from "./test/TestGameManagers";
import { GameEntity } from "db://assets/script/GameEntity";
import { IConfigTableItem } from "db://assets/script/managers/myTable/tables/ConfigTable";
import { xhgame } from "db://assets/script/xhgame";
import { LoadResourceViewComp } from "db://assets/script/comps/enter/LoadResourceViewComp";
import { GameEnterComp } from "db://assets/script/comps/enter/GameEnterComp";
// import { Platform } from "db://assets/script/common/ClientEnum";
// import { HelpComp } from "db://assets/script/severs/common/HelpComp";
// import { LoadResourceViewComp } from "db://assets/script/severs/common/LoadResourceViewComp";
// import { SdkComp } from "db://assets/script/severs/common/SdkComp";
// import { GameEntity } from "db://assets/script/severs/entitys/GameEntity";
// import { GateSenceComp } from "db://assets/script/severs/gate/GateSenceComp";
// import { PlayerLoginComp } from "db://assets/script/severs/player/PlayerLoginComp";
// import { xhgame } from "db://assets/script/xhgame";
// import { TestNode } from "./test/TestGameManagers";
// import { IConfigTableItem } from "db://assets/script/managers/myTable/tables/ConfigTable";

export class TestGame implements IGame {
    name = 'TestGame';
    node: TestNode = new TestNode('root')
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

    async start() {
        this.serverNo = 'dev_001'
        this.at_platform = Platform.H5
        const managers = new TestGameManagers()
        DI.bindInstance('IGame', this)
        DI.bindInstance('IManagers', managers)
        managers.init(this.node)
        await this.init()
        console.log('init over')
        await this.play()
        console.log('play over')
        console.log('等待玩家操作')
    }

    async init() {
        return new Promise<void>((resolve, reject) => {
            this.setGameEntity(Entity.createEntity<GameEntity>(GameEntity))
            const comp = xhgame.gameEntity.attachComponent(LoadResourceViewComp)
            setTimeout(() => {
                this.tableInit()
                console.log('模拟加载资源完成')
                comp.loadFinishedCallback()
                // 这个时候xhgame.table.config已经有值里
                this.config = xhgame.table.getTable(xhgame.table.enums.config).getInfo(this.serverNo)
                resolve()
            }, 1000)
        })
    }

    async play(): Promise<void> {
        xhgame.timer.timePlay()
        await xhgame.gameEntity.attachComponent(GameEnterComp).done()
    }

    tableInit() {
        var fs = require('fs');
        var battledata = fs.readFileSync(__dirname + '/config/client/battle.json', 'utf8');
        var unitdata = fs.readFileSync(__dirname + '/config/client/unit.json', 'utf8');
        var skilldata = fs.readFileSync(__dirname + '/config/client/skill.json', 'utf8');
        var storedata = fs.readFileSync(__dirname + '/config/client/store.json', 'utf8');
        var configdata = fs.readFileSync(__dirname + '/config/client/config.json', 'utf8');
        xhgame.table.getTable(xhgame.table.enums.skill).init(JSON.parse(skilldata))
        xhgame.table.getTable(xhgame.table.enums.unit).init(JSON.parse(unitdata))
        xhgame.table.getTable(xhgame.table.enums.battle).init(JSON.parse(battledata))
        xhgame.table.getTable(xhgame.table.enums.store).init(JSON.parse(storedata))
        xhgame.table.getTable(xhgame.table.enums.config).init(JSON.parse(configdata))
    }
}