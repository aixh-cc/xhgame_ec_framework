import { CCInteger } from 'cc';
import { SpriteAtlas } from 'cc';
import { CCString } from 'cc';
import { Component, Sprite, _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlistSpriteComponent')
export class PlistSpriteComponent extends Component {

    @property({ type: Sprite, visible: true })
    SpriteComponent: Sprite

    @property({ type: SpriteAtlas, visible: true })
    plist: SpriteAtlas

    /** 图形 */
    @property
    _plistCode: string = '';
    @property({ type: CCString, visible: true })
    get plistCode() {
        return this._plistCode
    }
    set plistCode(val) {
        this._plistCode = val
        if (val != '') {
            if (this.plistNames.length == 0) {
                this.getPlistNames()
            }
            this._plistIndex = this.plistNames.indexOf(this._plistCode)
            this.reloadSprite()
        }
    }

    /** 图形 */
    @property
    _plistIndex: number = 0;
    @property({ type: CCInteger, visible: true })
    get plistIndex() {
        return this._plistIndex
    }
    set plistIndex(val) {
        this._plistIndex = val
        if (this.plistNames.length == 0) {
            this.getPlistNames()
        }
        this._plistCode = this.plistNames[val]
        this.reloadSprite()
    }
    plistNames: string[] = []
    protected reloadSprite() {
        if (this._plistIndex > -1) {
            let frames = this.SpriteComponent.spriteAtlas.getSpriteFrames()
            this.SpriteComponent.spriteFrame = frames[this._plistIndex]
            this.SpriteComponent.node.active = true
        }
    }
    protected onLoad(): void {
        this.plistIndex = this.plistIndex // 初始化时需要触发set
    }
    getPlistNames() {
        if (this.plist) {
            this.plistNames = []
            let keys = Object.keys(this.plist.spriteFrames);
            for (let key of keys) {
                this.plistNames.push(key)
            }
        }
    }
}