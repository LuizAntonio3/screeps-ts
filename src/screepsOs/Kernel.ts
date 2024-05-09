import { Scheduler } from "./Scheduler";
import { ProcessStatus } from "./Process";

export class Kernel {
    maxUsageCPU: number;

    constructor(maxUsageCPU: number) {
        this.maxUsageCPU = maxUsageCPU;
    }

    tick() {
        while (Game.cpu.getUsed() < this.maxUsageCPU) {
            let beforeProcessCpuUsage = Game.cpu.getUsed();
            let cpuAvailable = this.maxUsageCPU - Game.cpu.getUsed();

            let process = Scheduler.getProcess(cpuAvailable);

            if (!process || process.status == ProcessStatus.STOPPED)
                break;

            try{
                process.run();
                process.updateMeanCpuUsage(beforeProcessCpuUsage, Game.cpu.getUsed());
            }
            catch(e){
                console.log(`PROCESS PID: ${process.PID} - EXECUTED WITH ERROR: ${e}`);
            }
        }
    }
}
