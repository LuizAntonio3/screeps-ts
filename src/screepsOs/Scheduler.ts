import { Process, ProcessStatus } from "./Process"
import { ScreepsSerializer } from "./Serializer";

export class Scheduler {
    static processTable: Array<Process> = [];
    static executedProcessTable: Array<Process>;
    static skippedProcessTable: Array<Process>;

    constructor() {
        let processTable = ScreepsSerializer.deserializeFromMemory();

        if(processTable)
            Scheduler.rebuildProcessTable(processTable)

        Scheduler.organizeTable();
        Scheduler.executedProcessTable = [];
        Scheduler.skippedProcessTable = [];
    }

    static resetArrays() {
        Scheduler.processTable = [];
    }

    static getCompleteProcessTable(): Array<Process> {
        return Scheduler.processTable.concat(Scheduler.executedProcessTable, this.skippedProcessTable)
    }

    static rebuildProcessTable(processArray: Array<Process>){
        Scheduler.processTable = Scheduler.processTable.concat(processArray);
    }

    static addNewProcess(process: Process) {
        Scheduler.processTable.push(process);
    }

    static getProcessByPID(PID: string | null): Process | null {
        if(!PID)
            return null;
        return _.filter(Scheduler.getCompleteProcessTable(), process => {
            let processComparison = process.PID === PID;
            return processComparison;
        })[0];
    }

    static getProcess(maxCPU: number): Process | null {
        while(true) {
            let process = Scheduler.processTable.shift();
            if (!process) {
                return null;
            }

            if (process.meanCpuUse > maxCPU) {
                this.skippedProcessTable.push(process);
                continue
            }

            Scheduler.executedProcessTable.push(process);
            return process;
        }
    }

    static organizeTable() {
        _.sortBy(Scheduler.processTable, (process) => process.currentPriority)
    }

    static increasePriority() {
        // TODO: takes flags from its parent process to check the correct amount of increase
        let amount = 1;
        this.rebuildProcessTable(Scheduler.skippedProcessTable);
        _.forEach(Scheduler.processTable, process => process.increaseCurrentPriority(amount));
    }

    static addBackExecutedProcess() {
        _.remove(Scheduler.executedProcessTable, process => {
            if(process.status == ProcessStatus.RUNNING){
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

    endOfTick() {
        Scheduler.increasePriority();
        Scheduler.addBackExecutedProcess();
        ScreepsSerializer.serializeToMemory(Scheduler.processTable);
        Scheduler.resetArrays();
    }
}
