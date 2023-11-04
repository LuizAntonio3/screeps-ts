import { ErrorMapper } from "utils/ErrorMapper";
import { Kernel } from "screepsOs/Kernel";
import { Scheduler } from "screepsOs/Scheduler";
import { EmpireManager } from "empire/EmpireManager";

import "prototypes/creep"
import "prototypes/room"
import { CreepStatus } from "prototypes/creep";

declare global {
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
  let maxCPUPerTick = maxCPUPerTickPercentual * Game.cpu.tickLimit; // TODO: check this based on bucket size

  let kernel = new Kernel(maxCPUPerTick);
  let scheduler = new Scheduler();
  let empire = Scheduler.getProcessByPID(Memory.empireProcessPID);

  if (!empire) {
    empire = new EmpireManager(true);
    Memory.empireProcessPID = empire.PID;
  }

  kernel.tick();
  scheduler.endOfTick();

  // Automatically delete memory of missing creeps
  for (const name in _.filter(Memory.creeps, creep => creep.status === CreepStatus.IDLE)) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
