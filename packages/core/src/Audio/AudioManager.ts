import { IAudioDrive } from "./AudioDrive"

export class AudioManager<T extends IAudioDrive> {
    private _drive: T
    constructor(drive: T) {
        this._drive = drive
    }
    getDrive() {
        return this._drive
    }
}