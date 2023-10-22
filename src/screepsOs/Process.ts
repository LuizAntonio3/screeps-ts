import { Scheduler } from "./Scheduler";

export enum ProcessStatus {
    STOPPED,
    RUNNING
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
    private _PPID: string;
    private _priority: number;
    private _currentPriority: number;
    // TODO: ADD mean tick usage for the last 5 ticks so that the kernel can use as estimative

    constructor(PPID: string, priority: number, generatePID: boolean) {
        if(generatePID){
            this._PID = Process.generatePID();
            Scheduler.addNewProcess(this);
        }
        else
            this._PID = "";
        this._PPID = PPID;
        this._priority = priority;
        this._currentPriority = priority;
        this._status = ProcessStatus.RUNNING;
    }

    run() {
        // to get overwriten
    }

    get status(): ProcessStatus {
        return this._status;
    }

    killProcess() {
        this._status = ProcessStatus.STOPPED
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

    set PPID(PIID: string) {
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

    set currentPriority(priority) {
        this._priority = priority;
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
