import { __decorate } from "tslib";
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthStateService } from '../authState/auth-state.service';
import { AuthorizedState } from '../authState/authorized-state';
import { ConfigurationProvider } from '../config/config.provider';
import { FlowsDataService } from '../flows/flows-data.service';
import { FlowsService } from '../flows/flows.service';
import { SilentRenewService } from '../iframe/silent-renew.service';
import { LoggerService } from '../logging/logger.service';
import { UserService } from '../userData/user-service';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { UrlService } from '../utils/url/url.service';
import { ValidationResult } from '../validation/validation-result';
import * as i0 from "@angular/core";
import * as i1 from "../utils/url/url.service";
import * as i2 from "../flows/flows.service";
import * as i3 from "../utils/flowHelper/flow-helper.service";
import * as i4 from "../config/config.provider";
import * as i5 from "@angular/router";
import * as i6 from "../flows/flows-data.service";
import * as i7 from "../logging/logger.service";
import * as i8 from "../iframe/silent-renew.service";
import * as i9 from "../userData/user-service";
import * as i10 from "../authState/auth-state.service";
let CallbackService = class CallbackService {
    constructor(urlService, flowsService, flowHelper, configurationProvider, router, flowsDataService, loggerService, silentRenewService, userService, authStateService) {
        this.urlService = urlService;
        this.flowsService = flowsService;
        this.flowHelper = flowHelper;
        this.configurationProvider = configurationProvider;
        this.router = router;
        this.flowsDataService = flowsDataService;
        this.loggerService = loggerService;
        this.silentRenewService = silentRenewService;
        this.userService = userService;
        this.authStateService = authStateService;
        this.runTokenValidationRunning = null;
        this.stsCallbackInternal$ = new Subject();
    }
    get stsCallback$() {
        return this.stsCallbackInternal$.asObservable();
    }
    handlePossibleStsCallback(currentCallbackUrl) {
        let callback$;
        if (!this.urlService.isCallbackFromSts()) {
            callback$ = of(null);
        }
        else if (this.flowHelper.isCurrentFlowCodeFlow()) {
            callback$ = this.authorizedCallbackWithCode(currentCallbackUrl);
        }
        else if (this.flowHelper.isCurrentFlowAnyImplicitFlow()) {
            callback$ = this.authorizedImplicitFlowCallback();
        }
        return callback$.pipe(tap(() => this.stsCallbackInternal$.next()));
    }
    startTokenValidationPeriodically(repeatAfterSeconds) {
        if (!!this.runTokenValidationRunning || !this.configurationProvider.openIDConfiguration.silentRenew) {
            return;
        }
        const millisecondsDelayBetweenTokenCheck = repeatAfterSeconds * 1000;
        this.loggerService.logDebug(`starting token validation check every ${repeatAfterSeconds}s (${millisecondsDelayBetweenTokenCheck}ms)`);
        const periodicallyCheck$ = interval(millisecondsDelayBetweenTokenCheck).pipe(switchMap(() => {
            const idToken = this.authStateService.getIdToken();
            const isSilentRenewRunning = this.flowsDataService.isSilentRenewRunning();
            const userDataFromStore = this.userService.getUserDataFromStore();
            this.loggerService.logDebug(`Checking: silentRenewRunning: ${isSilentRenewRunning} id_token: ${!!idToken} userData: ${!!userDataFromStore}`);
            const shouldBeExecuted = userDataFromStore && !isSilentRenewRunning && idToken;
            if (!shouldBeExecuted) {
                return of(null);
            }
            const idTokenHasExpired = this.authStateService.hasIdTokenExpired();
            const accessTokenHasExpired = this.authStateService.hasAccessTokenExpiredIfExpiryExists();
            if (!idTokenHasExpired && !accessTokenHasExpired) {
                return of(null);
            }
            this.loggerService.logDebug('IsAuthorized: id_token idTokenHasExpired, start silent renew if active');
            if (!this.configurationProvider.openIDConfiguration.silentRenew) {
                this.flowsService.resetAuthorizationData();
                return of(null);
            }
            this.flowsDataService.setSilentRenewRunning();
            if (this.flowHelper.isCurrentFlowCodeFlowWithRefeshTokens()) {
                // Refresh Session using Refresh tokens
                return this.refreshSessionWithRefreshTokens();
            }
            return this.refreshSessionWithIframe();
        }));
        this.runTokenValidationRunning = periodicallyCheck$
            .pipe(catchError(() => {
            this.flowsDataService.resetSilentRenewRunning();
            return throwError('periodically check failed');
        }))
            .subscribe(() => {
            if (this.flowHelper.isCurrentFlowCodeFlowWithRefeshTokens()) {
                this.flowsDataService.resetSilentRenewRunning();
            }
        });
    }
    stopPeriodicallTokenCheck() {
        if (this.scheduledHeartBeatInternal) {
            clearTimeout(this.scheduledHeartBeatInternal);
            this.scheduledHeartBeatInternal = null;
            this.runTokenValidationRunning.unsubscribe();
            this.runTokenValidationRunning = null;
        }
    }
    // Code Flow Callback
    authorizedCallbackWithCode(urlToCheck) {
        return this.flowsService.processCodeFlowCallback(urlToCheck).pipe(tap((callbackContext) => {
            if (!this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent && !callbackContext.isRenewProcess) {
                this.router.navigate([this.configurationProvider.openIDConfiguration.postLoginRoute]);
            }
        }), catchError((error) => {
            this.flowsDataService.resetSilentRenewRunning();
            if (!this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent /* TODO && !this.isRenewProcess */) {
                this.router.navigate([this.configurationProvider.openIDConfiguration.unauthorizedRoute]);
            }
            this.stopPeriodicallTokenCheck();
            return throwError(error);
        }));
    }
    // Implicit Flow Callback
    authorizedImplicitFlowCallback(hash) {
        return this.flowsService.processImplicitFlowCallback(hash).pipe(tap((callbackContext) => {
            if (!this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent && !callbackContext.isRenewProcess) {
                this.router.navigate([this.configurationProvider.openIDConfiguration.postLoginRoute]);
            }
        }), catchError((error) => {
            this.flowsDataService.resetSilentRenewRunning();
            if (!this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent /* TODO && !this.isRenewProcess */) {
                this.router.navigate([this.configurationProvider.openIDConfiguration.unauthorizedRoute]);
            }
            this.stopPeriodicallTokenCheck();
            return throwError(error);
        }));
    }
    refreshSessionWithIframe() {
        this.loggerService.logDebug('BEGIN refresh session Authorize Iframe renew');
        const url = this.urlService.getRefreshSessionSilentRenewUrl();
        return this.sendAuthorizeReqestUsingSilentRenew(url);
    }
    refreshSessionWithRefreshTokens() {
        this.loggerService.logDebug('BEGIN refresh session Authorize');
        return this.flowsService.processRefreshToken().pipe(catchError((error) => {
            if (!this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent /* TODO && !this.isRenewProcess */) {
                this.router.navigate([this.configurationProvider.openIDConfiguration.unauthorizedRoute]);
            }
            this.stopPeriodicallTokenCheck();
            this.flowsService.resetAuthorizationData();
            return throwError(error);
        }));
    }
    sendAuthorizeReqestUsingSilentRenew(url) {
        const sessionIframe = this.silentRenewService.getOrCreateIframe();
        this.initSilentRenewRequest();
        this.loggerService.logDebug('sendAuthorizeReqestUsingSilentRenew for URL:' + url);
        return new Observable((observer) => {
            const onLoadHandler = () => {
                sessionIframe.removeEventListener('load', onLoadHandler);
                this.loggerService.logDebug('removed event listener from IFrame');
                observer.next(true);
                observer.complete();
            };
            sessionIframe.addEventListener('load', onLoadHandler);
            sessionIframe.src = url;
        });
    }
    silentRenewEventHandler(e) {
        this.loggerService.logDebug('silentRenewEventHandler');
        if (!e.detail) {
            return;
        }
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            const urlParts = e.detail.toString().split('?');
            // Code Flow Callback silent renew iframe
            this.codeFlowCallbackSilentRenewIframe(urlParts).subscribe(() => {
                this.flowsDataService.resetSilentRenewRunning();
            }, (err) => {
                this.loggerService.logError('Error: ' + err);
                this.flowsDataService.resetSilentRenewRunning();
            });
        }
        else {
            // Implicit Flow Callback silent renew iframe
            this.authorizedImplicitFlowCallback(e.detail).subscribe(() => {
                this.flowsDataService.resetSilentRenewRunning();
            }, (err) => {
                this.loggerService.logError('Error: ' + err);
                this.flowsDataService.resetSilentRenewRunning();
            });
        }
    }
    codeFlowCallbackSilentRenewIframe(urlParts) {
        const params = new HttpParams({
            fromString: urlParts[1],
        });
        const error = params.get('error');
        if (error) {
            this.authStateService.updateAndPublishAuthState({
                authorizationState: AuthorizedState.Unauthorized,
                validationResult: ValidationResult.LoginRequired,
                isRenewProcess: true,
            });
            this.flowsService.resetAuthorizationData();
            this.flowsDataService.setNonce('');
            this.stopPeriodicallTokenCheck();
            return throwError(error);
        }
        const code = params.get('code');
        const state = params.get('state');
        const sessionState = params.get('session_state');
        const callbackContext = {
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
        return this.flowsService.processSilentRenewCodeFlowCallback(callbackContext).pipe(catchError((errorFromFlow) => {
            this.stopPeriodicallTokenCheck();
            this.flowsService.resetAuthorizationData();
            return throwError(errorFromFlow);
        }));
    }
    initSilentRenewRequest() {
        const instanceId = Math.random();
        this.silentRenewService.getOrCreateIframe();
        // Support authorization via DOM events.
        // Deregister if OidcSecurityService.setupModule is called again by any instance.
        //      We only ever want the latest setup service to be reacting to this event.
        this.boundSilentRenewEvent = this.silentRenewEventHandler.bind(this);
        const boundSilentRenewInitEvent = ((e) => {
            if (e.detail !== instanceId) {
                window.removeEventListener('oidc-silent-renew-message', this.boundSilentRenewEvent);
                window.removeEventListener('oidc-silent-renew-init', boundSilentRenewInitEvent);
            }
        }).bind(this);
        window.addEventListener('oidc-silent-renew-init', boundSilentRenewInitEvent, false);
        window.addEventListener('oidc-silent-renew-message', this.boundSilentRenewEvent, false);
        window.dispatchEvent(new CustomEvent('oidc-silent-renew-init', {
            detail: instanceId,
        }));
    }
};
CallbackService.ctorParameters = () => [
    { type: UrlService },
    { type: FlowsService },
    { type: FlowHelper },
    { type: ConfigurationProvider },
    { type: Router },
    { type: FlowsDataService },
    { type: LoggerService },
    { type: SilentRenewService },
    { type: UserService },
    { type: AuthStateService }
];
CallbackService.ɵprov = i0.ɵɵdefineInjectable({ factory: function CallbackService_Factory() { return new CallbackService(i0.ɵɵinject(i1.UrlService), i0.ɵɵinject(i2.FlowsService), i0.ɵɵinject(i3.FlowHelper), i0.ɵɵinject(i4.ConfigurationProvider), i0.ɵɵinject(i5.Router), i0.ɵɵinject(i6.FlowsDataService), i0.ɵɵinject(i7.LoggerService), i0.ɵɵinject(i8.SilentRenewService), i0.ɵɵinject(i9.UserService), i0.ɵɵinject(i10.AuthStateService)); }, token: CallbackService, providedIn: "root" });
CallbackService = __decorate([
    Injectable({ providedIn: 'root' })
], CallbackService);
export { CallbackService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbGJhY2suc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC8iLCJzb3VyY2VzIjpbImxpYi9jYWxsYmFjay9jYWxsYmFjay5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBZ0IsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ25GLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzVELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ25FLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDckUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFN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TUFBTSxDQUFDLGdCQUFnQixDQUFDLHdCQUF3QixFQUFFLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BGLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQywyQkFBMkIsRUFBRSxJQUFJLENBQUMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEYsTUFBTSxDQUFDLGFBQWEsQ0FDaEIsSUFBSSxXQUFXLENBQUMsd0JBQXdCLEVBQUU7WUFDdEMsTUFBTSxFQUFFLFVBQVU7U0FDckIsQ0FBQyxDQUNMLENBQUM7SUFDTixDQUFDO0NBQ0osQ0FBQTs7WUFwUjJCLFVBQVU7WUFDUixZQUFZO1lBQ2QsVUFBVTtZQUNDLHFCQUFxQjtZQUNwQyxNQUFNO1lBQ0ksZ0JBQWdCO1lBQ25CLGFBQWE7WUFDUixrQkFBa0I7WUFDekIsV0FBVztZQUNOLGdCQUFnQjs7O0FBckJyQyxlQUFlO0lBRDNCLFVBQVUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsQ0FBQztHQUN0QixlQUFlLENBZ1MzQjtTQWhTWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cFBhcmFtcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcclxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xyXG5pbXBvcnQgeyBpbnRlcnZhbCwgT2JzZXJ2YWJsZSwgb2YsIFN1YmplY3QsIFN1YnNjcmlwdGlvbiwgdGhyb3dFcnJvciB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBjYXRjaEVycm9yLCBzd2l0Y2hNYXAsIHRhcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgQXV0aFN0YXRlU2VydmljZSB9IGZyb20gJy4uL2F1dGhTdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBBdXRob3JpemVkU3RhdGUgfSBmcm9tICcuLi9hdXRoU3RhdGUvYXV0aG9yaXplZC1zdGF0ZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRmxvd3NTZXJ2aWNlIH0gZnJvbSAnLi4vZmxvd3MvZmxvd3Muc2VydmljZSc7XHJcbmltcG9ydCB7IFNpbGVudFJlbmV3U2VydmljZSB9IGZyb20gJy4uL2lmcmFtZS9zaWxlbnQtcmVuZXcuc2VydmljZSc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVXNlclNlcnZpY2UgfSBmcm9tICcuLi91c2VyRGF0YS91c2VyLXNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVXJsU2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3VybC91cmwuc2VydmljZSc7XHJcbmltcG9ydCB7IFZhbGlkYXRpb25SZXN1bHQgfSBmcm9tICcuLi92YWxpZGF0aW9uL3ZhbGlkYXRpb24tcmVzdWx0JztcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXHJcbmV4cG9ydCBjbGFzcyBDYWxsYmFja1NlcnZpY2Uge1xyXG4gICAgcHJpdmF0ZSBydW5Ub2tlblZhbGlkYXRpb25SdW5uaW5nOiBTdWJzY3JpcHRpb24gPSBudWxsO1xyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZWRIZWFydEJlYXRJbnRlcm5hbDogYW55O1xyXG4gICAgcHJpdmF0ZSBib3VuZFNpbGVudFJlbmV3RXZlbnQ6IGFueTtcclxuXHJcbiAgICBwcml2YXRlIHN0c0NhbGxiYWNrSW50ZXJuYWwkID0gbmV3IFN1YmplY3QoKTtcclxuXHJcbiAgICBnZXQgc3RzQ2FsbGJhY2skKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0c0NhbGxiYWNrSW50ZXJuYWwkLmFzT2JzZXJ2YWJsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgdXJsU2VydmljZTogVXJsU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIGZsb3dzU2VydmljZTogRmxvd3NTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgZmxvd0hlbHBlcjogRmxvd0hlbHBlcixcclxuICAgICAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXHJcbiAgICAgICAgcHJpdmF0ZSBmbG93c0RhdGFTZXJ2aWNlOiBGbG93c0RhdGFTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHNpbGVudFJlbmV3U2VydmljZTogU2lsZW50UmVuZXdTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgdXNlclNlcnZpY2U6IFVzZXJTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgYXV0aFN0YXRlU2VydmljZTogQXV0aFN0YXRlU2VydmljZVxyXG4gICAgKSB7fVxyXG5cclxuICAgIGhhbmRsZVBvc3NpYmxlU3RzQ2FsbGJhY2soY3VycmVudENhbGxiYWNrVXJsOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgY2FsbGJhY2skOiBPYnNlcnZhYmxlPGFueT47XHJcblxyXG4gICAgICAgIGlmICghdGhpcy51cmxTZXJ2aWNlLmlzQ2FsbGJhY2tGcm9tU3RzKCkpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2skID0gb2YobnVsbCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCkpIHtcclxuICAgICAgICAgICAgY2FsbGJhY2skID0gdGhpcy5hdXRob3JpemVkQ2FsbGJhY2tXaXRoQ29kZShjdXJyZW50Q2FsbGJhY2tVcmwpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dBbnlJbXBsaWNpdEZsb3coKSkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayQgPSB0aGlzLmF1dGhvcml6ZWRJbXBsaWNpdEZsb3dDYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrJC5waXBlKHRhcCgoKSA9PiB0aGlzLnN0c0NhbGxiYWNrSW50ZXJuYWwkLm5leHQoKSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0VG9rZW5WYWxpZGF0aW9uUGVyaW9kaWNhbGx5KHJlcGVhdEFmdGVyU2Vjb25kczogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5ydW5Ub2tlblZhbGlkYXRpb25SdW5uaW5nIHx8ICF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG1pbGxpc2Vjb25kc0RlbGF5QmV0d2VlblRva2VuQ2hlY2sgPSByZXBlYXRBZnRlclNlY29uZHMgKiAxMDAwO1xyXG5cclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXHJcbiAgICAgICAgICAgIGBzdGFydGluZyB0b2tlbiB2YWxpZGF0aW9uIGNoZWNrIGV2ZXJ5ICR7cmVwZWF0QWZ0ZXJTZWNvbmRzfXMgKCR7bWlsbGlzZWNvbmRzRGVsYXlCZXR3ZWVuVG9rZW5DaGVja31tcylgXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3QgcGVyaW9kaWNhbGx5Q2hlY2skID0gaW50ZXJ2YWwobWlsbGlzZWNvbmRzRGVsYXlCZXR3ZWVuVG9rZW5DaGVjaykucGlwZShcclxuICAgICAgICAgICAgc3dpdGNoTWFwKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlkVG9rZW4gPSB0aGlzLmF1dGhTdGF0ZVNlcnZpY2UuZ2V0SWRUb2tlbigpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaXNTaWxlbnRSZW5ld1J1bm5pbmcgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuaXNTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJEYXRhRnJvbVN0b3JlID0gdGhpcy51c2VyU2VydmljZS5nZXRVc2VyRGF0YUZyb21TdG9yZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcclxuICAgICAgICAgICAgICAgICAgICBgQ2hlY2tpbmc6IHNpbGVudFJlbmV3UnVubmluZzogJHtpc1NpbGVudFJlbmV3UnVubmluZ30gaWRfdG9rZW46ICR7ISFpZFRva2VufSB1c2VyRGF0YTogJHshIXVzZXJEYXRhRnJvbVN0b3JlfWBcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2hvdWxkQmVFeGVjdXRlZCA9IHVzZXJEYXRhRnJvbVN0b3JlICYmICFpc1NpbGVudFJlbmV3UnVubmluZyAmJiBpZFRva2VuO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghc2hvdWxkQmVFeGVjdXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvZihudWxsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBpZFRva2VuSGFzRXhwaXJlZCA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5oYXNJZFRva2VuRXhwaXJlZCgpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYWNjZXNzVG9rZW5IYXNFeHBpcmVkID0gdGhpcy5hdXRoU3RhdGVTZXJ2aWNlLmhhc0FjY2Vzc1Rva2VuRXhwaXJlZElmRXhwaXJ5RXhpc3RzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCFpZFRva2VuSGFzRXhwaXJlZCAmJiAhYWNjZXNzVG9rZW5IYXNFeHBpcmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnSXNBdXRob3JpemVkOiBpZF90b2tlbiBpZFRva2VuSGFzRXhwaXJlZCwgc3RhcnQgc2lsZW50IHJlbmV3IGlmIGFjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ldykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd3NTZXJ2aWNlLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2YobnVsbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93V2l0aFJlZmVzaFRva2VucygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVmcmVzaCBTZXNzaW9uIHVzaW5nIFJlZnJlc2ggdG9rZW5zXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVmcmVzaFNlc3Npb25XaXRoUmVmcmVzaFRva2VucygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZnJlc2hTZXNzaW9uV2l0aElmcmFtZSgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHRoaXMucnVuVG9rZW5WYWxpZGF0aW9uUnVubmluZyA9IHBlcmlvZGljYWxseUNoZWNrJFxyXG4gICAgICAgICAgICAucGlwZShcclxuICAgICAgICAgICAgICAgIGNhdGNoRXJyb3IoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdwZXJpb2RpY2FsbHkgY2hlY2sgZmFpbGVkJyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3dXaXRoUmVmZXNoVG9rZW5zKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2UucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdG9wUGVyaW9kaWNhbGxUb2tlbkNoZWNrKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLnNjaGVkdWxlZEhlYXJ0QmVhdEludGVybmFsKSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnNjaGVkdWxlZEhlYXJ0QmVhdEludGVybmFsKTtcclxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZWRIZWFydEJlYXRJbnRlcm5hbCA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMucnVuVG9rZW5WYWxpZGF0aW9uUnVubmluZy51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnJ1blRva2VuVmFsaWRhdGlvblJ1bm5pbmcgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDb2RlIEZsb3cgQ2FsbGJhY2tcclxuICAgIHByaXZhdGUgYXV0aG9yaXplZENhbGxiYWNrV2l0aENvZGUodXJsVG9DaGVjazogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvd3NTZXJ2aWNlLnByb2Nlc3NDb2RlRmxvd0NhbGxiYWNrKHVybFRvQ2hlY2spLnBpcGUoXHJcbiAgICAgICAgICAgIHRhcCgoY2FsbGJhY2tDb250ZXh0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24udHJpZ2dlckF1dGhvcml6YXRpb25SZXN1bHRFdmVudCAmJiAhY2FsbGJhY2tDb250ZXh0LmlzUmVuZXdQcm9jZXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoW3RoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24ucG9zdExvZ2luUm91dGVdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIGNhdGNoRXJyb3IoKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2UucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi50cmlnZ2VyQXV0aG9yaXphdGlvblJlc3VsdEV2ZW50IC8qIFRPRE8gJiYgIXRoaXMuaXNSZW5ld1Byb2Nlc3MgKi8pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi51bmF1dGhvcml6ZWRSb3V0ZV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wUGVyaW9kaWNhbGxUb2tlbkNoZWNrKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJbXBsaWNpdCBGbG93IENhbGxiYWNrXHJcbiAgICBwcml2YXRlIGF1dGhvcml6ZWRJbXBsaWNpdEZsb3dDYWxsYmFjayhoYXNoPzogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvd3NTZXJ2aWNlLnByb2Nlc3NJbXBsaWNpdEZsb3dDYWxsYmFjayhoYXNoKS5waXBlKFxyXG4gICAgICAgICAgICB0YXAoKGNhbGxiYWNrQ29udGV4dCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnRyaWdnZXJBdXRob3JpemF0aW9uUmVzdWx0RXZlbnQgJiYgIWNhbGxiYWNrQ29udGV4dC5pc1JlbmV3UHJvY2Vzcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFt0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnBvc3RMb2dpblJvdXRlXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICBjYXRjaEVycm9yKChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mbG93c0RhdGFTZXJ2aWNlLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24udHJpZ2dlckF1dGhvcml6YXRpb25SZXN1bHRFdmVudCAvKiBUT0RPICYmICF0aGlzLmlzUmVuZXdQcm9jZXNzICovKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoW3RoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24udW5hdXRob3JpemVkUm91dGVdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcFBlcmlvZGljYWxsVG9rZW5DaGVjaygpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWZyZXNoU2Vzc2lvbldpdGhJZnJhbWUoKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdCRUdJTiByZWZyZXNoIHNlc3Npb24gQXV0aG9yaXplIElmcmFtZSByZW5ldycpO1xyXG4gICAgICAgIGNvbnN0IHVybCA9IHRoaXMudXJsU2VydmljZS5nZXRSZWZyZXNoU2Vzc2lvblNpbGVudFJlbmV3VXJsKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VuZEF1dGhvcml6ZVJlcWVzdFVzaW5nU2lsZW50UmVuZXcodXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlZnJlc2hTZXNzaW9uV2l0aFJlZnJlc2hUb2tlbnMoKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdCRUdJTiByZWZyZXNoIHNlc3Npb24gQXV0aG9yaXplJyk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmZsb3dzU2VydmljZS5wcm9jZXNzUmVmcmVzaFRva2VuKCkucGlwZShcclxuICAgICAgICAgICAgY2F0Y2hFcnJvcigoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi50cmlnZ2VyQXV0aG9yaXphdGlvblJlc3VsdEV2ZW50IC8qIFRPRE8gJiYgIXRoaXMuaXNSZW5ld1Byb2Nlc3MgKi8pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi51bmF1dGhvcml6ZWRSb3V0ZV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wUGVyaW9kaWNhbGxUb2tlbkNoZWNrKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZsb3dzU2VydmljZS5yZXNldEF1dGhvcml6YXRpb25EYXRhKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbmRBdXRob3JpemVSZXFlc3RVc2luZ1NpbGVudFJlbmV3KHVybDogc3RyaW5nKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XHJcbiAgICAgICAgY29uc3Qgc2Vzc2lvbklmcmFtZSA9IHRoaXMuc2lsZW50UmVuZXdTZXJ2aWNlLmdldE9yQ3JlYXRlSWZyYW1lKCk7XHJcbiAgICAgICAgdGhpcy5pbml0U2lsZW50UmVuZXdSZXF1ZXN0KCk7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdzZW5kQXV0aG9yaXplUmVxZXN0VXNpbmdTaWxlbnRSZW5ldyBmb3IgVVJMOicgKyB1cmwpO1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoKG9ic2VydmVyKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9uTG9hZEhhbmRsZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBzZXNzaW9uSWZyYW1lLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbkxvYWRIYW5kbGVyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygncmVtb3ZlZCBldmVudCBsaXN0ZW5lciBmcm9tIElGcmFtZScpO1xyXG4gICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dCh0cnVlKTtcclxuICAgICAgICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHNlc3Npb25JZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9uTG9hZEhhbmRsZXIpO1xyXG4gICAgICAgICAgICBzZXNzaW9uSWZyYW1lLnNyYyA9IHVybDtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNpbGVudFJlbmV3RXZlbnRIYW5kbGVyKGU6IEN1c3RvbUV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdzaWxlbnRSZW5ld0V2ZW50SGFuZGxlcicpO1xyXG4gICAgICAgIGlmICghZS5kZXRhaWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVybFBhcnRzID0gZS5kZXRhaWwudG9TdHJpbmcoKS5zcGxpdCgnPycpO1xyXG4gICAgICAgICAgICAvLyBDb2RlIEZsb3cgQ2FsbGJhY2sgc2lsZW50IHJlbmV3IGlmcmFtZVxyXG4gICAgICAgICAgICB0aGlzLmNvZGVGbG93Q2FsbGJhY2tTaWxlbnRSZW5ld0lmcmFtZSh1cmxQYXJ0cykuc3Vic2NyaWJlKFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIChlcnI6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignRXJyb3I6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIEltcGxpY2l0IEZsb3cgQ2FsbGJhY2sgc2lsZW50IHJlbmV3IGlmcmFtZVxyXG4gICAgICAgICAgICB0aGlzLmF1dGhvcml6ZWRJbXBsaWNpdEZsb3dDYWxsYmFjayhlLmRldGFpbCkuc3Vic2NyaWJlKFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIChlcnI6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignRXJyb3I6ICcgKyBlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmxvd3NEYXRhU2VydmljZS5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvZGVGbG93Q2FsbGJhY2tTaWxlbnRSZW5ld0lmcmFtZSh1cmxQYXJ0cykge1xyXG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBIdHRwUGFyYW1zKHtcclxuICAgICAgICAgICAgZnJvbVN0cmluZzogdXJsUGFydHNbMV0sXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGVycm9yID0gcGFyYW1zLmdldCgnZXJyb3InKTtcclxuXHJcbiAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXV0aFN0YXRlU2VydmljZS51cGRhdGVBbmRQdWJsaXNoQXV0aFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIGF1dGhvcml6YXRpb25TdGF0ZTogQXV0aG9yaXplZFN0YXRlLlVuYXV0aG9yaXplZCxcclxuICAgICAgICAgICAgICAgIHZhbGlkYXRpb25SZXN1bHQ6IFZhbGlkYXRpb25SZXN1bHQuTG9naW5SZXF1aXJlZCxcclxuICAgICAgICAgICAgICAgIGlzUmVuZXdQcm9jZXNzOiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5mbG93c1NlcnZpY2UucmVzZXRBdXRob3JpemF0aW9uRGF0YSgpO1xyXG4gICAgICAgICAgICB0aGlzLmZsb3dzRGF0YVNlcnZpY2Uuc2V0Tm9uY2UoJycpO1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BQZXJpb2RpY2FsbFRva2VuQ2hlY2soKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY29kZSA9IHBhcmFtcy5nZXQoJ2NvZGUnKTtcclxuICAgICAgICBjb25zdCBzdGF0ZSA9IHBhcmFtcy5nZXQoJ3N0YXRlJyk7XHJcbiAgICAgICAgY29uc3Qgc2Vzc2lvblN0YXRlID0gcGFyYW1zLmdldCgnc2Vzc2lvbl9zdGF0ZScpO1xyXG5cclxuICAgICAgICBjb25zdCBjYWxsYmFja0NvbnRleHQgPSB7XHJcbiAgICAgICAgICAgIGNvZGUsXHJcbiAgICAgICAgICAgIHJlZnJlc2hUb2tlbjogbnVsbCxcclxuICAgICAgICAgICAgc3RhdGUsXHJcbiAgICAgICAgICAgIHNlc3Npb25TdGF0ZSxcclxuICAgICAgICAgICAgYXV0aFJlc3VsdDogbnVsbCxcclxuICAgICAgICAgICAgaXNSZW5ld1Byb2Nlc3M6IGZhbHNlLFxyXG4gICAgICAgICAgICBqd3RLZXlzOiBudWxsLFxyXG4gICAgICAgICAgICB2YWxpZGF0aW9uUmVzdWx0OiBudWxsLFxyXG4gICAgICAgICAgICBleGlzdGluZ0lkVG9rZW46IG51bGwsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmxvd3NTZXJ2aWNlLnByb2Nlc3NTaWxlbnRSZW5ld0NvZGVGbG93Q2FsbGJhY2soY2FsbGJhY2tDb250ZXh0KS5waXBlKFxyXG4gICAgICAgICAgICBjYXRjaEVycm9yKChlcnJvckZyb21GbG93KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3BQZXJpb2RpY2FsbFRva2VuQ2hlY2soKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmxvd3NTZXJ2aWNlLnJlc2V0QXV0aG9yaXphdGlvbkRhdGEoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVycm9yRnJvbUZsb3cpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbml0U2lsZW50UmVuZXdSZXF1ZXN0KCkge1xyXG4gICAgICAgIGNvbnN0IGluc3RhbmNlSWQgPSBNYXRoLnJhbmRvbSgpO1xyXG4gICAgICAgIHRoaXMuc2lsZW50UmVuZXdTZXJ2aWNlLmdldE9yQ3JlYXRlSWZyYW1lKCk7XHJcbiAgICAgICAgLy8gU3VwcG9ydCBhdXRob3JpemF0aW9uIHZpYSBET00gZXZlbnRzLlxyXG4gICAgICAgIC8vIERlcmVnaXN0ZXIgaWYgT2lkY1NlY3VyaXR5U2VydmljZS5zZXR1cE1vZHVsZSBpcyBjYWxsZWQgYWdhaW4gYnkgYW55IGluc3RhbmNlLlxyXG4gICAgICAgIC8vICAgICAgV2Ugb25seSBldmVyIHdhbnQgdGhlIGxhdGVzdCBzZXR1cCBzZXJ2aWNlIHRvIGJlIHJlYWN0aW5nIHRvIHRoaXMgZXZlbnQuXHJcbiAgICAgICAgdGhpcy5ib3VuZFNpbGVudFJlbmV3RXZlbnQgPSB0aGlzLnNpbGVudFJlbmV3RXZlbnRIYW5kbGVyLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGJvdW5kU2lsZW50UmVuZXdJbml0RXZlbnQ6IGFueSA9ICgoZTogQ3VzdG9tRXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuZGV0YWlsICE9PSBpbnN0YW5jZUlkKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignb2lkYy1zaWxlbnQtcmVuZXctbWVzc2FnZScsIHRoaXMuYm91bmRTaWxlbnRSZW5ld0V2ZW50KTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdvaWRjLXNpbGVudC1yZW5ldy1pbml0JywgYm91bmRTaWxlbnRSZW5ld0luaXRFdmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb2lkYy1zaWxlbnQtcmVuZXctaW5pdCcsIGJvdW5kU2lsZW50UmVuZXdJbml0RXZlbnQsIGZhbHNlKTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb2lkYy1zaWxlbnQtcmVuZXctbWVzc2FnZScsIHRoaXMuYm91bmRTaWxlbnRSZW5ld0V2ZW50LCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxyXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoJ29pZGMtc2lsZW50LXJlbmV3LWluaXQnLCB7XHJcbiAgICAgICAgICAgICAgICBkZXRhaWw6IGluc3RhbmNlSWQsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG4iXX0=