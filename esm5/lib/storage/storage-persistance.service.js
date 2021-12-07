import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { AuthorizedState } from '../authState/authorized-state';
import { ConfigurationProvider } from '../config/config.provider';
import { AbstractSecurityStorage } from './abstract-security-storage';
var StoragePersistanceService = /** @class */ (function () {
    function StoragePersistanceService(oidcSecurityStorage, configurationProvider) {
        this.oidcSecurityStorage = oidcSecurityStorage;
        this.configurationProvider = configurationProvider;
        this.storageAuthResult = 'authorizationResult';
        this.storageAccessToken = 'authorizationData';
        this.storageIdToken = 'authorizationDataIdToken';
        this.storageAuthorizedState = 'storageAuthorizedState';
        this.storageUserData = 'userData';
        this.storageAuthNonce = 'authNonce';
        this.storageCodeVerifier = 'codeVerifier';
        this.storageAuthStateControl = 'authStateControl';
        this.storageSessionState = 'session_state';
        this.storageSilentRenewRunning = 'storageSilentRenewRunning';
        this.storageAccessTokenExpiresIn = 'access_token_expires_at';
    }
    Object.defineProperty(StoragePersistanceService.prototype, "authResult", {
        get: function () {
            return this.retrieve(this.storageAuthResult);
        },
        set: function (value) {
            var _a;
            this.store(this.storageAuthResult, value);
            var expiresIn = (_a = this.authResult) === null || _a === void 0 ? void 0 : _a.expires_in;
            if (expiresIn) {
                var accessTokenExpiryTime = new Date().valueOf() + expiresIn * 1000;
                this.accessTokenExpiresIn = accessTokenExpiryTime;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoragePersistanceService.prototype, "accessToken", {
        get: function () {
            return this.retrieve(this.storageAccessToken) || '';
        },
        set: function (value) {
            this.store(this.storageAccessToken, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoragePersistanceService.prototype, "idToken", {
        get: function () {
            return this.retrieve(this.storageIdToken) || '';
        },
        set: function (value) {
            this.store(this.storageIdToken, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoragePersistanceService.prototype, "authorizedState", {
        get: function () {
            return this.retrieve(this.storageAuthorizedState);
        },
        set: function (value) {
            this.store(this.storageAuthorizedState, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoragePersistanceService.prototype, "userData", {
        get: function () {
            return this.retrieve(this.storageUserData);
        },
        set: function (value) {
            this.store(this.storageUserData, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoragePersistanceService.prototype, "authNonce", {
        get: function () {
            return this.retrieve(this.storageAuthNonce) || '';
        },
        set: function (value) {
            this.store(this.storageAuthNonce, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoragePersistanceService.prototype, "codeVerifier", {
        get: function () {
            return this.retrieve(this.storageCodeVerifier) || '';
        },
        set: function (value) {
            this.store(this.storageCodeVerifier, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoragePersistanceService.prototype, "authStateControl", {
        get: function () {
            return this.retrieve(this.storageAuthStateControl) || '';
        },
        set: function (value) {
            this.store(this.storageAuthStateControl, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoragePersistanceService.prototype, "sessionState", {
        get: function () {
            return this.retrieve(this.storageSessionState);
        },
        set: function (value) {
            this.store(this.storageSessionState, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoragePersistanceService.prototype, "silentRenewRunning", {
        get: function () {
            return this.retrieve(this.storageSilentRenewRunning) || '';
        },
        set: function (value) {
            this.store(this.storageSilentRenewRunning, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StoragePersistanceService.prototype, "accessTokenExpiresIn", {
        get: function () {
            return this.retrieve(this.storageAccessTokenExpiresIn);
        },
        set: function (value) {
            this.store(this.storageAccessTokenExpiresIn, value);
        },
        enumerable: true,
        configurable: true
    });
    StoragePersistanceService.prototype.retrieve = function (key) {
        var keyToRead = this.createKeyWithPrefix(key);
        return this.oidcSecurityStorage.read(keyToRead);
    };
    StoragePersistanceService.prototype.store = function (key, value) {
        var keyToStore = this.createKeyWithPrefix(key);
        this.oidcSecurityStorage.write(keyToStore, value);
    };
    StoragePersistanceService.prototype.resetStorageFlowData = function () {
        this.store(this.storageSessionState, '');
        this.store(this.storageSilentRenewRunning, '');
        this.store(this.storageCodeVerifier, '');
        this.store(this.storageUserData, '');
    };
    StoragePersistanceService.prototype.resetAuthStateInStorage = function () {
        this.store(this.storageAuthorizedState, AuthorizedState.Unknown);
        this.store(this.storageAccessToken, '');
        this.store(this.storageIdToken, '');
        this.store(this.storageAuthResult, '');
    };
    StoragePersistanceService.prototype.getAccessToken = function () {
        return this.retrieve(this.storageAccessToken);
    };
    StoragePersistanceService.prototype.getIdToken = function () {
        return this.retrieve(this.storageIdToken);
    };
    StoragePersistanceService.prototype.getRefreshToken = function () {
        var _a;
        return (_a = this.authResult) === null || _a === void 0 ? void 0 : _a.refresh_token;
    };
    StoragePersistanceService.prototype.createKeyWithPrefix = function (key) {
        var prefix = this.configurationProvider.openIDConfiguration.clientId;
        return prefix + "_" + key;
    };
    StoragePersistanceService.ctorParameters = function () { return [
        { type: AbstractSecurityStorage },
        { type: ConfigurationProvider }
    ]; };
    StoragePersistanceService = __decorate([
        Injectable()
    ], StoragePersistanceService);
    return StoragePersistanceService;
}());
export { StoragePersistanceService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUt0RTtJQUNJLG1DQUNxQixtQkFBNEMsRUFDNUMscUJBQTRDO1FBRDVDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBeUI7UUFDNUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQWdHekQsc0JBQWlCLEdBQUcscUJBQXFCLENBQUM7UUFFMUMsdUJBQWtCLEdBQUcsbUJBQW1CLENBQUM7UUFFekMsbUJBQWMsR0FBRywwQkFBMEIsQ0FBQztRQUU1QywyQkFBc0IsR0FBRyx3QkFBd0IsQ0FBQztRQUVsRCxvQkFBZSxHQUFHLFVBQVUsQ0FBQztRQUU3QixxQkFBZ0IsR0FBRyxXQUFXLENBQUM7UUFFL0Isd0JBQW1CLEdBQUcsY0FBYyxDQUFDO1FBRXJDLDRCQUF1QixHQUFHLGtCQUFrQixDQUFDO1FBRTdDLHdCQUFtQixHQUFHLGVBQWUsQ0FBQztRQUV0Qyw4QkFBeUIsR0FBRywyQkFBMkIsQ0FBQztRQUV4RCxnQ0FBMkIsR0FBRyx5QkFBeUIsQ0FBQztJQW5IN0QsQ0FBQztJQUVKLHNCQUFJLGlEQUFVO2FBQWQ7WUFDSSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDakQsQ0FBQzthQUVELFVBQWUsS0FBVTs7WUFDckIs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OlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQXV0aG9yaXplZFN0YXRlIH0gZnJvbSAnLi4vYXV0aFN0YXRlL2F1dGhvcml6ZWQtc3RhdGUnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBBYnN0cmFjdFNlY3VyaXR5U3RvcmFnZSB9IGZyb20gJy4vYWJzdHJhY3Qtc2VjdXJpdHktc3RvcmFnZSc7XG5cbmV4cG9ydCB0eXBlIFNpbGVudFJlbmV3U3RhdGUgPSAncnVubmluZycgfCAnJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IG9pZGNTZWN1cml0eVN0b3JhZ2U6IEFic3RyYWN0U2VjdXJpdHlTdG9yYWdlLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyXG4gICAgKSB7fVxuXG4gICAgZ2V0IGF1dGhSZXN1bHQoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmV0cmlldmUodGhpcy5zdG9yYWdlQXV0aFJlc3VsdCk7XG4gICAgfVxuXG4gICAgc2V0IGF1dGhSZXN1bHQodmFsdWU6IGFueSkge1xuICAgICAgICB0aGlzLnN0b3JlKHRoaXMuc3RvcmFnZUF1dGhSZXN1bHQsIHZhbHVlKTtcblxuICAgICAgICBjb25zdCBleHBpcmVzSW4gPSB0aGlzLmF1dGhSZXN1bHQ/LmV4cGlyZXNfaW47XG4gICAgICAgIGlmIChleHBpcmVzSW4pIHtcbiAgICAgICAgICAgIGNvbnN0IGFjY2Vzc1Rva2VuRXhwaXJ5VGltZSA9IG5ldyBEYXRlKCkudmFsdWVPZigpICsgZXhwaXJlc0luICogMTAwMDtcbiAgICAgICAgICAgIHRoaXMuYWNjZXNzVG9rZW5FeHBpcmVzSW4gPSBhY2Nlc3NUb2tlbkV4cGlyeVRpbWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgYWNjZXNzVG9rZW4oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmV0cmlldmUodGhpcy5zdG9yYWdlQWNjZXNzVG9rZW4pIHx8ICcnO1xuICAgIH1cblxuICAgIHNldCBhY2Nlc3NUb2tlbih2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlQWNjZXNzVG9rZW4sIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgaWRUb2tlbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXRyaWV2ZSh0aGlzLnN0b3JhZ2VJZFRva2VuKSB8fCAnJztcbiAgICB9XG5cbiAgICBzZXQgaWRUb2tlbih2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlSWRUb2tlbiwgdmFsdWUpO1xuICAgIH1cblxuICAgIGdldCBhdXRob3JpemVkU3RhdGUoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmV0cmlldmUodGhpcy5zdG9yYWdlQXV0aG9yaXplZFN0YXRlKTtcbiAgICB9XG5cbiAgICBzZXQgYXV0aG9yaXplZFN0YXRlKHZhbHVlOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5zdG9yZSh0aGlzLnN0b3JhZ2VBdXRob3JpemVkU3RhdGUsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgdXNlckRhdGEoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmV0cmlldmUodGhpcy5zdG9yYWdlVXNlckRhdGEpO1xuICAgIH1cblxuICAgIHNldCB1c2VyRGF0YSh2YWx1ZTogYW55KSB7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlVXNlckRhdGEsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgYXV0aE5vbmNlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnJldHJpZXZlKHRoaXMuc3RvcmFnZUF1dGhOb25jZSkgfHwgJyc7XG4gICAgfVxuXG4gICAgc2V0IGF1dGhOb25jZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlQXV0aE5vbmNlLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IGNvZGVWZXJpZmllcigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXRyaWV2ZSh0aGlzLnN0b3JhZ2VDb2RlVmVyaWZpZXIpIHx8ICcnO1xuICAgIH1cblxuICAgIHNldCBjb2RlVmVyaWZpZXIodmFsdWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLnN0b3JlKHRoaXMuc3RvcmFnZUNvZGVWZXJpZmllciwgdmFsdWUpO1xuICAgIH1cblxuICAgIGdldCBhdXRoU3RhdGVDb250cm9sKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnJldHJpZXZlKHRoaXMuc3RvcmFnZUF1dGhTdGF0ZUNvbnRyb2wpIHx8ICcnO1xuICAgIH1cblxuICAgIHNldCBhdXRoU3RhdGVDb250cm9sKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zdG9yZSh0aGlzLnN0b3JhZ2VBdXRoU3RhdGVDb250cm9sLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IHNlc3Npb25TdGF0ZSgpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXRyaWV2ZSh0aGlzLnN0b3JhZ2VTZXNzaW9uU3RhdGUpO1xuICAgIH1cblxuICAgIHNldCBzZXNzaW9uU3RhdGUodmFsdWU6IGFueSkge1xuICAgICAgICB0aGlzLnN0b3JlKHRoaXMuc3RvcmFnZVNlc3Npb25TdGF0ZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIGdldCBzaWxlbnRSZW5ld1J1bm5pbmcoKTogU2lsZW50UmVuZXdTdGF0ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJldHJpZXZlKHRoaXMuc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZykgfHwgJyc7XG4gICAgfVxuXG4gICAgc2V0IHNpbGVudFJlbmV3UnVubmluZyh2YWx1ZTogU2lsZW50UmVuZXdTdGF0ZSkge1xuICAgICAgICB0aGlzLnN0b3JlKHRoaXMuc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZywgdmFsdWUpO1xuICAgIH1cbiAgICBnZXQgYWNjZXNzVG9rZW5FeHBpcmVzSW4oKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmV0cmlldmUodGhpcy5zdG9yYWdlQWNjZXNzVG9rZW5FeHBpcmVzSW4pO1xuICAgIH1cblxuICAgIHNldCBhY2Nlc3NUb2tlbkV4cGlyZXNJbih2YWx1ZTogYW55KSB7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlQWNjZXNzVG9rZW5FeHBpcmVzSW4sIHZhbHVlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0b3JhZ2VBdXRoUmVzdWx0ID0gJ2F1dGhvcml6YXRpb25SZXN1bHQnO1xuXG4gICAgcHJpdmF0ZSBzdG9yYWdlQWNjZXNzVG9rZW4gPSAnYXV0aG9yaXphdGlvbkRhdGEnO1xuXG4gICAgcHJpdmF0ZSBzdG9yYWdlSWRUb2tlbiA9ICdhdXRob3JpemF0aW9uRGF0YUlkVG9rZW4nO1xuXG4gICAgcHJpdmF0ZSBzdG9yYWdlQXV0aG9yaXplZFN0YXRlID0gJ3N0b3JhZ2VBdXRob3JpemVkU3RhdGUnO1xuXG4gICAgcHJpdmF0ZSBzdG9yYWdlVXNlckRhdGEgPSAndXNlckRhdGEnO1xuXG4gICAgcHJpdmF0ZSBzdG9yYWdlQXV0aE5vbmNlID0gJ2F1dGhOb25jZSc7XG5cbiAgICBwcml2YXRlIHN0b3JhZ2VDb2RlVmVyaWZpZXIgPSAnY29kZVZlcmlmaWVyJztcblxuICAgIHByaXZhdGUgc3RvcmFnZUF1dGhTdGF0ZUNvbnRyb2wgPSAnYXV0aFN0YXRlQ29udHJvbCc7XG5cbiAgICBwcml2YXRlIHN0b3JhZ2VTZXNzaW9uU3RhdGUgPSAnc2Vzc2lvbl9zdGF0ZSc7XG5cbiAgICBwcml2YXRlIHN0b3JhZ2VTaWxlbnRSZW5ld1J1bm5pbmcgPSAnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZyc7XG5cbiAgICBwcml2YXRlIHN0b3JhZ2VBY2Nlc3NUb2tlbkV4cGlyZXNJbiA9ICdhY2Nlc3NfdG9rZW5fZXhwaXJlc19hdCc7XG5cbiAgICBwcml2YXRlIHJldHJpZXZlKGtleTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgY29uc3Qga2V5VG9SZWFkID0gdGhpcy5jcmVhdGVLZXlXaXRoUHJlZml4KGtleSk7XG4gICAgICAgIHJldHVybiB0aGlzLm9pZGNTZWN1cml0eVN0b3JhZ2UucmVhZChrZXlUb1JlYWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RvcmUoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAgICAgY29uc3Qga2V5VG9TdG9yZSA9IHRoaXMuY3JlYXRlS2V5V2l0aFByZWZpeChrZXkpO1xuICAgICAgICB0aGlzLm9pZGNTZWN1cml0eVN0b3JhZ2Uud3JpdGUoa2V5VG9TdG9yZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIHJlc2V0U3RvcmFnZUZsb3dEYXRhKCkge1xuICAgICAgICB0aGlzLnN0b3JlKHRoaXMuc3RvcmFnZVNlc3Npb25TdGF0ZSwgJycpO1xuICAgICAgICB0aGlzLnN0b3JlKHRoaXMuc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZywgJycpO1xuICAgICAgICB0aGlzLnN0b3JlKHRoaXMuc3RvcmFnZUNvZGVWZXJpZmllciwgJycpO1xuICAgICAgICB0aGlzLnN0b3JlKHRoaXMuc3RvcmFnZVVzZXJEYXRhLCAnJyk7XG4gICAgfVxuXG4gICAgcmVzZXRBdXRoU3RhdGVJblN0b3JhZ2UoKSB7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlQXV0aG9yaXplZFN0YXRlLCBBdXRob3JpemVkU3RhdGUuVW5rbm93bik7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlQWNjZXNzVG9rZW4sICcnKTtcbiAgICAgICAgdGhpcy5zdG9yZSh0aGlzLnN0b3JhZ2VJZFRva2VuLCAnJyk7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlQXV0aFJlc3VsdCwgJycpO1xuICAgIH1cblxuICAgIGdldEFjY2Vzc1Rva2VuKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJldHJpZXZlKHRoaXMuc3RvcmFnZUFjY2Vzc1Rva2VuKTtcbiAgICB9XG5cbiAgICBnZXRJZFRva2VuKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJldHJpZXZlKHRoaXMuc3RvcmFnZUlkVG9rZW4pO1xuICAgIH1cblxuICAgIGdldFJlZnJlc2hUb2tlbigpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5hdXRoUmVzdWx0Py5yZWZyZXNoX3Rva2VuO1xuICAgIH1cbiAgICBwcml2YXRlIGNyZWF0ZUtleVdpdGhQcmVmaXgoa2V5OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5jbGllbnRJZDtcblxuICAgICAgICByZXR1cm4gYCR7cHJlZml4fV8ke2tleX1gO1xuICAgIH1cbn1cbiJdfQ==