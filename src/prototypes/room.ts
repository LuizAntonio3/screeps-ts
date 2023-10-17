export {}

declare global {
    interface Room {
        findEnergySources(): Array<Source>;
        findFreeSpotsAroundObject(object: Structure | Source): Array<Array<number>>;
        findFreeSpotsAroundSource(source: Source): number;
    }
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


// Room.prototype.createBody = function createBody(energy, bodyTemplate, maxSize = 50) {
//     let body = [];
//     let consumedEnergy = 0;

//     for (let bodyPart in bodyTemplate) {
//         let amount = Math.round(energy * bodyTemplate[bodyPart] / BODYPART_COST[bodyPart]);
//         let maxAmount = Math.floor(maxSize * bodyTemplate[bodyPart]);

//         if (amount > maxAmount)
//             amount = maxAmount;

//         for (let i = 0; i < amount; i++) {
//             body.push(bodyPart);
//             consumedEnergy += BODYPART_COST[bodyPart];
//         }
//     }

//     // in test changed to remove 1 work part a time
//     while (consumedEnergy > this.energyCapacityAvailable) {
//         let remBodyPart = body.shift();
//         consumedEnergy -= BODYPART_COST[remBodyPart];
//     }

//     // console.log(JSON.stringify(body));
//     return body;
// }

// Room.prototype.createWorkerWody = function createWorkerWody() {
//     let energy = .6 * this.energyCapacityAvailable;
//     const bodyTemplate = { "work": .55, "move": .275, "carry": .275 };

//     let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.room.name == this.name);
//     if (!harvesters.length) {
//         energy = this.energyAvailable;
//         if (energy < 300)
//             energy = 300; // min body
//         return this.createBody(energy, bodyTemplate) // bug in here: when there is no harvester in high rcl it always use this
//     }

//     return this.createBody(energy, bodyTemplate)
// }

// Room.prototype.createMinerBody = function createMinerBody() {
//     let energy = 1 * this.energyCapacityAvailable;
//     const bodyTemplate = { "work": .5, "move": .5 };

//     return this.createBody(energy, bodyTemplate, 10); // verify if this limite is needed
// }

// Room.prototype.createRemoteBody = function createRemoteBody() {
//     let energy = .75 * this.energyCapacityAvailable;
//     const bodyTemplate = { "work": .15, "move": .45, "carry": .4 };

//     return this.createBody(energy, bodyTemplate, 25); // verify if this limite is needed
// }

// Room.prototype.createHaulerBody = function createHaulerBody() {
//     let energy = .75 * this.energyCapacityAvailable;
//     const bodyTemplate = { "move": .5, "carry": .5 };

//     return this.createBody(energy, bodyTemplate, 30); // verify if this limite is needed
// }
