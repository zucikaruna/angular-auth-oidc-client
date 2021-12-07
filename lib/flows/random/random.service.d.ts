import { LoggerService } from '../../logging/logger.service';
export declare class RandomService {
    private loggerService;
    constructor(loggerService: LoggerService);
    createRandom(requiredLength: number): string;
    private toHex;
    private randomString;
    private getCrypto;
}
