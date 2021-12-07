import { ConfigurationProvider } from '../config/config.provider';
import { CallbackContext } from '../flows/callback-context';
import { LoggerService } from '../logging/logger.service';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { TokenHelperService } from '../utils/tokenHelper/oidc-token-helper.service';
import { StateValidationResult } from './state-validation-result';
import { TokenValidationService } from './token-validation.service';
export declare class StateValidationService {
    private storagePersistanceService;
    private tokenValidationService;
    private tokenHelperService;
    private loggerService;
    private readonly configurationProvider;
    private readonly flowHelper;
    constructor(storagePersistanceService: StoragePersistanceService, tokenValidationService: TokenValidationService, tokenHelperService: TokenHelperService, loggerService: LoggerService, configurationProvider: ConfigurationProvider, flowHelper: FlowHelper);
    getValidatedStateResult(callbackContext: CallbackContext): StateValidationResult;
    private isIdTokenAfterRefreshTokenRequestValid;
    validateState(callbackContext: any): StateValidationResult;
    private handleSuccessfulValidation;
    private handleUnsuccessfulValidation;
}
