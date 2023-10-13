import { Process } from "./Process";

export class ScreepsSerializer{
    static serializeToMemory(processTable: Array<Process>){
        // const serilizedScheduler = JSON.stringify(scheduler);
        Memory.processTable = processTable;
    }

    static deserializeFromMemory(): Array<Process> | null{
        return Memory.processTable;
    }
}
