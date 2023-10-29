import { StructureOwner } from "empire/Architect";
import { Task } from "./Task";

enum EnergyHaulerStates {
    RETRIEVE_ENERGY,
    DELIVER_ENERGY
}

export class HaulerEnergy extends Task {

    // task type
    _class: string = HaulerEnergy.name;
    sourceTargetId: Id<Source> | null;
    state: EnergyHaulerStates;

    constructor(generatePID: boolean = false, PPID: string = "", priority: number = 0, creepId: Id<Creep> | null = null, sourceId: Id<Source> | null = null) {
        super(creepId, generatePID, PPID, priority);
        this.sourceTargetId = sourceId;
        this.state = EnergyHaulerStates.RETRIEVE_ENERGY;
    }

    checkTaskStatus() {

    }

    endTask() {

    }

    moveToSource(creep: Creep, source: Source|null) {
        if (!creep || !source)
            return

        if (creep.store.getFreeCapacity() === 0) {
            this.state = EnergyHaulerStates.DELIVER_ENERGY;
            return
        }
        let cohortManager = this.getCohortManager();

        if (creep.pos.inRangeTo(source, 4)) {
            let storageIndex = cohortManager?.containersInfo.findIndex(containerInfo => containerInfo.structureOwnerId === this.sourceTargetId);

            if (!storageIndex){
                this.endTask();
                return
            }

            if (cohortManager?.containersInfo[storageIndex].storageId) {
                let container = Game.getObjectById(cohortManager.containersInfo[storageIndex].storageId as any) as StructureContainer;

                if (container) {
                    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container);
                    }
                }
            }
            else {
                let energyDropped = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 4);

                if (energyDropped.length > 0) {
                    if (creep.pickup(energyDropped[0]) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(energyDropped[0]);
                    }
                }
            }

            containerInfo.inQueueToBeTaken
            containerInfo.inQueueToBeTaken
            containerInfo.inQueueToBeTaken
        }
        else {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    }

    moveToBase(creep: Creep, source: Source|null) {
        if (creep.room.storage) {
            if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage);
            }
            return
        }

        let cohortManager = this.getCohortManager();
        if (!cohortManager)
            return

        let containersInfo = cohortManager.containersInfo.filter(containerInfo => {
            return containerInfo.structureOwnerType === StructureOwner.SPAWN && containerInfo.storageId !== null
        });

        if (containersInfo.length > 0) {
            let container = Game.getObjectById(containersInfo[0].storageId as any) as StructureContainer;

            if (container) {
                let transferResult = creep.transfer(container, RESOURCE_ENERGY);
                if (transferResult === ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                }
                else if (transferResult === ERR_FULL) {
                    this.endTask(); // to start searching for another place to put this energy
                }
            }
            else {
                let index = cohortManager.containersInfo.findIndex(containerInfo => containerInfo === containersInfo[0]);
                cohortManager.containersInfo[index].storageId = null;
            }

            return
        }

        let spawns = cohortManager.spawnsAndExtensions.filter(structure => structure.structureType === STRUCTURE_SPAWN);
        spawns.map(spawn => {
            let result = Game.getObjectById(spawn.structureId);

            if (result) {
                result = result as StructureSpawn;
                if (result.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    return result;
                }
            }

            return null
        });

        spawns = spawns.filter(spawn => spawn !== null);

        if (spawns.length) {
            // deposit energy in spawn
            return
        }

        // MAYBE use target deposit in memory? - to handle flicking
        // CHECK if there is static hauler to handle spawn delivery - else spawn delivere when needed
        stopped here


        // search container - assigned to spawn
        // search extensions
        // search spawn
        // deliver energy to any of it in this order
        // hauler is not mainly responsible for the deliver of energy to extensions and spawns
    }

    run() {
        if(!this.creepId || !this.sourceTargetId){
            return
        }

        let creep = Game.getObjectById(this.creepId);
        let source = Game.getObjectById(this.sourceTargetId);

        if(!creep){
            this.killProcess();
            return;
        }

        switch (this.state) {
            case EnergyHaulerStates.RETRIEVE_ENERGY:
                this.moveToSource(creep, source);
                break
            case EnergyHaulerStates.DELIVER_ENERGY:
                this.moveToBase(creep, source);
                break
        }

        this.checkTaskStatus();
    }
}
