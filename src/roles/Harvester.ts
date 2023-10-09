import { Process } from "screepsOs/Process";

export class Harvester extends Process {
    creep: Creep;

    constructor(creep: Creep) {
        super();
        this.creep = creep;
    }

    public run() {
        // state machine using process - can use prioritys - try this one
        // state machine normal - rules of priority will be
    }

}

class HarvestEnergy extends Process {
    creep: Creep;

    constructor(creep: Creep) {
        super();
        this.creep = creep;
    }

    run() {
        this.creep.harvestEnergy();
    }
}

class DeliveryEnergy extends Process {
    creep: Creep;

    constructor(creep: Creep) {
        super();
        this.creep = creep;
    }

    reun() {
        this.creep.deliveryEnergy();
    }
}
