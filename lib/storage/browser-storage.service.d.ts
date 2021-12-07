import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { AbstractSecurityStorage } from './abstract-security-storage';
export declare class BrowserStorageService implements AbstractSecurityStorage {
    private configProvider;
    private loggerService;
    constructor(configProvider: ConfigurationProvider, loggerService: LoggerService);
    read(key: string): any;
    write(key: string, value: any): boolean;
    private getStorage;
    private hasStorage;
}
