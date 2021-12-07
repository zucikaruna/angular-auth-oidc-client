import { __decorate } from "tslib";
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { DataService } from '../api/data.service';
import { ConfigurationProvider } from '../config/config.provider';
import { FlowsService } from '../flows/flows.service';
import { CheckSessionService } from '../iframe/check-session.service';
import { LoggerService } from '../logging/logger.service';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { RedirectService } from '../utils/redirect/redirect.service';
import { UrlService } from '../utils/url/url.service';
var LogoffRevocationService = /** @class */ (function () {
    function LogoffRevocationService(dataService, storagePersistanceService, loggerService, urlService, checkSessionService, flowsService, redirectService, configurationProvider) {
        this.dataService = dataService;
        this.storagePersistanceService = storagePersistanceService;
        this.loggerService = loggerService;
        this.urlService = urlService;
        this.checkSessionService = checkSessionService;
        this.flowsService = flowsService;
        this.redirectService = redirectService;
        this.configurationProvider = configurationProvider;
    }
    // Logs out on the server and the local client.
    // If the server state has changed, checksession, then only a local logout.
    LogoffRevocationService.prototype.logoff = function (urlHandler) {
        this.loggerService.logDebug('logoff, remove auth ');
        var endSessionUrl = this.getEndSessionUrl();
        this.flowsService.resetAuthorizationData();
        if (!endSessionUrl) {
            this.loggerService.logDebug('only local login cleaned up, no end_session_endpoint');
            return;
        }
        if (this.checkSessionService.serverStateChanged()) {
            this.loggerService.logDebug('only local login cleaned up, server session has changed');
        }
        else if (urlHandler) {
            urlHandler(endSessionUrl);
        }
        else {
            this.redirectService.redirectTo(endSessionUrl);
        }
    };
    LogoffRevocationService.prototype.logoffLocal = function () {
        this.flowsService.resetAuthorizationData();
    };
    // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
    // only the access token is revoked. Then the logout run.
    LogoffRevocationService.prototype.logoffAndRevokeTokens = function (urlHandler) {
        var _this = this;
        var _a;
        if (!((_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.revocationEndpoint)) {
            this.loggerService.logDebug('revocation endpoint not supported');
            this.logoff(urlHandler);
        }
        if (this.storagePersistanceService.getRefreshToken()) {
            return this.revokeRefreshToken().pipe(switchMap(function (result) { return _this.revokeAccessToken(result); }), catchError(function (error) {
                var errorMessage = "revoke token failed " + error;
                _this.loggerService.logError(errorMessage);
                return throwError(errorMessage);
            }), tap(function () { return _this.logoff(urlHandler); }));
        }
        else {
            return this.revokeAccessToken().pipe(catchError(function (error) {
                var errorMessage = "revoke access token failed " + error;
                _this.loggerService.logError(errorMessage);
                return throwError(errorMessage);
            }), tap(function () { return _this.logoff(urlHandler); }));
        }
    };
    // https://tools.ietf.org/html/rfc7009
    // revokes an access token on the STS. If no token is provided, then the token from
    // the storage is revoked. You can pass any token to revoke. This makes it possible to
    // manage your own tokens. The is a public API.
    LogoffRevocationService.prototype.revokeAccessToken = function (accessToken) {
        var _this = this;
        var accessTok = accessToken || this.storagePersistanceService.accessToken;
        var body = this.urlService.createRevocationEndpointBodyAccessToken(accessTok);
        var url = this.urlService.getRevocationEndpointUrl();
        var headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        return this.dataService.post(url, body, headers).pipe(switchMap(function (response) {
            _this.loggerService.logDebug('revocation endpoint post response: ', response);
            return of(response);
        }), catchError(function (error) {
            var errorMessage = "Revocation request failed " + error;
            _this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }));
    };
    // https://tools.ietf.org/html/rfc7009
    // revokes an refresh token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    LogoffRevocationService.prototype.revokeRefreshToken = function (refreshToken) {
        var _this = this;
        var refreshTok = refreshToken || this.storagePersistanceService.getRefreshToken();
        var body = this.urlService.createRevocationEndpointBodyRefreshToken(refreshTok);
        var url = this.urlService.getRevocationEndpointUrl();
        var headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        return this.dataService.post(url, body, headers).pipe(switchMap(function (response) {
            _this.loggerService.logDebug('revocation endpoint post response: ', response);
            return of(response);
        }), catchError(function (error) {
            var errorMessage = "Revocation request failed " + error;
            _this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }));
    };
    LogoffRevocationService.prototype.getEndSessionUrl = function () {
        var idTokenHint = this.storagePersistanceService.idToken;
        return this.urlService.createEndSessionUrl(idTokenHint);
    };
    LogoffRevocationService.ctorParameters = function () { return [
        { type: DataService },
        { type: StoragePersistanceService },
        { type: LoggerService },
        { type: UrlService },
        { type: CheckSessionService },
        { type: FlowsService },
        { type: RedirectService },
        { type: ConfigurationProvider }
    ]; };
    LogoffRevocationService = __decorate([
        Injectable()
    ], LogoffRevocationService);
    return LogoffRevocationService;
}());
export { LogoffRevocationService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nb2ZmLXJldm9jYXRpb24uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC8iLCJzb3VyY2VzIjpbImxpYi9sb2dvZmZSZXZva2UvbG9nb2ZmLXJldm9jYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUN0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDbkYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUd0RDtJQUNJLGlDQUNZLFdBQXdCLEVBQ3hCLHlCQUFvRCxFQUNwRCxhQUE0QixFQUM1QixVQUFzQixFQUN0QixtQkFBd0MsRUFDeEMsWUFBMEIsRUFDMUIsZUFBZ0MsRUFDaEMscUJBQTRDO1FBUDVDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3hCLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFD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VC9DLHVCQUF1QjtRQURuQyxVQUFVLEVBQUU7T0FDQSx1QkFBdUIsQ0F5SG5DO0lBQUQsOEJBQUM7Q0FBQSxBQXpIRCxJQXlIQztTQXpIWSx1QkFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IG9mLCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBjYXRjaEVycm9yLCBzd2l0Y2hNYXAsIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vYXBpL2RhdGEuc2VydmljZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IEZsb3dzU2VydmljZSB9IGZyb20gJy4uL2Zsb3dzL2Zsb3dzLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ2hlY2tTZXNzaW9uU2VydmljZSB9IGZyb20gJy4uL2lmcmFtZS9jaGVjay1zZXNzaW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcbmltcG9ydCB7IFJlZGlyZWN0U2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3JlZGlyZWN0L3JlZGlyZWN0LnNlcnZpY2UnO1xuaW1wb3J0IHsgVXJsU2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3VybC91cmwuc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBMb2dvZmZSZXZvY2F0aW9uU2VydmljZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgZGF0YVNlcnZpY2U6IERhdGFTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSB1cmxTZXJ2aWNlOiBVcmxTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGNoZWNrU2Vzc2lvblNlcnZpY2U6IENoZWNrU2Vzc2lvblNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgZmxvd3NTZXJ2aWNlOiBGbG93c1NlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgcmVkaXJlY3RTZXJ2aWNlOiBSZWRpcmVjdFNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXJcbiAgICApIHt9XG5cbiAgICAvLyBMb2dzIG91dCBvbiB0aGUgc2VydmVyIGFuZCB0aGUgbG9jYWwgY2xpZW50LlxuICAgIC8vIElmIHRoZSBzZXJ2ZXIgc3RhdGUgaGFzIGNoYW5nZWQsIGNoZWNrc2Vzc2lvbiwgdGhlbiBvbmx5IGEgbG9jYWwgbG9nb3V0LlxuICAgIGxvZ29mZih1cmxIYW5kbGVyPzogKHVybDogc3RyaW5nKSA9PiBhbnkpIHtcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdsb2dvZmYsIHJlbW92ZSBhdXRoICcpO1xuICAgICAgICBjb25zdCBlbmRTZXNzaW9uVXJsID0gdGhpcy5nZXRFbmRTZXNzaW9uVXJsKCk7XG4gICAgICAgIHRoaXMuZmxvd3NTZXJ2aWNlLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcblxuICAgICAgICBpZiAoIWVuZFNlc3Npb25VcmwpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zygnb25seSBsb2NhbCBsb2dpbiBjbGVhbmVkIHVwLCBubyBlbmRfc2Vzc2lvbl9lbmRwb2ludCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuY2hlY2tTZXNzaW9uU2VydmljZS5zZXJ2ZXJTdGF0ZUNoYW5nZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdvbmx5IGxvY2FsIGxvZ2luIGNsZWFuZWQgdXAsIHNlcnZlciBzZXNzaW9uIGhhcyBjaGFuZ2VkJyk7XG4gICAgICAgIH0gZWxzZSBpZiAodXJsSGFuZGxlcikge1xuICAgICAgICAgICAgdXJsSGFuZGxlcihlbmRTZXNzaW9uVXJsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVkaXJlY3RTZXJ2aWNlLnJlZGlyZWN0VG8oZW5kU2Vzc2lvblVybCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2dvZmZMb2NhbCgpIHtcbiAgICAgICAgdGhpcy5mbG93c1NlcnZpY2UucmVzZXRBdXRob3JpemF0aW9uRGF0YSgpO1xuICAgIH1cblxuICAgIC8vIFRoZSByZWZyZXNoIHRva2VuIGFuZCBhbmQgdGhlIGFjY2VzcyB0b2tlbiBhcmUgcmV2b2tlZCBvbiB0aGUgc2VydmVyLiBJZiB0aGUgcmVmcmVzaCB0b2tlbiBkb2VzIG5vdCBleGlzdFxuICAgIC8vIG9ubHkgdGhlIGFjY2VzcyB0b2tlbiBpcyByZXZva2VkLiBUaGVuIHRoZSBsb2dvdXQgcnVuLlxuICAgIGxvZ29mZkFuZFJldm9rZVRva2Vucyh1cmxIYW5kbGVyPzogKHVybDogc3RyaW5nKSA9PiBhbnkpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci53ZWxsS25vd25FbmRwb2ludHM/LnJldm9jYXRpb25FbmRwb2ludCkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdyZXZvY2F0aW9uIGVuZHBvaW50IG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgICAgICAgIHRoaXMubG9nb2ZmKHVybEhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5nZXRSZWZyZXNoVG9rZW4oKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmV2b2tlUmVmcmVzaFRva2VuKCkucGlwZShcbiAgICAgICAgICAgICAgICBzd2l0Y2hNYXAoKHJlc3VsdCkgPT4gdGhpcy5yZXZva2VBY2Nlc3NUb2tlbihyZXN1bHQpKSxcbiAgICAgICAgICAgICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgcmV2b2tlIHRva2VuIGZhaWxlZCAke2Vycm9yfWA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHRhcCgoKSA9PiB0aGlzLmxvZ29mZih1cmxIYW5kbGVyKSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXZva2VBY2Nlc3NUb2tlbigpLnBpcGUoXG4gICAgICAgICAgICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYHJldm9rZSBhY2Nlc3MgdG9rZW4gZmFpbGVkICR7ZXJyb3J9YDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgdGFwKCgpID0+IHRoaXMubG9nb2ZmKHVybEhhbmRsZXIpKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MDA5XG4gICAgLy8gcmV2b2tlcyBhbiBhY2Nlc3MgdG9rZW4gb24gdGhlIFNUUy4gSWYgbm8gdG9rZW4gaXMgcHJvdmlkZWQsIHRoZW4gdGhlIHRva2VuIGZyb21cbiAgICAvLyB0aGUgc3RvcmFnZSBpcyByZXZva2VkLiBZb3UgY2FuIHBhc3MgYW55IHRva2VuIHRvIHJldm9rZS4gVGhpcyBtYWtlcyBpdCBwb3NzaWJsZSB0b1xuICAgIC8vIG1hbmFnZSB5b3VyIG93biB0b2tlbnMuIFRoZSBpcyBhIHB1YmxpYyBBUEkuXG4gICAgcmV2b2tlQWNjZXNzVG9rZW4oYWNjZXNzVG9rZW4/OiBhbnkpIHtcbiAgICAgICAgY29uc3QgYWNjZXNzVG9rID0gYWNjZXNzVG9rZW4gfHwgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmFjY2Vzc1Rva2VuO1xuICAgICAgICBjb25zdCBib2R5ID0gdGhpcy51cmxTZXJ2aWNlLmNyZWF0ZVJldm9jYXRpb25FbmRwb2ludEJvZHlBY2Nlc3NUb2tlbihhY2Nlc3NUb2spO1xuICAgICAgICBjb25zdCB1cmwgPSB0aGlzLnVybFNlcnZpY2UuZ2V0UmV2b2NhdGlvbkVuZHBvaW50VXJsKCk7XG5cbiAgICAgICAgbGV0IGhlYWRlcnM6IEh0dHBIZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKCk7XG4gICAgICAgIGhlYWRlcnMgPSBoZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFTZXJ2aWNlLnBvc3QodXJsLCBib2R5LCBoZWFkZXJzKS5waXBlKFxuICAgICAgICAgICAgc3dpdGNoTWFwKChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdyZXZvY2F0aW9uIGVuZHBvaW50IHBvc3QgcmVzcG9uc2U6ICcsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2YocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBSZXZvY2F0aW9uIHJlcXVlc3QgZmFpbGVkICR7ZXJyb3J9YDtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNzAwOVxuICAgIC8vIHJldm9rZXMgYW4gcmVmcmVzaCB0b2tlbiBvbiB0aGUgU1RTLiBUaGlzIGlzIG9ubHkgcmVxdWlyZWQgaW4gdGhlIGNvZGUgZmxvdyB3aXRoIHJlZnJlc2ggdG9rZW5zLlxuICAgIC8vIElmIG5vIHRva2VuIGlzIHByb3ZpZGVkLCB0aGVuIHRoZSB0b2tlbiBmcm9tIHRoZSBzdG9yYWdlIGlzIHJldm9rZWQuIFlvdSBjYW4gcGFzcyBhbnkgdG9rZW4gdG8gcmV2b2tlLlxuICAgIC8vIFRoaXMgbWFrZXMgaXQgcG9zc2libGUgdG8gbWFuYWdlIHlvdXIgb3duIHRva2Vucy5cbiAgICByZXZva2VSZWZyZXNoVG9rZW4ocmVmcmVzaFRva2VuPzogYW55KSB7XG4gICAgICAgIGNvbnN0IHJlZnJlc2hUb2sgPSByZWZyZXNoVG9rZW4gfHwgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmdldFJlZnJlc2hUb2tlbigpO1xuICAgICAgICBjb25zdCBib2R5ID0gdGhpcy51cmxTZXJ2aWNlLmNyZWF0ZVJldm9jYXRpb25FbmRwb2ludEJvZHlSZWZyZXNoVG9rZW4ocmVmcmVzaFRvayk7XG4gICAgICAgIGNvbnN0IHVybCA9IHRoaXMudXJsU2VydmljZS5nZXRSZXZvY2F0aW9uRW5kcG9pbnRVcmwoKTtcblxuICAgICAgICBsZXQgaGVhZGVyczogSHR0cEhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcbiAgICAgICAgaGVhZGVycyA9IGhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVNlcnZpY2UucG9zdCh1cmwsIGJvZHksIGhlYWRlcnMpLnBpcGUoXG4gICAgICAgICAgICBzd2l0Y2hNYXAoKHJlc3BvbnNlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3Jldm9jYXRpb24gZW5kcG9pbnQgcG9zdCByZXNwb25zZTogJywgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBvZihyZXNwb25zZSk7XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYFJldm9jYXRpb24gcmVxdWVzdCBmYWlsZWQgJHtlcnJvcn1gO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGdldEVuZFNlc3Npb25VcmwoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IGlkVG9rZW5IaW50ID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmlkVG9rZW47XG4gICAgICAgIHJldHVybiB0aGlzLnVybFNlcnZpY2UuY3JlYXRlRW5kU2Vzc2lvblVybChpZFRva2VuSGludCk7XG4gICAgfVxufVxuIl19