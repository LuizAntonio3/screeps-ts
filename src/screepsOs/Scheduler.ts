import { Process, ProcessStatus } from "./Process"

export class Scheduler {
    static processTable: Array<Process> = [];
    static executedProcessTable: Array<Process>;

    constructor(processTable: Array<Process> | null) {
        if(processTable)
            Scheduler.rebuildProcessTable(processTable)
        Scheduler.organizeTable();
        Scheduler.executedProcessTable = [];
    }

    static resetArrays() {
        Scheduler.processTable = [];
    }

    static getCompleteProcessTable(): Array<Process> {
        return Scheduler.processTable.concat(Scheduler.executedProcessTable)
    }

    static rebuildProcessTable(processArray: Array<Process>){
        Scheduler.processTable = Scheduler.processTable.concat(processArray);
    }

    static addNewProcess(process: Process) {
        Scheduler.processTable.push(process);
    }

    static getProcessByPID(PID: string): Process | null {
        return _.filter(Scheduler.processTable, process => {
            let processComparison = process.PID === PID;
            return processComparison;
        })[0];
    }

    static getProcess(maxCPU: number): Process | null {
        // TODO: return a process that is below the maxCPU usage to the kernel to run
        let process = Scheduler.processTable.shift();
        if (!process) {
            return null;
        }

        Scheduler.executedProcessTable.push(process);
        return process;
    }

    static organizeTable() {
        _.sortBy(Scheduler.processTable, (process) => process.currentPriority)
    }

    static increasePriority() {
        // TODO: takes flags from its parent process to check the correct amount of increase
        let amount = 1;
        _.forEach(Scheduler.processTable, process => process.increaseCurrentPriority(amount));
    }

    static addBackProcess() {
        _.remove(Scheduler.executedProcessTable, process => {
            if(process.status == ProcessStatus.running){
                process.resetPriority();
                return false;
            }
            else
                return true;
        });

        if(Scheduler.executedProcessTable.length > 0){
            Scheduler.rebuildProcessTable(Scheduler.executedProcessTable);
            Scheduler.executedProcessTable = [];
        }

    }

    static endOfTick() {
        this.increasePriority();
        this.addBackProcess();
    }
}
