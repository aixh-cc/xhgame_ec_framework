
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
    /** 是否为循环定时器 */
    isLoop: boolean
}
/**
 * 时间系统（调度器）
 * - 控制游戏时间播放/暂停/重置
 * - 支持一次性与循环定时，驱动系统 `update(dt)`
 * 使用示例：`tests/core/Time/TimeSystem.test.ts`
 */
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
    /** 开始时间流动（需 `timeReset` 后再开始） */
    timePlay(): void {
        if (this._pass_time > 0) {
            return console.error('请重置(timeReset)后,再开始')
        }
        this._time_need_update = true
        this._pass_time = 0
    }
    /** 暂停时间流动 */
    timeStop(): void {
        this._time_need_update = false
    }
    /** 继续时间流动 */
    timeContinuePlay(): void {
        if (this._time_need_update == false) {
            this._time_need_update = true
        }
    }
    /** 重置时间与状态 */
    timeReset() {
        this._pass_time = 0
        this._time_need_update = false
    }

    /** 注册参与时间更新的系统 */
    addSystemToTimeUpdate(system: IUpdate) {
        this._needTimeUpdateSystems.push(system)
        return this
    }

    /** 移除参与时间更新的系统 */
    removeSystemFromTimeUpdate(system: IUpdate) {
        const index = this._needTimeUpdateSystems.indexOf(system)
        if (index > -1) {
            this._needTimeUpdateSystems.splice(index, 1)
        }
        return this
    }

    /** 等待（基于时间系统的 Promise），单位毫秒 */
    waitTimeSystemXms(ms: number = 0): Promise<void> {
        return new Promise<void>((resolve) => {
            let uuid = `wt_${this._scheduleCount++}`;
            let lastTime = this._pass_time + ms
            let timer: ITimer = { uuid: uuid, callback: resolve, lastTime: lastTime, duration: ms, isLoop: false }
            this._delayTimers.push(timer)
            this._delayTimers.sort((a, b) => a.lastTime - b.lastTime);
        })
    }
    /** 循环调度(毫秒) */
    schedule(callback: Function, interval: number) {
        let uuid = `schedule_${this._scheduleCount++}`
        let lastTime = this._pass_time + interval
        let timer: ITimer = { uuid: uuid, callback: callback, lastTime: lastTime, duration: interval, isLoop: true }
        this._loopTimers.push(timer)
        return uuid;
    }
    /** 一次性调度(毫秒) */
    scheduleOnce(callback: Function, delay: number = 0) {
        let uuid = `scheduleOnce_${this._scheduleCount++}`;
        let lastTime = this._pass_time + delay
        let timer: ITimer = { uuid: uuid, callback: callback, lastTime: lastTime, duration: delay, isLoop: false }
        this._delayTimers.push(timer)
        this._delayTimers.sort((a, b) => a.lastTime - b.lastTime);
        return uuid;
    }
    /** 取消调度（一次性或循环） */
    unschedule(uuid: string) {
        // 尝试从一次性定时器列表中查找
        let index = this._delayTimers.findIndex(t => t.uuid === uuid);
        if (index !== -1) {
            this._delayTimers.splice(index, 1);
            return;
        }
        // 尝试从循环定时器列表中查找
        index = this._loopTimers.findIndex(t => t.uuid === uuid);
        if (index !== -1) {
            this._loopTimers.splice(index, 1);
        }
    }
    /** 取消全部调度 */
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
        // 使用 while 循环防止栈溢出，同时隔离回调异常
        while (this._delayTimers.length > 0 && this._delayTimers[0].lastTime <= this._pass_time) {
            const timer = this._delayTimers.shift()!;
            try {
                timer.callback && timer.callback();
            } catch (e) {
                console.error('[TimeSystem] scheduleOnce 回调异常:', e);
            }
        }
    }
    private _emitSchedule() {
        // 以快照方式迭代，避免回调中修改 _loopTimers 导致跳过或重复触发
        const snapshot = [...this._loopTimers];
        for (let i = 0; i < snapshot.length; i++) {
            const _loop = snapshot[i];
            // 验证 timer 仍在数组中（未被 unschedule 移除）
            if (!this._loopTimers.includes(_loop)) continue;
            if (_loop.lastTime <= this._pass_time) {
                try {
                    _loop.callback && _loop.callback();
                } catch (e) {
                    console.error('[TimeSystem] schedule 回调异常:', e);
                }
                _loop.lastTime = this._pass_time + _loop.duration;
            }
        }
    }
    /** 由外部驱动时间更新（例如游戏主循环） */
    public updateByDrive(dt: number) {
        if (this._time_need_update == true) {
            this._pass_time += dt
            this._updateSystem(dt)
            this._emitScheduleOnce();
            this._emitSchedule();
        }
    }
}
