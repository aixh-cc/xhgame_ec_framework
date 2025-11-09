import { AudioManager, DI, IAudioDrive } from "@aixh-cc/xhgame_ec_framework"

export class MyAudioManager<T extends IAudioDrive> extends AudioManager<T> {
    constructor() {
        super(DI.make('IAudioDrive'))
    }
    get enums() {
        return AudioEnums
    }
}

enum AudioEnums {
    QingBg = 'bundle_gate://audio/qingbg',
    MyGameBG = 'bundle_battle://audio/mygamebg',
    // 
    Chose = 'bundle_game://audio/shengli',
    ShengLi = 'bundle_game://audio/shengli',
    ShiBai = 'bundle_game://audio/shibai',
    //
    BingDong = 'bundle_game://audio/skill_wuxing_3',
}