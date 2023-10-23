import { Process, PriorityLevel } from "screepsOs/Process";
import { Request, RequestType } from "./Request";
import { ImmunesManager } from "./ImmunesManager";
import { Scheduler } from "screepsOs/Scheduler";
import { CreepSpawnData } from "prototypes/creep";

class CenturysManager{} // war related

interface SourceInfo {
    sourceId: Id<Source>;
    availableSpots: number;
    creepsAmountAssigned: number;
    workPartsAssigned: number;
    energyNearby: number;
}

// Basically the RoomManager - Also dealing with Remotes of this Room
export class CohortManager extends Process{
    _class: string = CohortManager.name;
    roomName: string;
    immmunesManagerPID: string | null;
    centurysManager: CenturysManager | null;
    requestsToEmpire: Array<Request>;
    sourcesInfo: Array<SourceInfo>;
    extensions: Array<Id<StructureSpawn|StructureExtension>>;
    // requests: Array<Request>;
    // requestsBeenExecuted: Array<Request>;

    constructor(generatePID: boolean = false, PPID: string = "", priority: number = 0, roomName: string = "") {
        super(PPID, priority, generatePID);
        this.roomName = roomName;
        this.immmunesManagerPID = null;
        this.centurysManager = null;
        this.requestsToEmpire = [];
        this.sourcesInfo = [];
        this.extensions = [];
        // this.requests = [];
        // this.requestsBeenExecuted = []

        if (generatePID && !this.immmunesManagerPID){
            let newImmunesManager = new ImmunesManager(true, this.PID, PriorityLevel.DEFAULT, this.roomName); // this one will always exist
            this.immmunesManagerPID = newImmunesManager.PID;
            let room = this.getRoom();

            let sources = room.findEnergySources();

            if (sources.length > 0){
                for (let source of sources){
                    let sourceInfo: SourceInfo = { // bug
                        sourceId: source.id,
                        availableSpots: room.findFreeSpotsAroundSource(source),
                        creepsAmountAssigned: 0,
                        workPartsAssigned: 0,
                        energyNearby: 0
                    };

                    this.sourcesInfo.push(sourceInfo);
                }
            }

            this.updateExtensionsList();
        }
    }

    private updateExtensionsList() {
        // TODO: recheck extensions id and list - called when id is not found or extension is built
    }

    private getRoom(): Room {
        return Game.rooms[this.roomName];
    }

    private makeRequest(request: Request) {
        this.requestsToEmpire.push(request);
    }

    getRequests(): Array<Request>|null {
        // should return a single or list of requests?
        return this.requestsToEmpire;
    }

    takeRequestsFromImmunes() {
        if(!this.immmunesManagerPID)
            return

        let immunesManager = Scheduler.getProcessByPID(this.immmunesManagerPID) as ImmunesManager;
        if(!immunesManager){
            this.immmunesManagerPID = null;
            return
        }

        let request = immunesManager.getRequest();
        if(!request)
            return

        // process request
        if(request.type === RequestType.SPAWN){
            let room = this.getRoom();
            let freeSpawns = _.filter(room.find(FIND_MY_SPAWNS), spawn => spawn.spawning === null);

            if (freeSpawns.length > 0){
                let spawnRequest= request.data as CreepSpawnData;
                let spawnRequestResponse = freeSpawns[0].spawnCreep(spawnRequest.body, spawnRequest.name, {memory: spawnRequest.memory});

                // check different reponses
                if(spawnRequestResponse == OK)
                    immunesManager.newRequestBeenProcessed(request);
            }
        }
    }

    // resolveImmunesRequest(request: Request) {
    //     this.immunesManager.resolveResquests(request);
    // }

    run() {
        // decides when to call the tower manager
        // decides when to call the century manager
        // deals with building logic

        this.takeRequestsFromImmunes();
        // this.processRequests();
    }
}
