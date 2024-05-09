import { CohortManager } from "empire/CohortManager";
import { ImmunesManager } from "empire/ImmunesManager";
import { CreepStatus } from "prototypes/creep";
import { Process } from "screepsOs/Process";
import { Scheduler } from "screepsOs/Scheduler";

export class Task extends Process {

    creepId: Id<Creep> | null = null;

    constructor(creepId: Id<Creep> | null = null, generatePID: boolean = false, PPID: string, priority: number) {
        super(PPID, priority, generatePID);
        this.creepId = creepId;

        this.setCreepAsBusy();
    }

    getCohortManager(): CohortManager | null {
        let immunesManager = Scheduler.getProcessByPID(this.PPID) as ImmunesManager | null;

        if (!immunesManager)
            return null

        return Scheduler.getProcessByPID(immunesManager.PPID) as CohortManager | null;
    }

    setCreepAsBusy() {
        if (this.creepId){
            let creep = Game.getObjectById(this.creepId) as Creep; // better to put in task?
            creep.memory.status = CreepStatus.BUSY;
        }
    }

    // functions to be overwritten

    checkTaskStatus(creep: Creep, structure?: Source|Array<Structure>|null) {
        // handles logic to call endTask or state changes
    }

    endTask(creep: Creep) {
        // finish task cleanly
    }

    run() {

    }
}
