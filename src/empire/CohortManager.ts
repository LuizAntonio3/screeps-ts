import { Process, PriorityLevel } from "screepsOs/Process";
import { Request, RequestType } from "./Request";
import { ImmunesManager } from "./ImmunesManager";
import { Scheduler } from "screepsOs/Scheduler";
import { CreepSpawnData } from "prototypes/creep";
import { CenturysManager } from "./CenturysManager";
import { SourceInfo, StrutureInfo, StorageInfo, StructureOwner, StorageType } from "./Architect";

// Basically the RoomManager - Also dealing with Remotes of this Room
export class CohortManager extends Process {
    _class: string = CohortManager.name;
    roomName: string;
    immmunesManagerPID: string | null;
    centurysManagerPID: string | null;
    requestsToEmpire: Array<Request>;
    requestsBeenProcessed: Array<Request>;

    // cohort structures
    sourcesInfo: Array<SourceInfo>;
    // spawnsAndExtensions: Array<StrutureInfo>;
    storagesInfo: Array<StorageInfo>

    constructor(generatePID: boolean = false, PPID: string = "", priority: number = 0, roomName: string = "") {
        super(PPID, priority, generatePID);
        this.roomName = roomName;
        this.immmunesManagerPID = null;
        this.centurysManagerPID = null;
        this.sourcesInfo = [];
        this.storagesInfo = [];
        // this.spawnsAndExtensions = [];
        this.requestsToEmpire = [];
        this.requestsBeenProcessed = [];

        if (generatePID && !this.immmunesManagerPID) {
            let newImmunesManager = new ImmunesManager(true, this.PID, PriorityLevel.DEFAULT, this.roomName); // this one will always exist
            this.immmunesManagerPID = newImmunesManager.PID;

            this.updateEnergySourcesInfo();
            this.updateExtensionsList();
        }
    }

    private updateEnergySourcesInfo() {
        let room = this.getRoom();

        let sources = room.findEnergySources();

        if (sources.length > 0) {
            for (let source of sources) {
                let sourceInfo: SourceInfo = { // bug -> do not rebember what is this bug
                    sourceId: source.id,
                    availableSpots: room.findFreeSpotsAroundSource(source),
                    spotsAssigned: 0,
                    workPartsAssigned: 0,
                    minerAssigned: false,
                };

                this.sourcesInfo.push(sourceInfo);
            }
        }
    }

    private updateExtensionsList() {
        let ExtensionsAndSpawns = this.getRoom().find(FIND_STRUCTURES).filter(structure => {
            return structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN
        }) as Array<AnyStoreStructure>;

        let firstSpawn = ExtensionsAndSpawns.filter(structure => structure.structureType === STRUCTURE_SPAWN)[0];

        if (ExtensionsAndSpawns.length > 0) {
            for (let structure of ExtensionsAndSpawns) {
                let structureInfo: StorageInfo = {
                    storageId: structure.id,
                    storageType: StorageType.EXTENSION,
                    structureOwnerId: structure.structureType === STRUCTURE_SPAWN? null : firstSpawn.id,
                    structureOwnerType: StructureOwner.SPAWN,
                    energyStored: structure.store.getUsedCapacity(RESOURCE_ENERGY),
                    inQueueToBeDelivered: 0,
                    inQueueToBeTaken: 0
                }

                this.storagesInfo.push(structureInfo);
            }
        }
    }

    private getRoom(): Room {
        return Game.rooms[this.roomName];
    }

    private getImmunesManager(): ImmunesManager | null {
        if (!this.immmunesManagerPID)
            return null

        let immunesManager = Scheduler.getProcessByPID(this.immmunesManagerPID);
        if (!immunesManager) {
            this.immmunesManagerPID = null;
            return null;
        }

        return immunesManager as ImmunesManager;
    }

    private getCenturysManager(): CenturysManager | null {
        if (!this.centurysManagerPID)
            return null

        let centurysManager = Scheduler.getProcessByPID(this.centurysManagerPID);
        if (!centurysManager) {
            this.centurysManagerPID = null;
            return null
        }

        return centurysManager as CenturysManager;
    }

    private makeRequest(request: Request) {
        this.requestsToEmpire.push(request);
    }

    private checkRequestsBeenProcessed() {
        // TODO
    }

    getRequests(): Array<Request> | null {
        // should return a single or list of requests?
        return this.requestsToEmpire;
    }

    takeRequests(): Array<Request> {
        let immunesManager = this.getImmunesManager();
        let centurysManager = this.getCenturysManager();

        let immunesRequest = immunesManager?.getRequest();
        let centurysRequest = centurysManager?.getRequest();

        if (!immunesManager || (!immunesRequest && !centurysRequest))
            return []

        let requests = Array<Request>();

        // TODO: check priority of request to be executed
        if (immunesRequest)
            requests.push(immunesRequest as Request);
        if (centurysRequest)
            requests.push(centurysRequest as Request);

        // TODO: check if this is the best strategy
        _.sortBy(requests, (request) => Scheduler.getProcessByPID(request.requesterPID)?.currentPriority);

        return requests
    }

    processRequest(requests: Array<Request>) {

        if (requests.length == 0)
            return

        let request = requests.shift() as Request; // TODO: iterate over all requests

        if (request.type === RequestType.SPAWN) {
            let room = this.getRoom();
            let freeSpawns = _.filter(room.find(FIND_MY_SPAWNS), spawn => spawn.spawning === null);

            if (freeSpawns.length > 0) {
                let spawnRequest = request.data as CreepSpawnData;
                let spawnRequestResponse = freeSpawns[0].spawnCreep(spawnRequest.body, spawnRequest.name, { memory: spawnRequest.memory });

                // check different reponses
                if (spawnRequestResponse == OK) {
                    if (request.requesterName == ImmunesManager.name) {
                        let immunesManager = this.getImmunesManager() as ImmunesManager;
                        immunesManager.newRequestBeenProcessed(request);
                    }
                    else if (request.requesterName == CenturysManager.name) {
                        let centurysManager = this.getCenturysManager() as CenturysManager;
                        centurysManager.newRequestBeenProcessed(request);
                    }
                }
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

        let requests = this.takeRequests();
        this.processRequest(requests);
    }
}
