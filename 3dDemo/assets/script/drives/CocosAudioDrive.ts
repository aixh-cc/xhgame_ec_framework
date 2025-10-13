import { _decorator, Component, director, instantiate, Node, Prefab } from "cc";
import { xhgame } from "db://assets/script/xhgame";
import { DI, IAudioDrive } from "@aixh-cc/xhgame_ec_framework";
import { AudioEffect } from "../../../extensions/xhgame_plugin/assets/ccComponent/AudioEffect";
import { AudioMusic } from "../../../extensions/xhgame_plugin/assets/ccComponent/AudioMusic";

const { ccclass } = _decorator;

@ccclass('CocosAudioDrive')
export class CocosAudioDrive extends Component implements IAudioDrive {

    private effect!: AudioEffect;
    private music!: AudioMusic;

    protected onLoad(): void {
        var node = new Node("AudioManagerNode");
        director.addPersistRootNode(node);
        var effect = new Node("EffectNode");
        effect.parent = node;
        this.effect = effect.addComponent(AudioEffect);
        var music = new Node("MusicNode");
        music.parent = node;
        this.music = effect.addComponent(AudioMusic);
        DI.bindInstance('AudioDrive', this)
    }
    protected start(): void {
        // 
        let music_volume = xhgame.storage.getNumber('music_volume')
        if (music_volume) {
            this.music.volume = music_volume
        }
        let effect_volume = xhgame.storage.getNumber('effect_volume')
        if (effect_volume) {
            this.effect.volume = effect_volume
        }
    }
    getMusicVolume(): number {
        return this.music.volume;
    }
    setMusicVolume(val: number) {
        xhgame.storage.set('music_volume', val)
        this.music.volume = val
    }
    getEffectVolume() {
        return this.effect.volume
    }
    setEffectVolume(val: number) {
        xhgame.storage.set('effect_volume', val)
        this.effect.volume = val
    }
    playEffect(url: string) {
        this.effect.playAudio(url);
    }
    playMusic(url: string, callback?: Function) {
        this.music.loop = true;
        this.music.load(url, callback); // todo 
    }
    stopMusic() {
        this.music.stop();
    }
    resumeAll() {
        if (this.music) {
            this.music.play();
            this.effect.play();
        }
    }
    pauseAll() {
        if (this.music) {
            this.music.pause();
            this.effect.pause();
        }
    }
}