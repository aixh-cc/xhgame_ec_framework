---
outline: deep
---

# xhgame-plugin-framework 实际使用指南

本文档基于assets/script目录中的实际使用案例，详细说明如何在Cocos Creator项目中使用xhgame-plugin-framework框架。

## 1. 框架核心架构

### 1.1 全局访问点

所有框架功能都通过`gameInstance`单例访问，定义在`assets/script/SingletonInstance.ts`中：

```typescript
import { gameInstance } from "./SingletonInstance"

// 访问各种管理器
gameInstance.configManager    // 配置管理
gameInstance.tableManager     // 数据表管理
gameInstance.netManager       // 网络管理
gameInstance.storageManager   // 本地存储
gameInstance.audioManager     // 音频管理
gameInstance.guiManager       // UI管理
gameInstance.factoryManager   // 工厂管理
gameInstance.timerManager     // 时间管理
gameInstance.deviceManager    // 设备管理
```

### 1.2 快捷访问方式

框架提供了更简洁的访问方式：

```typescript
import { xhgame } from "db://xhgame-plugin-framework/core/xhgame"

// 等效于上面的访问
xhgame.table
xhgame.gui
xhgame.factory
xhgame.storage
xhgame.audio
xhgame.net
xhgame.config
xhgame.timer
xhgame.device
```

## 2. 数据表系统使用

### 2.1 定义数据表

以UnitTable为例，在`assets/script/common/tables/UnitTable.ts`中：

```typescript
import { BaseTable } from "db://xhgame-plugin-framework/core/config/TableManager"
import { TableType } from "../ClientEnum"

export class UnitTable<T> extends BaseTable<T> {
    name = TableType.unit
}

export interface IUnitTableItem {
    id: number
    name: string        // 单位名称
    describe: string    // 说明
    unit_type: number   // 单位类型
    skills: number[]    // 技能ids
    model_no: string    // 模型编号
    scale: number       // 单位缩放比例
}
```

### 2.2 注册数据表

在`assets/script/common/MyTableMap.ts`中定义映射：

```typescript
export class MyTableMap implements ITableMap {
    [TableType.skill]: SkillTable<ISkillTableItem>
    [TableType.unit]: UnitTable<IUnitTableItem>
    [TableType.battle]: BattleTable<IBattleTableItem>
    [TableType.store]: BattleTable<IStoreTableItem>
}
```

### 2.3 实际使用

```typescript
// 查询数据
let unitId = 1001
let unitData = xhgame.table.getTable(TableType.unit).queryById(unitId)

// 在组件中使用
let unitTable = gameInstance.tableManager.getTable(TableType.unit)
let allUnits = unitTable.getAll()
```

## 3. 物品工厂系统

### 3.1 创建物品类

以`CocosUiItem`为例，在`assets/script/view/items/CocosUiItem.ts`中：

```typescript
@ccclass('CocosUiItem')
export class CocosUiItem extends Component implements IItem, IUiItem {
    static className = 'CocosUiItem'  // 必须定义类名
    
    // 实现IItem接口
    itemId: number = 0
    itemNo: string = ''
    itemsIndex: number = 0
    
    // 实现IUiItem接口
    onClickCallback: Function = null
    
    // 生命周期方法
    reset(): void {
        // 重置物品状态
        this.itemId = 0
        this.itemsIndex = 0
    }
    
    toScene(): void {
        // 将物品添加到场景
        xhgame.gui.gui_root.addChild(this.node)
    }
    
    toPool(): void {
        // 回收物品到对象池
        xhgame.factory.recycleItem(this, CocosUiItem)
    }
}
```

### 3.2 创建工厂驱动

```typescript
@ccclass('CocosUiItemFactoryDrive')
export class CocosUiItemFactoryDrive extends Component implements IItemFactoryDrive {
    factory: IItemFactory
    
    createItem(itemNo: string) {
        // 创建物品实例
        let node = instantiate(this._prefab)
        return node.getComponent(CocosUiItem)
    }
    
    removeItem(item: CocosUiItem) {
        // 移除物品
        item.node.removeFromParent()
    }
}
```

### 3.3 使用物品工厂

```typescript
// 创建UI物品
let uiItem = xhgame.factory.enums.createUiItem('goods_item')
uiItem.positions = [0, 0, 0]

// 获取视图模型并设置数据
let vm = uiItem.getViewVm<IGoodsItemViewVM>()
vm.goodsNo = 'gold'
vm.num = 100

// 添加到场景
uiItem.toScene()
```

## 4. ECS实体-组件系统

### 4.1 定义实体

在`assets/script/severs/entitys/GameEntity.ts`中：

```typescript
export class GameEntity extends Entity {
    /** 账号模型 */
    model: GameModelComp | null = null
    
    init() {
        this.model = this.attachComponent(GameModelComp)
    }
    
    start() {
        // 实体启动逻辑
    }
}
```

