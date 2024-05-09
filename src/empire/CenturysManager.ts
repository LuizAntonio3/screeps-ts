import { Process } from "screepsOs/Process";
import { Request } from "./Request";

// TODO: ALL
export class CenturysManager extends Process {
    constructor(generatePID: boolean = false, PPID: string = "", priority: number = 0, roomName: string = "") {
        super(PPID, priority, generatePID);
    }

    getRequest(): Request | null {
        return null
    }

    newRequestBeenProcessed(request: Request){
        // TODO
    }
}
