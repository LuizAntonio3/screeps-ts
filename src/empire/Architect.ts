// has the building logic

export enum StructureOwner {
    SOURCE,
    CONTROLLER,
    SPAWN
}

export interface StorageInfo {
    storageId: Id<StructureContainer> | null,
    structureOwnerType: StructureOwner | null,
    structureOwnerId: Id<Source> | Id<StructureController> | Id<StructureSpawn> | null,
    energyStored: number,
    inQueueToBeTaken: number
}

export interface SourceInfo {
    sourceId: Id<Source>;
    availableSpots: number;
    spotsAssigned: number;
    workPartsAssigned: number;
    minerAssigned: boolean;
}

export interface StrutureInfo {
    structureId: Id<AnyStructure>,
    structureType: string,
    energyBeenDelivered: number
}

export class Architect {

}
