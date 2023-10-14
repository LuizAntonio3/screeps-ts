import { Process, PriorityLevel } from "screepsOs/Process";
import { CohortManager } from "./CohortManager";
import { Request } from "./Request";
import { Scheduler } from "screepsOs/Scheduler";

// Empire Manager - deals with all the rooms
// chooses when to go to another room and the interaction between the two - like help in echonomy and war
export class EmpireManager extends Process{
    _class: string = EmpireManager.name;
    cohortsPID: Array<string>;
    requests: Array<Request>;

    constructor(generatePID: boolean = false) {
        super(null, PriorityLevel.HIGH, generatePID);
        this.cohortsPID = [];
        this.requests = [];
    }

    retrieveCohorts(): any {
        let cohorts: Array<Process> = []

        _.filter(this.cohortsPID, (cohortPID) => {
            let result = Scheduler.getCompleteProcessTable().find((process) => process.PID === cohortPID);
            if(result)
                cohorts.push(result);
        });

        return cohorts;
    }

    createCohorts(cohorts: Array<CohortManager>) { // there is a bug in this
        let myRooms = _.filter(Game.rooms, r => r.controller && r.controller.level > 0 && r.controller.my);

        let roomThatAreNotCohorts = _.filter(myRooms, (room) => {
            for(let cohort of cohorts){
                if(room.name === cohort.roomName)
                    return false;
            }

            return true;
        });

        if(!roomThatAreNotCohorts)
            return;

        for(let room of roomThatAreNotCohorts){
            let newCohort = new CohortManager(true, this.PID, PriorityLevel.DEFAULT, room.name);
            this.cohortsPID.push(newCohort.PID);
        }
    }

    takeRequestsFromCohorts(cohorts: Array<CohortManager>) {
        for(let cohort of cohorts){
            let cohortRequests = cohort.getRequests();
            if(cohortRequests){
                this.requests.concat(cohortRequests);
            }
        }
    }

    processRequests() {
        // TODO: process requests
        return
    }

    run(){
        let cohorts = this.retrieveCohorts();
        this.createCohorts(cohorts);
        this.takeRequestsFromCohorts(cohorts);
        this.processRequests();
    }
}
