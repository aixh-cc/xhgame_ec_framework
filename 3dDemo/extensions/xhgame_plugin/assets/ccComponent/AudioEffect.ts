
import { AudioClip, AudioSource, error, _decorator, resources, assetManager } from 'cc';
import { xhgame } from '../../../../assets/script/xhgame';
const { ccclass, menu } = _decorator;

/** 游戏音效 */
@ccclass('AudioEffect')
export class AudioEffect extends AudioSource {
    private effects: Map<string, AudioClip> = new Map<string, AudioClip>();

    // 
    // playOneShot 是一次性播放操作，播放后的音效无法暂停或停止播放，也无法监听播放结束的事件回调。
    load(url: string, callback?: Function) {
        let data = this.effects.get(url)
        if (data) {
            this.playOneShot(data, this.volume);
            callback && callback();
            return
        }
        resources.load(url, AudioClip, (err: Error | null, data: AudioClip) => {
            if (err) {
                error(err);
            }
            this.effects.set(url, data);
            this.playOneShot(data, this.volume);
            callback && callback();
        });
    }

    playAudio(path: string) {
        // let audio = xhgame.resource.getAudioClip(path)
        // if (audio) {
        //     this.playOneShot(audio, this.volume);
        // }
        let data = this.effects.get(path)
        if (data) {
            this.playOneShot(data, this.volume);
            // callback && callback();
            return
        }
        let bundle_name = 'resources'
        // let res_path = uiid
        if (path.indexOf('bundle_') > -1) {
            let _arr = path.split('://')
            bundle_name = _arr[0]
            path = _arr[1]
        }
        assetManager.loadBundle(bundle_name, (err, bundle) => {
            bundle.load(path, AudioClip, (err, data: AudioClip) => {
                if (err) {
                    console.error('Failed to load AudioClip:', err);
                    return;
                }
                this.effects.set(path, data);
                this.playOneShot(data, this.volume);
            });
        });
    }
    playMusic(path: string) {
        // let audio = xhgame.resource.getAudioClip(path)
        // if (audio) {
        //     this.playOneShot(audio, this.volume);
        // }
        let data = this.effects.get(path)
        if (data) {
            this.playOneShot(data, this.volume);
            // callback && callback();
            return
        }
        let bundle_name = 'resources'
        // let res_path = uiid
        if (path.indexOf('bundle_') > -1) {
            let _arr = path.split('://')
            bundle_name = _arr[0]
            path = _arr[1]
        }
        assetManager.loadBundle(bundle_name, (err, bundle) => {
            bundle.load(path, AudioClip, (err, data: AudioClip) => {
                if (err) {
                    console.error('Failed to load AudioClip:', err);
                    return;
                }
                this.effects.set(path, data);
                // this.playOneShot(data, this.volume);
                this.play();
            });
        });
    }
}
