import { ConfigurationProvider } from '../config/config.provider';
export declare class LoggerService {
    private configurationProvider;
    constructor(configurationProvider: ConfigurationProvider);
    logError(message: any, ...args: any[]): void;
    logWarning(message: any, ...args: string[]): void;
    logDebug(message: any, ...args: string[]): void;
    private currentLogLevelIsEqualOrSmallerThan;
}
