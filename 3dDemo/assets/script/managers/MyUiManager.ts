import { DI, INode, IUiDrive, UiManager } from "@aixh-cc/xhgame_ec_framework"
import { TestUiDrive } from "../../../tests/myTestGame/test/drive/TestUiDrive"

export class MyUiManager extends UiManager<IUiDrive, INode> {

    constructor() {
        DI.bindSingleton<TestUiDrive>('IUiDrive', TestUiDrive)
        super(DI.make('IUiDrive'))
    }

    get enums() {
        return UIEnums
    }
}

enum UIEnums {
    LoadResource = 'gui/common/loading',
    /**
     * 通用ui
     */
    Unloading = 'bundle_game://gui/common/unloading',
    // common/help
    Help_Chat = 'bundle_game://gui/common/help/help_chat',
    Help_Guide = 'bundle_game://gui/common/help/help_guide',
    Help_Pic = 'bundle_game://gui/common/help/help_pic',
    Setting = 'bundle_game://gui/common/setting',
    See_Video_Get = 'bundle_game://gui/common/see_video_get',
    /**
     * gateui
     */
    /** 入口 */

    Gate_Index = 'bundle_gate://gui/gate/gate_index',
    GateGroupMission = 'bundle_gate://gui/gate/dialog/gate_group_mission',
    GateStorePanel = 'bundle_gate://gui/gate/dialog/gate_store_panel',
    GatePackagePanel = 'bundle_gate://gui/gate/dialog/gate_package_panel',
    GateDYYJPanel = 'bundle_gate://gui/gate/dialog/dy_yjrk',
    Loading = 'bundle_gate://gui/gate/loading',
    /** 
     * 战役ui
     */
    Battle_Index = 'bundle_game://gui/battle/battle_index',
    Battle_Show_Target = 'bundle_game://gui/battle/dialog/showTarget',
    // dialog
    Battle_Intention_Grid = 'bundle_game://gui/battle/dialog/battle_intention_grid',
    /** 失败弹窗 */
    Battle_Over = 'bundle_game://gui/battle/dialog/game_over',
    /** 胜利弹窗 */
    Battle_Win = 'bundle_game://gui/battle/dialog/game_win',
    /** 是否复活弹窗 */
    Battle_Revive = 'bundle_game://gui/battle/dialog/game_revive',
    BattleDialogChooseSkill = 'bundle_game://gui/battle/dialog/choose_skill_dialog',
    BattleWaitSetting = 'bundle_game://gui/battle/dialog/battle_wait_setting',
    /**
     * 其他临时
     */
    Joystick = 'bundle_game://gui/joystick',
}