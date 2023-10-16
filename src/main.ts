import { EmpireManager } from "empire/EmpireManager";
import { Kernel } from "screepsOs/Kernel";
import { Scheduler } from "screepsOs/Scheduler";
import { Process } from "screepsOs/Process";
import { ErrorMapper } from "utils/ErrorMapper";
import { ScreepsSerializer } from "screepsOs/Serializer";
import * as rolesIndex from "tasks/index"

import * as creepPrototype from "prototypes/creep"
import * as roomPrototype from "prototypes/room"

declare global {
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    empireProcessPID: string;
    processTable: string;
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
  let processTable = ScreepsSerializer.deserializeFromMemory();
  let scheduler = new Scheduler(processTable);
  debugger;
  let empire = Scheduler.getProcessByPID(Memory.empireProcessPID);

  if(!empire){
    empire = new EmpireManager(true);
    Memory.empireProcessPID = empire.PID;
  }

  let maxCPUPerTick = maxCPUPerTickPercentual * Game.cpu.tickLimit;
  let kernel = new Kernel(maxCPUPerTick);
  kernel.tick();
  Scheduler.endOfTick();
  ScreepsSerializer.serializeToMemory(Scheduler.processTable);
  Scheduler.resetArrays();

  // Automatically delete memory of missing creeps - turn this into a process
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
