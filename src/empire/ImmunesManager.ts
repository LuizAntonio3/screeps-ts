import { Process } from "screepsOs/Process";
import { Request, RequestType } from "./Request";
import { Scheduler } from "screepsOs/Scheduler";
import { CohortManager } from "./CohortManager";
import { CreepStatus } from "prototypes/creep";
import { HarvestEnergy } from "tasks/HarvestEnergy";
import { StaticHarvestEnergy } from "tasks/StaticHarvestEnergy";

// Manages the workes
export class ImmunesManager extends Process {

    _class: string = ImmunesManager.name;
    roomName: string;
    requestsToCohort: Array<Request>;

    constructor(generatePID: boolean = false, PPID: string = "", priority: number = 0, roomName: string = "") {
        super(PPID, priority, generatePID);
        this.roomName = roomName;
        this.requestsToCohort = []
    }

    private getRoom(): Room {
        return Game.rooms[this.roomName];
    }

    private getCreeps() {
        return _.filter(Game.creeps, creep => creep.memory.cohortRoomName == this.roomName);
    }

    private getCreepsIdle() {
        let creeps = this.getCreeps();
        return _.filter(Game.creeps, creep => creep.memory.status !== CreepStatus.BUSY);
    }

    private getCreepsProcess(): Array<Process> {
        return _.filter(Scheduler.getCompleteProcessTable(), process => process.PPID == this.PID);
    }

    private generateTaskHarvestEnergy() {

        let cohortProcess = Scheduler.getProcessByPID(this.PPID) as CohortManager | null;
        if(!cohortProcess)
            return;

        let sourcesInfo = cohortProcess.sourcesInfo;
        let creeps = this.getCreeps();
        let tasks = this.getCreepsProcess();

        if (creeps.length <= 1){

            // harvestEnergy/Hauler Energy
            let creepsWithTaskHarvesting = _.filter(tasks, task => {
                let taskAsAny = task as any;
                return taskAsAny._class === HarvestEnergy.name
            });

            if(creepsWithTaskHarvesting.length === 0){
                // spawn creep and assign task Harvest to him
            }
        }
        else{

            let creepsStaticHarvesting = _.filter(tasks, task => {
                let taskAsAny = task as any;
                return taskAsAny._class === StaticHarvestEnergy.name
            });

            let amountOfFreeSpotsAroundAllSources = 0;
            let workPartsInSource = 0;

            _.forEach(sourcesInfo, sourceInfo => {
                let creepsInThisSource = _.filter(creepsHarvesting.concat(creepsStaticHarvesting), creep => {
                 let creepAsAny = creep as any;
                 return creepAsAny.sourceId;
                });
                let workParts = 0;
                _.forEach(creepsInThisSource, creepProcess => {
                 let creepAsAny = creepProcess as any;
                 let creep = Game.getObjectById(creepAsAny.creepId);
                 creep = creep as Creep;

                 let workParts = _.filter(creep, creep => );
                });

                amountOfFreeSpotsAroundAllSources += sourceInfo.availableSpots;
                sourceInfo.creepsAmountAssigned = creepsInThisSource.length;
             });
        }

        if(creeps.length <= 1){
            // generate task harvest energy with creep body and spawn creep
        }
        else if (creepsStaticHarvesting.length < sourcesInfo.length) {
            // generate static harvest task
        }

        // creepsHarvesting + Static has to have the same amount of freeSpots
        // creepsStatic has to has the same amount of sources
    }

    private generateTaskHarvestEnergyRemote(){

    }

    private generateTaskDeliveEnergyToSpawn() {
        // 1. check if spawn needs energy
        // 2. check if there is creeps full of energy
        // 3. if there is assign creep to deliver energy to spawn
        // 4. else check if there is energy in storages - for haulers
        // 5. send creep to take energy from that storage
        // repeat

    }

    private generateTasks(cohortManager: CohortManager) {
        this.generateTaskDeliveEnergyToSpawn();
        this.generateTaskHarvestEnergy();
        this.generateTaskHarvestEnergyRemote();
        this.generateTaskBuild();

        // energy diagram:
        // storage -> spawn
        // sources -> spawn

        // 1. check storages existence and energy in it
        // 2. if there is energy spawn a creep and assign it as a hauler
        // 3. if there is more th



        // Miner - "harvester"/"remote harvester"

        // Engineer - "builder"/"repairer"

        // Transporter - Energy or Mineral - "hauler" - remote "haulers"

        // Fast Tranporter - Spawned to specific location to fast delivery of energy to extensions


        // make workers carry the last type of task that was executed - kind of giving a role to the same creep - keeping from changing tasks - only when prioritized
    }

