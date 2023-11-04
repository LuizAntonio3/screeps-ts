import { PriorityLevel, Process } from "screepsOs/Process";
import { Request, RequestType } from "./Request";
import { Scheduler } from "screepsOs/Scheduler";
import { CohortManager } from "./CohortManager";
import { CreepSpawnData, CreepStatus, CreepType } from "prototypes/creep";
import { HarvestEnergy } from "tasks/HarvestEnergy";
import { MineEnergy } from "tasks/MineEnergy";
import { DeliverEnergyToSpawn } from "tasks/DeliverEnergyToSpawn";
import { StructureOwner } from "./Architect";
import { HaulerEnergy } from "tasks/HaulerEnergy";

// Manages the workes
export class ImmunesManager extends Process {

    _class: string = ImmunesManager.name;
    roomName: string;
    requestsToCohort: Array<Request>;
    requestsBeenProcessed: Array<Request>;

    constructor(generatePID: boolean = false, PPID: string = "", priority: number = 0, roomName: string = "") {
        super(PPID, priority, generatePID);
        this.roomName = roomName;
        this.requestsToCohort = []
        this.requestsBeenProcessed = []
    }

    private getRoom(): Room {
        return Game.rooms[this.roomName];
    }

    private getCreeps() {
        let creeps = _.filter(Game.creeps, creep => creep.memory.cohortRoomName == this.roomName && !creep.spawning);
        // console.log("getCreeps: " + JSON.stringify(creeps));
        return creeps
    }

    private getCreepsIdle() {
        let creeps = this.getCreeps();
        // console.log("getCreepsIddle: " + JSON.stringify(creeps));
        return _.filter(creeps, creep => creep.memory.status !== CreepStatus.BUSY);
    }

    private getCreepsProcess(): Array<Process> {
        return _.filter(Scheduler.getCompleteProcessTable(), process => process.PPID == this.PID);
    }

    private makeRequest(request: Request) {
        this.requestsToCohort.push(request);
    }

    getRequest(): Request | null {
        return this.requestsToCohort.shift() || null;
    }

    newRequestBeenProcessed(request: Request) {
        this.requestsBeenProcessed.push(request);
    }

    checkRequestsBeenProcessed() {
        if (this.requestsBeenProcessed.length === 0)
            return

        let requestsStillInProcess: Array<Request> = [];
        _.forEach(this.requestsBeenProcessed, request => {
            if (request.type === RequestType.SPAWN) {
                if (this.getCreeps().map(creep => creep.name).includes((request.data as CreepSpawnData).name)) {
                    return
                }
            }
            requestsStillInProcess.push(request);
        });

        this.requestsBeenProcessed = requestsStillInProcess;
    }

    private assignTasks(cohortManager: CohortManager, creepsIdle: Array<Creep>) {
        debugger

        let creepsTrulyIdle = _.filter(creepsIdle, creep => creep.memory.status === CreepStatus.IDLE);
        let workersFullOfEnergy = _.filter(creepsIdle, creep => creep.memory.status === CreepStatus.ENERGY_FULL);

        if (workersFullOfEnergy.length > 0) {
            // WORKER WITH ENERGY
            // HAULER WITH ENERGY
            for (let creep of workersFullOfEnergy) {
                if (creep.memory.type === CreepType.WORKER) {
                    // ASSIGN BUILD, REPAIR, UPGRADEUPGRADE, ETC. - FOR NOW HARDCODED
                    // harvest for starter
                    // build
                    // upgrade
                    // repair
                    let newProcess = new DeliverEnergyToSpawn(true, this.PID, PriorityLevel.DEFAULT, creep.id); // UPDATE DELIVERY TO EVERYTHING
                }
            }
        }

        if (creepsTrulyIdle.length > 0) {
            for (let creep of creepsTrulyIdle) {
                if (creep.memory.type === CreepType.MINER) {
                    let source = null;

                    if (cohortManager) {
                        let index = cohortManager.sourcesInfo.findIndex(sourceInfo => {
                            return sourceInfo.minerAssigned === false
                        });

                        if (index > -1) {
                            cohortManager.sourcesInfo[index].minerAssigned = true;
                            cohortManager.sourcesInfo[index].spotsAssigned += 1;
                            cohortManager.sourcesInfo[index].workPartsAssigned += creep.body.filter(part => part.type === WORK).length;
                            source = cohortManager.sourcesInfo[index].sourceId;
                        }
                    }

                    if (source) {
                        let newProcess = new MineEnergy(true, this.PID, PriorityLevel.HIGH, creep.id, source);
                    }
                }
                else if (creep.memory.type === CreepType.HAULER) {
                    let haulingTargets = _.filter(cohortManager.storagesInfo, storageInfo => {
                        return storageInfo.structureOwnerType === StructureOwner.SOURCE &&
                        storageInfo.energyStored - storageInfo.inQueueToBeTaken > 0
                    });

                    if (haulingTargets.length > 0) {
                        let haulingTarget = haulingTargets[0];

                        let index = cohortManager.storagesInfo.findIndex(storageInfo => storageInfo.storageId === haulingTarget.storageId);
                        cohortManager.storagesInfo[index].inQueueToBeTaken += creep.store.getFreeCapacity();

                        let newProcess = new HaulerEnergy(true, this.PID, PriorityLevel.DEFAULT, creep.id, haulingTargets[0].structureOwnerId as Id<Source>);
                    }
                }
                else if (creep.memory.type === CreepType.WORKER) {
                    let source = null;

                    if (cohortManager) {
                        let index = cohortManager.sourcesInfo.findIndex(sourceInfo => {
                            return sourceInfo.availableSpots - sourceInfo.spotsAssigned > 0
                        });

                        if (index > -1) {
                            cohortManager.sourcesInfo[index].spotsAssigned += 1;
                            cohortManager.sourcesInfo[index].workPartsAssigned += creep.body.filter(part => part.type === WORK).length;
                            source = cohortManager.sourcesInfo[index].sourceId;
                        }
                    }

                    if (source) {
                        let newProcess = new HarvestEnergy(true, this.PID, PriorityLevel.DEFAULT, creep.id, source);
                    }
                }
            }
        }
    }


