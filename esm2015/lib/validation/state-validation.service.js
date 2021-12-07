import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { TokenHelperService } from '../utils/tokenHelper/oidc-token-helper.service';
import { StateValidationResult } from './state-validation-result';
import { TokenValidationService } from './token-validation.service';
import { ValidationResult } from './validation-result';
let StateValidationService = class StateValidationService {
    constructor(storagePersistanceService, tokenValidationService, tokenHelperService, loggerService, configurationProvider, flowHelper) {
        this.storagePersistanceService = storagePersistanceService;
        this.tokenValidationService = tokenValidationService;
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.flowHelper = flowHelper;
    }
    getValidatedStateResult(callbackContext) {
        if (callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult.error) {
            return new StateValidationResult('', '', false, {});
        }
        return this.validateState(callbackContext);
    }
    isIdTokenAfterRefreshTokenRequestValid(callbackContext, newIdToken) {
        if (!this.configurationProvider.openIDConfiguration.useRefreshToken) {
            return true;
        }
        if (!callbackContext.existingIdToken) {
            return true;
        }
        const decodedIdToken = this.tokenHelperService.getPayloadFromToken(callbackContext.existingIdToken, false);
        // Upon successful validation of the Refresh Token, the response body is the Token Response of Section 3.1.3.3
        // except that it might not contain an id_token.
        // If an ID Token is returned as a result of a token refresh request, the following requirements apply:
        // its iss Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.iss !== newIdToken.iss) {
            this.loggerService.logDebug(`iss do not match: ${decodedIdToken.iss} ${newIdToken.iss}`);
            return false;
        }
        // its azp Claim Value MUST be the same as in the ID Token issued when the original authentication occurred;
        //   if no azp Claim was present in the original ID Token, one MUST NOT be present in the new ID Token, and
        // otherwise, the same rules apply as apply when issuing an ID Token at the time of the original authentication.
        if (decodedIdToken.azp !== newIdToken.azp) {
            this.loggerService.logDebug(`azp do not match: ${decodedIdToken.azp} ${newIdToken.azp}`);
            return false;
        }
        // its sub Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.sub !== newIdToken.sub) {
            this.loggerService.logDebug(`sub do not match: ${decodedIdToken.sub} ${newIdToken.sub}`);
            return false;
        }
        // its aud Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.aud !== newIdToken.aud) {
            this.loggerService.logDebug(`aud do not match: ${decodedIdToken.aud} ${newIdToken.aud}`);
            return false;
        }
        if (this.configurationProvider.openIDConfiguration.disableRefreshIdTokenAuthTimeValidation) {
            return true;
        }
        // its iat Claim MUST represent the time that the new ID Token is issued,
        // if the ID Token contains an auth_time Claim, its value MUST represent the time of the original authentication
        // - not the time that the new ID token is issued,
        if (decodedIdToken.auth_time !== newIdToken.auth_time) {
            this.loggerService.logDebug(`auth_time do not match: ${decodedIdToken.auth_time} ${newIdToken.auth_time}`);
            return false;
        }
        return true;
    }
    validateState(callbackContext) {
        const toReturn = new StateValidationResult();
        if (!this.tokenValidationService.validateStateFromHashCallback(callbackContext.authResult.state, this.storagePersistanceService.authStateControl)) {
            this.loggerService.logWarning('authorizedCallback incorrect state');
            toReturn.state = ValidationResult.StatesDoNotMatch;
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        const isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken();
        const isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
        if (isCurrentFlowImplicitFlowWithAccessToken || isCurrentFlowCodeFlow) {
            toReturn.accessToken = callbackContext.authResult.access_token;
        }
        if (callbackContext.authResult.id_token) {
            toReturn.idToken = callbackContext.authResult.id_token;
            toReturn.decodedIdToken = this.tokenHelperService.getPayloadFromToken(toReturn.idToken, false);
            if (!this.tokenValidationService.validateSignatureIdToken(toReturn.idToken, callbackContext.jwtKeys)) {
                this.loggerService.logDebug('authorizedCallback Signature validation failed id_token');
                toReturn.state = ValidationResult.SignatureFailed;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenNonce(toReturn.decodedIdToken, this.storagePersistanceService.authNonce, this.configurationProvider.openIDConfiguration.ignoreNonceAfterRefresh)) {
                this.loggerService.logWarning('authorizedCallback incorrect nonce');
                toReturn.state = ValidationResult.IncorrectNonce;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateRequiredIdToken(toReturn.decodedIdToken)) {
                this.loggerService.logDebug('authorizedCallback Validation, one of the REQUIRED properties missing from id_token');
                toReturn.state = ValidationResult.RequiredPropertyMissing;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenIatMaxOffset(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.maxIdTokenIatOffsetAllowedInSeconds, this.configurationProvider.openIDConfiguration.disableIatOffsetValidation)) {
                this.loggerService.logWarning('authorizedCallback Validation, iat rejected id_token was issued too far away from the current time');
                toReturn.state = ValidationResult.MaxOffsetExpired;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (this.configurationProvider.wellKnownEndpoints) {
                if (this.configurationProvider.openIDConfiguration.issValidationOff) {
                    this.loggerService.logDebug('iss validation is turned off, this is not recommended!');
                }
                else if (!this.configurationProvider.openIDConfiguration.issValidationOff &&
                    !this.tokenValidationService.validateIdTokenIss(toReturn.decodedIdToken, this.configurationProvider.wellKnownEndpoints.issuer)) {
                    this.loggerService.logWarning('authorizedCallback incorrect iss does not match authWellKnownEndpoints issuer');
                    toReturn.state = ValidationResult.IssDoesNotMatchIssuer;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
            }
            else {
                this.loggerService.logWarning('authWellKnownEndpoints is undefined');
                toReturn.state = ValidationResult.NoAuthWellKnownEndPoints;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAud(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.clientId)) {
                this.loggerService.logWarning('authorizedCallback incorrect aud');
                toReturn.state = ValidationResult.IncorrectAud;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAzpExistsIfMoreThanOneAud(toReturn.decodedIdToken)) {
                this.loggerService.logWarning('authorizedCallback missing azp');
                toReturn.state = ValidationResult.IncorrectAzp;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAzpValid(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.clientId)) {
                this.loggerService.logWarning('authorizedCallback incorrect azp');
                toReturn.state = ValidationResult.IncorrectAzp;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.isIdTokenAfterRefreshTokenRequestValid(callbackContext, toReturn.decodedIdToken)) {
                this.loggerService.logWarning('authorizedCallback pre, post id_token claims do not match in refresh');
                toReturn.state = ValidationResult.IncorrectIdTokenClaimsAfterRefresh;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenExpNotExpired(toReturn.decodedIdToken)) {
                this.loggerService.logWarning('authorizedCallback id token expired');
                toReturn.state = ValidationResult.TokenExpired;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
        }
        else {
            this.loggerService.logDebug('No id_token found, skipping id_token validation');
        }
        // flow id_token
        if (!isCurrentFlowImplicitFlowWithAccessToken && !isCurrentFlowCodeFlow) {
            toReturn.authResponseIsValid = true;
            toReturn.state = ValidationResult.Ok;
            this.handleSuccessfulValidation();
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        const idTokenHeader = this.tokenHelperService.getHeaderFromToken(toReturn.idToken, false);
        // The at_hash is optional for the code flow
        if (isCurrentFlowCodeFlow && !toReturn.decodedIdToken.at_hash) {
            this.loggerService.logDebug('Code Flow active, and no at_hash in the id_token, skipping check!');
        }
        else if (!this.tokenValidationService.validateIdTokenAtHash(toReturn.accessToken, toReturn.decodedIdToken.at_hash, isCurrentFlowCodeFlow, idTokenHeader.alg // 'RSA256'
        ) ||
            !toReturn.accessToken) {
            this.loggerService.logWarning('authorizedCallback incorrect at_hash');
            toReturn.state = ValidationResult.IncorrectAtHash;
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        toReturn.authResponseIsValid = true;
        toReturn.state = ValidationResult.Ok;
        this.handleSuccessfulValidation();
        return toReturn;
    }
    handleSuccessfulValidation() {
        this.storagePersistanceService.authNonce = '';
        if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
            this.storagePersistanceService.authStateControl = '';
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) validated, continue');
    }
    handleUnsuccessfulValidation() {
        this.storagePersistanceService.authNonce = '';
        if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
            this.storagePersistanceService.authStateControl = '';
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) invalid');
    }
};
StateValidationService.ctorParameters = () => [
    { type: StoragePersistanceService },
    { type: TokenValidationService },
    { type: TokenHelperService },
    { type: LoggerService },
    { type: ConfigurationProvider },
    { type: FlowHelper }
];
StateValidationService = __decorate([
    Injectable()
], StateValidationService);
export { StateValidationService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUtdmFsaWRhdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL3ZhbGlkYXRpb24vc3RhdGUtdmFsaWRhdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRWxFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNuRixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDckUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDcEYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDcEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFHdkQsSUFBYSxzQkFBc0IsR0FBbkMsTUFBYSxzQkFBc0I7SUFDL0IsWUFDWSx5QkFBb0QsRUFDcEQsc0JBQThDLEVBQzlDLGtCQUFzQyxFQUN0QyxhQUE0QixFQUNuQixxQkFBNEMsRUFDNUMsVUFBc0I7UUFML0IsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1FBQzlDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdEMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDbkIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxlQUFVLEdBQVYsVUFBVSxDQUFZO0lBQ3hDLENBQUM7SUFFSix1QkFBdUIsQ0FBQyxl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LENBQUM7WUFDcEMsT0FBTyxRQUFRLENBQUM7U0FDbkI7UUFFRCxRQUFRLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1FBQ3BDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1FBQ2xDLE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFTywwQkFBMEI7UUFDOUIsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFFOUMsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsaUNBQWlDLEVBQUU7WUFDbEYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztTQUN4RDtRQUNELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGlEQUFpRCxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVPLDRCQUE0QjtRQUNoQyxJQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUU5QyxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQyxpQ0FBaUMsRUFBRTtZQUNsRixJQUFJLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1NBQ3hEO1FBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMscUNBQXFDLENBQUMsQ0FBQztJQUN2RSxDQUFDO0NBQ0osQ0FBQTs7WUFwUTBDLHlCQUF5QjtZQUM1QixzQkFBc0I7WUFDMUIsa0JBQWtCO1lBQ3ZCLGFBQWE7WUFDSSxxQkFBcUI7WUFDaEMsVUFBVTs7QUFQbEMsc0JBQXNCO0lBRGxDLFVBQVUsRUFBRTtHQUNBLHNCQUFzQixDQXNRbEM7U0F0UVksc0JBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBDYWxsYmFja0NvbnRleHQgfSBmcm9tICcuLi9mbG93cy9jYWxsYmFjay1jb250ZXh0JztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcbmltcG9ydCB7IFRva2VuSGVscGVyU2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3Rva2VuSGVscGVyL29pZGMtdG9rZW4taGVscGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RhdGVWYWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnLi9zdGF0ZS12YWxpZGF0aW9uLXJlc3VsdCc7XG5pbXBvcnQgeyBUb2tlblZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi90b2tlbi12YWxpZGF0aW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4vdmFsaWRhdGlvbi1yZXN1bHQnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU3RhdGVWYWxpZGF0aW9uU2VydmljZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSB0b2tlblZhbGlkYXRpb25TZXJ2aWNlOiBUb2tlblZhbGlkYXRpb25TZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHRva2VuSGVscGVyU2VydmljZTogVG9rZW5IZWxwZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgZmxvd0hlbHBlcjogRmxvd0hlbHBlclxuICAgICkge31cblxuICAgIGdldFZhbGlkYXRlZFN0YXRlUmVzdWx0KGNhbGxiYWNrQ29udGV4dDogQ2FsbGJhY2tDb250ZXh0KTogU3RhdGVWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICAgICAgaWYgKGNhbGxiYWNrQ29udGV4dD8uYXV0aFJlc3VsdC5lcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBTdGF0ZVZhbGlkYXRpb25SZXN1bHQoJycsICcnLCBmYWxzZSwge30pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVTdGF0ZShjYWxsYmFja0NvbnRleHQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNJZFRva2VuQWZ0ZXJSZWZyZXNoVG9rZW5SZXF1ZXN0VmFsaWQoY2FsbGJhY2tDb250ZXh0OiBDYWxsYmFja0NvbnRleHQsIG5ld0lkVG9rZW46IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24udXNlUmVmcmVzaFRva2VuKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY2FsbGJhY2tDb250ZXh0LmV4aXN0aW5nSWRUb2tlbikge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGVjb2RlZElkVG9rZW4gPSB0aGlzLnRva2VuSGVscGVyU2VydmljZS5nZXRQYXlsb2FkRnJvbVRva2VuKGNhbGxiYWNrQ29udGV4dC5leGlzdGluZ0lkVG9rZW4sIGZhbHNlKTtcblxuICAgICAgICAvLyBVcG9uIHN1Y2Nlc3NmdWwgdmFsaWRhdGlvbiBvZiB0aGUgUmVmcmVzaCBUb2tlbiwgdGhlIHJlc3BvbnNlIGJvZHkgaXMgdGhlIFRva2VuIFJlc3BvbnNlIG9mIFNlY3Rpb24gMy4xLjMuM1xuICAgICAgICAvLyBleGNlcHQgdGhhdCBpdCBtaWdodCBub3QgY29udGFpbiBhbiBpZF90b2tlbi5cblxuICAgICAgICAvLyBJZiBhbiBJRCBUb2tlbiBpcyByZXR1cm5lZCBhcyBhIHJlc3VsdCBvZiBhIHRva2VuIHJlZnJlc2ggcmVxdWVzdCwgdGhlIGZvbGxvd2luZyByZXF1aXJlbWVudHMgYXBwbHk6XG5cbiAgICAgICAgLy8gaXRzIGlzcyBDbGFpbSBWYWx1ZSBNVVNUIGJlIHRoZSBzYW1lIGFzIGluIHRoZSBJRCBUb2tlbiBpc3N1ZWQgd2hlbiB0aGUgb3JpZ2luYWwgYXV0aGVudGljYXRpb24gb2NjdXJyZWQsXG4gICAgICAgIGlmIChkZWNvZGVkSWRUb2tlbi5pc3MgIT09IG5ld0lkVG9rZW4uaXNzKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGlzcyBkbyBub3QgbWF0Y2g6ICR7ZGVjb2RlZElkVG9rZW4uaXNzfSAke25ld0lkVG9rZW4uaXNzfWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGl0cyBhenAgQ2xhaW0gVmFsdWUgTVVTVCBiZSB0aGUgc2FtZSBhcyBpbiB0aGUgSUQgVG9rZW4gaXNzdWVkIHdoZW4gdGhlIG9yaWdpbmFsIGF1dGhlbnRpY2F0aW9uIG9jY3VycmVkO1xuICAgICAgICAvLyAgIGlmIG5vIGF6cCBDbGFpbSB3YXMgcHJlc2VudCBpbiB0aGUgb3JpZ2luYWwgSUQgVG9rZW4sIG9uZSBNVVNUIE5PVCBiZSBwcmVzZW50IGluIHRoZSBuZXcgSUQgVG9rZW4sIGFuZFxuICAgICAgICAvLyBvdGhlcndpc2UsIHRoZSBzYW1lIHJ1bGVzIGFwcGx5IGFzIGFwcGx5IHdoZW4gaXNzdWluZyBhbiBJRCBUb2tlbiBhdCB0aGUgdGltZSBvZiB0aGUgb3JpZ2luYWwgYXV0aGVudGljYXRpb24uXG4gICAgICAgIGlmIChkZWNvZGVkSWRUb2tlbi5henAgIT09IG5ld0lkVG9rZW4uYXpwKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGF6cCBkbyBub3QgbWF0Y2g6ICR7ZGVjb2RlZElkVG9rZW4uYXpwfSAke25ld0lkVG9rZW4uYXpwfWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGl0cyBzdWIgQ2xhaW0gVmFsdWUgTVVTVCBiZSB0aGUgc2FtZSBhcyBpbiB0aGUgSUQgVG9rZW4gaXNzdWVkIHdoZW4gdGhlIG9yaWdpbmFsIGF1dGhlbnRpY2F0aW9uIG9jY3VycmVkLFxuICAgICAgICBpZiAoZGVjb2RlZElkVG9rZW4uc3ViICE9PSBuZXdJZFRva2VuLnN1Yikge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBzdWIgZG8gbm90IG1hdGNoOiAke2RlY29kZWRJZFRva2VuLnN1Yn0gJHtuZXdJZFRva2VuLnN1Yn1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGl0cyBhdWQgQ2xhaW0gVmFsdWUgTVVTVCBiZSB0aGUgc2FtZSBhcyBpbiB0aGUgSUQgVG9rZW4gaXNzdWVkIHdoZW4gdGhlIG9yaWdpbmFsIGF1dGhlbnRpY2F0aW9uIG9jY3VycmVkLFxuICAgICAgICBpZiAoZGVjb2RlZElkVG9rZW4uYXVkICE9PSBuZXdJZFRva2VuLmF1ZCkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBhdWQgZG8gbm90IG1hdGNoOiAke2RlY29kZWRJZFRva2VuLmF1ZH0gJHtuZXdJZFRva2VuLmF1ZH1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmRpc2FibGVSZWZyZXNoSWRUb2tlbkF1dGhUaW1lVmFsaWRhdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpdHMgaWF0IENsYWltIE1VU1QgcmVwcmVzZW50IHRoZSB0aW1lIHRoYXQgdGhlIG5ldyBJRCBUb2tlbiBpcyBpc3N1ZWQsXG4gICAgICAgIC8vIGlmIHRoZSBJRCBUb2tlbiBjb250YWlucyBhbiBhdXRoX3RpbWUgQ2xhaW0sIGl0cyB2YWx1ZSBNVVNUIHJlcHJlc2VudCB0aGUgdGltZSBvZiB0aGUgb3JpZ2luYWwgYXV0aGVudGljYXRpb25cbiAgICAgICAgLy8gLSBub3QgdGhlIHRpbWUgdGhhdCB0aGUgbmV3IElEIHRva2VuIGlzIGlzc3VlZCxcbiAgICAgICAgaWYgKGRlY29kZWRJZFRva2VuLmF1dGhfdGltZSAhPT0gbmV3SWRUb2tlbi5hdXRoX3RpbWUpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgYXV0aF90aW1lIGRvIG5vdCBtYXRjaDogJHtkZWNvZGVkSWRUb2tlbi5hdXRoX3RpbWV9ICR7bmV3SWRUb2tlbi5hdXRoX3RpbWV9YCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZVN0YXRlKGNhbGxiYWNrQ29udGV4dCk6IFN0YXRlVmFsaWRhdGlvblJlc3VsdCB7XG4gICAgICAgIGNvbnN0IHRvUmV0dXJuID0gbmV3IFN0YXRlVmFsaWRhdGlvblJlc3VsdCgpO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlU3RhdGVGcm9tSGFzaENhbGxiYWNrKFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0LnN0YXRlLFxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5hdXRoU3RhdGVDb250cm9sXG4gICAgICAgICAgICApXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpbmNvcnJlY3Qgc3RhdGUnKTtcbiAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5TdGF0ZXNEb05vdE1hdGNoO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aEFjY2Vzc1Rva2VuID0gdGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4oKTtcbiAgICAgICAgY29uc3QgaXNDdXJyZW50Rmxvd0NvZGVGbG93ID0gdGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpO1xuXG4gICAgICAgIGlmIChpc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aEFjY2Vzc1Rva2VuIHx8IGlzQ3VycmVudEZsb3dDb2RlRmxvdykge1xuICAgICAgICAgICAgdG9SZXR1cm4uYWNjZXNzVG9rZW4gPSBjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdC5hY2Nlc3NfdG9rZW47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuaWRfdG9rZW4pIHtcbiAgICAgICAgICAgIHRvUmV0dXJuLmlkVG9rZW4gPSBjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdC5pZF90b2tlbjtcblxuICAgICAgICAgICAgdG9SZXR1cm4uZGVjb2RlZElkVG9rZW4gPSB0aGlzLnRva2VuSGVscGVyU2VydmljZS5nZXRQYXlsb2FkRnJvbVRva2VuKHRvUmV0dXJuLmlkVG9rZW4sIGZhbHNlKTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVTaWduYXR1cmVJZFRva2VuKHRvUmV0dXJuLmlkVG9rZW4sIGNhbGxiYWNrQ29udGV4dC5qd3RLZXlzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnYXV0aG9yaXplZENhbGxiYWNrIFNpZ25hdHVyZSB2YWxpZGF0aW9uIGZhaWxlZCBpZF90b2tlbicpO1xuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5TaWduYXR1cmVGYWlsZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5Ob25jZShcbiAgICAgICAgICAgICAgICAgICAgdG9SZXR1cm4uZGVjb2RlZElkVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5hdXRoTm9uY2UsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uaWdub3JlTm9uY2VBZnRlclJlZnJlc2hcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIGluY29ycmVjdCBub25jZScpO1xuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3ROb25jZTtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlUmVxdWlyZWRJZFRva2VuKHRvUmV0dXJuLmRlY29kZWRJZFRva2VuKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnYXV0aG9yaXplZENhbGxiYWNrIFZhbGlkYXRpb24sIG9uZSBvZiB0aGUgUkVRVUlSRUQgcHJvcGVydGllcyBtaXNzaW5nIGZyb20gaWRfdG9rZW4nKTtcbiAgICAgICAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuUmVxdWlyZWRQcm9wZXJ0eU1pc3Npbmc7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5JYXRNYXhPZmZzZXQoXG4gICAgICAgICAgICAgICAgICAgIHRvUmV0dXJuLmRlY29kZWRJZFRva2VuLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLm1heElkVG9rZW5JYXRPZmZzZXRBbGxvd2VkSW5TZWNvbmRzLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmRpc2FibGVJYXRPZmZzZXRWYWxpZGF0aW9uXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoXG4gICAgICAgICAgICAgICAgICAgICdhdXRob3JpemVkQ2FsbGJhY2sgVmFsaWRhdGlvbiwgaWF0IHJlamVjdGVkIGlkX3Rva2VuIHdhcyBpc3N1ZWQgdG9vIGZhciBhd2F5IGZyb20gdGhlIGN1cnJlbnQgdGltZSdcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5NYXhPZmZzZXRFeHBpcmVkO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmlzc1ZhbGlkYXRpb25PZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdpc3MgdmFsaWRhdGlvbiBpcyB0dXJuZWQgb2ZmLCB0aGlzIGlzIG5vdCByZWNvbW1lbmRlZCEnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICAhdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5pc3NWYWxpZGF0aW9uT2ZmICYmXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVJZFRva2VuSXNzKFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9SZXR1cm4uZGVjb2RlZElkVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci53ZWxsS25vd25FbmRwb2ludHMuaXNzdWVyXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpbmNvcnJlY3QgaXNzIGRvZXMgbm90IG1hdGNoIGF1dGhXZWxsS25vd25FbmRwb2ludHMgaXNzdWVyJyk7XG4gICAgICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5Jc3NEb2VzTm90TWF0Y2hJc3N1ZXI7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQnKTtcbiAgICAgICAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuTm9BdXRoV2VsbEtub3duRW5kUG9pbnRzO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVJZFRva2VuQXVkKFxuICAgICAgICAgICAgICAgICAgICB0b1JldHVybi5kZWNvZGVkSWRUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5jbGllbnRJZFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgaW5jb3JyZWN0IGF1ZCcpO1xuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3RBdWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5BenBFeGlzdHNJZk1vcmVUaGFuT25lQXVkKHRvUmV0dXJuLmRlY29kZWRJZFRva2VuKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgbWlzc2luZyBhenAnKTtcbiAgICAgICAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuSW5jb3JyZWN0QXpwO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVJZFRva2VuQXpwVmFsaWQoXG4gICAgICAgICAgICAgICAgICAgIHRvUmV0dXJuLmRlY29kZWRJZFRva2VuLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmNsaWVudElkXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpbmNvcnJlY3QgYXpwJyk7XG4gICAgICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LkluY29ycmVjdEF6cDtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5pc0lkVG9rZW5BZnRlclJlZnJlc2hUb2tlblJlcXVlc3RWYWxpZChjYWxsYmFja0NvbnRleHQsIHRvUmV0dXJuLmRlY29kZWRJZFRva2VuKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgcHJlLCBwb3N0IGlkX3Rva2VuIGNsYWltcyBkbyBub3QgbWF0Y2ggaW4gcmVmcmVzaCcpO1xuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3RJZFRva2VuQ2xhaW1zQWZ0ZXJSZWZyZXNoO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVJZFRva2VuRXhwTm90RXhwaXJlZCh0b1JldHVybi5kZWNvZGVkSWRUb2tlbikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIGlkIHRva2VuIGV4cGlyZWQnKTtcbiAgICAgICAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuVG9rZW5FeHBpcmVkO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnTm8gaWRfdG9rZW4gZm91bmQsIHNraXBwaW5nIGlkX3Rva2VuIHZhbGlkYXRpb24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZsb3cgaWRfdG9rZW5cbiAgICAgICAgaWYgKCFpc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aEFjY2Vzc1Rva2VuICYmICFpc0N1cnJlbnRGbG93Q29kZUZsb3cpIHtcbiAgICAgICAgICAgIHRvUmV0dXJuLmF1dGhSZXNwb25zZUlzVmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0Lk9rO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVTdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpZFRva2VuSGVhZGVyID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0SGVhZGVyRnJvbVRva2VuKHRvUmV0dXJuLmlkVG9rZW4sIGZhbHNlKTtcblxuICAgICAgICAvLyBUaGUgYXRfaGFzaCBpcyBvcHRpb25hbCBmb3IgdGhlIGNvZGUgZmxvd1xuICAgICAgICBpZiAoaXNDdXJyZW50Rmxvd0NvZGVGbG93ICYmICEodG9SZXR1cm4uZGVjb2RlZElkVG9rZW4uYXRfaGFzaCBhcyBzdHJpbmcpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ0NvZGUgRmxvdyBhY3RpdmUsIGFuZCBubyBhdF9oYXNoIGluIHRoZSBpZF90b2tlbiwgc2tpcHBpbmcgY2hlY2shJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAhdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlSWRUb2tlbkF0SGFzaChcbiAgICAgICAgICAgICAgICB0b1JldHVybi5hY2Nlc3NUb2tlbixcbiAgICAgICAgICAgICAgICB0b1JldHVybi5kZWNvZGVkSWRUb2tlbi5hdF9oYXNoLFxuICAgICAgICAgICAgICAgIGlzQ3VycmVudEZsb3dDb2RlRmxvdyxcbiAgICAgICAgICAgICAgICBpZFRva2VuSGVhZGVyLmFsZyAvLyAnUlNBMjU2J1xuICAgICAgICAgICAgKSB8fFxuICAgICAgICAgICAgIXRvUmV0dXJuLmFjY2Vzc1Rva2VuXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpbmNvcnJlY3QgYXRfaGFzaCcpO1xuICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LkluY29ycmVjdEF0SGFzaDtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdG9SZXR1cm4uYXV0aFJlc3BvbnNlSXNWYWxpZCA9IHRydWU7XG4gICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5PaztcbiAgICAgICAgdGhpcy5oYW5kbGVTdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xuICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVTdWNjZXNzZnVsVmFsaWRhdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmF1dGhOb25jZSA9ICcnO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmF1dG9DbGVhblN0YXRlQWZ0ZXJBdXRoZW50aWNhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmF1dGhTdGF0ZUNvbnRyb2wgPSAnJztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ0F1dGhvcml6ZWRDYWxsYmFjayB0b2tlbihzKSB2YWxpZGF0ZWQsIGNvbnRpbnVlJyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCkge1xuICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuYXV0aE5vbmNlID0gJyc7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uYXV0b0NsZWFuU3RhdGVBZnRlckF1dGhlbnRpY2F0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuYXV0aFN0YXRlQ29udHJvbCA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQXV0aG9yaXplZENhbGxiYWNrIHRva2VuKHMpIGludmFsaWQnKTtcbiAgICB9XG59XG4iXX0=