    private makeRequest(request: Request) {
        this.requestsToCohort.push(request);
    }

    // getRequests(): Array<Request> | null {
    //     return this.requestsToCohort;
    // }

    // resolveResquests(request: Request){
    //     // receive response from requests that were finished
    // }


    private generateCreepInfo(taskType: string) {
        let name = "Immune" + Game.time;
        let memory = {
            cohortPID: this.PPID,
            cohortRoomName: this.roomName,
            lastTask: "",
            status: CreepStatus.IDLE
        }
        let body = [];

        // TODO: create body based on task
        if (taskType === StaticHarvestEnergy.name) {
            // TODO: check if there is container/link near source
            body = [WORK, MOVE]
        }

        body = [CARRY, WORK, MOVE];

        return {body, name, memory}
    }

    // private spawnImmunes(): any {
    //     // check the energy been harvested - the energy harvesting capacity - the energy stored in others sources

    //     // let availableEnergy = this.room.energyAvailable;
    //     // let capacityAvailable = this.room.energyCapacityAvailable;

    //     // let workersTypes = Object.keys(rolesIndex);
    //     // let workersList = _.forEach(workersTypes, (type) => {
    //     //     return _.filter(Game.creeps, creep => (creep.memory.role === type && creep.memory.managerRoom === this.room));
    //     // });

    //     // task generator
    //     // Generate tasks based in the current situation - generated in each tick -
    //     // based on the quantity of free workes - worker is free when it is not caring any energy and it has no process associated to it
    //     // Workes taks tasks from this queue

    //     // has the list of all the works - deals with the spawn - if there is none will spawn one new -
    //     // can use tasks to check energy generation as well as create process based os these tasks

    //     return { name: "harvester" + Game.time, body: [WORK] } // maybe memory is not needed anymore - because of the process schematic
    // }

    run() {
        let cohortManager = Scheduler.getProcessByPID(this.PPID) as CohortManager | null;
        let creeps = this.getCreeps();
        let creepsIdle = this.getCreepsIdle(); // -> can be assigned a new job

        if(!cohortManager)
            return;

        let totalWorkParts = 0;
        let staticMinersProcess = _.filter(this.getCreepsProcess(), creepProcess => {
            let creepProcessAsAny = creepProcess as any;
            let creep = Game.getObjectById(creepProcessAsAny.creepId) as Creep;

            let workParts = 0;
            _.forEach(creep.body, bodyPart => {
                if(bodyPart.type === WORK)
                    workParts++;
            });

            totalWorkParts += workParts;

            if(cohortManager){
                let index = _.findIndex(cohortManager.sourcesInfo, {sourceId: creepProcessAsAny.sourceId});
                cohortManager.sourcesInfo[index].workPartsAssigned = workParts;
            }

            return creepProcessAsAny._class === StaticHarvestEnergy.name;
        });

        let freeSpotsInAllSources = 0;
        _.forEach(cohortManager.sourcesInfo, sourceInfo => {
            freeSpotsInAllSources += sourceInfo.availableSpots;
        });

        // spawn static until sources are full
        // spawn remote harvester
        // spawn haulers in between to make things faster
        // at least 5 builder - at the same time
        // at least 5 upgraders - at the same time - not the best but will work for now - only when there is enough creeps to handle - after remote in at leat 1 room

        let spawnRequests = _.filter(this.requestsToCohort, request => request.type === RequestType.SPAWN);

        // do not check any more spawns until request is completed
        if (spawnRequests.length > 0)
            return;

        // spawn
        if (creeps.length < 1) {
            let data = this.generateCreepInfo(HarvestEnergy.name);
            let spawnRequest = new Request(RequestType.SPAWN, data);
            this.makeRequest(spawnRequest);

            return
        }
        else if (false) {
            // at leat one harvester per source to serve as hauler
        }
        else if (staticMinersProcess.length < freeSpotsInAllSources && totalWorkParts < 5 * cohortManager.sourcesInfo.length){
            let data = this.generateCreepInfo(StaticHarvestEnergy.name);
            let spawnRequest = new Request(RequestType.SPAWN, data);
            this.makeRequest(spawnRequest);

            return
        }

        // this.generateTasks(cohortManager);
        // this.spawnImmunes();
        // this.assignTasks(); // only if creep is already spawned
    }
}
