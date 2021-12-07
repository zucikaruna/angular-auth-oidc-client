import { ConfigurationProvider } from '../../config/config.provider';
import { FlowsDataService } from '../../flows/flows-data.service';
import { LoggerService } from '../../logging/logger.service';
import { TokenValidationService } from '../../validation/token-validation.service';
import { FlowHelper } from '../flowHelper/flow-helper.service';
export declare class UrlService {
    private readonly configurationProvider;
    private readonly loggerService;
    private readonly flowsDataService;
    private readonly flowHelper;
    private tokenValidationService;
    private window;
    private CALLBACK_PARAMS_TO_CHECK;
    constructor(configurationProvider: ConfigurationProvider, loggerService: LoggerService, flowsDataService: FlowsDataService, flowHelper: FlowHelper, tokenValidationService: TokenValidationService, window: any);
    getUrlParameter(urlToCheck: any, name: any): string;
    isCallbackFromSts(): boolean;
    getRefreshSessionSilentRenewUrl(): string;
    getAuthorizeUrl(customParams?: {
        [key: string]: string | number | boolean;
    }): string;
    createEndSessionUrl(idTokenHint: string): string;
    createRevocationEndpointBodyAccessToken(token: any): string;
    createRevocationEndpointBodyRefreshToken(token: any): string;
    getRevocationEndpointUrl(): string;
    createBodyForCodeFlowCodeRequest(code: string): string;
    createBodyForCodeFlowRefreshTokensRequest(refreshtoken: string): string;
    private createAuthorizeUrl;
    private createUrlImplicitFlowWithSilentRenew;
    private createUrlCodeFlowWithSilentRenew;
    private createUrlImplicitFlowAuthorize;
    private createUrlCodeFlowAuthorize;
    private getRedirectUrl;
    private getSilentRenewUrl;
    private getPostLogoutRedirectUrl;
    private getClientId;
}
