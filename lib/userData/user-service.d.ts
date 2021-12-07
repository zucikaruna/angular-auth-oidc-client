import { Observable } from 'rxjs';
import { DataService } from '../api/data.service';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { PublicEventsService } from '../public-events/public-events.service';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { TokenHelperService } from '../utils/tokenHelper/oidc-token-helper.service';
export declare class UserService {
    private oidcDataService;
    private storagePersistanceService;
    private eventService;
    private loggerService;
    private tokenHelperService;
    private readonly configurationProvider;
    private readonly flowHelper;
    private userDataInternal$;
    get userData$(): Observable<any>;
    constructor(oidcDataService: DataService, storagePersistanceService: StoragePersistanceService, eventService: PublicEventsService, loggerService: LoggerService, tokenHelperService: TokenHelperService, configurationProvider: ConfigurationProvider, flowHelper: FlowHelper);
    getAndPersistUserDataInStore(isRenewProcess?: boolean, idToken?: any, decodedIdToken?: any): Observable<any>;
    getUserDataFromStore(): any;
    publishUserdataIfExists(): void;
    setUserDataToStore(value: any): void;
    resetUserDataInStore(): void;
    private getUserDataOidcFlowAndSave;
    private getIdentityUserData;
    private validateUserdataSubIdToken;
}
