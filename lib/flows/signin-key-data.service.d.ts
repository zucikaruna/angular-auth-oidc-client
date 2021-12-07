import { DataService } from '../api/data.service';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { JwtKeys } from '../validation/jwtkeys';
export declare class SigninKeyDataService {
    private configurationProvider;
    private loggerService;
    private dataService;
    constructor(configurationProvider: ConfigurationProvider, loggerService: LoggerService, dataService: DataService);
    getSigningKeys(): import("rxjs").Observable<JwtKeys>;
    private handleErrorGetSigningKeys;
}
