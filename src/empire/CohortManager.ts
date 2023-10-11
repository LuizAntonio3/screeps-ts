import { Process } from "screepsOs/Process";

class ImmuneManager{}
class CenturyManager{}

// Basically the RoomManager - Also dealing with Remotes of this Room
export class CohortManager extends Process{
    room: Room;
    immuneManager: any;
    remoteImmuneManager: any;
    centuryManager: any;

    constructor(PID: string, PPID: string, room: Room) {
        super(PID, PPID, 100);
        this.room = room;
    }

    run() {
        // run immuneManager and centuryManager - instantiate it when needed - actually they are separet process so there will be no run
        // keeps in here the managers instantiation when needed - and the room managing
    }
}
