import { CreepStatus } from "prototypes/creep";
import { Task } from "./Task";
import { CohortManager } from "empire/CohortManager";
import { Scheduler } from "screepsOs/Scheduler";
import { ImmunesManager } from "empire/ImmunesManager";

export class MineEnergy extends Task {

    // task type
    _class: string = MineEnergy.name;
    creepId: Id<Creep> | null;
    sourceId: Id<Source> | null;

    constructor(generatePID: boolean = false, PPID: string = "", priority: number = 0, creepId: Id<Creep> | null = null, sourceId: Id<Source> | null = null) {
        super(generatePID, PPID, priority);
        this.creepId = creepId;
        this.sourceId = sourceId;

        if (creepId){
            let creep = Game.getObjectById(creepId) as Creep; // better to put in task?
            creep.memory.status = CreepStatus.BUSY;
        }
    }

    getCohortManager(): CohortManager | null {
        let immunesManager = Scheduler.getProcessByPID(this.PPID) as ImmunesManager | null;

        if (!immunesManager)
            return null

        return Scheduler.getProcessByPID(immunesManager.PPID) as CohortManager | null;
    }

    harvestEnergy(creep: Creep, source: Source|null) {

        if(!creep || !source)
            return;

        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
            return
        }

        let energyNearby = 0;
        let container = creep.pos.findInRange(FIND_STRUCTURES, 1).filter(structure => structure.structureType === STRUCTURE_CONTAINER) as Array<StructureContainer>;

        if (container.length === 0){
            energyNearby = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1).filter(resource => resource.resourceType === RESOURCE_ENERGY)[0].amount;
        }
        else {
            energyNearby = container[0].store.getCapacity(RESOURCE_ENERGY);
        }

        let cohortManager = this.getCohortManager() as CohortManager;

        _.forEach(cohortManager.sourcesInfo, sourceInfo => {
            if (sourceInfo.sourceId === this.sourceId) {
                sourceInfo.energyStoredNearby = energyNearby;

            }
        });
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
        if(!this.creepId || !this.sourceId){
            return
        }

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