    private generateCreepInfo(type: CreepType, kargs = {}) {
        let name = `Immune_${CreepType[type].toLowerCase()}_${Game.time}`;
        let room = this.getRoom();

        let memory: CreepMemory = {
            cohortPID: this.PPID,
            cohortRoomName: this.roomName,
            lastTask: "",
            status: CreepStatus.IDLE,
            type: type
        }

        let body = Array<BodyPartConstant>();

        // TODO: check if it is for remote
        if (type === CreepType.WORKER) {
            let firstWorker = kargs.hasOwnProperty("firstWorker") ? true : false;
            body = room.generateWorkerBody(firstWorker);
        }
        else if (type === CreepType.MINER) {
            let withCarry = false; // check if link exists
            body = room.generateMinerBody(withCarry);
        }
        else if (type === CreepType.HAULER) {
            body = room.generateHaulerBody();
        }
        else {
            body = [CARRY, WORK, MOVE];
        }

        return { body, name, memory }
    }

    private getMinersProcess(cohortManager: CohortManager): Array<MineEnergy> {
        let totalWorkParts = 0;
        let result = _.filter(this.getCreepsProcess(), creepProcess => {
            let creepProcessAsAny = creepProcess as any;
            let creep = Game.getObjectById(creepProcessAsAny.creepId) as Creep;

            let workParts = 0;
            _.forEach(creep.body, bodyPart => {
                if (bodyPart.type === WORK)
                    workParts++;
            });

            totalWorkParts += workParts;

            if (cohortManager) {
                let index = _.findIndex(cohortManager.sourcesInfo, source => source.sourceId === creepProcessAsAny.sourceId);
                if (index != -1)
                    cohortManager.sourcesInfo[index].workPartsAssigned = workParts;
            }

            return creepProcessAsAny._class === MineEnergy.name;
        });

        return result as Array<MineEnergy>
    }

    private spawnImmunes(cohortManager: CohortManager) {

        // CREEPS LIST
        let creeps = this.getCreeps();
        let workers = _.filter(creeps, creep => creep.memory.type === CreepType.WORKER); // GENERIC WORKS - CAN DO ALL THE JOBS - BUT NOT ASSIGNED PERMANENTLY
        let miners = _.filter(creeps, creep => creep.memory.type === CreepType.MINER);
        let haulers = _.filter(creeps, creep => creep.memory.type === CreepType.HAULER);

        let requestData = null;

        // let freeSpotsInAllSources = 0;
        // _.forEach(cohortManager.sourcesInfo, sourceInfo => {
        //     freeSpotsInAllSources += sourceInfo.availableSpots;
        // });

        // TODO: check metrics - work capacity - cpu usage - use prioritys
        if (creeps.length < 1) {
            requestData = this.generateCreepInfo(CreepType.WORKER, { firstWorker: true });
        }
        else if (miners.length < cohortManager.sourcesInfo.length) {
            requestData = this.generateCreepInfo(CreepType.MINER);
        }
        else if (haulers.length < cohortManager.sourcesInfo.length) {
            requestData = this.generateCreepInfo(CreepType.HAULER);
        }
        else if (workers.length < 10) {
            requestData = this.generateCreepInfo(CreepType.WORKER);
        }

        if (!requestData)
            return

        let request = new Request(this._class, this.PID, RequestType.SPAWN, requestData);
        this.makeRequest(request);
    }

    run() {
        let cohortManager = Scheduler.getProcessByPID(this.PPID) as CohortManager | null;
        let creepsIdle = this.getCreepsIdle(); // -> can be assigned a new job

        if (!cohortManager)
            return;

        let spawnRequests = _.filter(this.requestsBeenProcessed, request => request.type === RequestType.SPAWN);

        if (spawnRequests.length == 0)
            this.spawnImmunes(cohortManager);

        if (creepsIdle.length) {
            this.assignTasks(cohortManager, creepsIdle);
        }

        this.checkRequestsBeenProcessed();
    }
}
