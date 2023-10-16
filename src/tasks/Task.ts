import { Process } from "screepsOs/Process";

export class Task extends Process {
    constructor(generatePID: boolean = false, PPID: string, priority: number) {
        super(PPID, priority, generatePID);
    }

    checkCreepAlive(creep: Creep): boolean {
        if (!creep.isAlive) {
            console.log(`creep does not exist any longer - killing process ${this.PID}`);
            this.killProcess();
            return false;
        }

        return true;
    }

    run() {

    }
}
