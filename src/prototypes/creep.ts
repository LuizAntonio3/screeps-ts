declare global {
    interface CreepMemory {
        cohortPID: string;
        cohortRoomName: string;
        lastTask: string;
        status: CreepStatus;
    }

    interface Creep {
        isAlive: Function;
    }
}

export enum CreepStatus {
    BUSY,
    ENERGY_FULL,
    IDLE
};

// can improve this to raise reason of death - NATURAL/KILLED
// this way cohorts can take request to create the century manager to investigate the situation
Creep.prototype.isAlive = function () {
    if(this.ticksToLive === 0 || this.hits === 0)
        return false;
    else
        return true;
}
