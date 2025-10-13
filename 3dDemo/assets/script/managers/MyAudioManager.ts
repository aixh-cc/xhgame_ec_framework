import { AudioManager, IAudioDrive } from "@aixh-cc/xhgame_ec_framework"

export class MyAudioManager<T extends IAudioDrive> extends AudioManager<T> {
    get enums() {
        return AudioEnums
    }
}

enum AudioEnums {
    Chose = 'bundle_game://audio/shengli',
    ShengLi = 'bundle_game://audio/shengli',
    ShiBai = 'bundle_game://audio/shibai',
    //
    BingDong = 'bundle_game://audio/skill_wuxing_3',
    MyGameBG = 'bundle_game://audio/mygamebg',
    QingBg = 'bundle_game://audio/qingbg',
}