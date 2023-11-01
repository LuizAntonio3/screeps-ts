// has the building logic

export enum StorageType {
    VIRTUAL_CONTAINER,
    CONTAINER,
    SPAWN,
    EXTENSION
}

export enum StructureOwner {
    SOURCE,
    CONTROLLER,
    SPAWN
}

// everything that can hold energy inside of it
export interface StorageInfo {
    storageType: StorageType,
    storageId: Id<StructureContainer> | null,
    structureOwnerType: StructureOwner | null,
    structureOwnerId: Id<Source> | Id<StructureController> | Id<StructureSpawn> | null,
    energyStored: number,
    inQueueToBeTaken: number,
    inQueueToBeDelivered: number
}

export interface SourceInfo {
    sourceId: Id<Source>;
    availableSpots: number;
    spotsAssigned: number;
    workPartsAssigned: number;
    minerAssigned: boolean;
}

// old
export interface StrutureInfo {
    structureId: Id<AnyStructure>,
    structureType: string,
    inQueueToBeDelivered: number
}

export class Architect {

}
