import { LogLevel } from '../logging/log-level';
export interface OpenIdConfiguration {
    stsServer?: string;
    authWellknownEndpoint?: string;
    redirectUrl?: string;
    clientId?: string;
    responseType?: string;
    scope?: string;
    hdParam?: string;
    postLogoutRedirectUri?: string;
    startCheckSession?: boolean;
    silentRenew?: boolean;
    silentRenewUrl?: string;
    renewTimeBeforeTokenExpiresInSeconds?: number;
    useRefreshToken?: boolean;
    ignoreNonceAfterRefresh?: boolean;
    postLoginRoute?: string;
    forbiddenRoute?: string;
    unauthorizedRoute?: string;
    autoUserinfo?: boolean;
    autoCleanStateAfterAuthentication?: boolean;
    triggerAuthorizationResultEvent?: boolean;
    logLevel?: LogLevel;
    issValidationOff?: boolean;
    historyCleanupOff?: boolean;
    maxIdTokenIatOffsetAllowedInSeconds?: number;
    disableIatOffsetValidation?: boolean;
    storage?: any;
    customParams?: {
        [key: string]: string | number | boolean;
    };
    disableRefreshIdTokenAuthTimeValidation?: boolean;
}
