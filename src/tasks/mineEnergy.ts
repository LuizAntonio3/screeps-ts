import { CreepStatus } from "prototypes/creep";
import { Task } from "./Task";
import { CohortManager } from "empire/CohortManager";
import { Scheduler } from "screepsOs/Scheduler";
import { ImmunesManager } from "empire/ImmunesManager";
import { StorageType, StructureOwner } from "empire/Architect";

export class MineEnergy extends Task {

    // task type
    _class: string = MineEnergy.name;
    sourceId: Id<Source> | null;

    constructor(generatePID: boolean = false, PPID: string = "", priority: number = 0, creepId: Id<Creep> | null = null, sourceId: Id<Source> | null = null) {
        super(creepId, generatePID, PPID, priority);
        this.creepId = creepId;
        this.sourceId = sourceId;
    }

    mineEnergy(creep: Creep, source: Source|null) {

        if(!creep || !source)
            return;

        // move to container if exists
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
            return
        }

        let cohortManager = this.getCohortManager() as CohortManager;
        let storageIndex = cohortManager.storagesInfo.findIndex(containerInfo => containerInfo.structureOwnerId === this.sourceId);

        if (storageIndex) {
            let energyStored = 0;

            if (cohortManager.storagesInfo[storageIndex].storageId) {
                let container = Game.getObjectById(cohortManager.storagesInfo[storageIndex].storageId as any) as StructureContainer;

                if (container) {
                    energyStored += container.store.getUsedCapacity(RESOURCE_ENERGY);
                }
                else {
                    cohortManager.storagesInfo[storageIndex].storageId = null;
                }
            }

            energyStored += creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1).filter(resource => resource.resourceType === RESOURCE_ENERGY)[0].amount;
            cohortManager.storagesInfo[storageIndex].energyStored = energyStored;
        }
        else {
            // create virtual storage - real one is assigned by architect
            cohortManager.storagesInfo.push({
                storageType: StorageType.VIRTUAL_CONTAINER,
                storageId: null,
                structureOwnerType: StructureOwner.SOURCE,
                structureOwnerId: this.sourceId,
                energyStored: 0,
                inQueueToBeTaken: 0,
                inQueueToBeDelivered: 0
            });
        }
    }

    checkTaskStatus(creep: Creep, source: Source|null) {
        if (!source || !creep.isAlive()) {
            this.endTask(creep);
        }
    }

    endTask(creep: Creep) {
        creep.memory.status = CreepStatus.IDLE;
        let cohortManager = this.getCohortManager();

        if(cohortManager) {
            for (let i = 0; i < cohortManager.sourcesInfo.length; i++) {
                if (cohortManager.sourcesInfo[i].sourceId === this.sourceId) {
                    cohortManager.sourcesInfo[i].minerAssigned = false;
                    cohortManager.sourcesInfo[i].spotsAssigned -= 1;
                    cohortManager.sourcesInfo[i].workPartsAssigned -= creep.body.filter(part => part.type === WORK).length;
                    break;
                }
            }
        }

        if (creep.isAlive())
            creep.memory.lastTask = this._class;
        else
            delete Memory.creeps[creep.name];

        this.killProcess();
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

        this.mineEnergy(creep, source);
        this.checkTaskStatus(creep, source);
    }
}
