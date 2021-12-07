import { __decorate } from "tslib";
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { DataService } from '../api/data.service';
import { AuthStateService } from '../authState/auth-state.service';
import { AuthorizedState } from '../authState/authorized-state';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { UserService } from '../userData/user-service';
import { UrlService } from '../utils/url/url.service';
import { StateValidationService } from '../validation/state-validation.service';
import { TokenValidationService } from '../validation/token-validation.service';
import { ValidationResult } from '../validation/validation-result';
import { FlowsDataService } from './flows-data.service';
import { SigninKeyDataService } from './signin-key-data.service';
let FlowsService = class FlowsService {
    constructor(urlService, loggerService, tokenValidationService, configurationProvider, authStateService, flowsDataService, signinKeyDataService, dataService, userService, stateValidationService) {
        this.urlService = urlService;
        this.loggerService = loggerService;
        this.tokenValidationService = tokenValidationService;
        this.configurationProvider = configurationProvider;
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
        this.signinKeyDataService = signinKeyDataService;
        this.dataService = dataService;
        this.userService = userService;
        this.stateValidationService = stateValidationService;
    }
    resetAuthorizationData() {
        if (this.configurationProvider.openIDConfiguration.autoUserinfo) {
            // Clear user data. Fixes #97.
            this.userService.resetUserDataInStore();
        }
        this.flowsDataService.resetStorageFlowData();
        this.authStateService.setUnauthorizedAndFireEvent();
    }
    processCodeFlowCallback(urlToCheck) {
        return this.codeFlowCallback(urlToCheck).pipe(switchMap((callbackContext) => this.codeFlowCodeRequest(callbackContext)), switchMap((callbackContext) => this.codeFlowSilentRenewCheck(callbackContext)), switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    processSilentRenewCodeFlowCallback(firstContext) {
        return this.codeFlowCodeRequest(firstContext).pipe(switchMap((callbackContext) => this.codeFlowSilentRenewCheck(callbackContext)), switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    processImplicitFlowCallback(hash) {
        return this.implicitFlowCallback(hash).pipe(switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    processRefreshToken() {
        return this.refreshSessionWithRefreshTokens().pipe(switchMap((callbackContext) => this.refreshTokensRequestTokens(callbackContext)), switchMap((callbackContext) => this.codeFlowSilentRenewCheck(callbackContext)), switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    // STEP 1 Code Flow
    codeFlowCallback(urlToCheck) {
        const code = this.urlService.getUrlParameter(urlToCheck, 'code');
        const state = this.urlService.getUrlParameter(urlToCheck, 'state');
        const sessionState = this.urlService.getUrlParameter(urlToCheck, 'session_state') || null;
        if (!state) {
            this.loggerService.logDebug('no state in url');
            return throwError('no state in url');
        }
        if (!code) {
            this.loggerService.logDebug('no code in url');
            return throwError('no code in url');
        }
        this.loggerService.logDebug('running validation for callback' + urlToCheck);
        const initialCallbackContext = {
            code,
            refreshToken: null,
            state,
            sessionState,
            authResult: null,
            isRenewProcess: false,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return of(initialCallbackContext);
    }
    // STEP 1 Implicit Flow
    implicitFlowCallback(hash) {
        const isRenewProcessData = this.flowsDataService.isSilentRenewRunning();
        this.loggerService.logDebug('BEGIN authorizedCallback, no auth data');
        if (!isRenewProcessData) {
            this.resetAuthorizationData();
        }
        hash = hash || window.location.hash.substr(1);
        const authResult = hash.split('&').reduce((resultData, item) => {
            const parts = item.split('=');
            resultData[parts.shift()] = parts.join('=');
            return resultData;
        }, {});
        const callbackContext = {
            code: null,
            refreshToken: null,
            state: null,
            sessionState: null,
            authResult,
            isRenewProcess: isRenewProcessData,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return of(callbackContext);
    }
    // STEP 1 Refresh session
    refreshSessionWithRefreshTokens() {
        const stateData = this.flowsDataService.getExistingOrCreateAuthStateControl();
        this.loggerService.logDebug('RefreshSession created. adding myautostate: ' + stateData);
        const refreshToken = this.authStateService.getRefreshToken();
        const idToken = this.authStateService.getIdToken();
        // TODO add id_token data
        if (refreshToken) {
            const callbackContext = {
                code: null,
                refreshToken,
                state: stateData,
                sessionState: null,
                authResult: null,
                isRenewProcess: false,
                jwtKeys: null,
                validationResult: null,
                existingIdToken: idToken,
            };
            this.loggerService.logDebug('found refresh code, obtaining new credentials with refresh code');
            // Nonce is not used with refresh tokens; but Keycloak may send it anyway
            this.flowsDataService.setNonce(TokenValidationService.RefreshTokenNoncePlaceholder);
            return of(callbackContext);
        }
        else {
            const errorMessage = 'no refresh token found, please login';
            this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }
    }
    // STEP 2 Refresh Token
    refreshTokensRequestTokens(callbackContext) {
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const tokenRequestUrl = this.getTokenEndpoint();
        if (!tokenRequestUrl) {
            return throwError('Token Endpoint not defined');
        }
        const data = this.urlService.createBodyForCodeFlowRefreshTokensRequest(callbackContext.refreshToken);
        return this.dataService.post(tokenRequestUrl, data, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug('token refresh response: ', response);
            let authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), catchError((error) => {
            const errorMessage = `OidcService code request ${this.configurationProvider.openIDConfiguration.stsServer}: ${error}`;
            this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }));
    }
    // STEP 2 Code Flow //  Code Flow Silent Renew starts here
    codeFlowCodeRequest(callbackContext) {
        const isStateCorrect = this.tokenValidationService.validateStateFromHashCallback(callbackContext.state, this.flowsDataService.getAuthStateControl());
        if (!isStateCorrect) {
            this.loggerService.logWarning('codeFlowCodeRequest incorrect state');
            return throwError('codeFlowCodeRequest incorrect state');
        }
        const tokenRequestUrl = this.getTokenEndpoint();
        if (!tokenRequestUrl) {
            return throwError('Token Endpoint not defined');
        }
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const bodyForCodeFlow = this.urlService.createBodyForCodeFlowCodeRequest(callbackContext.code);
        return this.dataService.post(tokenRequestUrl, bodyForCodeFlow, headers).pipe(switchMap((response) => {
            let authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            authResult.session_state = callbackContext.sessionState;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), catchError((error) => {
            const errorMessage = `OidcService code request ${this.configurationProvider.openIDConfiguration.stsServer} with error ${error}`;
            this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }));
    }
    // STEP 3 Code Flow, STEP 3 Refresh Token
    codeFlowSilentRenewCheck(callbackContext) {
        callbackContext.isRenewProcess = this.flowsDataService.isSilentRenewRunning();
        this.loggerService.logDebug('BEGIN authorized Code Flow Callback, no auth data');
        if (!callbackContext.isRenewProcess) {
            this.resetAuthorizationData();
        }
        return of(callbackContext);
    }
    // STEP 4 Code Flow, STEP 2 Implicit Flow, STEP 4 Refresh Token
    callbackHistoryAndResetJwtKeys(callbackContext) {
        this.authStateService.setAuthResultInStorage(callbackContext.authResult);
        if (this.historyCleanUpTurnedOn() && !callbackContext.isRenewProcess) {
            this.resetBrowserHistory();
        }
        else {
            this.loggerService.logDebug('history clean up inactive');
        }
        if (callbackContext.authResult.error) {
            const errorMessage = `authorizedCallbackProcedure came with error: ${callbackContext.authResult.error}`;
            this.loggerService.logDebug(errorMessage);
            this.resetAuthorizationData();
            this.flowsDataService.setNonce('');
            this.handleResultErrorFromCallback(callbackContext.authResult, callbackContext.isRenewProcess);
            return throwError(errorMessage);
        }
        this.loggerService.logDebug(callbackContext.authResult);
        this.loggerService.logDebug('authorizedCallback created, begin token validation');
        return this.signinKeyDataService.getSigningKeys().pipe(switchMap((jwtKeys) => {
            if (jwtKeys) {
                callbackContext.jwtKeys = jwtKeys;
                return of(callbackContext);
            }
            const errorMessage = `Failed to retrieve signing key`;
            this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }), catchError((err) => {
            const errorMessage = `Failed to retrieve signing key with error: ${err}`;
            this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }));
    }
    // STEP 5 All flows
    callbackStateValidation(callbackContext) {
        const validationResult = this.stateValidationService.getValidatedStateResult(callbackContext);
        callbackContext.validationResult = validationResult;
        if (validationResult.authResponseIsValid) {
            this.authStateService.setAuthorizationData(validationResult.accessToken, validationResult.idToken);
            return of(callbackContext);
        }
        else {
            const errorMessage = `authorizedCallback, token(s) validation failed, resetting. Hash: ${window.location.hash}`;
            this.loggerService.logWarning(errorMessage);
            this.resetAuthorizationData();
            this.publishUnauthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
            return throwError(errorMessage);
        }
    }
    // STEP 6 userData
    callbackUser(callbackContext) {
        if (!this.configurationProvider.openIDConfiguration.autoUserinfo) {
            if (!callbackContext.isRenewProcess) {
                // userData is set to the id_token decoded, auto get user data set to false
                this.userService.setUserDataToStore(callbackContext.validationResult.decodedIdToken);
            }
            this.publishAuthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
            return of(callbackContext);
        }
        return this.userService
            .getAndPersistUserDataInStore(callbackContext.isRenewProcess, callbackContext.validationResult.idToken, callbackContext.validationResult.decodedIdToken)
            .pipe(switchMap((userData) => {
            if (!!userData) {
                this.flowsDataService.setSessionState(callbackContext.authResult.session_state);
                this.publishAuthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                return of(callbackContext);
            }
            else {
                this.resetAuthorizationData();
                this.publishUnauthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                const errorMessage = `Called for userData but they were ${userData}`;
                this.loggerService.logWarning(errorMessage);
                return throwError(errorMessage);
            }
        }), catchError((err) => {
            const errorMessage = `Failed to retreive user info with error:  ${err}`;
            this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }));
    }
    publishAuthorizedState(stateValidationResult, isRenewProcess) {
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Authorized,
            validationResult: stateValidationResult.state,
            isRenewProcess,
        });
    }
    publishUnauthorizedState(stateValidationResult, isRenewProcess) {
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Unauthorized,
            validationResult: stateValidationResult.state,
            isRenewProcess,
        });
    }
    handleResultErrorFromCallback(result, isRenewProcess) {
        let validationResult = ValidationResult.SecureTokenServerError;
        if (result.error === 'login_required') {
            validationResult = ValidationResult.LoginRequired;
        }
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Unauthorized,
            validationResult,
            isRenewProcess,
        });
    }
    getTokenEndpoint() {
        var _a;
        return ((_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.tokenEndpoint) || null;
    }
    historyCleanUpTurnedOn() {
        return !this.configurationProvider.openIDConfiguration.historyCleanupOff;
    }
    resetBrowserHistory() {
        window.history.replaceState({}, window.document.title, window.location.origin + window.location.pathname);
    }
};
FlowsService.ctorParameters = () => [
    { type: UrlService },
    { type: LoggerService },
    { type: TokenValidationService },
    { type: ConfigurationProvider },
    { type: AuthStateService },
    { type: FlowsDataService },
    { type: SigninKeyDataService },
    { type: DataService },
    { type: UserService },
    { type: StateValidationService }
];
FlowsService = __decorate([
    Injectable()
], FlowsService);
export { FlowsService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd3Muc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC8iLCJzb3VyY2VzIjpbImxpYi9mbG93cy9mbG93cy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQWMsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNsRCxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNuRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDaEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFdEQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDaEYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDaEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFbkUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDeEQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFHakUsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBWTtJ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QUU7WUFDL0MsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDO1NBQ3JEO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDO1lBQzVDLGtCQUFrQixFQUFFLGVBQWUsQ0FBQyxZQUFZO1lBQ2hELGdCQUFnQjtZQUNoQixjQUFjO1NBQ2pCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyxnQkFBZ0I7O1FBQ3BCLE9BQU8sT0FBQSxJQUFJLENBQUMscUJBQXFCLENBQUMsa0JBQWtCLDBDQUFFLGFBQWEsS0FBSSxJQUFJLENBQUM7SUFDaEYsQ0FBQztJQUVPLHNCQUFzQjtRQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDO0lBQzdFLENBQUM7SUFFTyxtQkFBbUI7UUFDdkIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUcsQ0FBQztDQUNKLENBQUE7O1lBelhvQyxVQUFVO1lBQ1AsYUFBYTtZQUNKLHNCQUFzQjtZQUN2QixxQkFBcUI7WUFDMUIsZ0JBQWdCO1lBQ2hCLGdCQUFnQjtZQUNaLG9CQUFvQjtZQUM3QixXQUFXO1lBQ1gsV0FBVztZQUNBLHNCQUFzQjs7QUFYMUQsWUFBWTtJQUR4QixVQUFVLEVBQUU7R0FDQSxZQUFZLENBMlh4QjtTQTNYWSxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciwgc3dpdGNoTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9hcGkvZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IEF1dGhTdGF0ZVNlcnZpY2UgfSBmcm9tICcuLi9hdXRoU3RhdGUvYXV0aC1zdGF0ZS5zZXJ2aWNlJztcbmltcG9ydCB7IEF1dGhvcml6ZWRTdGF0ZSB9IGZyb20gJy4uL2F1dGhTdGF0ZS9hdXRob3JpemVkLXN0YXRlJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXNlclNlcnZpY2UgfSBmcm9tICcuLi91c2VyRGF0YS91c2VyLXNlcnZpY2UnO1xuaW1wb3J0IHsgVXJsU2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3VybC91cmwuc2VydmljZSc7XG5pbXBvcnQgeyBTdGF0ZVZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICcuLi92YWxpZGF0aW9uL3N0YXRlLXZhbGlkYXRpb24tcmVzdWx0JztcbmltcG9ydCB7IFN0YXRlVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuLi92YWxpZGF0aW9uL3N0YXRlLXZhbGlkYXRpb24uc2VydmljZSc7XG5pbXBvcnQgeyBUb2tlblZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vdmFsaWRhdGlvbi90b2tlbi12YWxpZGF0aW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4uL3ZhbGlkYXRpb24vdmFsaWRhdGlvbi1yZXN1bHQnO1xuaW1wb3J0IHsgQ2FsbGJhY2tDb250ZXh0IH0gZnJvbSAnLi9jYWxsYmFjay1jb250ZXh0JztcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuL2Zsb3dzLWRhdGEuc2VydmljZSc7XG5pbXBvcnQgeyBTaWduaW5LZXlEYXRhU2VydmljZSB9IGZyb20gJy4vc2lnbmluLWtleS1kYXRhLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRmxvd3NTZXJ2aWNlIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSB1cmxTZXJ2aWNlOiBVcmxTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgdG9rZW5WYWxpZGF0aW9uU2VydmljZTogVG9rZW5WYWxpZGF0aW9uU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgc2lnbmluS2V5RGF0YVNlcnZpY2U6IFNpZ25pbktleURhdGFTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGRhdGFTZXJ2aWNlOiBEYXRhU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSB1c2VyU2VydmljZTogVXNlclNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgc3RhdGVWYWxpZGF0aW9uU2VydmljZTogU3RhdGVWYWxpZGF0aW9uU2VydmljZVxuICAgICkge31cblxuICAgIHJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmF1dG9Vc2VyaW5mbykge1xuICAgICAgICAgICAgLy8gQ2xlYXIgdXNlciBkYXRhLiBGaXhlcyAjOTcuXG4gICAgICAgICAgICB0aGlzLnVzZXJTZXJ2aWNlLnJlc2V0VXNlckRhdGFJblN0b3JlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2UucmVzZXRTdG9yYWdlRmxvd0RhdGEoKTtcbiAgICAgICAgdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLnNldFVuYXV0aG9yaXplZEFuZEZpcmVFdmVudCgpO1xuICAgIH1cblxuICAgIHByb2Nlc3NDb2RlRmxvd0NhbGxiYWNrKHVybFRvQ2hlY2s6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5jb2RlRmxvd0NhbGxiYWNrKHVybFRvQ2hlY2spLnBpcGUoXG4gICAgICAgICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jb2RlRmxvd0NvZGVSZXF1ZXN0KGNhbGxiYWNrQ29udGV4dCkpLFxuICAgICAgICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY29kZUZsb3dTaWxlbnRSZW5ld0NoZWNrKGNhbGxiYWNrQ29udGV4dCkpLFxuICAgICAgICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tIaXN0b3J5QW5kUmVzZXRKd3RLZXlzKGNhbGxiYWNrQ29udGV4dCkpLFxuICAgICAgICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tTdGF0ZVZhbGlkYXRpb24oY2FsbGJhY2tDb250ZXh0KSksXG4gICAgICAgICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja1VzZXIoY2FsbGJhY2tDb250ZXh0KSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcm9jZXNzU2lsZW50UmVuZXdDb2RlRmxvd0NhbGxiYWNrKGZpcnN0Q29udGV4dDogQ2FsbGJhY2tDb250ZXh0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvZGVGbG93Q29kZVJlcXVlc3QoZmlyc3RDb250ZXh0KS5waXBlKFxuICAgICAgICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY29kZUZsb3dTaWxlbnRSZW5ld0NoZWNrKGNhbGxiYWNrQ29udGV4dCkpLFxuICAgICAgICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tIaXN0b3J5QW5kUmVzZXRKd3RLZXlzKGNhbGxiYWNrQ29udGV4dCkpLFxuICAgICAgICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tTdGF0ZVZhbGlkYXRpb24oY2FsbGJhY2tDb250ZXh0KSksXG4gICAgICAgICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja1VzZXIoY2FsbGJhY2tDb250ZXh0KSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcm9jZXNzSW1wbGljaXRGbG93Q2FsbGJhY2soaGFzaD86IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5pbXBsaWNpdEZsb3dDYWxsYmFjayhoYXNoKS5waXBlKFxuICAgICAgICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tIaXN0b3J5QW5kUmVzZXRKd3RLZXlzKGNhbGxiYWNrQ29udGV4dCkpLFxuICAgICAgICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tTdGF0ZVZhbGlkYXRpb24oY2FsbGJhY2tDb250ZXh0KSksXG4gICAgICAgICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja1VzZXIoY2FsbGJhY2tDb250ZXh0KSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcm9jZXNzUmVmcmVzaFRva2VuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWZyZXNoU2Vzc2lvbldpdGhSZWZyZXNoVG9rZW5zKCkucGlwZShcbiAgICAgICAgICAgIHN3aXRjaE1hcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB0aGlzLnJlZnJlc2hUb2tlbnNSZXF1ZXN0VG9rZW5zKGNhbGxiYWNrQ29udGV4dCkpLFxuICAgICAgICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY29kZUZsb3dTaWxlbnRSZW5ld0NoZWNrKGNhbGxiYWNrQ29udGV4dCkpLFxuICAgICAgICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tIaXN0b3J5QW5kUmVzZXRKd3RLZXlzKGNhbGxiYWNrQ29udGV4dCkpLFxuICAgICAgICAgICAgc3dpdGNoTWFwKChjYWxsYmFja0NvbnRleHQpID0+IHRoaXMuY2FsbGJhY2tTdGF0ZVZhbGlkYXRpb24oY2FsbGJhY2tDb250ZXh0KSksXG4gICAgICAgICAgICBzd2l0Y2hNYXAoKGNhbGxiYWNrQ29udGV4dCkgPT4gdGhpcy5jYWxsYmFja1VzZXIoY2FsbGJhY2tDb250ZXh0KSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBTVEVQIDEgQ29kZSBGbG93XG4gICAgcHJpdmF0ZSBjb2RlRmxvd0NhbGxiYWNrKHVybFRvQ2hlY2s6IHN0cmluZyk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XG4gICAgICAgIGNvbnN0IGNvZGUgPSB0aGlzLnVybFNlcnZpY2UuZ2V0VXJsUGFyYW1ldGVyKHVybFRvQ2hlY2ssICdjb2RlJyk7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy51cmxTZXJ2aWNlLmdldFVybFBhcmFtZXRlcih1cmxUb0NoZWNrLCAnc3RhdGUnKTtcbiAgICAgICAgY29uc3Qgc2Vzc2lvblN0YXRlID0gdGhpcy51cmxTZXJ2aWNlLmdldFVybFBhcmFtZXRlcih1cmxUb0NoZWNrLCAnc2Vzc2lvbl9zdGF0ZScpIHx8IG51bGw7XG5cbiAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdubyBzdGF0ZSBpbiB1cmwnKTtcbiAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdubyBzdGF0ZSBpbiB1cmwnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvZGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zygnbm8gY29kZSBpbiB1cmwnKTtcbiAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdubyBjb2RlIGluIHVybCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygncnVubmluZyB2YWxpZGF0aW9uIGZvciBjYWxsYmFjaycgKyB1cmxUb0NoZWNrKTtcblxuICAgICAgICBjb25zdCBpbml0aWFsQ2FsbGJhY2tDb250ZXh0ID0ge1xuICAgICAgICAgICAgY29kZSxcbiAgICAgICAgICAgIHJlZnJlc2hUb2tlbjogbnVsbCxcbiAgICAgICAgICAgIHN0YXRlLFxuICAgICAgICAgICAgc2Vzc2lvblN0YXRlLFxuICAgICAgICAgICAgYXV0aFJlc3VsdDogbnVsbCxcbiAgICAgICAgICAgIGlzUmVuZXdQcm9jZXNzOiBmYWxzZSxcbiAgICAgICAgICAgIGp3dEtleXM6IG51bGwsXG4gICAgICAgICAgICB2YWxpZGF0aW9uUmVzdWx0OiBudWxsLFxuICAgICAgICAgICAgZXhpc3RpbmdJZFRva2VuOiBudWxsLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gb2YoaW5pdGlhbENhbGxiYWNrQ29udGV4dCk7XG4gICAgfVxuXG4gICAgLy8gU1RFUCAxIEltcGxpY2l0IEZsb3dcbiAgICBwcml2YXRlIGltcGxpY2l0Rmxvd0NhbGxiYWNrKGhhc2g/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xuICAgICAgICBjb25zdCBpc1JlbmV3UHJvY2Vzc0RhdGEgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuaXNTaWxlbnRSZW5ld1J1bm5pbmcoKTtcblxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ0JFR0lOIGF1dGhvcml6ZWRDYWxsYmFjaywgbm8gYXV0aCBkYXRhJyk7XG4gICAgICAgIGlmICghaXNSZW5ld1Byb2Nlc3NEYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGhhc2ggPSBoYXNoIHx8IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigxKTtcblxuICAgICAgICBjb25zdCBhdXRoUmVzdWx0OiBhbnkgPSBoYXNoLnNwbGl0KCcmJykucmVkdWNlKChyZXN1bHREYXRhOiBhbnksIGl0ZW06IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGFydHMgPSBpdGVtLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgICByZXN1bHREYXRhW3BhcnRzLnNoaWZ0KCkgYXMgc3RyaW5nXSA9IHBhcnRzLmpvaW4oJz0nKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHREYXRhO1xuICAgICAgICB9LCB7fSk7XG5cbiAgICAgICAgY29uc3QgY2FsbGJhY2tDb250ZXh0ID0ge1xuICAgICAgICAgICAgY29kZTogbnVsbCxcbiAgICAgICAgICAgIHJlZnJlc2hUb2tlbjogbnVsbCxcbiAgICAgICAgICAgIHN0YXRlOiBudWxsLFxuICAgICAgICAgICAgc2Vzc2lvblN0YXRlOiBudWxsLFxuICAgICAgICAgICAgYXV0aFJlc3VsdCxcbiAgICAgICAgICAgIGlzUmVuZXdQcm9jZXNzOiBpc1JlbmV3UHJvY2Vzc0RhdGEsXG4gICAgICAgICAgICBqd3RLZXlzOiBudWxsLFxuICAgICAgICAgICAgdmFsaWRhdGlvblJlc3VsdDogbnVsbCxcbiAgICAgICAgICAgIGV4aXN0aW5nSWRUb2tlbjogbnVsbCxcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcbiAgICB9XG5cbiAgICAvLyBTVEVQIDEgUmVmcmVzaCBzZXNzaW9uXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvbldpdGhSZWZyZXNoVG9rZW5zKCk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XG4gICAgICAgIGNvbnN0IHN0YXRlRGF0YSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRFeGlzdGluZ09yQ3JlYXRlQXV0aFN0YXRlQ29udHJvbCgpO1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1JlZnJlc2hTZXNzaW9uIGNyZWF0ZWQuIGFkZGluZyBteWF1dG9zdGF0ZTogJyArIHN0YXRlRGF0YSk7XG4gICAgICAgIGNvbnN0IHJlZnJlc2hUb2tlbiA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRSZWZyZXNoVG9rZW4oKTtcbiAgICAgICAgY29uc3QgaWRUb2tlbiA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRJZFRva2VuKCk7XG4gICAgICAgIC8vIFRPRE8gYWRkIGlkX3Rva2VuIGRhdGFcblxuICAgICAgICBpZiAocmVmcmVzaFRva2VuKSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFja0NvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgY29kZTogbnVsbCxcbiAgICAgICAgICAgICAgICByZWZyZXNoVG9rZW4sXG4gICAgICAgICAgICAgICAgc3RhdGU6IHN0YXRlRGF0YSxcbiAgICAgICAgICAgICAgICBzZXNzaW9uU3RhdGU6IG51bGwsXG4gICAgICAgICAgICAgICAgYXV0aFJlc3VsdDogbnVsbCxcbiAgICAgICAgICAgICAgICBpc1JlbmV3UHJvY2VzczogZmFsc2UsXG4gICAgICAgICAgICAgICAgand0S2V5czogbnVsbCxcbiAgICAgICAgICAgICAgICB2YWxpZGF0aW9uUmVzdWx0OiBudWxsLFxuICAgICAgICAgICAgICAgIGV4aXN0aW5nSWRUb2tlbjogaWRUb2tlbixcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnZm91bmQgcmVmcmVzaCBjb2RlLCBvYnRhaW5pbmcgbmV3IGNyZWRlbnRpYWxzIHdpdGggcmVmcmVzaCBjb2RlJyk7XG4gICAgICAgICAgICAvLyBOb25jZSBpcyBub3QgdXNlZCB3aXRoIHJlZnJlc2ggdG9rZW5zOyBidXQgS2V5Y2xvYWsgbWF5IHNlbmQgaXQgYW55d2F5XG4gICAgICAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2Uuc2V0Tm9uY2UoVG9rZW5WYWxpZGF0aW9uU2VydmljZS5SZWZyZXNoVG9rZW5Ob25jZVBsYWNlaG9sZGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSAnbm8gcmVmcmVzaCB0b2tlbiBmb3VuZCwgcGxlYXNlIGxvZ2luJztcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNURVAgMiBSZWZyZXNoIFRva2VuXG4gICAgcHJpdmF0ZSByZWZyZXNoVG9rZW5zUmVxdWVzdFRva2VucyhjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XG4gICAgICAgIGxldCBoZWFkZXJzOiBIdHRwSGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycygpO1xuICAgICAgICBoZWFkZXJzID0gaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcblxuICAgICAgICBjb25zdCB0b2tlblJlcXVlc3RVcmwgPSB0aGlzLmdldFRva2VuRW5kcG9pbnQoKTtcbiAgICAgICAgaWYgKCF0b2tlblJlcXVlc3RVcmwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdUb2tlbiBFbmRwb2ludCBub3QgZGVmaW5lZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMudXJsU2VydmljZS5jcmVhdGVCb2R5Rm9yQ29kZUZsb3dSZWZyZXNoVG9rZW5zUmVxdWVzdChjYWxsYmFja0NvbnRleHQucmVmcmVzaFRva2VuKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhU2VydmljZS5wb3N0KHRva2VuUmVxdWVzdFVybCwgZGF0YSwgaGVhZGVycykucGlwZShcbiAgICAgICAgICAgIHN3aXRjaE1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygndG9rZW4gcmVmcmVzaCByZXNwb25zZTogJywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIGxldCBhdXRoUmVzdWx0OiBhbnkgPSBuZXcgT2JqZWN0KCk7XG4gICAgICAgICAgICAgICAgYXV0aFJlc3VsdCA9IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIGF1dGhSZXN1bHQuc3RhdGUgPSBjYWxsYmFja0NvbnRleHQuc3RhdGU7XG5cbiAgICAgICAgICAgICAgICBjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdCA9IGF1dGhSZXN1bHQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYE9pZGNTZXJ2aWNlIGNvZGUgcmVxdWVzdCAke3RoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc3RzU2VydmVyfTogJHtlcnJvcn1gO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIFNURVAgMiBDb2RlIEZsb3cgLy8gIENvZGUgRmxvdyBTaWxlbnQgUmVuZXcgc3RhcnRzIGhlcmVcbiAgICBwcml2YXRlIGNvZGVGbG93Q29kZVJlcXVlc3QoY2FsbGJhY2tDb250ZXh0OiBDYWxsYmFja0NvbnRleHQpOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xuICAgICAgICBjb25zdCBpc1N0YXRlQ29ycmVjdCA9IHRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZVN0YXRlRnJvbUhhc2hDYWxsYmFjayhcbiAgICAgICAgICAgIGNhbGxiYWNrQ29udGV4dC5zdGF0ZSxcbiAgICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRBdXRoU3RhdGVDb250cm9sKClcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoIWlzU3RhdGVDb3JyZWN0KSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnY29kZUZsb3dDb2RlUmVxdWVzdCBpbmNvcnJlY3Qgc3RhdGUnKTtcbiAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdjb2RlRmxvd0NvZGVSZXF1ZXN0IGluY29ycmVjdCBzdGF0ZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdG9rZW5SZXF1ZXN0VXJsID0gdGhpcy5nZXRUb2tlbkVuZHBvaW50KCk7XG4gICAgICAgIGlmICghdG9rZW5SZXF1ZXN0VXJsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcignVG9rZW4gRW5kcG9pbnQgbm90IGRlZmluZWQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBoZWFkZXJzOiBIdHRwSGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycygpO1xuICAgICAgICBoZWFkZXJzID0gaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcblxuICAgICAgICBjb25zdCBib2R5Rm9yQ29kZUZsb3cgPSB0aGlzLnVybFNlcnZpY2UuY3JlYXRlQm9keUZvckNvZGVGbG93Q29kZVJlcXVlc3QoY2FsbGJhY2tDb250ZXh0LmNvZGUpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFTZXJ2aWNlLnBvc3QodG9rZW5SZXF1ZXN0VXJsLCBib2R5Rm9yQ29kZUZsb3csIGhlYWRlcnMpLnBpcGUoXG4gICAgICAgICAgICBzd2l0Y2hNYXAoKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGF1dGhSZXN1bHQ6IGFueSA9IG5ldyBPYmplY3QoKTtcbiAgICAgICAgICAgICAgICBhdXRoUmVzdWx0ID0gcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgYXV0aFJlc3VsdC5zdGF0ZSA9IGNhbGxiYWNrQ29udGV4dC5zdGF0ZTtcbiAgICAgICAgICAgICAgICBhdXRoUmVzdWx0LnNlc3Npb25fc3RhdGUgPSBjYWxsYmFja0NvbnRleHQuc2Vzc2lvblN0YXRlO1xuXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQgPSBhdXRoUmVzdWx0O1xuICAgICAgICAgICAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBPaWRjU2VydmljZSBjb2RlIHJlcXVlc3QgJHt0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnN0c1NlcnZlcn0gd2l0aCBlcnJvciAke2Vycm9yfWA7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gU1RFUCAzIENvZGUgRmxvdywgU1RFUCAzIFJlZnJlc2ggVG9rZW5cbiAgICBwcml2YXRlIGNvZGVGbG93U2lsZW50UmVuZXdDaGVjayhjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XG4gICAgICAgIGNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2VzcyA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5pc1NpbGVudFJlbmV3UnVubmluZygpO1xuXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQkVHSU4gYXV0aG9yaXplZCBDb2RlIEZsb3cgQ2FsbGJhY2ssIG5vIGF1dGggZGF0YScpO1xuICAgICAgICBpZiAoIWNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcbiAgICB9XG5cbiAgICAvLyBTVEVQIDQgQ29kZSBGbG93LCBTVEVQIDIgSW1wbGljaXQgRmxvdywgU1RFUCA0IFJlZnJlc2ggVG9rZW5cbiAgICBwcml2YXRlIGNhbGxiYWNrSGlzdG9yeUFuZFJlc2V0Snd0S2V5cyhjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XG4gICAgICAgIHRoaXMuYXV0aFN0YXRlU2VydmljZS5zZXRBdXRoUmVzdWx0SW5TdG9yYWdlKGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0KTtcblxuICAgICAgICBpZiAodGhpcy5oaXN0b3J5Q2xlYW5VcFR1cm5lZE9uKCkgJiYgIWNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcykge1xuICAgICAgICAgICAgdGhpcy5yZXNldEJyb3dzZXJIaXN0b3J5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2hpc3RvcnkgY2xlYW4gdXAgaW5hY3RpdmUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdC5lcnJvcikge1xuICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYGF1dGhvcml6ZWRDYWxsYmFja1Byb2NlZHVyZSBjYW1lIHdpdGggZXJyb3I6ICR7Y2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuZXJyb3J9YDtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhpcy5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XG4gICAgICAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2Uuc2V0Tm9uY2UoJycpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVSZXN1bHRFcnJvckZyb21DYWxsYmFjayhjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdCwgY2FsbGJhY2tDb250ZXh0LmlzUmVuZXdQcm9jZXNzKTtcbiAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQpO1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2F1dGhvcml6ZWRDYWxsYmFjayBjcmVhdGVkLCBiZWdpbiB0b2tlbiB2YWxpZGF0aW9uJyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuc2lnbmluS2V5RGF0YVNlcnZpY2UuZ2V0U2lnbmluZ0tleXMoKS5waXBlKFxuICAgICAgICAgICAgc3dpdGNoTWFwKChqd3RLZXlzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGp3dEtleXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tDb250ZXh0Lmp3dEtleXMgPSBqd3RLZXlzO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBGYWlsZWQgdG8gcmV0cmlldmUgc2lnbmluZyBrZXlgO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY2F0Y2hFcnJvcigoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEZhaWxlZCB0byByZXRyaWV2ZSBzaWduaW5nIGtleSB3aXRoIGVycm9yOiAke2Vycn1gO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gU1RFUCA1IEFsbCBmbG93c1xuICAgIHByaXZhdGUgY2FsbGJhY2tTdGF0ZVZhbGlkYXRpb24oY2FsbGJhY2tDb250ZXh0OiBDYWxsYmFja0NvbnRleHQpOiBPYnNlcnZhYmxlPENhbGxiYWNrQ29udGV4dD4ge1xuICAgICAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdGhpcy5zdGF0ZVZhbGlkYXRpb25TZXJ2aWNlLmdldFZhbGlkYXRlZFN0YXRlUmVzdWx0KGNhbGxiYWNrQ29udGV4dCk7XG4gICAgICAgIGNhbGxiYWNrQ29udGV4dC52YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGlvblJlc3VsdDtcblxuICAgICAgICBpZiAodmFsaWRhdGlvblJlc3VsdC5hdXRoUmVzcG9uc2VJc1ZhbGlkKSB7XG4gICAgICAgICAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2Uuc2V0QXV0aG9yaXphdGlvbkRhdGEodmFsaWRhdGlvblJlc3VsdC5hY2Nlc3NUb2tlbiwgdmFsaWRhdGlvblJlc3VsdC5pZFRva2VuKTtcblxuICAgICAgICAgICAgcmV0dXJuIG9mKGNhbGxiYWNrQ29udGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgYXV0aG9yaXplZENhbGxiYWNrLCB0b2tlbihzKSB2YWxpZGF0aW9uIGZhaWxlZCwgcmVzZXR0aW5nLiBIYXNoOiAke3dpbmRvdy5sb2NhdGlvbi5oYXNofWA7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhpcy5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XG4gICAgICAgICAgICB0aGlzLnB1Ymxpc2hVbmF1dGhvcml6ZWRTdGF0ZShjYWxsYmFja0NvbnRleHQudmFsaWRhdGlvblJlc3VsdCwgY2FsbGJhY2tDb250ZXh0LmlzUmVuZXdQcm9jZXNzKTtcbiAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTVEVQIDYgdXNlckRhdGFcbiAgICBwcml2YXRlIGNhbGxiYWNrVXNlcihjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCk6IE9ic2VydmFibGU8Q2FsbGJhY2tDb250ZXh0PiB7XG4gICAgICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5hdXRvVXNlcmluZm8pIHtcbiAgICAgICAgICAgIGlmICghY2FsbGJhY2tDb250ZXh0LmlzUmVuZXdQcm9jZXNzKSB7XG4gICAgICAgICAgICAgICAgLy8gdXNlckRhdGEgaXMgc2V0IHRvIHRoZSBpZF90b2tlbiBkZWNvZGVkLCBhdXRvIGdldCB1c2VyIGRhdGEgc2V0IHRvIGZhbHNlXG4gICAgICAgICAgICAgICAgdGhpcy51c2VyU2VydmljZS5zZXRVc2VyRGF0YVRvU3RvcmUoY2FsbGJhY2tDb250ZXh0LnZhbGlkYXRpb25SZXN1bHQuZGVjb2RlZElkVG9rZW4pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnB1Ymxpc2hBdXRob3JpemVkU3RhdGUoY2FsbGJhY2tDb250ZXh0LnZhbGlkYXRpb25SZXN1bHQsIGNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gb2YoY2FsbGJhY2tDb250ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLnVzZXJTZXJ2aWNlXG4gICAgICAgICAgICAuZ2V0QW5kUGVyc2lzdFVzZXJEYXRhSW5TdG9yZShcbiAgICAgICAgICAgICAgICBjYWxsYmFja0NvbnRleHQuaXNSZW5ld1Byb2Nlc3MsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tDb250ZXh0LnZhbGlkYXRpb25SZXN1bHQuaWRUb2tlbixcbiAgICAgICAgICAgICAgICBjYWxsYmFja0NvbnRleHQudmFsaWRhdGlvblJlc3VsdC5kZWNvZGVkSWRUb2tlblxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgc3dpdGNoTWFwKCh1c2VyRGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoISF1c2VyRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldFNlc3Npb25TdGF0ZShjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdC5zZXNzaW9uX3N0YXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHVibGlzaEF1dGhvcml6ZWRTdGF0ZShjYWxsYmFja0NvbnRleHQudmFsaWRhdGlvblJlc3VsdCwgY2FsbGJhY2tDb250ZXh0LmlzUmVuZXdQcm9jZXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvZihjYWxsYmFja0NvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnB1Ymxpc2hVbmF1dGhvcml6ZWRTdGF0ZShjYWxsYmFja0NvbnRleHQudmFsaWRhdGlvblJlc3VsdCwgY2FsbGJhY2tDb250ZXh0LmlzUmVuZXdQcm9jZXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBDYWxsZWQgZm9yIHVzZXJEYXRhIGJ1dCB0aGV5IHdlcmUgJHt1c2VyRGF0YX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICBjYXRjaEVycm9yKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYEZhaWxlZCB0byByZXRyZWl2ZSB1c2VyIGluZm8gd2l0aCBlcnJvcjogICR7ZXJyfWA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwdWJsaXNoQXV0aG9yaXplZFN0YXRlKHN0YXRlVmFsaWRhdGlvblJlc3VsdDogU3RhdGVWYWxpZGF0aW9uUmVzdWx0LCBpc1JlbmV3UHJvY2VzczogYm9vbGVhbikge1xuICAgICAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UudXBkYXRlQW5kUHVibGlzaEF1dGhTdGF0ZSh7XG4gICAgICAgICAgICBhdXRob3JpemF0aW9uU3RhdGU6IEF1dGhvcml6ZWRTdGF0ZS5BdXRob3JpemVkLFxuICAgICAgICAgICAgdmFsaWRhdGlvblJlc3VsdDogc3RhdGVWYWxpZGF0aW9uUmVzdWx0LnN0YXRlLFxuICAgICAgICAgICAgaXNSZW5ld1Byb2Nlc3MsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcHVibGlzaFVuYXV0aG9yaXplZFN0YXRlKHN0YXRlVmFsaWRhdGlvblJlc3VsdDogU3RhdGVWYWxpZGF0aW9uUmVzdWx0LCBpc1JlbmV3UHJvY2VzczogYm9vbGVhbikge1xuICAgICAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UudXBkYXRlQW5kUHVibGlzaEF1dGhTdGF0ZSh7XG4gICAgICAgICAgICBhdXRob3JpemF0aW9uU3RhdGU6IEF1dGhvcml6ZWRTdGF0ZS5VbmF1dGhvcml6ZWQsXG4gICAgICAgICAgICB2YWxpZGF0aW9uUmVzdWx0OiBzdGF0ZVZhbGlkYXRpb25SZXN1bHQuc3RhdGUsXG4gICAgICAgICAgICBpc1JlbmV3UHJvY2VzcyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVSZXN1bHRFcnJvckZyb21DYWxsYmFjayhyZXN1bHQ6IGFueSwgaXNSZW5ld1Byb2Nlc3M6IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IHZhbGlkYXRpb25SZXN1bHQgPSBWYWxpZGF0aW9uUmVzdWx0LlNlY3VyZVRva2VuU2VydmVyRXJyb3I7XG5cbiAgICAgICAgaWYgKChyZXN1bHQuZXJyb3IgYXMgc3RyaW5nKSA9PT0gJ2xvZ2luX3JlcXVpcmVkJykge1xuICAgICAgICAgICAgdmFsaWRhdGlvblJlc3VsdCA9IFZhbGlkYXRpb25SZXN1bHQuTG9naW5SZXF1aXJlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYXV0aFN0YXRlU2VydmljZS51cGRhdGVBbmRQdWJsaXNoQXV0aFN0YXRlKHtcbiAgICAgICAgICAgIGF1dGhvcml6YXRpb25TdGF0ZTogQXV0aG9yaXplZFN0YXRlLlVuYXV0aG9yaXplZCxcbiAgICAgICAgICAgIHZhbGlkYXRpb25SZXN1bHQsXG4gICAgICAgICAgICBpc1JlbmV3UHJvY2VzcyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRUb2tlbkVuZHBvaW50KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci53ZWxsS25vd25FbmRwb2ludHM/LnRva2VuRW5kcG9pbnQgfHwgbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhpc3RvcnlDbGVhblVwVHVybmVkT24oKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5oaXN0b3J5Q2xlYW51cE9mZjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2V0QnJvd3Nlckhpc3RvcnkoKSB7XG4gICAgICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgd2luZG93LmRvY3VtZW50LnRpdGxlLCB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgICB9XG59XG4iXX0=