import { PriorityLevel, Process } from "screepsOs/Process";
import { Request, RequestType } from "./Request";
import { Scheduler } from "screepsOs/Scheduler";
import { CohortManager } from "./CohortManager";
import { CreepSpawnData, CreepStatus, CreepType } from "prototypes/creep";
import { HarvestEnergy } from "tasks/HarvestEnergy";
import { MineEnergy } from "tasks/mineEnergy";
import { DeliverEnergyToSpawn } from "tasks/DeliverEnergyToSpawn";

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

    newRequestBeenProcessed(request: Request){
        this.requestsBeenProcessed.push(request);
    }

    checkRequestsBeenProcessed() {
        if(this.requestsBeenProcessed.length === 0)
            return

        let requestsStillInProcess: Array<Request> = [];
        _.forEach(this.requestsBeenProcessed, request => {
            if(request.type === RequestType.SPAWN) {
                if (this.getCreeps().map(creep => creep.name).includes((request.data as CreepSpawnData).name)){
                    return
                }
            }
            requestsStillInProcess.push(request);
        });

        this.requestsBeenProcessed = requestsStillInProcess;
    }

    private assignTasks(cohortManager: CohortManager, creepsIdle: Array<Creep>){
        let creepsFullOfEnergy = _.filter(creepsIdle, creep => creep.memory.status === CreepStatus.ENERGY_FULL);
        let creepsEmptyOfEnergy = _.filter(creepsIdle, creep => creep.memory.status === CreepStatus.IDLE);

        if (creepsFullOfEnergy.length > 0) {
            // assign a job to hauler energy to spawn or to build or to upgrade
            // hard coded to harvest
            for(let creep of creepsFullOfEnergy){
                let newProcess = new DeliverEnergyToSpawn(true, this.PID, PriorityLevel.DEFAULT, creep.id);
            }
        }

        if (creepsEmptyOfEnergy) {
            // assign harvest(trully harvest or take energy from static) or take energy from storage
            for(let creep of creepsEmptyOfEnergy){
                let source = cohortManager.sourcesInfo[0].sourceId; // hard coded for test TODO: improve it
                let newProcess = new HarvestEnergy(true, this.PID, PriorityLevel.DEFAULT, creep.id, source);
            }
        }
    }


    private generateCreepInfo(taskType: string) {
        let name = "Immune" + Game.time;
        let memory: CreepMemory = {
            cohortPID: this.PPID,
            cohortRoomName: this.roomName,
            lastTask: "",
            status: CreepStatus.IDLE,
            type: CreepType.MINER
        }
        let body = [];

        // TODO: create body based on task
        if (taskType === MineEnergy.name) {
            // TODO: check if there is container/link near source
            body = [WORK, MOVE]
        }

        body = [CARRY, WORK, MOVE];

        return {body, name, memory}
    }

    private filterMinersProcess(cohortManager: CohortManager): Array<MineEnergy> {
        let totalWorkParts = 0;
        let result = _.filter(this.getCreepsProcess(), creepProcess => {
            let creepProcessAsAny = creepProcess as any;
            let creep = Game.getObjectById(creepProcessAsAny.creepId) as Creep;

            let workParts = 0;
            _.forEach(creep.body, bodyPart => {
                if(bodyPart.type === WORK)
                    workParts++;
            });

            totalWorkParts += workParts;

            if(cohortManager){
                let index = _.findIndex(cohortManager.sourcesInfo, source => source.sourceId === creepProcessAsAny.sourceId);
                if (index != -1)
                    cohortManager.sourcesInfo[index].workPartsAssigned = workParts;
            }

            return creepProcessAsAny._class === MineEnergy.name;
        });

        return result as Array<MineEnergy>
    }

    private spawnImmunes(cohortManager: CohortManager) {

        // spawn static until sources are full
        // spawn remote harvester
        // spawn haulers in between to make things faster
        // at least 5 builder - at the same time
        // at least 5 upgraders - at the same time - not the best but will work for now - only when there is enough creeps to handle - after remote in at leat 1 room

        // CREEPS LIST
        let creeps  = this.getCreeps();
        let workes  = _.filter(creeps, creep => creep.memory.type === CreepType.WORKER); // GENERIC WORKS - BUILD - REPAIR - ETC - STARTING UNITY
        let miners  = _.filter(creeps, creep => creep.memory.type === CreepType.MINER);
        let haulers = _.filter(creeps, creep => creep.memory.type === CreepType.HAULER);

        let staticMinersProcess = this.filterMinersProcess(cohortManager);

        // let freeSpotsInAllSources = 0;
        // _.forEach(cohortManager.sourcesInfo, sourceInfo => {
        //     freeSpotsInAllSources += sourceInfo.availableSpots;
        // });

        // spawn - real
        if (creeps.length < 1) { // MAYBE: add controller check - storages check
            // in case it is a start and there is no energy
        }

        else if (miners.length < cohortManager.sourcesInfo.length) {
            // spawn miner - assigned to each source
        }


        // spawn - test spawn
        // if (creeps.length < 1) {
        //     let data = this.generateCreepInfo(HarvestEnergy.name);
        //     let spawnRequest = new Request(RequestType.SPAWN, data);
        //     this.makeRequest(spawnRequest);
        // spawn
        if (creeps.length < 1) {
            let data = this.generateCreepInfo(HarvestEnergy.name);
            let spawnRequest = new Request(this._class, this.PID, RequestType.SPAWN, data);
            this.makeRequest(spawnRequest);

        //     return
        // }
        // else if (staticMinersProcess.length < freeSpotsInAllSources && totalWorkParts < 5 * cohortManager.sourcesInfo.length){
        //     let data = this.generateCreepInfo(MineEnergy.name);
        //     let spawnRequest = new Request(RequestType.SPAWN, data);
        //     this.makeRequest(spawnRequest);
            return
        }
        else if (staticMinersProcess.length < freeSpotsInAllSources && totalWorkParts < 5 * cohortManager.sourcesInfo.length){
            let data = this.generateCreepInfo(StaticHarvestEnergy.name);
            let spawnRequest = new Request(this._class, this.PID, RequestType.SPAWN, data);
            this.makeRequest(spawnRequest);

        //     return
        // }
        // else {
        //     // spawn worker
        //     let data = this.generateCreepInfo(HarvestEnergy.name);
        //     let spawnRequest = new Request(RequestType.SPAWN, data);
        //     this.makeRequest(spawnRequest);
            return
        }
        else {
            // spawn worker
            let data = this.generateCreepInfo(HarvestEnergy.name);
            let spawnRequest = new Request(this._class, this.PID, RequestType.SPAWN, data);
            this.makeRequest(spawnRequest);

        //     return
        // }

    }

    run() {
        let cohortManager = Scheduler.getProcessByPID(this.PPID) as CohortManager | null;
        let creepsIdle = this.getCreepsIdle(); // -> can be assigned a new job

        if(!cohortManager)
            return;

        let spawnRequests = _.filter(this.requestsBeenProcessed, request => request.type === RequestType.SPAWN);

        if (spawnRequests.length == 0)
            this.spawnImmunes(cohortManager);

        if (creepsIdle.length){
            this.assignTasks(cohortManager, creepsIdle);

        }

        this.checkRequestsBeenProcessed();
    }
}
