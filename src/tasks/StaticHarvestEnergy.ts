import { CreepStatus } from "prototypes/creep";
import { Task } from "./Task";

export class StaticHarvestEnergy extends Task {

    // task type
    _class: string = StaticHarvestEnergy.name;
    creepId: Id<Creep>;
    sourceId: Id<Source>;

    constructor(generatePID: boolean = false, PPID: string, priority: number, creepId: Id<Creep>, sourceId: Id<Source>) {
        super(generatePID, PPID, priority);
        this.creepId = creepId;
        this.sourceId = sourceId;
    }

    harvestEnergy(creep: Creep, source: Source|null) {

        if(!creep || !source)
            return;

        if (creep.harvest(source) == ERR_NOT_IN_RANGE){
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }

    }

    checkTaskStatus(creep: Creep, source: Source|null) {
        if(!this.checkCreepAlive(creep))
            return;

        if (!source) {
            creep.memory.status = CreepStatus.IDLE;
            creep.memory.lastTask = this._class;
            this.killProcess();
        }
    }

    run() {
        let creep = Game.getObjectById(this.creepId);
        let source = Game.getObjectById(this.sourceId);

        if(!creep){
            this.killProcess();
            return;
        }

        this.harvestEnergy(creep, source);
        this.checkTaskStatus(creep, source);
    }
}
