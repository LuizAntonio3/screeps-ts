import { Process, PriorityLevel } from "screepsOs/Process";
import { Request } from "./Request";
import { ImmunesManager } from "./ImmunesManager";

class CenturysManager{} // war related

interface SourceInfo {
    sourceId: Id<Source>;
    availableSpots: number;
    creepsAmountAssigned: number;
    workPartsAssigned: number;
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
            let sourceInfo: SourceInfo = {
                sourceId: room.findEnergySources(),
                availableSpots: room.findFreeSpotsAroundSource(),
                creepsAmountAssigned: 0,
                workPartsAssigned: 0
            };

            this.sourcesInfo.push(sourceInfo);
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

    // takeRequestsFromImmunes() {
    //     if(!this.immunesManager)
    //         return

    //     let immunesRequests = this.immunesManager.getRequests();
    //     if(immunesRequests)
    //         this.requests.concat(immunesRequests); // check if request key is already in place
    // }

    // resolveImmunesRequest(request: Request) {
    //     this.immunesManager.resolveResquests(request);
    // }

    // takeRequestsFromRemoteImmunes() {
    //     // same as immunes
    // }

    // takeRequestsFromCenturys() {
    //     // same as immunes
    // }

    // processRequests() {
    //     if(this.requests.length == 0)
    //         return;

    //     for(let request of this.requests){
    //         switch (request.type) {
    //             case "spawn":

    //                 break;
    //         }
    //     }

    //     // process requests
    // }

    run() {
        console.log("running");
        // decides when to call the tower manager
        // decides when to call the century manager
        // deals with building logic

        // this.takeRequestsFromImmunes();
        // this.processRequests();
    }
}
