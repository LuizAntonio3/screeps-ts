import { Process } from "./Process"
import * as rolesIndex from "roles/index"

export class Scheduler {
    processTable: Array<Process> = [];

    constructor() {
        // first restore process from creeps
        for (let name in Game.creeps) {
            let creep = Game.creeps[name];
            let creepRole = creep.memory.role;

            if (creepRole in rolesIndex) {
                let creepProcess = new (rolesIndex as any)[creepRole](creep); // add to memory the has run in the last tick flag
                this.addNewProcess(creepProcess);
            }
            else {
                console.log("invalid role: " + creepRole);
            }
        }

        // TODO: restore the rest of the process from memory
    }

    public addNewProcess(process: Process) {
        this.processTable.push(process);
    }

    public getProcess(maxCPU: number): Process | null {
        // return a process that is below the maxCPU usage to the kernel to run
        let process = this.processTable.pop();
        if (!process) {
            return null;
        }

        return process;
    }

    public organizeTable() {
        // organize table according to process priority
    }

    public checkPriority() {
        // TODO: iterate over the process table and give bigger priority to the process that did not run in this tick
    }
}
