import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DataService } from '../api/data.service';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { EventTypes } from '../public-events/event-types';
import { PublicEventsService } from '../public-events/public-events.service';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { TokenHelperService } from '../utils/tokenHelper/oidc-token-helper.service';
let UserService = class UserService {
    constructor(oidcDataService, storagePersistanceService, eventService, loggerService, tokenHelperService, configurationProvider, flowHelper) {
        this.oidcDataService = oidcDataService;
        this.storagePersistanceService = storagePersistanceService;
        this.eventService = eventService;
        this.loggerService = loggerService;
        this.tokenHelperService = tokenHelperService;
        this.configurationProvider = configurationProvider;
        this.flowHelper = flowHelper;
        this.userDataInternal$ = new BehaviorSubject(null);
    }
    get userData$() {
        return this.userDataInternal$.asObservable();
    }
    // TODO CHECK PARAMETERS
    //  validationResult.idToken can be the complete valudationResult
    getAndPersistUserDataInStore(isRenewProcess = false, idToken, decodedIdToken) {
        idToken = idToken || this.storagePersistanceService.idToken;
        decodedIdToken = decodedIdToken || this.tokenHelperService.getPayloadFromToken(idToken, false);
        const existingUserDataFromStorage = this.getUserDataFromStore();
        const haveUserData = !!existingUserDataFromStorage;
        const isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken();
        const isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
        if (!(isCurrentFlowImplicitFlowWithAccessToken || isCurrentFlowCodeFlow)) {
            this.loggerService.logDebug('authorizedCallback id_token flow');
            this.loggerService.logDebug(this.storagePersistanceService.accessToken);
            this.setUserDataToStore(decodedIdToken);
            return of(decodedIdToken);
        }
        if ((!haveUserData && isRenewProcess) || !isRenewProcess) {
            return this.getUserDataOidcFlowAndSave(decodedIdToken.sub).pipe(switchMap((userData) => {
                this.loggerService.logDebug('Received user data', userData);
                if (!!userData) {
                    this.loggerService.logDebug(this.storagePersistanceService.accessToken);
                    return of(userData);
                }
                else {
                    return throwError('no user data, request failed');
                }
            }));
        }
        return of(existingUserDataFromStorage);
    }
    getUserDataFromStore() {
        return this.storagePersistanceService.userData || null;
    }
    publishUserdataIfExists() {
        const userdata = this.getUserDataFromStore();
        if (userdata) {
            this.userDataInternal$.next(userdata);
            this.eventService.fireEvent(EventTypes.UserDataChanged, userdata);
        }
    }
    setUserDataToStore(value) {
        this.storagePersistanceService.userData = value;
        this.userDataInternal$.next(value);
        this.eventService.fireEvent(EventTypes.UserDataChanged, value);
    }
    resetUserDataInStore() {
        this.storagePersistanceService.userData = null;
        this.eventService.fireEvent(EventTypes.UserDataChanged, null);
        this.userDataInternal$.next(null);
    }
    getUserDataOidcFlowAndSave(idTokenSub) {
        return this.getIdentityUserData().pipe(map((data) => {
            if (this.validateUserdataSubIdToken(idTokenSub, data === null || data === void 0 ? void 0 : data.sub)) {
                this.setUserDataToStore(data);
                return data;
            }
            else {
                // something went wrong, userdata sub does not match that from id_token
                this.loggerService.logWarning('authorizedCallback, User data sub does not match sub in id_token');
                this.loggerService.logDebug('authorizedCallback, token(s) validation failed, resetting');
                this.resetUserDataInStore();
                return null;
            }
        }));
    }
    getIdentityUserData() {
        var _a, _b;
        const token = this.storagePersistanceService.getAccessToken();
        if (!this.configurationProvider.wellKnownEndpoints) {
            this.loggerService.logWarning('init check session: authWellKnownEndpoints is undefined');
            return throwError('authWellKnownEndpoints is undefined');
        }
        const canGetUserData = (_b = (_a = this.configurationProvider) === null || _a === void 0 ? void 0 : _a.wellKnownEndpoints) === null || _b === void 0 ? void 0 : _b.userinfoEndpoint;
        if (!canGetUserData) {
            this.loggerService.logError('init check session: authWellKnownEndpoints.userinfo_endpoint is undefined; set auto_userinfo = false in config');
            return throwError('authWellKnownEndpoints.userinfo_endpoint is undefined');
        }
        return this.oidcDataService.get(this.configurationProvider.wellKnownEndpoints.userinfoEndpoint, token);
    }
    validateUserdataSubIdToken(idTokenSub, userdataSub) {
        if (!idTokenSub) {
            return false;
        }
        if (!userdataSub) {
            return false;
        }
        if (idTokenSub !== userdataSub) {
            this.loggerService.logDebug('validateUserdataSubIdToken failed', idTokenSub, userdataSub);
            return false;
        }
        return true;
    }
};
UserService.ctorParameters = () => [
    { type: DataService },
    { type: StoragePersistanceService },
    { type: PublicEventsService },
    { type: LoggerService },
    { type: TokenHelperService },
    { type: ConfigurationProvider },
    { type: FlowHelper }
];
UserService = __decorate([
    Injectable()
], UserService);
export { UserService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL3VzZXJEYXRhL3VzZXItc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZUFBZSxFQUFjLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbkUsT0FBTyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUM3RSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNuRixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDckUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFHcEYsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBVztJQU9wQixZQUNZLGVBQTRCLEVBQzVCLHlCQUFvRCxFQUNwRCxZQUFpQyxFQUNqQyxhQUE0QixFQUM1QixrQkFBc0MsRUFDN0IscUJBQTRDLEVBQzVDLFVBQXNCO1FBTi9CLG9CQUFlLEdBQWYsZUFBZSxDQUFhO1FBQzVCLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFDcEQsaUJBQVksR0FBWixZQUFZLENBQXFCO1FBQ2pDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVC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YmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUsIG9mLCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBtYXAsIHN3aXRjaE1hcCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vYXBpL2RhdGEuc2VydmljZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IEV2ZW50VHlwZXMgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL2V2ZW50LXR5cGVzJztcbmltcG9ydCB7IFB1YmxpY0V2ZW50c1NlcnZpY2UgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL3B1YmxpYy1ldmVudHMuc2VydmljZSc7XG5pbXBvcnQgeyBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlIH0gZnJvbSAnLi4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RhbmNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XG5pbXBvcnQgeyBUb2tlbkhlbHBlclNlcnZpY2UgfSBmcm9tICcuLi91dGlscy90b2tlbkhlbHBlci9vaWRjLXRva2VuLWhlbHBlci5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFVzZXJTZXJ2aWNlIHtcbiAgICBwcml2YXRlIHVzZXJEYXRhSW50ZXJuYWwkID0gbmV3IEJlaGF2aW9yU3ViamVjdDxhbnk+KG51bGwpO1xuXG4gICAgZ2V0IHVzZXJEYXRhJCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudXNlckRhdGFJbnRlcm5hbCQuYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgb2lkY0RhdGFTZXJ2aWNlOiBEYXRhU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGV2ZW50U2VydmljZTogUHVibGljRXZlbnRzU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHRva2VuSGVscGVyU2VydmljZTogVG9rZW5IZWxwZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGZsb3dIZWxwZXI6IEZsb3dIZWxwZXJcbiAgICApIHt9XG5cbiAgICAvLyBUT0RPIENIRUNLIFBBUkFNRVRFUlNcbiAgICAvLyAgdmFsaWRhdGlvblJlc3VsdC5pZFRva2VuIGNhbiBiZSB0aGUgY29tcGxldGUgdmFsdWRhdGlvblJlc3VsdFxuICAgIGdldEFuZFBlcnNpc3RVc2VyRGF0YUluU3RvcmUoaXNSZW5ld1Byb2Nlc3MgPSBmYWxzZSwgaWRUb2tlbj86IGFueSwgZGVjb2RlZElkVG9rZW4/OiBhbnkpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgICAgICBpZFRva2VuID0gaWRUb2tlbiB8fCB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuaWRUb2tlbjtcbiAgICAgICAgZGVjb2RlZElkVG9rZW4gPSBkZWNvZGVkSWRUb2tlbiB8fCB0aGlzLnRva2VuSGVscGVyU2VydmljZS5nZXRQYXlsb2FkRnJvbVRva2VuKGlkVG9rZW4sIGZhbHNlKTtcblxuICAgICAgICBjb25zdCBleGlzdGluZ1VzZXJEYXRhRnJvbVN0b3JhZ2UgPSB0aGlzLmdldFVzZXJEYXRhRnJvbVN0b3JlKCk7XG4gICAgICAgIGNvbnN0IGhhdmVVc2VyRGF0YSA9ICEhZXhpc3RpbmdVc2VyRGF0YUZyb21TdG9yYWdlO1xuICAgICAgICBjb25zdCBpc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aEFjY2Vzc1Rva2VuID0gdGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4oKTtcbiAgICAgICAgY29uc3QgaXNDdXJyZW50Rmxvd0NvZGVGbG93ID0gdGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpO1xuXG4gICAgICAgIGlmICghKGlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4gfHwgaXNDdXJyZW50Rmxvd0NvZGVGbG93KSkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdhdXRob3JpemVkQ2FsbGJhY2sgaWRfdG9rZW4gZmxvdycpO1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5hY2Nlc3NUb2tlbik7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0VXNlckRhdGFUb1N0b3JlKGRlY29kZWRJZFRva2VuKTtcbiAgICAgICAgICAgIHJldHVybiBvZihkZWNvZGVkSWRUb2tlbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKCFoYXZlVXNlckRhdGEgJiYgaXNSZW5ld1Byb2Nlc3MpIHx8ICFpc1JlbmV3UHJvY2Vzcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VXNlckRhdGFPaWRjRmxvd0FuZFNhdmUoZGVjb2RlZElkVG9rZW4uc3ViKS5waXBlKFxuICAgICAgICAgICAgICAgIHN3aXRjaE1hcCgodXNlckRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdSZWNlaXZlZCB1c2VyIGRhdGEnLCB1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghIXVzZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcodGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmFjY2Vzc1Rva2VuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvZih1c2VyRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcignbm8gdXNlciBkYXRhLCByZXF1ZXN0IGZhaWxlZCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb2YoZXhpc3RpbmdVc2VyRGF0YUZyb21TdG9yYWdlKTtcbiAgICB9XG5cbiAgICBnZXRVc2VyRGF0YUZyb21TdG9yZSgpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnVzZXJEYXRhIHx8IG51bGw7XG4gICAgfVxuXG4gICAgcHVibGlzaFVzZXJkYXRhSWZFeGlzdHMoKSB7XG4gICAgICAgIGNvbnN0IHVzZXJkYXRhID0gdGhpcy5nZXRVc2VyRGF0YUZyb21TdG9yZSgpO1xuICAgICAgICBpZiAodXNlcmRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMudXNlckRhdGFJbnRlcm5hbCQubmV4dCh1c2VyZGF0YSk7XG4gICAgICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5maXJlRXZlbnQoRXZlbnRUeXBlcy5Vc2VyRGF0YUNoYW5nZWQsIHVzZXJkYXRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFVzZXJEYXRhVG9TdG9yZSh2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS51c2VyRGF0YSA9IHZhbHVlO1xuICAgICAgICB0aGlzLnVzZXJEYXRhSW50ZXJuYWwkLm5leHQodmFsdWUpO1xuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5maXJlRXZlbnQoRXZlbnRUeXBlcy5Vc2VyRGF0YUNoYW5nZWQsIHZhbHVlKTtcbiAgICB9XG5cbiAgICByZXNldFVzZXJEYXRhSW5TdG9yZSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnVzZXJEYXRhID0gbnVsbDtcbiAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuZmlyZUV2ZW50KEV2ZW50VHlwZXMuVXNlckRhdGFDaGFuZ2VkLCBudWxsKTtcbiAgICAgICAgdGhpcy51c2VyRGF0YUludGVybmFsJC5uZXh0KG51bGwpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VXNlckRhdGFPaWRjRmxvd0FuZFNhdmUoaWRUb2tlblN1YjogYW55KTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SWRlbnRpdHlVc2VyRGF0YSgpLnBpcGUoXG4gICAgICAgICAgICBtYXAoKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZhbGlkYXRlVXNlcmRhdGFTdWJJZFRva2VuKGlkVG9rZW5TdWIsIGRhdGE/LnN1YikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRVc2VyRGF0YVRvU3RvcmUoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nLCB1c2VyZGF0YSBzdWIgZG9lcyBub3QgbWF0Y2ggdGhhdCBmcm9tIGlkX3Rva2VuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRob3JpemVkQ2FsbGJhY2ssIFVzZXIgZGF0YSBzdWIgZG9lcyBub3QgbWF0Y2ggc3ViIGluIGlkX3Rva2VuJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnYXV0aG9yaXplZENhbGxiYWNrLCB0b2tlbihzKSB2YWxpZGF0aW9uIGZhaWxlZCwgcmVzZXR0aW5nJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRVc2VyRGF0YUluU3RvcmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldElkZW50aXR5VXNlckRhdGEoKTogT2JzZXJ2YWJsZTxhbnk+IHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuZ2V0QWNjZXNzVG9rZW4oKTtcblxuICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cykge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2luaXQgY2hlY2sgc2Vzc2lvbjogYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQnKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjYW5HZXRVc2VyRGF0YSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyPy53ZWxsS25vd25FbmRwb2ludHM/LnVzZXJpbmZvRW5kcG9pbnQ7XG5cbiAgICAgICAgaWYgKCFjYW5HZXRVc2VyRGF0YSkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKFxuICAgICAgICAgICAgICAgICdpbml0IGNoZWNrIHNlc3Npb246IGF1dGhXZWxsS25vd25FbmRwb2ludHMudXNlcmluZm9fZW5kcG9pbnQgaXMgdW5kZWZpbmVkOyBzZXQgYXV0b191c2VyaW5mbyA9IGZhbHNlIGluIGNvbmZpZydcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcignYXV0aFdlbGxLbm93bkVuZHBvaW50cy51c2VyaW5mb19lbmRwb2ludCBpcyB1bmRlZmluZWQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLm9pZGNEYXRhU2VydmljZS5nZXQodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIud2VsbEtub3duRW5kcG9pbnRzLnVzZXJpbmZvRW5kcG9pbnQsIHRva2VuKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHZhbGlkYXRlVXNlcmRhdGFTdWJJZFRva2VuKGlkVG9rZW5TdWI6IGFueSwgdXNlcmRhdGFTdWI6IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWlkVG9rZW5TdWIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdXNlcmRhdGFTdWIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoaWRUb2tlblN1YiBhcyBzdHJpbmcpICE9PSAodXNlcmRhdGFTdWIgYXMgc3RyaW5nKSkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCd2YWxpZGF0ZVVzZXJkYXRhU3ViSWRUb2tlbiBmYWlsZWQnLCBpZFRva2VuU3ViLCB1c2VyZGF0YVN1Yik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4iXX0=