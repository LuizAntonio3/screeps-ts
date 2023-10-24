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
    static ticksToAverage: number = 5;
    static tickPIDNumerator: number = 0;

    status: ProcessStatus;
    PID: string;
    PPID: string;
    priority: number;
    currentPriority: number;
    meanCpuUse: number = 0;
    private lastCpuUsages: Array<number> = [];

    constructor(PPID: string, priority: number, generatePID: boolean) {
        if(generatePID){
            this.PID = Process.generatePID();
            Scheduler.addNewProcess(this);
        }
        else
            this.PID = "";
        this.PPID = PPID;
        this.priority = priority;
        this.currentPriority = priority;
        this.status = ProcessStatus.RUNNING;
    }

    updateMeanCpuUsage(startTickTime: number, endTickTime: number) {
        if(this.status == ProcessStatus.STOPPED)
            return

        let cpuUse = endTickTime - startTickTime;

        if(this.lastCpuUsages.length >= Process.ticksToAverage)
            this.lastCpuUsages.shift();

        this.lastCpuUsages.push(cpuUse);
        this.meanCpuUse = this.lastCpuUsages.reduce((a, b) => a+b, 0) / this.lastCpuUsages.length;
    }

    run() {
        // to get overwriten
    }

    killProcess() {
        this.status = ProcessStatus.STOPPED;
        // kill all child process
    }

    increaseCurrentPriority(increment: number) {
        this.currentPriority += increment;
    }

    resetPriority() {
        this.currentPriority = this.priority;
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
