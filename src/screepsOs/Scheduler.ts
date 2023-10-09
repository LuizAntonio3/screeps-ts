import { Process } from "./Process"

export class Scheduler {
    processTable: Array<object> = []

    public addNewProcess(process: Process){
        this.processTable.push(process)
    }

    public getProcess(maxCPU: number){
        // return a process that is below the maxCPU usage to the kernel to run
        return new Process()
    }

    public organizeTable() {
        // organize table according to process priority
    }

    public checkPriority(){
        // TODO: iterate over the process table and give bigger priority to the process that did not run in this tick
    }
}
