export class Process {
    private _PID: string;
    private _PPID: string;
    private _priority: number;


    constructor(PID: string, PPID: string, priority: number) {
        this._PID = PID;
        this._PPID = PPID;
        this._priority = priority;
    }

    run() {
        // to get overwriten
    }

    get PID(): string {
        return this._PID;
    }

    set PID(PID: string) {
        this._PID = PID;
    }

    get PPID(): string {
        return this._PPID;
    }

    set PIID(PIID: string) {
        this._PPID = PIID;
    }

    get priority() {
        return this._priority;
    }

    set priority(priority: number) {
        this._priority = priority;
    }
}
