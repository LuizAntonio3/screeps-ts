import { Scheduler } from "./Scheduler";

export enum ProcessStatus {
    stopped,
    running
}

export enum PriorityLevel {
    LOW = 1,
    DEFAULT = 5,
    HIGH = 10
}

export class Process {
    static tickPIDNumerator: number = 0;

    private _status: ProcessStatus; // TODO: verify status and generate stopped process - possible in run
    private _PID: string;
    private _PPID: string | null;
    private _priority: number;
    private _currentPriority: number;
    // TODO: ADD mean tick usage for the last 5 ticks so that the kernel can use as estimative

    constructor(PPID: string | null, priority: number, generatePID: boolean) {
        if(generatePID){
            this._PID = Process.generatePID();
            Scheduler.addNewProcess(this);
        }
        else
            this._PID = "";
        this._PPID = PPID;
        this._priority = priority;
        this._currentPriority = priority;
        this._status = ProcessStatus.running;
    }

    run() {
        // to get overwriten
    }

    get status(): ProcessStatus {
        return this._status;
    }

    set status(status: ProcessStatus) {
        this._status = status;
    }

    get PID(): string {
        return this._PID;
    }

    set PID(PID: string) {
        this._PID = PID;
    }

    get PPID(): string | null {
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

    get currentPriority(): number {
        return this._currentPriority;
    }

    increaseCurrentPriority(increment: number) {
        this._currentPriority += increment;
    }

    resetPriority() {
        this._currentPriority = this._priority;
    }

    static generatePID(): string {
        let PID = `${Game.time}-${Process.tickPIDNumerator}`;
        Process.tickPIDNumerator++;
        return PID;
    }

    rebuild(memory: any) {
        let that: any = this;
        Object.keys(memory).forEach(function(key) {
            that[key] = memory[key];
        });
    }
}
