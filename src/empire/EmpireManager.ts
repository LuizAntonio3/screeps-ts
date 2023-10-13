import { Process, PriorityLevel } from "screepsOs/Process";
import { CohortManager } from "./CohortManager";
import { Request } from "./Request";

// Empire Manger - deals with all the rooms
// chooses when to go to another room and the interaction between the two - like help in echonomy and war
export class EmpireManager extends Process{
    cohorts: Array<CohortManager>;
    requests: Array<Request>;

    constructor() {
        super(null, PriorityLevel.HIGH);
        Memory.empireProcessPID = this.PID;
        this.cohorts = [];
        this.requests = [];
    }

    takeRequestsFromCohorts() {
        for(let cohort of this.cohorts){
            let cohortRequests = cohort.getRequests();
            if(cohortRequests){
                this.requests.concat(cohortRequests);
            }
        }
    }

    processRequests() {

    }

    createCohorts() {
        let myRooms = _.filter(Game.rooms, r => r.controller && r.controller.level > 0 && r.controller.my);
        let roomThatAreNotCohorts = _.filter(myRooms, (room) => {
            for(let cohort of this.cohorts){
                if(cohort.room === room)
                    return false;
            }

            return true;
        });

        if(!roomThatAreNotCohorts)
            return;

        for(let room of roomThatAreNotCohorts){
            this.cohorts.push(new CohortManager(this.PID, room));
        }
    }

    run(){
        this.createCohorts();
        this.takeRequestsFromCohorts();
        this.processRequests();
    }
}
