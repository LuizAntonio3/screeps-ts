import { Process } from "screepsOs/Process";
import * as rolesIndex from "roles/index"

// Manages the workes
export class ImmuneManager extends Process{

    room: Room;

    constructor(PID: string, PPID: string, room: Room) {
        super(PID, PPID, 100);
        this.room = room;
    }

    private assignJobs() {
        // make workers carry the last type of task that was executed - kind of giving a role to the same creep - keeping from changing tasks - only when prioritized
        // check the energy been harvested - the energy harvesting capacity - the energy stored in others sources
    }

    private spawnWorkers() {
        let availableEnergy = this.room.energyAvailable;
        let capacityAvailable = this.room.energyCapacityAvailable;

        let workersTypes = Object.keys(rolesIndex);
        let workersList = _.forEach(workersTypes, (type) => {
            return _.filter(Game.creeps, creep => (creep.memory.role === type && creep.memory.managerRoom === this.room));
        });
    }

    run() {
        // check if needs workes - if needs gets the job needed
    }

    // task generator
    // Generate tasks based in the current situation - generated in each tick -
    // based on the quantity of free workes - worker is free when it is not caring any energy and it has no process associated to it
    // Workes taks tasks from this queue

    // has the list of all the works - deals with the spawn - if there is none will spawn one new -
    // can use tasks to check energy generation as well as create process based os these tasks
}
