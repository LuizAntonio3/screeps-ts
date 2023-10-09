import { Scheduler } from "./Scheduler";
import { Proces } from "./process";

export class Kernel {
    maxUsageCPU: number;
    scheduler: Scheduler;

    constructor(scheduler: Scheduler, maxUsageCPU: number) {
        this.scheduler = scheduler;
        this.maxUsageCPU = maxUsageCPU;
    }

    public tick() {
        // get new process from the scheduler and runs it

        let currentCPUAvailable = this.maxUsageCPU;

        while (currentCPUAvailable > this.maxUsageCPU) {
            let process = this.scheduler.getProcess(currentCPUAvailable);
            // check current cpuUsage7
            process.run()
        }
    }
}
