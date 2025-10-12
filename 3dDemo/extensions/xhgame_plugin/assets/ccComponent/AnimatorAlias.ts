import { Component, _decorator } from "cc";

const { ccclass, property } = _decorator;

/**
 * 动作别称
 */
@ccclass('AnimatorAlias')
export class AnimatorAlias extends Component {

    @property({ tooltip: "idle" })
    public idleAlias: string = '';

    @property({ tooltip: "run" })
    public runAlias: string = '';

    @property({ tooltip: "attack" })
    public attackAlias: string = '';

    @property({ tooltip: "skill" })
    public skillAlias: string = '';

    @property({ tooltip: "stun" })
    public stunAlias: string = '';

    @property({ tooltip: "die" })
    public dieAlias: string = '';
}