import { Scheduler } from "./Scheduler";
import { Process } from "./Process";

export class Kernel {
    maxUsageCPU: number;
    scheduler: Scheduler;

    constructor(scheduler: Scheduler, maxUsageCPU: number) {
        this.scheduler = scheduler;
        this.maxUsageCPU = maxUsageCPU;
    }

    public tick() {
        // get new process from the scheduler and runs it
        // console.log("tick before: ", Game.cpu.getUsed());

        while (Game.cpu.getUsed() < this.maxUsageCPU) {
            let cpuAvailable = this.maxUsageCPU - Game.cpu.getUsed();
            let process = this.scheduler.getProcess(cpuAvailable);
            // break if there is no process
            if (!process)
                break;

            process.run();
        }

        // console.log("tick after: ", Game.cpu.getUsed());
    }
}
