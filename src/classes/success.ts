export class Success {
    statusCode: number;
    settings?: any;
    ackTs?: number;
    message: string;
    cellLocation?: any;

    constructor(message: string, statusCode: number, settings?: any, ackTs?: number, cellLocation?: any) {
        this.message = message;
        this.statusCode = statusCode;
        this.settings = settings;
        this.ackTs = ackTs;
        this.cellLocation = cellLocation;
    }
}
