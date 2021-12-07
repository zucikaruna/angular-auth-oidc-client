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
var StateValidationService = /** @class */ (function () {
    function StateValidationService(storagePersistanceService, tokenValidationService, tokenHelperService, loggerService, configurationProvider, flowHelper) {
        this.storagePersistanceService = storagePersistanceService;
        this.tokenValidationService = tokenValidationService;
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.flowHelper = flowHelper;
    }
    StateValidationService.prototype.getValidatedStateResult = function (callbackContext) {
        if (callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult.error) {
            return new StateValidationResult('', '', false, {});
        }
        return this.validateState(callbackContext);
    };
    StateValidationService.prototype.isIdTokenAfterRefreshTokenRequestValid = function (callbackContext, newIdToken) {
        if (!this.configurationProvider.openIDConfiguration.useRefreshToken) {
            return true;
        }
        if (!callbackContext.existingIdToken) {
            return true;
        }
        var decodedIdToken = this.tokenHelperService.getPayloadFromToken(callbackContext.existingIdToken, false);
        // Upon successful validation of the Refresh Token, the response body is the Token Response of Section 3.1.3.3
        // except that it might not contain an id_token.
        // If an ID Token is returned as a result of a token refresh request, the following requirements apply:
        // its iss Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.iss !== newIdToken.iss) {
            this.loggerService.logDebug("iss do not match: " + decodedIdToken.iss + " " + newIdToken.iss);
            return false;
        }
        // its azp Claim Value MUST be the same as in the ID Token issued when the original authentication occurred;
        //   if no azp Claim was present in the original ID Token, one MUST NOT be present in the new ID Token, and
        // otherwise, the same rules apply as apply when issuing an ID Token at the time of the original authentication.
        if (decodedIdToken.azp !== newIdToken.azp) {
            this.loggerService.logDebug("azp do not match: " + decodedIdToken.azp + " " + newIdToken.azp);
            return false;
        }
        // its sub Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.sub !== newIdToken.sub) {
            this.loggerService.logDebug("sub do not match: " + decodedIdToken.sub + " " + newIdToken.sub);
            return false;
        }
        // its aud Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.aud !== newIdToken.aud) {
            this.loggerService.logDebug("aud do not match: " + decodedIdToken.aud + " " + newIdToken.aud);
            return false;
        }
        if (this.configurationProvider.openIDConfiguration.disableRefreshIdTokenAuthTimeValidation) {
            return true;
        }
        // its iat Claim MUST represent the time that the new ID Token is issued,
        // if the ID Token contains an auth_time Claim, its value MUST represent the time of the original authentication
        // - not the time that the new ID token is issued,
        if (decodedIdToken.auth_time !== newIdToken.auth_time) {
            this.loggerService.logDebug("auth_time do not match: " + decodedIdToken.auth_time + " " + newIdToken.auth_time);
            return false;
        }
        return true;
    };
    StateValidationService.prototype.validateState = function (callbackContext) {
        var toReturn = new StateValidationResult();
        if (!this.tokenValidationService.validateStateFromHashCallback(callbackContext.authResult.state, this.storagePersistanceService.authStateControl)) {
            this.loggerService.logWarning('authorizedCallback incorrect state');
            toReturn.state = ValidationResult.StatesDoNotMatch;
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        var isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken();
        var isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
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
        var idTokenHeader = this.tokenHelperService.getHeaderFromToken(toReturn.idToken, false);
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
    };
    StateValidationService.prototype.handleSuccessfulValidation = function () {
        this.storagePersistanceService.authNonce = '';
        if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
            this.storagePersistanceService.authStateControl = '';
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) validated, continue');
    };
    StateValidationService.prototype.handleUnsuccessfulValidation = function () {
        this.storagePersistanceService.authNonce = '';
        if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
            this.storagePersistanceService.authStateControl = '';
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) invalid');
    };
    StateValidationService.ctorParameters = function () { return [
        { type: StoragePersistanceService },
        { type: TokenValidationService },
        { type: TokenHelperService },
        { type: LoggerService },
        { type: ConfigurationProvider },
        { type: FlowHelper }
    ]; };
    StateValidationService = __decorate([
        Injectable()
    ], StateValidationService);
    return StateValidationService;
}());
export { StateValidationService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUtdmFsaWRhdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL3ZhbGlkYXRpb24vc3RhdGUtdmFsaWRhdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRWxFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNuRixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDckUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDcEYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDcEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFHdkQ7SUFDSSxnQ0FDWSx5QkFBb0QsRUFDcEQsc0JBQThDLEVBQzlDLGtCQUFzQyxFQUN0QyxhQUE0QixFQUNuQixxQkFBNEMsRUFDNUMsVUFBc0I7UUFML0IsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtRQUNwRCwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1FBQzlDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDdEMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDbkIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxlQUFVLEdBQVYsVUFBVSxDQUFZO0lBQ3hDLENBQUM7SUFFSix3REFBdUIsR0FBdkIsVUFBd0IsZUFBZ0M7UUFDcEQsSUFBSSxlQUFlLGFB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RUQsUUFBUSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztRQUNwQyxRQUFRLENBQUMsS0FBSyxHQUFHLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUNsQyxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRU8sMkRBQTBCLEdBQWxDO1FBQ0ksSUFBSSxDQUFDLHlCQUF5QixDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFFOUMsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsaUNBQWlDLEVBQUU7WUFDbEYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztTQUN4RDtRQUNELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGlEQUFpRCxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVPLDZEQUE0QixHQUFwQztRQUNJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBRTlDLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLGlDQUFpQyxFQUFFO1lBQ2xGLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7U0FDeEQ7UUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7O2dCQW5Rc0MseUJBQXlCO2dCQUM1QixzQkFBc0I7Z0JBQzFCLGtCQUFrQjtnQkFDdkIsYUFBYTtnQkFDSSxxQkFBcUI7Z0JBQ2hDLFVBQVU7O0lBUGxDLHNCQUFzQjtRQURsQyxVQUFVLEVBQUU7T0FDQSxzQkFBc0IsQ0FzUWxDO0lBQUQsNkJBQUM7Q0FBQSxBQXRRRCxJQXNRQztTQXRRWSxzQkFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IENhbGxiYWNrQ29udGV4dCB9IGZyb20gJy4uL2Zsb3dzL2NhbGxiYWNrLWNvbnRleHQnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuLi91dGlscy9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgVG9rZW5IZWxwZXJTZXJ2aWNlIH0gZnJvbSAnLi4vdXRpbHMvdG9rZW5IZWxwZXIvb2lkYy10b2tlbi1oZWxwZXIuc2VydmljZSc7XG5pbXBvcnQgeyBTdGF0ZVZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICcuL3N0YXRlLXZhbGlkYXRpb24tcmVzdWx0JztcbmltcG9ydCB7IFRva2VuVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuL3Rva2VuLXZhbGlkYXRpb24uc2VydmljZSc7XG5pbXBvcnQgeyBWYWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnLi92YWxpZGF0aW9uLXJlc3VsdCc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTdGF0ZVZhbGlkYXRpb25TZXJ2aWNlIHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHRva2VuVmFsaWRhdGlvblNlcnZpY2U6IFRva2VuVmFsaWRhdGlvblNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgdG9rZW5IZWxwZXJTZXJ2aWNlOiBUb2tlbkhlbHBlclNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBmbG93SGVscGVyOiBGbG93SGVscGVyXG4gICAgKSB7fVxuXG4gICAgZ2V0VmFsaWRhdGVkU3RhdGVSZXN1bHQoY2FsbGJhY2tDb250ZXh0OiBDYWxsYmFja0NvbnRleHQpOiBTdGF0ZVZhbGlkYXRpb25SZXN1bHQge1xuICAgICAgICBpZiAoY2FsbGJhY2tDb250ZXh0Py5hdXRoUmVzdWx0LmVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFN0YXRlVmFsaWRhdGlvblJlc3VsdCgnJywgJycsIGZhbHNlLCB7fSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZVN0YXRlKGNhbGxiYWNrQ29udGV4dCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0lkVG9rZW5BZnRlclJlZnJlc2hUb2tlblJlcXVlc3RWYWxpZChjYWxsYmFja0NvbnRleHQ6IENhbGxiYWNrQ29udGV4dCwgbmV3SWRUb2tlbjogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi51c2VSZWZyZXNoVG9rZW4pIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjYWxsYmFja0NvbnRleHQuZXhpc3RpbmdJZFRva2VuKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWNvZGVkSWRUb2tlbiA9IHRoaXMudG9rZW5IZWxwZXJTZXJ2aWNlLmdldFBheWxvYWRGcm9tVG9rZW4oY2FsbGJhY2tDb250ZXh0LmV4aXN0aW5nSWRUb2tlbiwgZmFsc2UpO1xuXG4gICAgICAgIC8vIFVwb24gc3VjY2Vzc2Z1bCB2YWxpZGF0aW9uIG9mIHRoZSBSZWZyZXNoIFRva2VuLCB0aGUgcmVzcG9uc2UgYm9keSBpcyB0aGUgVG9rZW4gUmVzcG9uc2Ugb2YgU2VjdGlvbiAzLjEuMy4zXG4gICAgICAgIC8vIGV4Y2VwdCB0aGF0IGl0IG1pZ2h0IG5vdCBjb250YWluIGFuIGlkX3Rva2VuLlxuXG4gICAgICAgIC8vIElmIGFuIElEIFRva2VuIGlzIHJldHVybmVkIGFzIGEgcmVzdWx0IG9mIGEgdG9rZW4gcmVmcmVzaCByZXF1ZXN0LCB0aGUgZm9sbG93aW5nIHJlcXVpcmVtZW50cyBhcHBseTpcblxuICAgICAgICAvLyBpdHMgaXNzIENsYWltIFZhbHVlIE1VU1QgYmUgdGhlIHNhbWUgYXMgaW4gdGhlIElEIFRva2VuIGlzc3VlZCB3aGVuIHRoZSBvcmlnaW5hbCBhdXRoZW50aWNhdGlvbiBvY2N1cnJlZCxcbiAgICAgICAgaWYgKGRlY29kZWRJZFRva2VuLmlzcyAhPT0gbmV3SWRUb2tlbi5pc3MpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgaXNzIGRvIG5vdCBtYXRjaDogJHtkZWNvZGVkSWRUb2tlbi5pc3N9ICR7bmV3SWRUb2tlbi5pc3N9YCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaXRzIGF6cCBDbGFpbSBWYWx1ZSBNVVNUIGJlIHRoZSBzYW1lIGFzIGluIHRoZSBJRCBUb2tlbiBpc3N1ZWQgd2hlbiB0aGUgb3JpZ2luYWwgYXV0aGVudGljYXRpb24gb2NjdXJyZWQ7XG4gICAgICAgIC8vICAgaWYgbm8gYXpwIENsYWltIHdhcyBwcmVzZW50IGluIHRoZSBvcmlnaW5hbCBJRCBUb2tlbiwgb25lIE1VU1QgTk9UIGJlIHByZXNlbnQgaW4gdGhlIG5ldyBJRCBUb2tlbiwgYW5kXG4gICAgICAgIC8vIG90aGVyd2lzZSwgdGhlIHNhbWUgcnVsZXMgYXBwbHkgYXMgYXBwbHkgd2hlbiBpc3N1aW5nIGFuIElEIFRva2VuIGF0IHRoZSB0aW1lIG9mIHRoZSBvcmlnaW5hbCBhdXRoZW50aWNhdGlvbi5cbiAgICAgICAgaWYgKGRlY29kZWRJZFRva2VuLmF6cCAhPT0gbmV3SWRUb2tlbi5henApIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgYXpwIGRvIG5vdCBtYXRjaDogJHtkZWNvZGVkSWRUb2tlbi5henB9ICR7bmV3SWRUb2tlbi5henB9YCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaXRzIHN1YiBDbGFpbSBWYWx1ZSBNVVNUIGJlIHRoZSBzYW1lIGFzIGluIHRoZSBJRCBUb2tlbiBpc3N1ZWQgd2hlbiB0aGUgb3JpZ2luYWwgYXV0aGVudGljYXRpb24gb2NjdXJyZWQsXG4gICAgICAgIGlmIChkZWNvZGVkSWRUb2tlbi5zdWIgIT09IG5ld0lkVG9rZW4uc3ViKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHN1YiBkbyBub3QgbWF0Y2g6ICR7ZGVjb2RlZElkVG9rZW4uc3VifSAke25ld0lkVG9rZW4uc3VifWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaXRzIGF1ZCBDbGFpbSBWYWx1ZSBNVVNUIGJlIHRoZSBzYW1lIGFzIGluIHRoZSBJRCBUb2tlbiBpc3N1ZWQgd2hlbiB0aGUgb3JpZ2luYWwgYXV0aGVudGljYXRpb24gb2NjdXJyZWQsXG4gICAgICAgIGlmIChkZWNvZGVkSWRUb2tlbi5hdWQgIT09IG5ld0lkVG9rZW4uYXVkKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGF1ZCBkbyBub3QgbWF0Y2g6ICR7ZGVjb2RlZElkVG9rZW4uYXVkfSAke25ld0lkVG9rZW4uYXVkfWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uZGlzYWJsZVJlZnJlc2hJZFRva2VuQXV0aFRpbWVWYWxpZGF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGl0cyBpYXQgQ2xhaW0gTVVTVCByZXByZXNlbnQgdGhlIHRpbWUgdGhhdCB0aGUgbmV3IElEIFRva2VuIGlzIGlzc3VlZCxcbiAgICAgICAgLy8gaWYgdGhlIElEIFRva2VuIGNvbnRhaW5zIGFuIGF1dGhfdGltZSBDbGFpbSwgaXRzIHZhbHVlIE1VU1QgcmVwcmVzZW50IHRoZSB0aW1lIG9mIHRoZSBvcmlnaW5hbCBhdXRoZW50aWNhdGlvblxuICAgICAgICAvLyAtIG5vdCB0aGUgdGltZSB0aGF0IHRoZSBuZXcgSUQgdG9rZW4gaXMgaXNzdWVkLFxuICAgICAgICBpZiAoZGVjb2RlZElkVG9rZW4uYXV0aF90aW1lICE9PSBuZXdJZFRva2VuLmF1dGhfdGltZSkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBhdXRoX3RpbWUgZG8gbm90IG1hdGNoOiAke2RlY29kZWRJZFRva2VuLmF1dGhfdGltZX0gJHtuZXdJZFRva2VuLmF1dGhfdGltZX1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHZhbGlkYXRlU3RhdGUoY2FsbGJhY2tDb250ZXh0KTogU3RhdGVWYWxpZGF0aW9uUmVzdWx0IHtcbiAgICAgICAgY29uc3QgdG9SZXR1cm4gPSBuZXcgU3RhdGVWYWxpZGF0aW9uUmVzdWx0KCk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVTdGF0ZUZyb21IYXNoQ2FsbGJhY2soXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tDb250ZXh0LmF1dGhSZXN1bHQuc3RhdGUsXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmF1dGhTdGF0ZUNvbnRyb2xcbiAgICAgICAgICAgIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIGluY29ycmVjdCBzdGF0ZScpO1xuICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LlN0YXRlc0RvTm90TWF0Y2g7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4gPSB0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0ltcGxpY2l0Rmxvd1dpdGhBY2Nlc3NUb2tlbigpO1xuICAgICAgICBjb25zdCBpc0N1cnJlbnRGbG93Q29kZUZsb3cgPSB0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCk7XG5cbiAgICAgICAgaWYgKGlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4gfHwgaXNDdXJyZW50Rmxvd0NvZGVGbG93KSB7XG4gICAgICAgICAgICB0b1JldHVybi5hY2Nlc3NUb2tlbiA9IGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0LmFjY2Vzc190b2tlbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFja0NvbnRleHQuYXV0aFJlc3VsdC5pZF90b2tlbikge1xuICAgICAgICAgICAgdG9SZXR1cm4uaWRUb2tlbiA9IGNhbGxiYWNrQ29udGV4dC5hdXRoUmVzdWx0LmlkX3Rva2VuO1xuXG4gICAgICAgICAgICB0b1JldHVybi5kZWNvZGVkSWRUb2tlbiA9IHRoaXMudG9rZW5IZWxwZXJTZXJ2aWNlLmdldFBheWxvYWRGcm9tVG9rZW4odG9SZXR1cm4uaWRUb2tlbiwgZmFsc2UpO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZVNpZ25hdHVyZUlkVG9rZW4odG9SZXR1cm4uaWRUb2tlbiwgY2FsbGJhY2tDb250ZXh0Lmp3dEtleXMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdhdXRob3JpemVkQ2FsbGJhY2sgU2lnbmF0dXJlIHZhbGlkYXRpb24gZmFpbGVkIGlkX3Rva2VuJyk7XG4gICAgICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LlNpZ25hdHVyZUZhaWxlZDtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAhdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlSWRUb2tlbk5vbmNlKFxuICAgICAgICAgICAgICAgICAgICB0b1JldHVybi5kZWNvZGVkSWRUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmF1dGhOb25jZSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5pZ25vcmVOb25jZUFmdGVyUmVmcmVzaFxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgaW5jb3JyZWN0IG5vbmNlJyk7XG4gICAgICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LkluY29ycmVjdE5vbmNlO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVSZXF1aXJlZElkVG9rZW4odG9SZXR1cm4uZGVjb2RlZElkVG9rZW4pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdhdXRob3JpemVkQ2FsbGJhY2sgVmFsaWRhdGlvbiwgb25lIG9mIHRoZSBSRVFVSVJFRCBwcm9wZXJ0aWVzIG1pc3NpbmcgZnJvbSBpZF90b2tlbicpO1xuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5SZXF1aXJlZFByb3BlcnR5TWlzc2luZztcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAhdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlSWRUb2tlbklhdE1heE9mZnNldChcbiAgICAgICAgICAgICAgICAgICAgdG9SZXR1cm4uZGVjb2RlZElkVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24ubWF4SWRUb2tlbklhdE9mZnNldEFsbG93ZWRJblNlY29uZHMsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uZGlzYWJsZUlhdE9mZnNldFZhbGlkYXRpb25cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhcbiAgICAgICAgICAgICAgICAgICAgJ2F1dGhvcml6ZWRDYWxsYmFjayBWYWxpZGF0aW9uLCBpYXQgcmVqZWN0ZWQgaWRfdG9rZW4gd2FzIGlzc3VlZCB0b28gZmFyIGF3YXkgZnJvbSB0aGUgY3VycmVudCB0aW1lJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0Lk1heE9mZnNldEV4cGlyZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIud2VsbEtub3duRW5kcG9pbnRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uaXNzVmFsaWRhdGlvbk9mZikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2lzcyB2YWxpZGF0aW9uIGlzIHR1cm5lZCBvZmYsIHRoaXMgaXMgbm90IHJlY29tbWVuZGVkIScpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgICAgICAgICF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmlzc1ZhbGlkYXRpb25PZmYgJiZcbiAgICAgICAgICAgICAgICAgICAgIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5Jc3MoXG4gICAgICAgICAgICAgICAgICAgICAgICB0b1JldHVybi5kZWNvZGVkSWRUb2tlbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cy5pc3N1ZXJcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIGluY29ycmVjdCBpc3MgZG9lcyBub3QgbWF0Y2ggYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpc3N1ZXInKTtcbiAgICAgICAgICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0Lklzc0RvZXNOb3RNYXRjaElzc3VlcjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzIHVuZGVmaW5lZCcpO1xuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5Ob0F1dGhXZWxsS25vd25FbmRQb2ludHM7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5BdWQoXG4gICAgICAgICAgICAgICAgICAgIHRvUmV0dXJuLmRlY29kZWRJZFRva2VuLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmNsaWVudElkXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpbmNvcnJlY3QgYXVkJyk7XG4gICAgICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LkluY29ycmVjdEF1ZDtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLnZhbGlkYXRlSWRUb2tlbkF6cEV4aXN0c0lmTW9yZVRoYW5PbmVBdWQodG9SZXR1cm4uZGVjb2RlZElkVG9rZW4pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBtaXNzaW5nIGF6cCcpO1xuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5JbmNvcnJlY3RBenA7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5BenBWYWxpZChcbiAgICAgICAgICAgICAgICAgICAgdG9SZXR1cm4uZGVjb2RlZElkVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uY2xpZW50SWRcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIGluY29ycmVjdCBhenAnKTtcbiAgICAgICAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuSW5jb3JyZWN0QXpwO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVW5zdWNjZXNzZnVsVmFsaWRhdGlvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzSWRUb2tlbkFmdGVyUmVmcmVzaFRva2VuUmVxdWVzdFZhbGlkKGNhbGxiYWNrQ29udGV4dCwgdG9SZXR1cm4uZGVjb2RlZElkVG9rZW4pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjayBwcmUsIHBvc3QgaWRfdG9rZW4gY2xhaW1zIGRvIG5vdCBtYXRjaCBpbiByZWZyZXNoJyk7XG4gICAgICAgICAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0LkluY29ycmVjdElkVG9rZW5DbGFpbXNBZnRlclJlZnJlc2g7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS52YWxpZGF0ZUlkVG9rZW5FeHBOb3RFeHBpcmVkKHRvUmV0dXJuLmRlY29kZWRJZFRva2VuKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2sgaWQgdG9rZW4gZXhwaXJlZCcpO1xuICAgICAgICAgICAgICAgIHRvUmV0dXJuLnN0YXRlID0gVmFsaWRhdGlvblJlc3VsdC5Ub2tlbkV4cGlyZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvUmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdObyBpZF90b2tlbiBmb3VuZCwgc2tpcHBpbmcgaWRfdG9rZW4gdmFsaWRhdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZmxvdyBpZF90b2tlblxuICAgICAgICBpZiAoIWlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4gJiYgIWlzQ3VycmVudEZsb3dDb2RlRmxvdykge1xuICAgICAgICAgICAgdG9SZXR1cm4uYXV0aFJlc3BvbnNlSXNWYWxpZCA9IHRydWU7XG4gICAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuT2s7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZVN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlkVG9rZW5IZWFkZXIgPSB0aGlzLnRva2VuSGVscGVyU2VydmljZS5nZXRIZWFkZXJGcm9tVG9rZW4odG9SZXR1cm4uaWRUb2tlbiwgZmFsc2UpO1xuXG4gICAgICAgIC8vIFRoZSBhdF9oYXNoIGlzIG9wdGlvbmFsIGZvciB0aGUgY29kZSBmbG93XG4gICAgICAgIGlmIChpc0N1cnJlbnRGbG93Q29kZUZsb3cgJiYgISh0b1JldHVybi5kZWNvZGVkSWRUb2tlbi5hdF9oYXNoIGFzIHN0cmluZykpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQ29kZSBGbG93IGFjdGl2ZSwgYW5kIG5vIGF0X2hhc2ggaW4gdGhlIGlkX3Rva2VuLCBza2lwcGluZyBjaGVjayEnKTtcbiAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICF0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UudmFsaWRhdGVJZFRva2VuQXRIYXNoKFxuICAgICAgICAgICAgICAgIHRvUmV0dXJuLmFjY2Vzc1Rva2VuLFxuICAgICAgICAgICAgICAgIHRvUmV0dXJuLmRlY29kZWRJZFRva2VuLmF0X2hhc2gsXG4gICAgICAgICAgICAgICAgaXNDdXJyZW50Rmxvd0NvZGVGbG93LFxuICAgICAgICAgICAgICAgIGlkVG9rZW5IZWFkZXIuYWxnIC8vICdSU0EyNTYnXG4gICAgICAgICAgICApIHx8XG4gICAgICAgICAgICAhdG9SZXR1cm4uYWNjZXNzVG9rZW5cbiAgICAgICAgKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrIGluY29ycmVjdCBhdF9oYXNoJyk7XG4gICAgICAgICAgICB0b1JldHVybi5zdGF0ZSA9IFZhbGlkYXRpb25SZXN1bHQuSW5jb3JyZWN0QXRIYXNoO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVVbnN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gdG9SZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0b1JldHVybi5hdXRoUmVzcG9uc2VJc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgdG9SZXR1cm4uc3RhdGUgPSBWYWxpZGF0aW9uUmVzdWx0Lk9rO1xuICAgICAgICB0aGlzLmhhbmRsZVN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCk7XG4gICAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhhbmRsZVN1Y2Nlc3NmdWxWYWxpZGF0aW9uKCkge1xuICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuYXV0aE5vbmNlID0gJyc7XG5cbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uYXV0b0NsZWFuU3RhdGVBZnRlckF1dGhlbnRpY2F0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuYXV0aFN0YXRlQ29udHJvbCA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQXV0aG9yaXplZENhbGxiYWNrIHRva2VuKHMpIHZhbGlkYXRlZCwgY29udGludWUnKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhhbmRsZVVuc3VjY2Vzc2Z1bFZhbGlkYXRpb24oKSB7XG4gICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5hdXRoTm9uY2UgPSAnJztcblxuICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5hdXRvQ2xlYW5TdGF0ZUFmdGVyQXV0aGVudGljYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5hdXRoU3RhdGVDb250cm9sID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdBdXRob3JpemVkQ2FsbGJhY2sgdG9rZW4ocykgaW52YWxpZCcpO1xuICAgIH1cbn1cbiJdfQ==