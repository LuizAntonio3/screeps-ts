declare global {
    interface CreepMemory {
        cohortPID: string;
        cohortRoomName: string;
        type: CreepType;
        lastTask: string;
        status: CreepStatus;
    }

    interface Creep {
        isAlive(): boolean;
    }
}

export interface CreepSpawnData {
    name: string;
    body: Array<BodyPartConstant>;
    memory: CreepMemory;
};

export enum CreepStatus {
    BUSY,
    ENERGY_FULL,
    IDLE
};

export enum CreepType {
    WORKER,
    MINER,
    HAULER
};

// can improve this to raise reason of death - NATURAL/KILLED
// this way cohorts can take request to create the century manager to investigate the situation
Creep.prototype.isAlive = function () {
    if(this.ticksToLive === 0 || this.hits === 0)
        return false;
    else
        return true;
}
