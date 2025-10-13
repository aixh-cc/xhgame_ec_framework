import { Node, tween, UITransform, v3, Vec3 } from "cc";
import { xhgame } from "db://assets/script/xhgame";

export class NodeUtil {
    /**
     * 坐标互转
     * @param aParentNode      A节点(A节点的父节点)
     * @param bParentNode      B节点(目标父节点)
     * @param atALocalPos      A节点当前坐标
     * @returns                A在B节点下的相对位置
     */
    static calculateASpaceToBSpacePos(aParentNode: Node, bParentNode: Node, atALocalPos: Vec3): Vec3 {
        var world: Vec3 = aParentNode.getComponent(UITransform)!.convertToWorldSpaceAR(atALocalPos);
        var atBLocalPos: Vec3 = bParentNode.getComponent(UITransform)!.convertToNodeSpaceAR(world);
        return atBLocalPos;
    }
    /**
     * 触控坐标转局域坐标
     * @param touch_x 
     * @param touch_y 
     * @param targetMountNode 
     * @returns 
     */
    static touchPosToLocalPos(touch_x: number, touch_y: number, targetMountNode: Node): number[] {
        let new_position = NodeUtil.calculateASpaceToBSpacePos(xhgame.gui.gui_root, targetMountNode, v3(touch_x, touch_y, 0))
        return [new_position.x - xhgame.game.screen.w / 2, new_position.y - xhgame.game.screen.h / 2, 0]
    }
    /**
    * 二阶贝塞尔曲线运动
    * @param target 目标
    * @param duration 时间
    * @param c1 起始点
    * @param c2 控制点
    * @param to 终点
    * @param callback 完成的回调
    * @returns
    */
    public static bezierTo(target: Node, duration: number, c1: Vec3, c2: Vec3, to: Vec3, callback: Function = null) {
        const tempVec3 = v3()
        tween(target).to(duration, { position: to }, {
            onUpdate: (pos, ratio) => {
                NodeUtil.quadraticCurve(ratio, c1, c2, to, tempVec3);
                target.setPosition(tempVec3);
            }
        }).call(() => {
            callback && callback();
        }).start();
    }

    // 二阶贝塞尔曲线运动
    public static quadraticCurve(t: number, p1: Vec3, cp: Vec3, p2: Vec3, out: Vec3) {
        out.x = (1 - t) * (1 - t) * p1.x + 2 * t * (1 - t) * cp.x + t * t * p2.x;
        out.y = (1 - t) * (1 - t) * p1.y + 2 * t * (1 - t) * cp.y + t * t * p2.y;
        out.z = 0; // (1 - t) * (1 - t) * p1.z + 2 * t * (1 - t) * cp.z + t * t * p2.z;
    }
}