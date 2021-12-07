import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { AuthorizedState } from '../authState/authorized-state';
import { ConfigurationProvider } from '../config/config.provider';
import { AbstractSecurityStorage } from './abstract-security-storage';
let StoragePersistanceService = class StoragePersistanceService {
    constructor(oidcSecurityStorage, configurationProvider) {
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
    get authResult() {
        return this.retrieve(this.storageAuthResult);
    }
    set authResult(value) {
        var _a;
        this.store(this.storageAuthResult, value);
        const expiresIn = (_a = this.authResult) === null || _a === void 0 ? void 0 : _a.expires_in;
        if (expiresIn) {
            const accessTokenExpiryTime = new Date().valueOf() + expiresIn * 1000;
            this.accessTokenExpiresIn = accessTokenExpiryTime;
        }
    }
    get accessToken() {
        return this.retrieve(this.storageAccessToken) || '';
    }
    set accessToken(value) {
        this.store(this.storageAccessToken, value);
    }
    get idToken() {
        return this.retrieve(this.storageIdToken) || '';
    }
    set idToken(value) {
        this.store(this.storageIdToken, value);
    }
    get authorizedState() {
        return this.retrieve(this.storageAuthorizedState);
    }
    set authorizedState(value) {
        this.store(this.storageAuthorizedState, value);
    }
    get userData() {
        return this.retrieve(this.storageUserData);
    }
    set userData(value) {
        this.store(this.storageUserData, value);
    }
    get authNonce() {
        return this.retrieve(this.storageAuthNonce) || '';
    }
    set authNonce(value) {
        this.store(this.storageAuthNonce, value);
    }
    get codeVerifier() {
        return this.retrieve(this.storageCodeVerifier) || '';
    }
    set codeVerifier(value) {
        this.store(this.storageCodeVerifier, value);
    }
    get authStateControl() {
        return this.retrieve(this.storageAuthStateControl) || '';
    }
    set authStateControl(value) {
        this.store(this.storageAuthStateControl, value);
    }
    get sessionState() {
        return this.retrieve(this.storageSessionState);
    }
    set sessionState(value) {
        this.store(this.storageSessionState, value);
    }
    get silentRenewRunning() {
        return this.retrieve(this.storageSilentRenewRunning) || '';
    }
    set silentRenewRunning(value) {
        this.store(this.storageSilentRenewRunning, value);
    }
    get accessTokenExpiresIn() {
        return this.retrieve(this.storageAccessTokenExpiresIn);
    }
    set accessTokenExpiresIn(value) {
        this.store(this.storageAccessTokenExpiresIn, value);
    }
    retrieve(key) {
        const keyToRead = this.createKeyWithPrefix(key);
        return this.oidcSecurityStorage.read(keyToRead);
    }
    store(key, value) {
        const keyToStore = this.createKeyWithPrefix(key);
        this.oidcSecurityStorage.write(keyToStore, value);
    }
    resetStorageFlowData() {
        this.store(this.storageSessionState, '');
        this.store(this.storageSilentRenewRunning, '');
        this.store(this.storageCodeVerifier, '');
        this.store(this.storageUserData, '');
    }
    resetAuthStateInStorage() {
        this.store(this.storageAuthorizedState, AuthorizedState.Unknown);
        this.store(this.storageAccessToken, '');
        this.store(this.storageIdToken, '');
        this.store(this.storageAuthResult, '');
    }
    getAccessToken() {
        return this.retrieve(this.storageAccessToken);
    }
    getIdToken() {
        return this.retrieve(this.storageIdToken);
    }
    getRefreshToken() {
        var _a;
        return (_a = this.authResult) === null || _a === void 0 ? void 0 : _a.refresh_token;
    }
    createKeyWithPrefix(key) {
        const prefix = this.configurationProvider.openIDConfiguration.clientId;
        return `${prefix}_${key}`;
    }
};
StoragePersistanceService.ctorParameters = () => [
    { type: AbstractSecurityStorage },
    { type: ConfigurationProvider }
];
StoragePersistanceService = __decorate([
    Injectable()
], StoragePersistanceService);
export { StoragePersistanceService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUt0RSxJQUFhLHlCQUF5QixHQUF0QyxNQUFhLHlCQUF5QjtJQUNsQyxZQUNxQixtQkFBNEMsRUFDNUMscUJBQTRDO1FBRDVDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBeUI7UUFDNUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQWdHekQsc0JBQWlCLEdBQUcscUJBQXFCLENBQUM7UUFFMUMsdUJBQWtCLEdBQUcsbUJBQW1CLENBQUM7UUFFekMsbUJBQWMsR0FBRywwQkFBMEIsQ0FBQztRQUU1QywyQkFBc0IsR0FBRyx3QkFBd0IsQ0FBQztRQUVsRCxvQkFBZSxHQUFHLFVBQVUsQ0FBQztRQUU3QixxQkFBZ0IsR0FBRyxXQUFXLENBQUM7UUFFL0Isd0JBQW1CLEdBQUcsY0FBYyxDQUFDO1FBRXJDLDRCQUF1QixHQUFHLGtCQUFrQixDQUFDO1FBRTdDLHdCQUFtQixHQUFHLGVBQWUsQ0FBQztRQUV0Qyw4QkFBeUIsR0FBRywyQkFBMkIsQ0FBQztRQUV4RCxnQ0FBMkIsR0FBRyx5QkFBeUIsQ0FBQztJQW5IN0QsQ0FBQztJQUVKLElBQUksVUFBVTtRQUNWLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNqRCxDQUFD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QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELHVCQUF1QjtRQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxjQUFjO1FBQ1YsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxVQUFVO1FBQ04sT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsZUFBZTs7UUFDWCxhQUFPLElBQUksQ0FBQyxVQUFVLDBDQUFFLGFBQWEsQ0FBQztJQUMxQyxDQUFDO0lBQ08sbUJBQW1CLENBQUMsR0FBVztRQUNuQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDO1FBRXZFLE9BQU8sR0FBRyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7SUFDOUIsQ0FBQztDQUNKLENBQUE7O1lBL0o2Qyx1QkFBdUI7WUFDckIscUJBQXFCOztBQUh4RCx5QkFBeUI7SUFEckMsVUFBVSxFQUFFO0dBQ0EseUJBQXlCLENBaUtyQztTQWpLWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBdXRob3JpemVkU3RhdGUgfSBmcm9tICcuLi9hdXRoU3RhdGUvYXV0aG9yaXplZC1zdGF0ZSc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IEFic3RyYWN0U2VjdXJpdHlTdG9yYWdlIH0gZnJvbSAnLi9hYnN0cmFjdC1zZWN1cml0eS1zdG9yYWdlJztcblxuZXhwb3J0IHR5cGUgU2lsZW50UmVuZXdTdGF0ZSA9ICdydW5uaW5nJyB8ICcnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgb2lkY1NlY3VyaXR5U3RvcmFnZTogQWJzdHJhY3RTZWN1cml0eVN0b3JhZ2UsXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXJcbiAgICApIHt9XG5cbiAgICBnZXQgYXV0aFJlc3VsdCgpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXRyaWV2ZSh0aGlzLnN0b3JhZ2VBdXRoUmVzdWx0KTtcbiAgICB9XG5cbiAgICBzZXQgYXV0aFJlc3VsdCh2YWx1ZTogYW55KSB7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlQXV0aFJlc3VsdCwgdmFsdWUpO1xuXG4gICAgICAgIGNvbnN0IGV4cGlyZXNJbiA9IHRoaXMuYXV0aFJlc3VsdD8uZXhwaXJlc19pbjtcbiAgICAgICAgaWYgKGV4cGlyZXNJbikge1xuICAgICAgICAgICAgY29uc3QgYWNjZXNzVG9rZW5FeHBpcnlUaW1lID0gbmV3IERhdGUoKS52YWx1ZU9mKCkgKyBleHBpcmVzSW4gKiAxMDAwO1xuICAgICAgICAgICAgdGhpcy5hY2Nlc3NUb2tlbkV4cGlyZXNJbiA9IGFjY2Vzc1Rva2VuRXhwaXJ5VGltZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBhY2Nlc3NUb2tlbigpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXRyaWV2ZSh0aGlzLnN0b3JhZ2VBY2Nlc3NUb2tlbikgfHwgJyc7XG4gICAgfVxuXG4gICAgc2V0IGFjY2Vzc1Rva2VuKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zdG9yZSh0aGlzLnN0b3JhZ2VBY2Nlc3NUb2tlbiwgdmFsdWUpO1xuICAgIH1cblxuICAgIGdldCBpZFRva2VuKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnJldHJpZXZlKHRoaXMuc3RvcmFnZUlkVG9rZW4pIHx8ICcnO1xuICAgIH1cblxuICAgIHNldCBpZFRva2VuKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zdG9yZSh0aGlzLnN0b3JhZ2VJZFRva2VuLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IGF1dGhvcml6ZWRTdGF0ZSgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXRyaWV2ZSh0aGlzLnN0b3JhZ2VBdXRob3JpemVkU3RhdGUpO1xuICAgIH1cblxuICAgIHNldCBhdXRob3JpemVkU3RhdGUodmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLnN0b3JlKHRoaXMuc3RvcmFnZUF1dGhvcml6ZWRTdGF0ZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIGdldCB1c2VyRGF0YSgpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXRyaWV2ZSh0aGlzLnN0b3JhZ2VVc2VyRGF0YSk7XG4gICAgfVxuXG4gICAgc2V0IHVzZXJEYXRhKHZhbHVlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5zdG9yZSh0aGlzLnN0b3JhZ2VVc2VyRGF0YSwgdmFsdWUpO1xuICAgIH1cblxuICAgIGdldCBhdXRoTm9uY2UoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmV0cmlldmUodGhpcy5zdG9yYWdlQXV0aE5vbmNlKSB8fCAnJztcbiAgICB9XG5cbiAgICBzZXQgYXV0aE5vbmNlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zdG9yZSh0aGlzLnN0b3JhZ2VBdXRoTm9uY2UsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgY29kZVZlcmlmaWVyKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnJldHJpZXZlKHRoaXMuc3RvcmFnZUNvZGVWZXJpZmllcikgfHwgJyc7XG4gICAgfVxuXG4gICAgc2V0IGNvZGVWZXJpZmllcih2YWx1ZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlQ29kZVZlcmlmaWVyLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IGF1dGhTdGF0ZUNvbnRyb2woKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmV0cmlldmUodGhpcy5zdG9yYWdlQXV0aFN0YXRlQ29udHJvbCkgfHwgJyc7XG4gICAgfVxuXG4gICAgc2V0IGF1dGhTdGF0ZUNvbnRyb2wodmFsdWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLnN0b3JlKHRoaXMuc3RvcmFnZUF1dGhTdGF0ZUNvbnRyb2wsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgc2Vzc2lvblN0YXRlKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJldHJpZXZlKHRoaXMuc3RvcmFnZVNlc3Npb25TdGF0ZSk7XG4gICAgfVxuXG4gICAgc2V0IHNlc3Npb25TdGF0ZSh2YWx1ZTogYW55KSB7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlU2Vzc2lvblN0YXRlLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IHNpbGVudFJlbmV3UnVubmluZygpOiBTaWxlbnRSZW5ld1N0YXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmV0cmlldmUodGhpcy5zdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nKSB8fCAnJztcbiAgICB9XG5cbiAgICBzZXQgc2lsZW50UmVuZXdSdW5uaW5nKHZhbHVlOiBTaWxlbnRSZW5ld1N0YXRlKSB7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nLCB2YWx1ZSk7XG4gICAgfVxuICAgIGdldCBhY2Nlc3NUb2tlbkV4cGlyZXNJbigpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZXRyaWV2ZSh0aGlzLnN0b3JhZ2VBY2Nlc3NUb2tlbkV4cGlyZXNJbik7XG4gICAgfVxuXG4gICAgc2V0IGFjY2Vzc1Rva2VuRXhwaXJlc0luKHZhbHVlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5zdG9yZSh0aGlzLnN0b3JhZ2VBY2Nlc3NUb2tlbkV4cGlyZXNJbiwgdmFsdWUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RvcmFnZUF1dGhSZXN1bHQgPSAnYXV0aG9yaXphdGlvblJlc3VsdCc7XG5cbiAgICBwcml2YXRlIHN0b3JhZ2VBY2Nlc3NUb2tlbiA9ICdhdXRob3JpemF0aW9uRGF0YSc7XG5cbiAgICBwcml2YXRlIHN0b3JhZ2VJZFRva2VuID0gJ2F1dGhvcml6YXRpb25EYXRhSWRUb2tlbic7XG5cbiAgICBwcml2YXRlIHN0b3JhZ2VBdXRob3JpemVkU3RhdGUgPSAnc3RvcmFnZUF1dGhvcml6ZWRTdGF0ZSc7XG5cbiAgICBwcml2YXRlIHN0b3JhZ2VVc2VyRGF0YSA9ICd1c2VyRGF0YSc7XG5cbiAgICBwcml2YXRlIHN0b3JhZ2VBdXRoTm9uY2UgPSAnYXV0aE5vbmNlJztcblxuICAgIHByaXZhdGUgc3RvcmFnZUNvZGVWZXJpZmllciA9ICdjb2RlVmVyaWZpZXInO1xuXG4gICAgcHJpdmF0ZSBzdG9yYWdlQXV0aFN0YXRlQ29udHJvbCA9ICdhdXRoU3RhdGVDb250cm9sJztcblxuICAgIHByaXZhdGUgc3RvcmFnZVNlc3Npb25TdGF0ZSA9ICdzZXNzaW9uX3N0YXRlJztcblxuICAgIHByaXZhdGUgc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZyA9ICdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJztcblxuICAgIHByaXZhdGUgc3RvcmFnZUFjY2Vzc1Rva2VuRXhwaXJlc0luID0gJ2FjY2Vzc190b2tlbl9leHBpcmVzX2F0JztcblxuICAgIHByaXZhdGUgcmV0cmlldmUoa2V5OiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBjb25zdCBrZXlUb1JlYWQgPSB0aGlzLmNyZWF0ZUtleVdpdGhQcmVmaXgoa2V5KTtcbiAgICAgICAgcmV0dXJuIHRoaXMub2lkY1NlY3VyaXR5U3RvcmFnZS5yZWFkKGtleVRvUmVhZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdG9yZShrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgICAgICBjb25zdCBrZXlUb1N0b3JlID0gdGhpcy5jcmVhdGVLZXlXaXRoUHJlZml4KGtleSk7XG4gICAgICAgIHRoaXMub2lkY1NlY3VyaXR5U3RvcmFnZS53cml0ZShrZXlUb1N0b3JlLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmVzZXRTdG9yYWdlRmxvd0RhdGEoKSB7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlU2Vzc2lvblN0YXRlLCAnJyk7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nLCAnJyk7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlQ29kZVZlcmlmaWVyLCAnJyk7XG4gICAgICAgIHRoaXMuc3RvcmUodGhpcy5zdG9yYWdlVXNlckRhdGEsICcnKTtcbiAgICB9XG5cbiAgICByZXNldEF1dGhTdGF0ZUluU3RvcmFnZSgpIHtcbiAgICAgICAgdGhpcy5zdG9yZSh0aGlzLnN0b3JhZ2VBdXRob3JpemVkU3RhdGUsIEF1dGhvcml6ZWRTdGF0ZS5Vbmtub3duKTtcbiAgICAgICAgdGhpcy5zdG9yZSh0aGlzLnN0b3JhZ2VBY2Nlc3NUb2tlbiwgJycpO1xuICAgICAgICB0aGlzLnN0b3JlKHRoaXMuc3RvcmFnZUlkVG9rZW4sICcnKTtcbiAgICAgICAgdGhpcy5zdG9yZSh0aGlzLnN0b3JhZ2VBdXRoUmVzdWx0LCAnJyk7XG4gICAgfVxuXG4gICAgZ2V0QWNjZXNzVG9rZW4oKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmV0cmlldmUodGhpcy5zdG9yYWdlQWNjZXNzVG9rZW4pO1xuICAgIH1cblxuICAgIGdldElkVG9rZW4oKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmV0cmlldmUodGhpcy5zdG9yYWdlSWRUb2tlbik7XG4gICAgfVxuXG4gICAgZ2V0UmVmcmVzaFRva2VuKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLmF1dGhSZXN1bHQ/LnJlZnJlc2hfdG9rZW47XG4gICAgfVxuICAgIHByaXZhdGUgY3JlYXRlS2V5V2l0aFByZWZpeChrZXk6IHN0cmluZykge1xuICAgICAgICBjb25zdCBwcmVmaXggPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLmNsaWVudElkO1xuXG4gICAgICAgIHJldHVybiBgJHtwcmVmaXh9XyR7a2V5fWA7XG4gICAgfVxufVxuIl19