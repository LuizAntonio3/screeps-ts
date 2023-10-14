import { Process } from "screepsOs/Process";

export class Upgrader extends Process {
    creep: Creep;

    constructor (creep: Creep){
        super("", 1, true);
        this.creep = creep;
    }

    public run() {
        this.creep.say("upgrader")
    }
}
