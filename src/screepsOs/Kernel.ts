import { Scheduler } from "./Scheduler";
import { Process } from "./Process";
import { ScreepsSerializer } from "./Serializer";

export class Kernel {
    maxUsageCPU: number;
    scheduler: Scheduler;

    constructor(scheduler: Scheduler, maxUsageCPU: number) {
        this.scheduler = scheduler;
        this.maxUsageCPU = maxUsageCPU;
    }

    public tick() {

        while (Game.cpu.getUsed() < this.maxUsageCPU) {
            let cpuAvailable = this.maxUsageCPU - Game.cpu.getUsed();
            let process = this.scheduler.getProcess(cpuAvailable);

            console.log("Process in kernel: " + JSON.stringify(process));

            if (!process)
                break;

            process.run();
        }

        this.scheduler.endOfTick();
        ScreepsSerializer.serializeToMemory(Scheduler.getProcessTable());
    }
}
