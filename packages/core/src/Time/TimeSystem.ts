
interface IUpdate {
    update(dt: number): void
}
interface ITimer {
    /** uuid */
    uuid: string
    /** 回调函数 */
    callback: Function
    /** 结束时间,0表示循环 */
    lastTime: number
    /** 持续时间(秒) */
    duration: number
}
export class TimeSystem {
    private static _instance: TimeSystem = new this()
    private constructor() { } // 私有,只能内部实例化
    static getInstance() {
        return this._instance
    }
    private _scheduleCount: number = 1;
    private _time_need_update: boolean = false
    private _pass_time: number = 0
    private _needTimeUpdateSystems: IUpdate[] = []
    private _delayTimers: ITimer[] = []
    private _loopTimers: ITimer[] = []
    isPlaying() {
        return this._time_need_update
    }
    getPassTime() {
        return this._pass_time
    }
    timePlay(): void {
        if (this._pass_time > 0) {
            return console.error('请重置(timeReset)后,再开始')
        }
        this._time_need_update = true
        this._pass_time = 0
    }
    timeStop(): void {
        this._time_need_update = false
    }
    timeContinuePlay(): void {
        if (this._time_need_update == false) {
            this._time_need_update = true
        }
    }
    timeReset() {
        this._pass_time = 0
        this._time_need_update = false
    }

    addSystemToTimeUpdate(system: IUpdate) {
        this._needTimeUpdateSystems.push(system)
        return this
    }

    waitTimeSystemXms(ms: number = 0): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let uuid = `wt_${this._scheduleCount++}`;
            let lastTime = this._pass_time + ms
            let timer: ITimer = { uuid: uuid, callback: resolve, lastTime: lastTime, duration: ms }
            this._delayTimers.push(timer)
            this._delayTimers.sort((a, b) => a.lastTime - b.lastTime);
        })
    }
    schedule(callback: Function, interval: number) {
        let uuid = `schedule_${this._scheduleCount++}`
        let lastTime = this._pass_time + interval
        let timer = { uuid: uuid, callback: callback, lastTime: lastTime, duration: interval }
        this._loopTimers.push(timer)
        return uuid;
    }
    scheduleOnce(callback: Function, delay: number = 0) {
        let uuid = `scheduleOnce_${this._scheduleCount++}`;
        let lastTime = this._pass_time + delay
        let timer: ITimer = { uuid: uuid, callback: callback, lastTime: lastTime, duration: delay }
        this._delayTimers.push(timer)
        this._delayTimers.sort((a, b) => a.lastTime - b.lastTime);
        return uuid;
    }
    unschedule(uuid: string) {
        if (uuid.indexOf('Once') > -1) {
            const index = this._delayTimers.findIndex(t => t.uuid === uuid);
            if (index !== -1) {
                this._delayTimers.splice(index, 1);
            }
        } else {
            const index = this._loopTimers.findIndex(t => t.uuid === uuid);
            if (index !== -1) {
                this._loopTimers.splice(index, 1);
            }
        }
    }
    unscheduleAll() {
        this._delayTimers = []
        this._loopTimers = []
    }

    private _updateSystem(dt: number) {
        for (let i = 0; i < this._needTimeUpdateSystems.length; i++) {
            this._needTimeUpdateSystems[i].update(dt)
        }
    }
    //
    private _emitScheduleOnce() {
        if (this._delayTimers.length > 0 && this._delayTimers[0].lastTime <= this._pass_time) {
            this._delayTimers[0].callback && this._delayTimers[0].callback()
            this._delayTimers.shift(); // 完成后移除
            this._emitScheduleOnce()
        }
    }
    private _emitSchedule() {
        for (let i = 0; i < this._loopTimers.length; i++) {
            const _loop = this._loopTimers[i];
            if (_loop.lastTime <= this._pass_time) {
                _loop.callback && _loop.callback()
                _loop.lastTime = this._pass_time + _loop.duration
            }
        }
    }
    public updateByDrive(dt: number) {
        if (this._time_need_update == true) {
            this._pass_time += dt
            this._updateSystem(dt)
            this._emitScheduleOnce();
            this._emitSchedule();
        }
    }
}
