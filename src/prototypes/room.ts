export {}

declare global {
    interface Room {
        findEnergySources(): Array<Source>;
        findFreeSpotsAroundObject(object: Structure | Source): Array<Array<number>>;
        findFreeSpotsAroundSource(source: Source): number;
        generateBody(workerBodyTemplate: Array<BodyPartTemplate>): Array<BodyPartConstant>;
        generateWorkerBody(firstWorker: boolean): Array<BodyPartConstant>;
        generateMinerBody(withCarry: boolean): Array<BodyPartConstant>;
        generateHaulerBody(): Array<BodyPartConstant>;
    }
}

interface BodyPartTemplate {
    type: BodyPartConstant,
    min: number,
    max: number,
    ratio: number
}

Room.prototype.findEnergySources = function findEnergySources() {
    let energySources = this.find(FIND_SOURCES);
    return energySources;
}

Room.prototype.findFreeSpotsAroundObject = function findFreeSpotsAroundObject(object: Structure | Source) {
    let inX = object.pos.x - 1;
    let inY = object.pos.y - 1;

    if (inX < 1) inX = 1
    if (inY < 1) inY = 1

    let freeSpots = [];

    for (let i = inX; i < inX + 3 && i <= 48; i++) { // verify this max size
        for (let j = inY; j < inY + 3 && i <= 48; j++) {
            if (this.getTerrain().get(i, j) != TERRAIN_MASK_WALL) {
                freeSpots.push([i, j]);
            }
        }
    }

    return freeSpots;
}

Room.prototype.findFreeSpotsAroundSource = function (source: Source) {
    let freeSpots = this.findFreeSpotsAroundObject(source);
    let numberFreeSpots = freeSpots.length;

    // if (numberFreeSpots > 0) {
    //     let creepsAssignedToSource = _.filter(Game.creeps, (creep) => (creep.pos.roomName == this.name && creep.memory.sourceId == source.id));

    //     if (creepsAssignedToSource.length) numberFreeSpots -= creepsAssignedToSource.length;
    // }

    return numberFreeSpots;
}

Room.prototype.generateBody = function createBody(template: Array<BodyPartTemplate>) {
    let energyCapacityAvailable = this.energyCapacityAvailable;

    let body: Array<BodyPartConstant> = [];

    for (let part of template) {
        let partAmount = Math.floor(energyCapacityAvailable * part.ratio / BODYPART_COST[part.type]);

        if (partAmount > part.max)
            partAmount = part.max;
        else if (partAmount < part.min)
            partAmount = part.min;

        for (let i = 0; i < partAmount; i++) {
            body.push(part.type);
        }
    }

    return body;
}

Room.prototype.generateWorkerBody = function (firstWorker: boolean = false) {
    let workerBodyTemplate: Array<BodyPartTemplate> = [
        {type: WORK, min: 1, max: firstWorker? 1 : 10, ratio: 1/5},
        {type: CARRY, min: 1, max: firstWorker? 1 : 30, ratio: 3/5},
        {type: MOVE, min: 1, max: firstWorker? 1 : 10, ratio: 1/5}
    ];

    return this.generateBody(workerBodyTemplate)
}

Room.prototype.generateMinerBody = function (withCarry: boolean = false) {
    let workerBodyTemplate: Array<BodyPartTemplate> = [
        {type: WORK, min: 1, max: 5, ratio: withCarry? 5/8 : 5/6},
        {type: CARRY, min: 0, max: withCarry? 2 : 0, ratio: withCarry? 2/8 : 0},
        {type: MOVE, min: 1, max: 1, ratio: withCarry? 1/8 : 1/5}
    ];

    return this.generateBody(workerBodyTemplate)
}

Room.prototype.generateHaulerBody = function () {
    let workerBodyTemplate: Array<BodyPartTemplate> = [
        {type: CARRY, min: 1, max: 20, ratio: 2/3},
        {type: MOVE, min: 1, max: 10, ratio: 1/3}
    ];

    return this.generateBody(workerBodyTemplate)
}


// Room.prototype.findMineralSources = function findMineralSources() {
//     let mineralSources = this.find(FIND_MINERALS).map(sourceObj => sourceObj.id);
//     this.memory.mineralSources = mineralSources;
// }

// // Source not assigned to creep
// Room.prototype.findNotAssignedSources = function findNotAssignedSources() {
//     let sources = this.memory.energySources;
//     let usedSources = [];
//     let miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner' && creep.room.name == this.name);

//     if (miners.length) { // todo: test this
//         let usedSources = [] // stores id
//         _.forEach(miners, (miner) => usedSources.push(miner.memory.sourceId));
//     }
//     if (usedSources.length) {
//         let freeSources = sources.filter(function (sourceId) {
//             return !usedSources.includes(sourceId);
//         })
//     }
//     else {
//         let freeSources = sources;
//     }

//     // console.log(JSON.stringify(freeSources));
//     return freeSources
// }

