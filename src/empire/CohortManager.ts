import { Process, PriorityLevel } from "screepsOs/Process";
import { Request } from "./Request";
import { ImmunesManager } from "./ImmunesManager";

// class RemoteImmunesManager{} // remote works related
class CenturysManager{} // war related

// Basically the RoomManager - Also dealing with Remotes of this Room
export class CohortManager extends Process{
    room: Room;
    immunesManager: ImmunesManager;
    // remoteImmunesManager: RemoteImmunesManager | null;
    centurysManager: CenturysManager | null;
    requestsToEmpire: Array<Request>;
    // requests: Array<Request>;
    // requestsBeenExecuted: Array<Request>;

    constructor(PPID: string, room: Room) {
        super(PPID, PriorityLevel.DEFAULT);
        this.room = room;
        this.immunesManager = new ImmunesManager(this.PID, PriorityLevel.DEFAULT, this.room); // this one will always exist
        // this.remoteImmunesManager = null;
        this.centurysManager = null;
        this.requestsToEmpire = [];
        // this.requests = [];
        // this.requestsBeenExecuted = []
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

    private makeRequest(request: Request) {
        this.requestsToEmpire.push(request);
    }

    getRequests(): Array<Request>|null {
        // should return a single or list of requests?
        return this.requestsToEmpire;
    }

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
