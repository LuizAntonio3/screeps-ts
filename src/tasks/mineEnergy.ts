import { CreepStatus } from "prototypes/creep";
import { Task } from "./Task";
import { CohortManager } from "empire/CohortManager";
import { Scheduler } from "screepsOs/Scheduler";
import { ImmunesManager } from "empire/ImmunesManager";
import { StructureOwner } from "empire/Architect";

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
        let storageIndex = cohortManager.containersInfo.findIndex(containerInfo => containerInfo.structureOwnerId === this.sourceId);

        if (storageIndex) {
            let energyStored = 0;

            if (cohortManager.containersInfo[storageIndex].storageId) {
                let container = Game.getObjectById(cohortManager.containersInfo[storageIndex].storageId as any) as StructureContainer;

                if (container) {
                    energyStored += container.store.getUsedCapacity(RESOURCE_ENERGY);
                }
                else {
                    cohortManager.containersInfo[storageIndex].storageId = null;
                }
            }

            energyStored += creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1).filter(resource => resource.resourceType === RESOURCE_ENERGY)[0].amount;
            cohortManager.containersInfo[storageIndex].energyStored = energyStored;
        }
        else {
            // create virtual storage - real one is assigned by architect
            cohortManager.containersInfo.push({
                storageId: null,
                structureOwnerType: StructureOwner.SOURCE,
                structureOwnerId: this.sourceId,
                energyStored: 0,
                inQueueToBeTaken: 0
            });
        }
    }

    checkTaskStatus(creep: Creep, source: Source|null) {
        let creepAlive = creep.isAlive();

        if (!source || !creepAlive) {
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

            if (creepAlive)
                creep.memory.lastTask = this._class;
            else
                delete Memory.creeps[creep.name];

            this.killProcess();
        }
    }

    endTask() {

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