### 4.2 定义组件

```typescript
export class GameModelComp extends BaseModelComp {
    compName: string = 'GameModelComp'
    platform: string = ''
    battleId: number = 0
    
    reset() {
        // 重置组件状态
        this.platform = ''
        this.battleId = 0
    }
}
```

### 4.3 使用实体

```typescript
// 创建实体
let gameEntity = Entity.createEntity<GameEntity>(GameEntity)
gameEntity.init()
gameEntity.start()

// 获取组件
let model = gameEntity.getComponent(GameModelComp)
if (model) {
    model.battleId = 1001
}
```

## 5. UI系统使用

### 5.1 创建视图类

在`assets/script/view/ui/battle/BattleView.ts`中：

```typescript
@ccclass('BattleView')
export class BattleView extends BaseView implements IBattleViewVM {
    /** 魔法进度 */
    @property
    _magicValue: number = 0
    
    @property({ type: CCFloat, visible: true })
    get magicValue() {
        return this._magicValue
    }
    set magicValue(val) {
        this._magicValue = val
        // 更新UI显示
        this.node.getChildByPath('top/ProgressBar').getComponent(ProgressBar).progress = val
    }
}
```

### 5.2 视图模型接口

```typescript
export interface IBattleViewVM {
    magicValue: number
    missionValue: number
    roundValue: number
    canRuQiao: boolean
    remainStep: number
}
```

### 5.3 使用视图
>tips @todo ,待实现
```typescript
// 获取视图并设置数据
let battleView = xhgame.gui.getView('BattleView')
battleView.magicValue = 0.75
battleView.missionValue = 3
```

## 6. 网络系统使用

### 6.1 定义API组件

在`assets/script/severs/apis/ApiPlayerEnterComp.ts`中：

```typescript
export class ApiPlayerEnterComp extends ApiComp {
    async send(data: { battleId: number }) {
        return await this.callApi('player/enter', data)
    }
}
```

### 6.2 使用网络API

```typescript
// 在实体中使用
let apiComp = gameEntity.getComponent(ApiPlayerEnterComp)
let result = await apiComp.send({ battleId: 1001 })
```

## 7. 存储系统使用

```typescript
// 设置存储数据
xhgame.storage.set('player_level', 10)

// 获取存储数据
let level = xhgame.storage.get('player_level', 1)

// 删除存储数据
xhgame.storage.remove('player_level')
```

## 8. 音频系统使用

```typescript
// 播放音效
xhgame.audio.playEffect('click_sound')

// 播放背景音乐
xhgame.audio.playMusic('bg_music', true)

// 停止音乐
xhgame.audio.stopMusic()
```

## 9. 时间管理使用

```typescript
// 延迟执行
xhgame.timer.delay(() => {
    console.log('延迟1秒执行')
}, 1)

// 定时执行
let timerId = xhgame.timer.schedule(() => {
    console.log('每帧执行')
}, 0)

// 取消定时器
xhgame.timer.unschedule(timerId)
```

## 10. 最佳实践总结

### 10.1 文件组织规范
```
assets/script/
├── common/           # 公共配置和数据表
├── severs/           # 服务端逻辑（ECS实体和组件）
├── view/            # 视图相关
│   ├── drive/       # 框架驱动实现
│   ├── items/       # 物品类
│   ├── modelViews/  # 模型视图
│   └── ui/          # UI界面
├── net/             # 网络相关
└── util/            # 工具类
```

### 10.2 命名规范
- **物品类**: `Cocos{Type}Item` (如CocosUiItem, CocosUnitItem)
- **工厂驱动**: `{Type}FactoryDrive` (如CocosUiItemFactoryDrive)
- **视图**: `{Name}View` (如BattleView, GateView)
- **组件**: `{Name}Comp` (如BattleSenceComp, GateStorePanelComp)
- **实体**: `{Name}Entity` (如GameEntity, BattleEntity)

### 10.3 初始化流程

1. **游戏启动**: `CocosGameBuilderDrive.ts`初始化所有管理器
2. **实体创建**: 通过`Entity.createEntity()`创建游戏实体
3. **组件挂载**: 实体通过`attachComponent()`挂载组件
4. **数据初始化**: 通过TableManager加载Excel数据
5. **UI初始化**: 通过FactoryManager创建UI物品

### 10.4 常用模式

#### 单例模式
```typescript
// 通过全局gameInstance访问
let tableManager = gameInstance.tableManager
```

#### 工厂模式
```typescript
// 通过工厂创建物品
let item = xhgame.factory.enums.createUiItem('goods_item')
```

#### 组件模式
```typescript
// 实体-组件系统
let entity = Entity.createEntity<GameEntity>(GameEntity)
entity.attachComponent(GameModelComp)
```

#### 观察者模式
```typescript
// 事件监听
xhgame.event.on('BATTLE_START', this.onBattleStart, this)
```
