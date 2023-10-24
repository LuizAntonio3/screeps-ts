import { CreepStatus } from "prototypes/creep";
import { Task } from "./Task";

export class HarvestEnergy extends Task {

    // task type
    _class: string = HarvestEnergy.name;
    creepId: Id<Creep> | null;
    sourceId: Id<Source> | null;

    constructor(generatePID: boolean = false, PPID: string = "", priority: number = 0, creepId: Id<Creep> | null = null, sourceId: Id<Source> | null = null) {
        super(generatePID, PPID, priority);
        this.creepId = creepId;
        this.sourceId = sourceId;

        if(creepId){
            let creep = Game.getObjectById(creepId) as Creep; // better to put in task?
            creep.memory.status = CreepStatus.BUSY;
        }
    }

    harvestEnergy(creep: Creep, source: Source|null) {

        if(!source)
            return;

        // TODO: IMPROVE TO CHECK ONLY AFTER MOVING THE VALUE OF RANGE
        // TODO: improve to also check for tombstones
        let energyDropped = _.filter(creep.pos.findInRange(FIND_DROPPED_RESOURCES, 5), (resource) => resource.resourceType == RESOURCE_ENERGY);

        if(energyDropped.length){ // improve this to the closes in the range
            if (creep.pickup(energyDropped[0]) == ERR_NOT_IN_RANGE){{}}
                creep.moveTo(energyDropped[0], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        else if (creep.harvest(source) == ERR_NOT_IN_RANGE){
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    }

    checkTaskStatus(creep: Creep, source: Source|null) {

        if(!this.checkCreepAlive(creep))
            return;

        // may give a bug if source dissapear
        if (!source || creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
            creep.memory.status = CreepStatus.ENERGY_FULL;
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
