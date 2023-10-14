import { EmpireManager } from "empire/EmpireManager";
import { Kernel } from "screepsOs/Kernel";
import { Scheduler } from "screepsOs/Scheduler";
import { Process } from "screepsOs/Process";
import { ErrorMapper } from "utils/ErrorMapper";
import { ScreepsSerializer } from "screepsOs/Serializer";
import * as rolesIndex from "roles/index"

declare global {
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    empireProcessPID: string;
    processTable: string;
  }

  interface CreepMemory {
    role: string;
    harvesting: any;
    sourceId: any
    // room: string;
    // working: boolean;
    // managerRoom: Room;
  }

  interface ProcessCache {
    memory: object
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

var maxCPUPerTickPercentual = 0.7; // maximum is Game.cpu.tickLimit = 500 when bucket is full
export const loop = ErrorMapper.wrapLoop(() => {
  // let classType = 'Harvester';
  // let index = (rolesIndex as any)[classType];
  // console.log(index);
  // console.log(`Current game tick is ${Game.time}`);

  let processTable = ScreepsSerializer.deserializeFromMemory();
  let scheduler = new Scheduler(processTable);
  debugger;
  let empire = Scheduler.getProcessByPID(Memory.empireProcessPID);

  // console.log("empire: " + JSON.stringify(empire));
  // console.log("empire is instance of manager: " + (empire instanceof EmpireManager));

  if(!empire){
    empire = new EmpireManager(true);
    Memory.empireProcessPID = empire.PID;
  }

  let maxCPUPerTick = maxCPUPerTickPercentual * Game.cpu.tickLimit;
  let kernel = new Kernel(maxCPUPerTick);
  kernel.tick();

  // Automatically delete memory of missing creeps - turn this into a process
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
