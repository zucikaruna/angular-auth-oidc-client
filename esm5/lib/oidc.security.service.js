import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthStateService } from './authState/auth-state.service';
import { CallbackService } from './callback/callback.service';
import { ConfigurationProvider } from './config/config.provider';
import { FlowsDataService } from './flows/flows-data.service';
import { FlowsService } from './flows/flows.service';
import { CheckSessionService } from './iframe/check-session.service';
import { SilentRenewService } from './iframe/silent-renew.service';
import { LoggerService } from './logging/logger.service';
import { LogoffRevocationService } from './logoffRevoke/logoff-revocation.service';
import { UserService } from './userData/user-service';
import { RedirectService } from './utils/redirect/redirect.service';
import { TokenHelperService } from './utils/tokenHelper/oidc-token-helper.service';
import { UrlService } from './utils/url/url.service';
import { TokenValidationService } from './validation/token-validation.service';
var OidcSecurityService = /** @class */ (function () {
    function OidcSecurityService(checkSessionService, silentRenewService, userService, tokenValidationService, tokenHelperService, loggerService, configurationProvider, urlService, authStateService, flowsDataService, flowsService, callbackService, logoffRevocationService, redirectService) {
        this.checkSessionService = checkSessionService;
        this.silentRenewService = silentRenewService;
        this.userService = userService;
        this.tokenValidationService = tokenValidationService;
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.urlService = urlService;
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
        this.flowsService = flowsService;
        this.callbackService = callbackService;
        this.logoffRevocationService = logoffRevocationService;
        this.redirectService = redirectService;
        this.TOKEN_REFRESH_INTERVALL_IN_SECONDS = 3;
    }
    Object.defineProperty(OidcSecurityService.prototype, "configuration", {
        get: function () {
            return this.configurationProvider.configuration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OidcSecurityService.prototype, "userData$", {
        get: function () {
            return this.userService.userData$;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OidcSecurityService.prototype, "isAuthenticated$", {
        get: function () {
            return this.authStateService.authorized$;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OidcSecurityService.prototype, "checkSessionChanged$", {
        get: function () {
            return this.checkSessionService.checkSessionChanged$;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OidcSecurityService.prototype, "stsCallback$", {
        get: function () {
            return this.callbackService.stsCallback$;
        },
        enumerable: true,
        configurable: true
    });
    OidcSecurityService.prototype.checkAuth = function () {
        var _this = this;
        if (!this.configurationProvider.hasValidConfig()) {
            this.loggerService.logError('Please provide a configuration before setting up the module');
            return of(false);
        }
        this.loggerService.logDebug('STS server: ' + this.configurationProvider.openIDConfiguration.stsServer);
        var currentUrl = window.location.toString();
        return this.callbackService.handlePossibleStsCallback(currentUrl).pipe(map(function () {
            var isAuthenticated = _this.authStateService.areAuthStorageTokensValid();
            if (isAuthenticated) {
                _this.authStateService.setAuthorizedAndFireEvent();
                _this.userService.publishUserdataIfExists();
                if (_this.checkSessionService.isCheckSessionConfigured()) {
                    _this.checkSessionService.start();
                }
                _this.callbackService.startTokenValidationPeriodically(_this.TOKEN_REFRESH_INTERVALL_IN_SECONDS);
                if (_this.silentRenewService.isSilentRenewConfigured()) {
                    _this.silentRenewService.getOrCreateIframe();
                }
            }
            _this.loggerService.logDebug('checkAuth completed fire events, auth: ' + isAuthenticated);
            return isAuthenticated;
        }));
    };
    OidcSecurityService.prototype.getToken = function () {
        return this.authStateService.getAccessToken();
    };
    OidcSecurityService.prototype.getIdToken = function () {
        return this.authStateService.getIdToken();
    };
    OidcSecurityService.prototype.getRefreshToken = function () {
        return this.authStateService.getRefreshToken();
    };
    OidcSecurityService.prototype.getPayloadFromIdToken = function (encode) {
        if (encode === void 0) { encode = false; }
        var token = this.getIdToken();
        return this.tokenHelperService.getPayloadFromToken(token, encode);
    };
    OidcSecurityService.prototype.setState = function (state) {
        this.flowsDataService.setAuthStateControl(state);
    };
    OidcSecurityService.prototype.getState = function () {
        return this.flowsDataService.getAuthStateControl();
    };
    // Code Flow with PCKE or Implicit Flow
    OidcSecurityService.prototype.authorize = function (authOptions) {
        if (!this.configurationProvider.hasValidConfig()) {
            this.loggerService.logError('Well known endpoints must be loaded before user can login!');
            return;
        }
        if (!this.tokenValidationService.configValidateResponseType(this.configurationProvider.openIDConfiguration.responseType)) {
            this.loggerService.logError('Invalid response type!');
            return;
        }
        this.flowsService.resetAuthorizationData();
        this.loggerService.logDebug('BEGIN Authorize OIDC Flow, no auth data');
        var _a = authOptions || {}, urlHandler = _a.urlHandler, customParams = _a.customParams;
        var url = this.urlService.getAuthorizeUrl(customParams);
        if (urlHandler) {
            urlHandler(url);
        }
        else {
            this.redirectService.redirectTo(url);
        }
    };
    // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
    // only the access token is revoked. Then the logout run.
    OidcSecurityService.prototype.logoffAndRevokeTokens = function (urlHandler) {
        return this.logoffRevocationService.logoffAndRevokeTokens(urlHandler);
    };
    // Logs out on the server and the local client.
    // If the server state has changed, checksession, then only a local logout.
    OidcSecurityService.prototype.logoff = function (urlHandler) {
        return this.logoffRevocationService.logoff(urlHandler);
    };
    OidcSecurityService.prototype.logoffLocal = function () {
        return this.logoffRevocationService.logoffLocal();
    };
    // https://tools.ietf.org/html/rfc7009
    // revokes an access token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    OidcSecurityService.prototype.revokeAccessToken = function (accessToken) {
        return this.logoffRevocationService.revokeAccessToken(accessToken);
    };
    // https://tools.ietf.org/html/rfc7009
    // revokes a refresh token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    OidcSecurityService.prototype.revokeRefreshToken = function (refreshToken) {
        return this.logoffRevocationService.revokeRefreshToken(refreshToken);
    };
    OidcSecurityService.prototype.getEndSessionUrl = function () {
        return this.logoffRevocationService.getEndSessionUrl();
    };
    OidcSecurityService.ctorParameters = function () { return [
        { type: CheckSessionService },
        { type: SilentRenewService },
        { type: UserService },
        { type: TokenValidationService },
        { type: TokenHelperService },
        { type: LoggerService },
        { type: ConfigurationProvider },
        { type: UrlService },
        { type: AuthStateService },
        { type: FlowsDataService },
        { type: FlowsService },
        { type: CallbackService },
        { type: LogoffRevocationService },
        { type: RedirectService }
    ]; };
    OidcSecurityService = __decorate([
        Injectable()
    ], OidcSecurityService);
    return OidcSecurityService;
}());
export { OidcSecurityService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2lkYy5zZWN1cml0eS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL29pZGMuc2VjdXJpdHkuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQWMsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVyQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNsRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDOUQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDakUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ25FLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUNuRixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQ25GLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FB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c0M7SUFDdEMsa0dBQWtHO0lBQ2xHLHlHQUF5RztJQUN6RyxvREFBb0Q7SUFDcEQsK0NBQWlCLEdBQWpCLFVBQWtCLFdBQWlCO1FBQy9CLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRCxzQ0FBc0M7SUFDdEMsa0dBQWtHO0lBQ2xHLHlHQUF5RztJQUN6RyxvREFBb0Q7SUFDcEQsZ0RBQWtCLEdBQWxCLFVBQW1CLFlBQWtCO1FBQ2pDLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFFRCw4Q0FBZ0IsR0FBaEI7UUFDSSxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzNELENBQUM7O2dCQXpJZ0MsbUJBQW1CO2dCQUNwQixrQkFBa0I7Z0JBQ3pCLFdBQVc7Z0JBQ0Esc0JBQXNCO2dCQUMxQixrQkFBa0I7Z0JBQ3ZCLGFBQWE7Z0JBQ0wscUJBQXFCO2dCQUNoQyxVQUFVO2dCQUNKLGdCQUFnQjtnQkFDaEIsZ0JBQWdCO2dCQUNwQixZQUFZO2dCQUNULGVBQWU7Z0JBQ1AsdUJBQXVCO2dCQUMvQixlQUFlOztJQXJDbkMsbUJBQW1CO1FBRC9CLFVBQVUsRUFBRTtPQUNBLG1CQUFtQixDQWtLL0I7SUFBRCwwQkFBQztDQUFBLEFBbEtELElBa0tDO1NBbEtZLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE9ic2VydmFibGUsIG9mIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBtYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBBdXRoT3B0aW9ucyB9IGZyb20gJy4vYXV0aC1vcHRpb25zJztcbmltcG9ydCB7IEF1dGhTdGF0ZVNlcnZpY2UgfSBmcm9tICcuL2F1dGhTdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ2FsbGJhY2tTZXJ2aWNlIH0gZnJvbSAnLi9jYWxsYmFjay9jYWxsYmFjay5zZXJ2aWNlJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgRmxvd3NTZXJ2aWNlIH0gZnJvbSAnLi9mbG93cy9mbG93cy5zZXJ2aWNlJztcbmltcG9ydCB7IENoZWNrU2Vzc2lvblNlcnZpY2UgfSBmcm9tICcuL2lmcmFtZS9jaGVjay1zZXNzaW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgU2lsZW50UmVuZXdTZXJ2aWNlIH0gZnJvbSAnLi9pZnJhbWUvc2lsZW50LXJlbmV3LnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBMb2dvZmZSZXZvY2F0aW9uU2VydmljZSB9IGZyb20gJy4vbG9nb2ZmUmV2b2tlL2xvZ29mZi1yZXZvY2F0aW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgVXNlclNlcnZpY2UgfSBmcm9tICcuL3VzZXJEYXRhL3VzZXItc2VydmljZSc7XG5pbXBvcnQgeyBSZWRpcmVjdFNlcnZpY2UgfSBmcm9tICcuL3V0aWxzL3JlZGlyZWN0L3JlZGlyZWN0LnNlcnZpY2UnO1xuaW1wb3J0IHsgVG9rZW5IZWxwZXJTZXJ2aWNlIH0gZnJvbSAnLi91dGlscy90b2tlbkhlbHBlci9vaWRjLXRva2VuLWhlbHBlci5zZXJ2aWNlJztcbmltcG9ydCB7IFVybFNlcnZpY2UgfSBmcm9tICcuL3V0aWxzL3VybC91cmwuc2VydmljZSc7XG5pbXBvcnQgeyBUb2tlblZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi92YWxpZGF0aW9uL3Rva2VuLXZhbGlkYXRpb24uc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBPaWRjU2VjdXJpdHlTZXJ2aWNlIHtcbiAgICBwcml2YXRlIFRPS0VOX1JFRlJFU0hfSU5URVJWQUxMX0lOX1NFQ09ORFMgPSAzO1xuXG4gICAgZ2V0IGNvbmZpZ3VyYXRpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5jb25maWd1cmF0aW9uO1xuICAgIH1cblxuICAgIGdldCB1c2VyRGF0YSQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnVzZXJTZXJ2aWNlLnVzZXJEYXRhJDtcbiAgICB9XG5cbiAgICBnZXQgaXNBdXRoZW50aWNhdGVkJCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXV0aFN0YXRlU2VydmljZS5hdXRob3JpemVkJDtcbiAgICB9XG5cbiAgICBnZXQgY2hlY2tTZXNzaW9uQ2hhbmdlZCQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoZWNrU2Vzc2lvblNlcnZpY2UuY2hlY2tTZXNzaW9uQ2hhbmdlZCQ7XG4gICAgfVxuXG4gICAgZ2V0IHN0c0NhbGxiYWNrJCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2tTZXJ2aWNlLnN0c0NhbGxiYWNrJDtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBjaGVja1Nlc3Npb25TZXJ2aWNlOiBDaGVja1Nlc3Npb25TZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHNpbGVudFJlbmV3U2VydmljZTogU2lsZW50UmVuZXdTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHVzZXJTZXJ2aWNlOiBVc2VyU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSB0b2tlblZhbGlkYXRpb25TZXJ2aWNlOiBUb2tlblZhbGlkYXRpb25TZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHRva2VuSGVscGVyU2VydmljZTogVG9rZW5IZWxwZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXG4gICAgICAgIHByaXZhdGUgdXJsU2VydmljZTogVXJsU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBhdXRoU3RhdGVTZXJ2aWNlOiBBdXRoU3RhdGVTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgZmxvd3NTZXJ2aWNlOiBGbG93c1NlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgY2FsbGJhY2tTZXJ2aWNlOiBDYWxsYmFja1NlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgbG9nb2ZmUmV2b2NhdGlvblNlcnZpY2U6IExvZ29mZlJldm9jYXRpb25TZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJlZGlyZWN0U2VydmljZTogUmVkaXJlY3RTZXJ2aWNlXG4gICAgKSB7fVxuXG4gICAgY2hlY2tBdXRoKCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLmhhc1ZhbGlkQ29uZmlnKCkpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignUGxlYXNlIHByb3ZpZGUgYSBjb25maWd1cmF0aW9uIGJlZm9yZSBzZXR0aW5nIHVwIHRoZSBtb2R1bGUnKTtcbiAgICAgICAgICAgIHJldHVybiBvZihmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1NUUyBzZXJ2ZXI6ICcgKyB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnN0c1NlcnZlcik7XG5cbiAgICAgICAgY29uc3QgY3VycmVudFVybCA9IHdpbmRvdy5sb2NhdGlvbi50b1N0cmluZygpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrU2VydmljZS5oYW5kbGVQb3NzaWJsZVN0c0NhbGxiYWNrKGN1cnJlbnRVcmwpLnBpcGUoXG4gICAgICAgICAgICBtYXAoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzQXV0aGVudGljYXRlZCA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5hcmVBdXRoU3RvcmFnZVRva2Vuc1ZhbGlkKCk7XG4gICAgICAgICAgICAgICAgaWYgKGlzQXV0aGVudGljYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dGhTdGF0ZVNlcnZpY2Uuc2V0QXV0aG9yaXplZEFuZEZpcmVFdmVudCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZXJTZXJ2aWNlLnB1Ymxpc2hVc2VyZGF0YUlmRXhpc3RzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tTZXNzaW9uU2VydmljZS5pc0NoZWNrU2Vzc2lvbkNvbmZpZ3VyZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja1Nlc3Npb25TZXJ2aWNlLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrU2VydmljZS5zdGFydFRva2VuVmFsaWRhdGlvblBlcmlvZGljYWxseSh0aGlzLlRPS0VOX1JFRlJFU0hfSU5URVJWQUxMX0lOX1NFQ09ORFMpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNpbGVudFJlbmV3U2VydmljZS5pc1NpbGVudFJlbmV3Q29uZmlndXJlZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNpbGVudFJlbmV3U2VydmljZS5nZXRPckNyZWF0ZUlmcmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdjaGVja0F1dGggY29tcGxldGVkIGZpcmUgZXZlbnRzLCBhdXRoOiAnICsgaXNBdXRoZW50aWNhdGVkKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBpc0F1dGhlbnRpY2F0ZWQ7XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGdldFRva2VuKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0QWNjZXNzVG9rZW4oKTtcbiAgICB9XG5cbiAgICBnZXRJZFRva2VuKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0SWRUb2tlbigpO1xuICAgIH1cblxuICAgIGdldFJlZnJlc2hUb2tlbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmdldFJlZnJlc2hUb2tlbigpO1xuICAgIH1cblxuICAgIGdldFBheWxvYWRGcm9tSWRUb2tlbihlbmNvZGUgPSBmYWxzZSk6IGFueSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gdGhpcy5nZXRJZFRva2VuKCk7XG4gICAgICAgIHJldHVybiB0aGlzLnRva2VuSGVscGVyU2VydmljZS5nZXRQYXlsb2FkRnJvbVRva2VuKHRva2VuLCBlbmNvZGUpO1xuICAgIH1cblxuICAgIHNldFN0YXRlKHN0YXRlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldEF1dGhTdGF0ZUNvbnRyb2woc3RhdGUpO1xuICAgIH1cblxuICAgIGdldFN0YXRlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0QXV0aFN0YXRlQ29udHJvbCgpO1xuICAgIH1cblxuICAgIC8vIENvZGUgRmxvdyB3aXRoIFBDS0Ugb3IgSW1wbGljaXQgRmxvd1xuICAgIGF1dGhvcml6ZShhdXRoT3B0aW9ucz86IEF1dGhPcHRpb25zKSB7XG4gICAgICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIuaGFzVmFsaWRDb25maWcoKSkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKCdXZWxsIGtub3duIGVuZHBvaW50cyBtdXN0IGJlIGxvYWRlZCBiZWZvcmUgdXNlciBjYW4gbG9naW4hJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS5jb25maWdWYWxpZGF0ZVJlc3BvbnNlVHlwZSh0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnJlc3BvbnNlVHlwZSkpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignSW52YWxpZCByZXNwb25zZSB0eXBlIScpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mbG93c1NlcnZpY2UucmVzZXRBdXRob3JpemF0aW9uRGF0YSgpO1xuXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQkVHSU4gQXV0aG9yaXplIE9JREMgRmxvdywgbm8gYXV0aCBkYXRhJyk7XG5cbiAgICAgICAgY29uc3QgeyB1cmxIYW5kbGVyLCBjdXN0b21QYXJhbXMgfSA9IGF1dGhPcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIGNvbnN0IHVybCA9IHRoaXMudXJsU2VydmljZS5nZXRBdXRob3JpemVVcmwoY3VzdG9tUGFyYW1zKTtcblxuICAgICAgICBpZiAodXJsSGFuZGxlcikge1xuICAgICAgICAgICAgdXJsSGFuZGxlcih1cmwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZWRpcmVjdFNlcnZpY2UucmVkaXJlY3RUbyh1cmwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGhlIHJlZnJlc2ggdG9rZW4gYW5kIGFuZCB0aGUgYWNjZXNzIHRva2VuIGFyZSByZXZva2VkIG9uIHRoZSBzZXJ2ZXIuIElmIHRoZSByZWZyZXNoIHRva2VuIGRvZXMgbm90IGV4aXN0XG4gICAgLy8gb25seSB0aGUgYWNjZXNzIHRva2VuIGlzIHJldm9rZWQuIFRoZW4gdGhlIGxvZ291dCBydW4uXG4gICAgbG9nb2ZmQW5kUmV2b2tlVG9rZW5zKHVybEhhbmRsZXI/OiAodXJsOiBzdHJpbmcpID0+IGFueSkge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2dvZmZSZXZvY2F0aW9uU2VydmljZS5sb2dvZmZBbmRSZXZva2VUb2tlbnModXJsSGFuZGxlcik7XG4gICAgfVxuXG4gICAgLy8gTG9ncyBvdXQgb24gdGhlIHNlcnZlciBhbmQgdGhlIGxvY2FsIGNsaWVudC5cbiAgICAvLyBJZiB0aGUgc2VydmVyIHN0YXRlIGhhcyBjaGFuZ2VkLCBjaGVja3Nlc3Npb24sIHRoZW4gb25seSBhIGxvY2FsIGxvZ291dC5cbiAgICBsb2dvZmYodXJsSGFuZGxlcj86ICh1cmw6IHN0cmluZykgPT4gYW55KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZ29mZlJldm9jYXRpb25TZXJ2aWNlLmxvZ29mZih1cmxIYW5kbGVyKTtcbiAgICB9XG5cbiAgICBsb2dvZmZMb2NhbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9nb2ZmUmV2b2NhdGlvblNlcnZpY2UubG9nb2ZmTG9jYWwoKTtcbiAgICB9XG5cbiAgICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNzAwOVxuICAgIC8vIHJldm9rZXMgYW4gYWNjZXNzIHRva2VuIG9uIHRoZSBTVFMuIFRoaXMgaXMgb25seSByZXF1aXJlZCBpbiB0aGUgY29kZSBmbG93IHdpdGggcmVmcmVzaCB0b2tlbnMuXG4gICAgLy8gSWYgbm8gdG9rZW4gaXMgcHJvdmlkZWQsIHRoZW4gdGhlIHRva2VuIGZyb20gdGhlIHN0b3JhZ2UgaXMgcmV2b2tlZC4gWW91IGNhbiBwYXNzIGFueSB0b2tlbiB0byByZXZva2UuXG4gICAgLy8gVGhpcyBtYWtlcyBpdCBwb3NzaWJsZSB0byBtYW5hZ2UgeW91ciBvd24gdG9rZW5zLlxuICAgIHJldm9rZUFjY2Vzc1Rva2VuKGFjY2Vzc1Rva2VuPzogYW55KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZ29mZlJldm9jYXRpb25TZXJ2aWNlLnJldm9rZUFjY2Vzc1Rva2VuKGFjY2Vzc1Rva2VuKTtcbiAgICB9XG5cbiAgICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNzAwOVxuICAgIC8vIHJldm9rZXMgYSByZWZyZXNoIHRva2VuIG9uIHRoZSBTVFMuIFRoaXMgaXMgb25seSByZXF1aXJlZCBpbiB0aGUgY29kZSBmbG93IHdpdGggcmVmcmVzaCB0b2tlbnMuXG4gICAgLy8gSWYgbm8gdG9rZW4gaXMgcHJvdmlkZWQsIHRoZW4gdGhlIHRva2VuIGZyb20gdGhlIHN0b3JhZ2UgaXMgcmV2b2tlZC4gWW91IGNhbiBwYXNzIGFueSB0b2tlbiB0byByZXZva2UuXG4gICAgLy8gVGhpcyBtYWtlcyBpdCBwb3NzaWJsZSB0byBtYW5hZ2UgeW91ciBvd24gdG9rZW5zLlxuICAgIHJldm9rZVJlZnJlc2hUb2tlbihyZWZyZXNoVG9rZW4/OiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9nb2ZmUmV2b2NhdGlvblNlcnZpY2UucmV2b2tlUmVmcmVzaFRva2VuKHJlZnJlc2hUb2tlbik7XG4gICAgfVxuXG4gICAgZ2V0RW5kU2Vzc2lvblVybCgpOiBzdHJpbmcgfCBudWxsIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9nb2ZmUmV2b2NhdGlvblNlcnZpY2UuZ2V0RW5kU2Vzc2lvblVybCgpO1xuICAgIH1cbn1cbiJdfQ==