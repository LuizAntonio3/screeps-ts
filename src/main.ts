import { EmpireManager } from "empire/EmpireManager";
import { Kernel } from "screepsOs/Kernel";
import { Scheduler } from "screepsOs/Scheduler";
import { Process } from "screepsOs/Process";
import { ErrorMapper } from "utils/ErrorMapper";
import { ScreepsSerializer } from "screepsOs/Serializer";


declare global {
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    empireProcessPID: string;
    processTable: Array<Process>;
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
  console.log(`Current game tick is ${Game.time}`);

  let processTable = ScreepsSerializer.deserializeFromMemory();
  let scheduler = new Scheduler(processTable);
  let empire = scheduler.getProcessByPID(Memory.empireProcessPID); // TODO: fix - not been executed properly

  console.log("empire: " + JSON.stringify(empire));
  console.log("empire is instance of manager: " + (empire instanceof EmpireManager));

  if(!empire){
    empire = new EmpireManager();
  }

  let maxCPUPerTick = maxCPUPerTickPercentual * Game.cpu.tickLimit;
  let kernel = new Kernel(scheduler, maxCPUPerTick);
  kernel.tick();

  // Automatically delete memory of missing creeps - turn this into a process
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
