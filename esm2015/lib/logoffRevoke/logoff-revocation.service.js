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
let LogoffRevocationService = class LogoffRevocationService {
    constructor(dataService, storagePersistanceService, loggerService, urlService, checkSessionService, flowsService, redirectService, configurationProvider) {
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
    logoff(urlHandler) {
        this.loggerService.logDebug('logoff, remove auth ');
        const endSessionUrl = this.getEndSessionUrl();
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
    }
    logoffLocal() {
        this.flowsService.resetAuthorizationData();
    }
    // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
    // only the access token is revoked. Then the logout run.
    logoffAndRevokeTokens(urlHandler) {
        var _a;
        if (!((_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.revocationEndpoint)) {
            this.loggerService.logDebug('revocation endpoint not supported');
            this.logoff(urlHandler);
        }
        if (this.storagePersistanceService.getRefreshToken()) {
            return this.revokeRefreshToken().pipe(switchMap((result) => this.revokeAccessToken(result)), catchError((error) => {
                const errorMessage = `revoke token failed ${error}`;
                this.loggerService.logError(errorMessage);
                return throwError(errorMessage);
            }), tap(() => this.logoff(urlHandler)));
        }
        else {
            return this.revokeAccessToken().pipe(catchError((error) => {
                const errorMessage = `revoke access token failed ${error}`;
                this.loggerService.logError(errorMessage);
                return throwError(errorMessage);
            }), tap(() => this.logoff(urlHandler)));
        }
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes an access token on the STS. If no token is provided, then the token from
    // the storage is revoked. You can pass any token to revoke. This makes it possible to
    // manage your own tokens. The is a public API.
    revokeAccessToken(accessToken) {
        const accessTok = accessToken || this.storagePersistanceService.accessToken;
        const body = this.urlService.createRevocationEndpointBodyAccessToken(accessTok);
        const url = this.urlService.getRevocationEndpointUrl();
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        return this.dataService.post(url, body, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug('revocation endpoint post response: ', response);
            return of(response);
        }), catchError((error) => {
            const errorMessage = `Revocation request failed ${error}`;
            this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }));
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes an refresh token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    revokeRefreshToken(refreshToken) {
        const refreshTok = refreshToken || this.storagePersistanceService.getRefreshToken();
        const body = this.urlService.createRevocationEndpointBodyRefreshToken(refreshTok);
        const url = this.urlService.getRevocationEndpointUrl();
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        return this.dataService.post(url, body, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug('revocation endpoint post response: ', response);
            return of(response);
        }), catchError((error) => {
            const errorMessage = `Revocation request failed ${error}`;
            this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }));
    }
    getEndSessionUrl() {
        const idTokenHint = this.storagePersistanceService.idToken;
        return this.urlService.createEndSessionUrl(idTokenHint);
    }
};
LogoffRevocationService.ctorParameters = () => [
    { type: DataService },
    { type: StoragePersistanceService },
    { type: LoggerService },
    { type: UrlService },
    { type: CheckSessionService },
    { type: FlowsService },
    { type: RedirectService },
    { type: ConfigurationProvider }
];
LogoffRevocationService = __decorate([
    Injectable()
], LogoffRevocationService);
export { LogoffRevocationService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nb2ZmLXJldm9jYXRpb24uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC8iLCJzb3VyY2VzIjpbImxpYi9sb2dvZmZSZXZva2UvbG9nb2ZmLXJldm9jYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUN0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDbkYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUd0RCxJQUFhLHVCQUF1QixHQUFwQyxNQUFhLHVCQUF1QjtJQUNoQyxZQUNZLFdBQXdCLEVBQ3hCLHlCQUFvRCxFQUNwRCxhQUE0QixFQUM1QixVQUFzQixFQUN0QixtQkFBd0MsRUFDeEMsWUFBMEIsRUFDMUIsZUFBZ0MsRUFDaEMscUJBQTRDO1FBUDVDLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ3hC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ZTtZQUNULHFCQUFxQjs7QUFUL0MsdUJBQXVCO0lBRG5DLFVBQVUsRUFBRTtHQUNBLHVCQUF1QixDQXlIbkM7U0F6SFksdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBvZiwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgY2F0Y2hFcnJvciwgc3dpdGNoTWFwLCB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBEYXRhU2VydmljZSB9IGZyb20gJy4uL2FwaS9kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBGbG93c1NlcnZpY2UgfSBmcm9tICcuLi9mbG93cy9mbG93cy5zZXJ2aWNlJztcbmltcG9ydCB7IENoZWNrU2Vzc2lvblNlcnZpY2UgfSBmcm9tICcuLi9pZnJhbWUvY2hlY2stc2Vzc2lvbi5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XG5pbXBvcnQgeyBSZWRpcmVjdFNlcnZpY2UgfSBmcm9tICcuLi91dGlscy9yZWRpcmVjdC9yZWRpcmVjdC5zZXJ2aWNlJztcbmltcG9ydCB7IFVybFNlcnZpY2UgfSBmcm9tICcuLi91dGlscy91cmwvdXJsLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTG9nb2ZmUmV2b2NhdGlvblNlcnZpY2Uge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIGRhdGFTZXJ2aWNlOiBEYXRhU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgdXJsU2VydmljZTogVXJsU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBjaGVja1Nlc3Npb25TZXJ2aWNlOiBDaGVja1Nlc3Npb25TZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGZsb3dzU2VydmljZTogRmxvd3NTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJlZGlyZWN0U2VydmljZTogUmVkaXJlY3RTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyXG4gICAgKSB7fVxuXG4gICAgLy8gTG9ncyBvdXQgb24gdGhlIHNlcnZlciBhbmQgdGhlIGxvY2FsIGNsaWVudC5cbiAgICAvLyBJZiB0aGUgc2VydmVyIHN0YXRlIGhhcyBjaGFuZ2VkLCBjaGVja3Nlc3Npb24sIHRoZW4gb25seSBhIGxvY2FsIGxvZ291dC5cbiAgICBsb2dvZmYodXJsSGFuZGxlcj86ICh1cmw6IHN0cmluZykgPT4gYW55KSB7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnbG9nb2ZmLCByZW1vdmUgYXV0aCAnKTtcbiAgICAgICAgY29uc3QgZW5kU2Vzc2lvblVybCA9IHRoaXMuZ2V0RW5kU2Vzc2lvblVybCgpO1xuICAgICAgICB0aGlzLmZsb3dzU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XG5cbiAgICAgICAgaWYgKCFlbmRTZXNzaW9uVXJsKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ29ubHkgbG9jYWwgbG9naW4gY2xlYW5lZCB1cCwgbm8gZW5kX3Nlc3Npb25fZW5kcG9pbnQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNoZWNrU2Vzc2lvblNlcnZpY2Uuc2VydmVyU3RhdGVDaGFuZ2VkKCkpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zygnb25seSBsb2NhbCBsb2dpbiBjbGVhbmVkIHVwLCBzZXJ2ZXIgc2Vzc2lvbiBoYXMgY2hhbmdlZCcpO1xuICAgICAgICB9IGVsc2UgaWYgKHVybEhhbmRsZXIpIHtcbiAgICAgICAgICAgIHVybEhhbmRsZXIoZW5kU2Vzc2lvblVybCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlZGlyZWN0U2VydmljZS5yZWRpcmVjdFRvKGVuZFNlc3Npb25VcmwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbG9nb2ZmTG9jYWwoKSB7XG4gICAgICAgIHRoaXMuZmxvd3NTZXJ2aWNlLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgcmVmcmVzaCB0b2tlbiBhbmQgYW5kIHRoZSBhY2Nlc3MgdG9rZW4gYXJlIHJldm9rZWQgb24gdGhlIHNlcnZlci4gSWYgdGhlIHJlZnJlc2ggdG9rZW4gZG9lcyBub3QgZXhpc3RcbiAgICAvLyBvbmx5IHRoZSBhY2Nlc3MgdG9rZW4gaXMgcmV2b2tlZC4gVGhlbiB0aGUgbG9nb3V0IHJ1bi5cbiAgICBsb2dvZmZBbmRSZXZva2VUb2tlbnModXJsSGFuZGxlcj86ICh1cmw6IHN0cmluZykgPT4gYW55KSB7XG4gICAgICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIud2VsbEtub3duRW5kcG9pbnRzPy5yZXZvY2F0aW9uRW5kcG9pbnQpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygncmV2b2NhdGlvbiBlbmRwb2ludCBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgICAgICB0aGlzLmxvZ29mZih1cmxIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuZ2V0UmVmcmVzaFRva2VuKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJldm9rZVJlZnJlc2hUb2tlbigpLnBpcGUoXG4gICAgICAgICAgICAgICAgc3dpdGNoTWFwKChyZXN1bHQpID0+IHRoaXMucmV2b2tlQWNjZXNzVG9rZW4ocmVzdWx0KSksXG4gICAgICAgICAgICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYHJldm9rZSB0b2tlbiBmYWlsZWQgJHtlcnJvcn1gO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB0YXAoKCkgPT4gdGhpcy5sb2dvZmYodXJsSGFuZGxlcikpXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmV2b2tlQWNjZXNzVG9rZW4oKS5waXBlKFxuICAgICAgICAgICAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGByZXZva2UgYWNjZXNzIHRva2VuIGZhaWxlZCAke2Vycm9yfWA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHRhcCgoKSA9PiB0aGlzLmxvZ29mZih1cmxIYW5kbGVyKSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNzAwOVxuICAgIC8vIHJldm9rZXMgYW4gYWNjZXNzIHRva2VuIG9uIHRoZSBTVFMuIElmIG5vIHRva2VuIGlzIHByb3ZpZGVkLCB0aGVuIHRoZSB0b2tlbiBmcm9tXG4gICAgLy8gdGhlIHN0b3JhZ2UgaXMgcmV2b2tlZC4gWW91IGNhbiBwYXNzIGFueSB0b2tlbiB0byByZXZva2UuIFRoaXMgbWFrZXMgaXQgcG9zc2libGUgdG9cbiAgICAvLyBtYW5hZ2UgeW91ciBvd24gdG9rZW5zLiBUaGUgaXMgYSBwdWJsaWMgQVBJLlxuICAgIHJldm9rZUFjY2Vzc1Rva2VuKGFjY2Vzc1Rva2VuPzogYW55KSB7XG4gICAgICAgIGNvbnN0IGFjY2Vzc1RvayA9IGFjY2Vzc1Rva2VuIHx8IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5hY2Nlc3NUb2tlbjtcbiAgICAgICAgY29uc3QgYm9keSA9IHRoaXMudXJsU2VydmljZS5jcmVhdGVSZXZvY2F0aW9uRW5kcG9pbnRCb2R5QWNjZXNzVG9rZW4oYWNjZXNzVG9rKTtcbiAgICAgICAgY29uc3QgdXJsID0gdGhpcy51cmxTZXJ2aWNlLmdldFJldm9jYXRpb25FbmRwb2ludFVybCgpO1xuXG4gICAgICAgIGxldCBoZWFkZXJzOiBIdHRwSGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycygpO1xuICAgICAgICBoZWFkZXJzID0gaGVhZGVycy5zZXQoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhU2VydmljZS5wb3N0KHVybCwgYm9keSwgaGVhZGVycykucGlwZShcbiAgICAgICAgICAgIHN3aXRjaE1hcCgocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygncmV2b2NhdGlvbiBlbmRwb2ludCBwb3N0IHJlc3BvbnNlOiAnLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9mKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBgUmV2b2NhdGlvbiByZXF1ZXN0IGZhaWxlZCAke2Vycm9yfWA7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzcwMDlcbiAgICAvLyByZXZva2VzIGFuIHJlZnJlc2ggdG9rZW4gb24gdGhlIFNUUy4gVGhpcyBpcyBvbmx5IHJlcXVpcmVkIGluIHRoZSBjb2RlIGZsb3cgd2l0aCByZWZyZXNoIHRva2Vucy5cbiAgICAvLyBJZiBubyB0b2tlbiBpcyBwcm92aWRlZCwgdGhlbiB0aGUgdG9rZW4gZnJvbSB0aGUgc3RvcmFnZSBpcyByZXZva2VkLiBZb3UgY2FuIHBhc3MgYW55IHRva2VuIHRvIHJldm9rZS5cbiAgICAvLyBUaGlzIG1ha2VzIGl0IHBvc3NpYmxlIHRvIG1hbmFnZSB5b3VyIG93biB0b2tlbnMuXG4gICAgcmV2b2tlUmVmcmVzaFRva2VuKHJlZnJlc2hUb2tlbj86IGFueSkge1xuICAgICAgICBjb25zdCByZWZyZXNoVG9rID0gcmVmcmVzaFRva2VuIHx8IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5nZXRSZWZyZXNoVG9rZW4oKTtcbiAgICAgICAgY29uc3QgYm9keSA9IHRoaXMudXJsU2VydmljZS5jcmVhdGVSZXZvY2F0aW9uRW5kcG9pbnRCb2R5UmVmcmVzaFRva2VuKHJlZnJlc2hUb2spO1xuICAgICAgICBjb25zdCB1cmwgPSB0aGlzLnVybFNlcnZpY2UuZ2V0UmV2b2NhdGlvbkVuZHBvaW50VXJsKCk7XG5cbiAgICAgICAgbGV0IGhlYWRlcnM6IEh0dHBIZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKCk7XG4gICAgICAgIGhlYWRlcnMgPSBoZWFkZXJzLnNldCgnQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFTZXJ2aWNlLnBvc3QodXJsLCBib2R5LCBoZWFkZXJzKS5waXBlKFxuICAgICAgICAgICAgc3dpdGNoTWFwKChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdyZXZvY2F0aW9uIGVuZHBvaW50IHBvc3QgcmVzcG9uc2U6ICcsIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2YocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBSZXZvY2F0aW9uIHJlcXVlc3QgZmFpbGVkICR7ZXJyb3J9YDtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBnZXRFbmRTZXNzaW9uVXJsKCk6IHN0cmluZyB8IG51bGwge1xuICAgICAgICBjb25zdCBpZFRva2VuSGludCA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5pZFRva2VuO1xuICAgICAgICByZXR1cm4gdGhpcy51cmxTZXJ2aWNlLmNyZWF0ZUVuZFNlc3Npb25VcmwoaWRUb2tlbkhpbnQpO1xuICAgIH1cbn1cbiJdfQ==