import { Process } from "screepsOs/Process";
import { CohortManager } from "./CohortManager";

// Empire Manger - deals with all the rooms
// chooses when to go to another room and the interaction between the two - like help in echonomy and war
export class EmpireManager extends Process{
    cohorts: Array<CohortManager>;

    constructor() {
        super("Emperor", "", 100);
        this.cohorts = [];
    }

    run(){
        _.forEach(this.cohorts, (cohort) => {
            cohort.run();
        })
    }
}
