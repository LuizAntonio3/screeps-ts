export class Request{
    static identifierNumerator: number = 0;

    identifier: string;
    type: string;
    data: object;

    constructor(type: string, data: object){
        this.identifier = Request.generateIdentifier(type, data);
        this.type = type;
        this.data = data;
    }

    static generateIdentifier(type: string, data: object): string {
        let identifier = `${Game.time}-${Request.identifierNumerator}`;
        Request.identifierNumerator++;
        return identifier;
    }
}
