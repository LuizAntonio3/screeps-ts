import { StorageInfo, StorageType, StructureOwner } from "empire/Architect";
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
    targetStorage: Id<AnyStructure> | null;

    constructor(generatePID: boolean = false, PPID: string = "", priority: number = 0, creepId: Id<Creep> | null = null, sourceId: Id<Source> | null = null) {
        super(creepId, generatePID, PPID, priority);
        this.sourceTargetId = sourceId;
        this.state = EnergyHaulerStates.RETRIEVE_ENERGY;
        this.targetStorage = null;
    }

    checkTaskStatus(creep: Creep) {
        if (!creep.isAlive())
            this.endTask()

        // handles state change
        if (creep.store.getFreeCapacity() === 0) {
            this.state = EnergyHaulerStates.DELIVER_ENERGY;
            let cohortManager = this.getCohortManager();

            if (!cohortManager)
                return

            // remove energy from in queue To be taken
            let index = cohortManager.storagesInfo.findIndex(containerInfo => containerInfo.structureOwnerId === this.sourceTargetId);
            cohortManager.storagesInfo[index].inQueueToBeTaken -= creep.store.getCapacity() * CARRY_CAPACITY; // may give bug - look up *
        }
        else if (creep.store.getUsedCapacity() === 0) {
            // removes energy from in queue to be delivered
            this.updateTarget(creep, null, true);
            this.endTask();
        }
    }

    endTask() {
        // clean target
    }

    moveToSource(creep: Creep, source: Source|null) {
        if (!creep || !source)
            return

        let cohortManager = this.getCohortManager();

        if (creep.pos.inRangeTo(source, 4)) {
            let storageIndex = cohortManager?.storagesInfo.findIndex(containerInfo => containerInfo.structureOwnerId === this.sourceTargetId);

            if (!storageIndex || storageIndex === -1){
                this.endTask();
                return
            }

            if (cohortManager?.storagesInfo[storageIndex].storageId) {
                let container = Game.getObjectById(cohortManager.storagesInfo[storageIndex].storageId as any) as StructureContainer;

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
        }
        else {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    }

    updateTarget(creep: Creep, storage: StorageInfo | null, update?: boolean) {
        if (storage) {
            let cohortManager = this.getCohortManager();
            if (!cohortManager){
                this.endTask()
                return
            }

            this.targetStorage = storage.storageId;
            let index = cohortManager.storagesInfo.findIndex(containerInfo => containerInfo.storageId === storage.storageId);
            cohortManager.storagesInfo[index].inQueueToBeDelivered += creep.store.getUsedCapacity() * CARRY_CAPACITY; // * because of this .getUsedCapacity
        }
        else if (update && this.targetStorage) {
            let cohortManager = this.getCohortManager();
            if (!cohortManager){
                this.endTask()
                return
            }

            let oldStorage = this.targetStorage;
            this.targetStorage = null;
            let index = cohortManager.storagesInfo.findIndex(containerInfo => containerInfo.storageId === oldStorage);
            cohortManager.storagesInfo[index].inQueueToBeDelivered -= creep.store.getCapacity() * CARRY_CAPACITY; // may give bug - look up *
        }
    }

    findTarget(creep: Creep): StorageInfo | null {
        if (this.targetStorage)
            return null

        if (creep.room.storage) {
            this.targetStorage = creep.room.storage.id;
            return null
        }

        let cohortManager = this.getCohortManager();
        if (!cohortManager){
            this.endTask()
            return null
        }

        // listing storages needing energy in order of priority
        let containersInfo: Array<StorageInfo> = [];
        let spawnsInfo: Array<StorageInfo>  = [];
        let extensionsInfo: Array<StorageInfo>  = [];

        for (const storageInfo of cohortManager.storagesInfo) {
            if (storageInfo.structureOwnerType !== StructureOwner.SPAWN && storageInfo.storageId !== null)
                continue

            let capacityUsed = storageInfo.energyStored + storageInfo.inQueueToBeDelivered;

            if (storageInfo.storageType === StorageType.CONTAINER && capacityUsed < CONTAINER_CAPACITY) {
                containersInfo.push(storageInfo);
                break
            }
            else if (storageInfo.storageType === StorageType.SPAWN && capacityUsed < SPAWN_ENERGY_CAPACITY) {
                spawnsInfo.push(storageInfo);
            }
            else if (storageInfo.storageType === StorageType.EXTENSION && capacityUsed < EXTENSION_ENERGY_CAPACITY[creep.room.controller?.level as number]) {
                spawnsInfo.push(storageInfo);
            }

        }

        if (containersInfo.length > 0) {
            for (const containerInfo of containersInfo){
                let container = Game.getObjectById(containerInfo.storageId as any) as StructureContainer;

                if (container) {
                    return containerInfo;
                }
                else {
                    let index = cohortManager.storagesInfo.findIndex(containerInfo => containerInfo.storageId === containerInfo.storageId);
                    cohortManager.storagesInfo[index].storageId = null;
                }
            }
        }

        // ADD ONLY IF NEEDED: check if there is static hauler to handle spawn delivery - else spawn delivere when needed

        if (spawnsInfo.length > 0) {
            for (const spawnInfo of spawnsInfo){
                let spawn = Game.getObjectById(spawnInfo.storageId as any) as StructureSpawn;

                if (spawn) {
                    return spawnInfo;
                }
                else {
                    let index = cohortManager.storagesInfo.findIndex(containerInfo => containerInfo.storageId === spawnInfo.storageId);
                    cohortManager.storagesInfo[index].storageId = null;
                }
            }
        }

        if (extensionsInfo.length > 0) {
            for (const extensionInfo of extensionsInfo){
                let extension = Game.getObjectById(extensionInfo.storageId as any) as StructureExtension;

                if (extension) {
                    return extensionInfo;
                }
                else {
                    let index = cohortManager.storagesInfo.findIndex(containerInfo => containerInfo.storageId === extensionInfo.storageId);
                    cohortManager.storagesInfo[index].storageId = null;
                }
            }
        }

        return null;
    }

    moveToBase(creep: Creep) {
        if (!this.targetStorage)
            return

        let tranferTarget = Game.getObjectById(this.targetStorage);

        if (!tranferTarget)
            return

        let tranferResult = creep.transfer(tranferTarget, RESOURCE_ENERGY); // TODO: improve to transfer every type of resource - use prototypes

        if (tranferResult === ERR_NOT_IN_RANGE) {
            creep.moveTo(tranferTarget);
        }
        else if (tranferResult === ERR_FULL || tranferResult === ERR_INVALID_TARGET) {
            // update target info
            this.updateTarget(creep, null, true);
        }
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
                let target = this.findTarget(creep);
                this.updateTarget(creep, target);
                this.moveToBase(creep);
                break
        }

        this.checkTaskStatus(creep);
    }
}
