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
var UserService = /** @class */ (function () {
    function UserService(oidcDataService, storagePersistanceService, eventService, loggerService, tokenHelperService, configurationProvider, flowHelper) {
        this.oidcDataService = oidcDataService;
        this.storagePersistanceService = storagePersistanceService;
        this.eventService = eventService;
        this.loggerService = loggerService;
        this.tokenHelperService = tokenHelperService;
        this.configurationProvider = configurationProvider;
        this.flowHelper = flowHelper;
        this.userDataInternal$ = new BehaviorSubject(null);
    }
    Object.defineProperty(UserService.prototype, "userData$", {
        get: function () {
            return this.userDataInternal$.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    // TODO CHECK PARAMETERS
    //  validationResult.idToken can be the complete valudationResult
    UserService.prototype.getAndPersistUserDataInStore = function (isRenewProcess, idToken, decodedIdToken) {
        var _this = this;
        if (isRenewProcess === void 0) { isRenewProcess = false; }
        idToken = idToken || this.storagePersistanceService.idToken;
        decodedIdToken = decodedIdToken || this.tokenHelperService.getPayloadFromToken(idToken, false);
        var existingUserDataFromStorage = this.getUserDataFromStore();
        var haveUserData = !!existingUserDataFromStorage;
        var isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken();
        var isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
        if (!(isCurrentFlowImplicitFlowWithAccessToken || isCurrentFlowCodeFlow)) {
            this.loggerService.logDebug('authorizedCallback id_token flow');
            this.loggerService.logDebug(this.storagePersistanceService.accessToken);
            this.setUserDataToStore(decodedIdToken);
            return of(decodedIdToken);
        }
        if ((!haveUserData && isRenewProcess) || !isRenewProcess) {
            return this.getUserDataOidcFlowAndSave(decodedIdToken.sub).pipe(switchMap(function (userData) {
                _this.loggerService.logDebug('Received user data', userData);
                if (!!userData) {
                    _this.loggerService.logDebug(_this.storagePersistanceService.accessToken);
                    return of(userData);
                }
                else {
                    return throwError('no user data, request failed');
                }
            }));
        }
        return of(existingUserDataFromStorage);
    };
    UserService.prototype.getUserDataFromStore = function () {
        return this.storagePersistanceService.userData || null;
    };
    UserService.prototype.publishUserdataIfExists = function () {
        var userdata = this.getUserDataFromStore();
        if (userdata) {
            this.userDataInternal$.next(userdata);
            this.eventService.fireEvent(EventTypes.UserDataChanged, userdata);
        }
    };
    UserService.prototype.setUserDataToStore = function (value) {
        this.storagePersistanceService.userData = value;
        this.userDataInternal$.next(value);
        this.eventService.fireEvent(EventTypes.UserDataChanged, value);
    };
    UserService.prototype.resetUserDataInStore = function () {
        this.storagePersistanceService.userData = null;
        this.eventService.fireEvent(EventTypes.UserDataChanged, null);
        this.userDataInternal$.next(null);
    };
    UserService.prototype.getUserDataOidcFlowAndSave = function (idTokenSub) {
        var _this = this;
        return this.getIdentityUserData().pipe(map(function (data) {
            if (_this.validateUserdataSubIdToken(idTokenSub, data === null || data === void 0 ? void 0 : data.sub)) {
                _this.setUserDataToStore(data);
                return data;
            }
            else {
                // something went wrong, userdata sub does not match that from id_token
                _this.loggerService.logWarning('authorizedCallback, User data sub does not match sub in id_token');
                _this.loggerService.logDebug('authorizedCallback, token(s) validation failed, resetting');
                _this.resetUserDataInStore();
                return null;
            }
        }));
    };
    UserService.prototype.getIdentityUserData = function () {
        var _a, _b;
        var token = this.storagePersistanceService.getAccessToken();
        if (!this.configurationProvider.wellKnownEndpoints) {
            this.loggerService.logWarning('init check session: authWellKnownEndpoints is undefined');
            return throwError('authWellKnownEndpoints is undefined');
        }
        var canGetUserData = (_b = (_a = this.configurationProvider) === null || _a === void 0 ? void 0 : _a.wellKnownEndpoints) === null || _b === void 0 ? void 0 : _b.userinfoEndpoint;
        if (!canGetUserData) {
            this.loggerService.logError('init check session: authWellKnownEndpoints.userinfo_endpoint is undefined; set auto_userinfo = false in config');
            return throwError('authWellKnownEndpoints.userinfo_endpoint is undefined');
        }
        return this.oidcDataService.get(this.configurationProvider.wellKnownEndpoints.userinfoEndpoint, token);
    };
    UserService.prototype.validateUserdataSubIdToken = function (idTokenSub, userdataSub) {
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
    };
    UserService.ctorParameters = function () { return [
        { type: DataService },
        { type: StoragePersistanceService },
        { type: PublicEventsService },
        { type: LoggerService },
        { type: TokenHelperService },
        { type: ConfigurationProvider },
        { type: FlowHelper }
    ]; };
    UserService = __decorate([
        Injectable()
    ], UserService);
    return UserService;
}());
export { UserService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL3VzZXJEYXRhL3VzZXItc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZUFBZSxFQUFjLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDbkUsT0FBTyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUM3RSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNuRixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDckUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFHcEY7SUFPSSxxQkFDWSxlQUE0QixFQUM1Qix5QkFBb0QsRUFDcEQsWUFBaUMsRUFDakMsYUFBNEIsRUFDNUIsa0JBQXNDLEVBQzdCLHFCQUE0QyxFQUM1QyxVQUFzQjtRQU4vQixvQkFBZSxHQUFmLGVBQWUsQ0FBYTtRQUM1Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGlCQUFZLEdBQVosWUFBWSxDQUFxQjtRQUNqQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9C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bUl2QjtJQUFELGtCQUFDO0NBQUEsQUFuSUQsSUFtSUM7U0FuSVksV0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSwgb2YsIHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IG1hcCwgc3dpdGNoTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9hcGkvZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgRXZlbnRUeXBlcyB9IGZyb20gJy4uL3B1YmxpYy1ldmVudHMvZXZlbnQtdHlwZXMnO1xuaW1wb3J0IHsgUHVibGljRXZlbnRzU2VydmljZSB9IGZyb20gJy4uL3B1YmxpYy1ldmVudHMvcHVibGljLWV2ZW50cy5zZXJ2aWNlJztcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi4vdXRpbHMvZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcbmltcG9ydCB7IFRva2VuSGVscGVyU2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3Rva2VuSGVscGVyL29pZGMtdG9rZW4taGVscGVyLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVXNlclNlcnZpY2Uge1xuICAgIHByaXZhdGUgdXNlckRhdGFJbnRlcm5hbCQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGFueT4obnVsbCk7XG5cbiAgICBnZXQgdXNlckRhdGEkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy51c2VyRGF0YUludGVybmFsJC5hc09ic2VydmFibGUoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBvaWRjRGF0YVNlcnZpY2U6IERhdGFTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgZXZlbnRTZXJ2aWNlOiBQdWJsaWNFdmVudHNTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgdG9rZW5IZWxwZXJTZXJ2aWNlOiBUb2tlbkhlbHBlclNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgZmxvd0hlbHBlcjogRmxvd0hlbHBlclxuICAgICkge31cblxuICAgIC8vIFRPRE8gQ0hFQ0sgUEFSQU1FVEVSU1xuICAgIC8vICB2YWxpZGF0aW9uUmVzdWx0LmlkVG9rZW4gY2FuIGJlIHRoZSBjb21wbGV0ZSB2YWx1ZGF0aW9uUmVzdWx0XG4gICAgZ2V0QW5kUGVyc2lzdFVzZXJEYXRhSW5TdG9yZShpc1JlbmV3UHJvY2VzcyA9IGZhbHNlLCBpZFRva2VuPzogYW55LCBkZWNvZGVkSWRUb2tlbj86IGFueSk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgICAgIGlkVG9rZW4gPSBpZFRva2VuIHx8IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5pZFRva2VuO1xuICAgICAgICBkZWNvZGVkSWRUb2tlbiA9IGRlY29kZWRJZFRva2VuIHx8IHRoaXMudG9rZW5IZWxwZXJTZXJ2aWNlLmdldFBheWxvYWRGcm9tVG9rZW4oaWRUb2tlbiwgZmFsc2UpO1xuXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nVXNlckRhdGFGcm9tU3RvcmFnZSA9IHRoaXMuZ2V0VXNlckRhdGFGcm9tU3RvcmUoKTtcbiAgICAgICAgY29uc3QgaGF2ZVVzZXJEYXRhID0gISFleGlzdGluZ1VzZXJEYXRhRnJvbVN0b3JhZ2U7XG4gICAgICAgIGNvbnN0IGlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4gPSB0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0ltcGxpY2l0Rmxvd1dpdGhBY2Nlc3NUb2tlbigpO1xuICAgICAgICBjb25zdCBpc0N1cnJlbnRGbG93Q29kZUZsb3cgPSB0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCk7XG5cbiAgICAgICAgaWYgKCEoaXNDdXJyZW50Rmxvd0ltcGxpY2l0Rmxvd1dpdGhBY2Nlc3NUb2tlbiB8fCBpc0N1cnJlbnRGbG93Q29kZUZsb3cpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpZF90b2tlbiBmbG93Jyk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcodGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmFjY2Vzc1Rva2VuKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRVc2VyRGF0YVRvU3RvcmUoZGVjb2RlZElkVG9rZW4pO1xuICAgICAgICAgICAgcmV0dXJuIG9mKGRlY29kZWRJZFRva2VuKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgoIWhhdmVVc2VyRGF0YSAmJiBpc1JlbmV3UHJvY2VzcykgfHwgIWlzUmVuZXdQcm9jZXNzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRVc2VyRGF0YU9pZGNGbG93QW5kU2F2ZShkZWNvZGVkSWRUb2tlbi5zdWIpLnBpcGUoXG4gICAgICAgICAgICAgICAgc3dpdGNoTWFwKCh1c2VyRGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1JlY2VpdmVkIHVzZXIgZGF0YScsIHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEhdXNlckRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyh0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuYWNjZXNzVG9rZW4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9mKHVzZXJEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdubyB1c2VyIGRhdGEsIHJlcXVlc3QgZmFpbGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvZihleGlzdGluZ1VzZXJEYXRhRnJvbVN0b3JhZ2UpO1xuICAgIH1cblxuICAgIGdldFVzZXJEYXRhRnJvbVN0b3JlKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UudXNlckRhdGEgfHwgbnVsbDtcbiAgICB9XG5cbiAgICBwdWJsaXNoVXNlcmRhdGFJZkV4aXN0cygpIHtcbiAgICAgICAgY29uc3QgdXNlcmRhdGEgPSB0aGlzLmdldFVzZXJEYXRhRnJvbVN0b3JlKCk7XG4gICAgICAgIGlmICh1c2VyZGF0YSkge1xuICAgICAgICAgICAgdGhpcy51c2VyRGF0YUludGVybmFsJC5uZXh0KHVzZXJkYXRhKTtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLmZpcmVFdmVudChFdmVudFR5cGVzLlVzZXJEYXRhQ2hhbmdlZCwgdXNlcmRhdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0VXNlckRhdGFUb1N0b3JlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnVzZXJEYXRhID0gdmFsdWU7XG4gICAgICAgIHRoaXMudXNlckRhdGFJbnRlcm5hbCQubmV4dCh2YWx1ZSk7XG4gICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLmZpcmVFdmVudChFdmVudFR5cGVzLlVzZXJEYXRhQ2hhbmdlZCwgdmFsdWUpO1xuICAgIH1cblxuICAgIHJlc2V0VXNlckRhdGFJblN0b3JlKCk6IHZvaWQge1xuICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UudXNlckRhdGEgPSBudWxsO1xuICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5maXJlRXZlbnQoRXZlbnRUeXBlcy5Vc2VyRGF0YUNoYW5nZWQsIG51bGwpO1xuICAgICAgICB0aGlzLnVzZXJEYXRhSW50ZXJuYWwkLm5leHQobnVsbCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRVc2VyRGF0YU9pZGNGbG93QW5kU2F2ZShpZFRva2VuU3ViOiBhbnkpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRJZGVudGl0eVVzZXJEYXRhKCkucGlwZShcbiAgICAgICAgICAgIG1hcCgoZGF0YTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmFsaWRhdGVVc2VyZGF0YVN1YklkVG9rZW4oaWRUb2tlblN1YiwgZGF0YT8uc3ViKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFVzZXJEYXRhVG9TdG9yZShkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmcsIHVzZXJkYXRhIHN1YiBkb2VzIG5vdCBtYXRjaCB0aGF0IGZyb20gaWRfdG9rZW5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhvcml6ZWRDYWxsYmFjaywgVXNlciBkYXRhIHN1YiBkb2VzIG5vdCBtYXRjaCBzdWIgaW4gaWRfdG9rZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdhdXRob3JpemVkQ2FsbGJhY2ssIHRva2VuKHMpIHZhbGlkYXRpb24gZmFpbGVkLCByZXNldHRpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldFVzZXJEYXRhSW5TdG9yZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0SWRlbnRpdHlVc2VyRGF0YSgpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5nZXRBY2Nlc3NUb2tlbigpO1xuXG4gICAgICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIud2VsbEtub3duRW5kcG9pbnRzKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnaW5pdCBjaGVjayBzZXNzaW9uOiBhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzIHVuZGVmaW5lZCcpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcignYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNhbkdldFVzZXJEYXRhID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXI/LndlbGxLbm93bkVuZHBvaW50cz8udXNlcmluZm9FbmRwb2ludDtcblxuICAgICAgICBpZiAoIWNhbkdldFVzZXJEYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoXG4gICAgICAgICAgICAgICAgJ2luaXQgY2hlY2sgc2Vzc2lvbjogYXV0aFdlbGxLbm93bkVuZHBvaW50cy51c2VyaW5mb19lbmRwb2ludCBpcyB1bmRlZmluZWQ7IHNldCBhdXRvX3VzZXJpbmZvID0gZmFsc2UgaW4gY29uZmlnJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdhdXRoV2VsbEtub3duRW5kcG9pbnRzLnVzZXJpbmZvX2VuZHBvaW50IGlzIHVuZGVmaW5lZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMub2lkY0RhdGFTZXJ2aWNlLmdldCh0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci53ZWxsS25vd25FbmRwb2ludHMudXNlcmluZm9FbmRwb2ludCwgdG9rZW4pO1xuICAgIH1cblxuICAgIHByaXZhdGUgdmFsaWRhdGVVc2VyZGF0YVN1YklkVG9rZW4oaWRUb2tlblN1YjogYW55LCB1c2VyZGF0YVN1YjogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghaWRUb2tlblN1Yikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF1c2VyZGF0YVN1Yikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChpZFRva2VuU3ViIGFzIHN0cmluZykgIT09ICh1c2VyZGF0YVN1YiBhcyBzdHJpbmcpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3ZhbGlkYXRlVXNlcmRhdGFTdWJJZFRva2VuIGZhaWxlZCcsIGlkVG9rZW5TdWIsIHVzZXJkYXRhU3ViKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbiJdfQ==