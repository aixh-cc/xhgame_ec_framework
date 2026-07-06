/**
 * xhgame_ec_framework 使用指南（仅用于承载类型文档，不需要实例化）。
 *
 * ## 推荐初始化顺序
 *
 * 1. 为平台能力实现 `IUiDrive`、`IAudioDrive`、`IAssetDrive`、`ISocket` 等驱动。
 * 2. 创建各 Manager，并由业务自己的 `IManagers` 实现统一持有。
 * 3. 在游戏主循环中调用 `TimeSystem.getInstance().updateByDrive(dt)`。
 * 4. 用 `Entity.createEntity()` 创建实体，用 `attachComponent()` 组合业务组件。
 * 5. 场景退出时移除实体、事件监听和 UI，避免保留上一场景状态。
 *
 * ## 最小 ECS 示例
 *
 * @example
 * ```ts
 * import {
 *   BaseModelComp, Entity, System, TimeSystem
 * } from '@aixh-cc/xhgame_ec_framework'
 *
 * class PlayerSystem extends System {
 *   static async initComp(comp: PlayerModel) {
 *     comp.hp = 100
 *   }
 * }
 *
 * class PlayerModel extends BaseModelComp {
 *   compName = 'player'
 *   hp = 0
 *   initBySystems = [PlayerSystem]
 *   reset() { this.hp = 0 }
 *   onDetach() {}
 *   damage(value: number) {
 *     this.hp -= value
 *     this.setDirtyMark()
 *   }
 * }
 *
 * class PlayerEntity extends Entity {}
 * const player = Entity.createEntity(PlayerEntity)
 * const model = player.attachComponent(PlayerModel)
 * await model.done()
 * TimeSystem.getInstance().updateByDrive(16.67)
 * ```
 *
 * ## 类型安全的事件
 *
 * @example
 * ```ts
 * interface Events {
 *   'player:damage': { playerId: number; value: number }
 *   'scene:ready': void
 * }
 * const events = new EventManager<Events>()
 * events.on('player:damage', (_event, data) => console.log(data.value))
 * events.emit('player:damage', { playerId: 1, value: 10 })
 * ```
 *
 * ## 常用入口
 *
 * - ECS：`Entity`、`Comp`、`BaseModelComp`、`System`
 * - UI：`UiManager`、`IUiDrive`、`SimpleBaseView`、`ViewUtil`
 * - 基础设施：`EventManager`、`TimeSystem`、`StorageManager`、`DI`
 * - 平台适配：`IAssetDrive`、`IAudioDrive`、`IHttp`、`ISocket`
 * - 数据与对象池：`TableManager`、`FactoryManager`
 * - 红点：`RedDotManager`、`IRedDotDrive`
 *
 * 该接口没有运行时行为；查看具体类型的 JSDoc 可获得参数、返回值和生命周期说明。
 */
export interface XhgameFrameworkGuide {}
