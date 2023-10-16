export enum RequestType {
    SPAWN
}

export class Request{
    static identifierNumerator: number = 0;

    identifier: string;
    type: RequestType;
    data: object;

    constructor(type: RequestType, data: object){
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
