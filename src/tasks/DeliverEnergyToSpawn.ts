import { Process } from "screepsOs/Process";
import { Task } from "./Task";
import { CreepStatus } from "prototypes/creep";

export class DeliverEnergyToSpawn extends Task{

    _class: string = DeliverEnergyToSpawn.name;
    creepId: Id<Creep>;

    constructor(generatePID: boolean = false, PPID: string, priority: number, creepId: Id<Creep>) {
        super(generatePID, PPID, priority);
        this.creepId = creepId;
    }

    deliverEnergy(creep: Creep): Array<Structure> {
        var targets = Game.rooms[creep.memory.cohortRoomName].find(FIND_STRUCTURES, {
            filter: (structure) =>
                    (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN)    &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });

        if(targets){
            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(targets[0]);
            }
        }

        return targets
    }

    checkTaskStatus(creep: Creep, targets: Array<Structure>) {
        if(!this.checkCreepAlive(creep))
            return;

        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0 || targets.length === 0){
            creep.memory.status = CreepStatus.IDLE;
            creep.memory.lastTask = this._class;
            this.killProcess();
        }
    }

    run() {
        let creep = Game.getObjectById(this.creepId);

        if(!creep){
            this.killProcess();
            return;
        }

        let targets = this.deliverEnergy(creep);
        this.checkTaskStatus(creep, targets);
    }
}
