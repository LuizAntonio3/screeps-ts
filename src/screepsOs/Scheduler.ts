import { Process, ProcessStatus } from "./Process"

export class Scheduler {
    static processTable: Array<Process> = []; // problem when seri c alizing this
    executedProcess: Array<Process>;

    constructor(processTable: Array<Process> | null) {
        if(processTable)
            Scheduler.rebuildProcessTable(processTable)
        this.organizeTable();
        this.executedProcess = [];
    }

    static rebuildProcessTable(processArray: Array<Process>){
        Scheduler.processTable = Scheduler.processTable.concat(processArray);
    }

    getProcessByPID(PID: string): Process | null {
        return _.filter(Scheduler.processTable, process => {
            let processComparison = process.PID === PID;
            return processComparison;
        })[0];
    }

    static addNewProcess(process: Process) {
        Scheduler.processTable.push(process);
    }

    static getProcessTable(): Array<Process> {
        return Scheduler.processTable;
    }

    public getProcess(maxCPU: number): Process | null {
        // return a process that is below the maxCPU usage to the kernel to run
        let process = Scheduler.processTable.shift();
        if (!process) {
            return null;
        }

        this.executedProcess.push(process);
        return process;
    }

    organizeTable() {
        _.sortBy(Scheduler.processTable, (process) => process.currentPriority)
    }

    increasePriority() {
        // TODO: takes flags from its parent process to check the correct amount of increase
        let amount = 1;
        _.forEach(Scheduler.processTable, process => process.increaseCurrentPriority(amount));
    }

    public addBackProcess() {
        // TODO: check if process is still alive to add back
        _.remove(this.executedProcess, process => {
            if(process.status == ProcessStatus.running){
                process.resetPriority();
                return false;
            }
            else
                return true;
        });
        // console.log("ProcessTable before add back: " + JSON.stringify(Scheduler.getProcessTable()) + "\n" + JSON.stringify(this.executedProcess));
        if(this.executedProcess.length > 0)
            Scheduler.rebuildProcessTable(this.executedProcess);
        // console.log("ProcessTable after add back: " + JSON.stringify(Scheduler.getProcessTable()) + "\n" + JSON.stringify(this.executedProcess));
    }

    endOfTick() {
        // console.log("process before endOfTick: " + JSON.stringify(this.executedProcess));
        this.increasePriority();
        // console.log("process middle endOfTick: " + JSON.stringify(this.executedProcess));
        this.addBackProcess();
        // console.log("process after endOfTick: " + JSON.stringify(this.executedProcess));
        // console.log("Table after endOfTick: " + JSON.stringify(Scheduler.processTable));
    }
}
