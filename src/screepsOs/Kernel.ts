import { Scheduler } from "./Scheduler";
import { Process } from "./Process";
import { ScreepsSerializer } from "./Serializer";

export class Kernel {
    maxUsageCPU: number;

    constructor(maxUsageCPU: number) {
        this.maxUsageCPU = maxUsageCPU;
    }

    public tick() {

        while (Game.cpu.getUsed() < this.maxUsageCPU) {
            let cpuAvailable = this.maxUsageCPU - Game.cpu.getUsed();
            let process = Scheduler.getProcess(cpuAvailable);

            // console.log("Process in kernel: " + JSON.stringify(process));

            if (!process)
                break;

            process.run();
        }
    }
}
