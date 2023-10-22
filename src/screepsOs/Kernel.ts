import { Scheduler } from "./Scheduler";

export class Kernel {
    maxUsageCPU: number;

    constructor(maxUsageCPU: number) {
        this.maxUsageCPU = maxUsageCPU;
    }

    public tick() {
        while (Game.cpu.getUsed() < this.maxUsageCPU) {
            let cpuAvailable = this.maxUsageCPU - Game.cpu.getUsed();
            let process = Scheduler.getProcess(cpuAvailable);

            if (!process)
                break;

            try{
                process.run();
            }
            catch(e){
                console.log(`PROCESS: ${process} - EXECUTED WITH ERROR: ${e}`);
            }
        }
    }
}
