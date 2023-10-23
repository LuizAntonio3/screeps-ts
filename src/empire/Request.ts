export enum RequestType {
    SPAWN
}

export class Request{
    static identifierNumerator: number = 0;

    requesterName: string;
    requesterPID: string;
    identifier: string;
    type: RequestType;
    data: object;

    constructor(requesterName: string, requesterPID: string, type: RequestType, data: object){
        this.requesterName = requesterName;
        this.requesterPID = requesterPID;
        this.identifier = Request.generateIdentifier();
        this.type = type;
        this.data = data;
    }

    static generateIdentifier(): string {
        let identifier = `${Game.time}-${Request.identifierNumerator}`;
        Request.identifierNumerator++;
        return identifier;
    }
}
