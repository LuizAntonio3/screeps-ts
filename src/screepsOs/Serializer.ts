import { Process } from "./Process";
import * as processTypes from "screepsOs/processTypes"

export class ScreepsSerializer{
    static serializeToMemory(processTable: Array<Process>){
        Memory.processTable = JSON.stringify(processTable);
    }

    static deserializeFromMemory(): Array<Process> | null{
        let processTableRetrieved: Array<Process> = [];

        try{
            let jsonProcessTable: Array<any> = JSON.parse(Memory.processTable);

            for(let processJson of jsonProcessTable){
                let _class = processJson._class;
                if(_class){
                    let newEmptyInstance = new (processTypes as any)[_class]();
                    newEmptyInstance.rebuild(processJson);
                    processTableRetrieved.push(newEmptyInstance);
                }
            }
        }
        catch(e){
            console.log(e);
        }

        return processTableRetrieved;
    }
}
