import { TimeSystem } from "../packages/core/src/Time/TimeSystem"

export class TestUtil {
    private static _instance: TestUtil = new this()
    // 私有,只能内部实例化
    private constructor() {
        this._loopTime()
    }
    static getInstance() {
        return this._instance
    }
    private _time_pass_dt: number = 100
    setTimePassDt(dt: number) {
        TimeSystem.getInstance().timeReset()
        this._time_pass_dt = dt
        return this
    }
    private _loopTime() {
        setTimeout(() => {
            TimeSystem.getInstance().updateByDrive(this._time_pass_dt)
            if (TimeSystem.getInstance().isPlaying()) {
                this._loopTime()
            }
        }, this._time_pass_dt)
    }
}
