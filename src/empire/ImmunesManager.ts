import { Process } from "screepsOs/Process";
import * as rolesIndex from "roles/index"
import { Request } from "./Request";

// Manages the workes
export class ImmunesManager extends Process {

    creepsAmount = { harvester: 1 };

    room: Room;
    // requestsToCohort: Array<Request>;

    constructor(PPID: string, priority: number, room: Room) { // maybe add room
        super(PPID, priority);
        // this.requestsToCohort = []
        this.room = room;
    }

    // private makeRequest(request: Request) {
    //     this.requestsToCohort.push(request);
    // }

    // getRequests(): Array<Request> | null {
    //     return this.requestsToCohort;
    // }

    // resolveResquests(request: Request){
    //     // receive response from requests that were finished
    // }

    private assignJobs() {
        // Miner - "harvester"/"remote harvester"

        // Engineer - "builder"/"repairer"

        // Transporter - Energy or Mineral - "hauler" - remote "haulers"

        // Fast Tranporter - Spawned to specific location to fast delivery of energy to extensions


        // make workers carry the last type of task that was executed - kind of giving a role to the same creep - keeping from changing tasks - only when prioritized
    }

    private generateBody() {

    }

    private checkNeedToSpawn(): any {
        // check the energy been harvested - the energy harvesting capacity - the energy stored in others sources

        // let availableEnergy = this.room.energyAvailable;
        // let capacityAvailable = this.room.energyCapacityAvailable;

        // let workersTypes = Object.keys(rolesIndex);
        // let workersList = _.forEach(workersTypes, (type) => {
        //     return _.filter(Game.creeps, creep => (creep.memory.role === type && creep.memory.managerRoom === this.room));
        // });

        // task generator
        // Generate tasks based in the current situation - generated in each tick -
        // based on the quantity of free workes - worker is free when it is not caring any energy and it has no process associated to it
        // Workes taks tasks from this queue

        // has the list of all the works - deals with the spawn - if there is none will spawn one new -
        // can use tasks to check energy generation as well as create process based os these tasks

        return { name: "harvester" + Game.time, body: [WORK] } // maybe memory is not needed anymore - because of the process schematic
    }

    spawnTest() {
        let harvesters = _.filter(Game.creeps, creep => creep.memory.role == "harvester");

        if (harvesters && harvesters.length < 1000) {
            let freeSpawn = _.filter(Game.spawns, spawn => spawn.room === this.room && !spawn.spawning);

            if(freeSpawn && freeSpawn.length > 0){
                freeSpawn[0].spawnCreep([WORK, MOVE, CARRY], "harvester" + Game.time, { memory: { sourceId: null, harvesting: true, role: "harvester" } });
            }
        }
    }

    runCreep() {
        _.forEach(Game.creeps, creep => {
            if (creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
                creep.memory.harvesting = false;
                creep.memory.sourceId = null;
            }
            else if (!creep.memory.harvesting && creep.store.getUsedCapacity() == 0) {
                creep.memory.harvesting = true;
            }

            if (creep.memory.harvesting) {
                let energySource = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);

                if(!energySource)
                    return

                if (creep.harvest(energySource) == ERR_NOT_IN_RANGE)
                    creep.moveTo(energySource, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
            else {
                // STORE ENERGY IN STORAGE IF NONE OF THESE ARE AVAILABLE
                var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                    }
                });

                if (target) {
                    if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
                    }
                }
                else {
                    // RUN SECONDARY ROLE - for now there is no secondary role
                }
            }
        });
    }

    run() {
        this.spawnTest();
        this.runCreep();
    }
}
