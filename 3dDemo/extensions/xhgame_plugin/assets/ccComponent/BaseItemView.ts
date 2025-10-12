import { _decorator } from 'cc';
import { BaseView } from './BaseView';

const { ccclass, property } = _decorator;

@ccclass('BaseItemView')
export abstract class BaseItemView extends BaseView {
    abstract toSceneNodePath: string
}