import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { RandomService } from './random/random.service';
var FlowsDataService = /** @class */ (function () {
    function FlowsDataService(storagePersistanceService, randomService) {
        this.storagePersistanceService = storagePersistanceService;
        this.randomService = randomService;
    }
    FlowsDataService.prototype.createNonce = function () {
        var nonce = this.randomService.createRandom(40);
        this.setNonce(nonce);
        return nonce;
    };
    FlowsDataService.prototype.setNonce = function (nonce) {
        this.storagePersistanceService.authNonce = nonce;
    };
    FlowsDataService.prototype.getAuthStateControl = function () {
        return this.storagePersistanceService.authStateControl;
    };
    FlowsDataService.prototype.setAuthStateControl = function (authStateControl) {
        this.storagePersistanceService.authStateControl = authStateControl;
    };
    FlowsDataService.prototype.getExistingOrCreateAuthStateControl = function () {
        var state = this.storagePersistanceService.authStateControl;
        if (!state) {
            state = this.randomService.createRandom(40);
            this.storagePersistanceService.authStateControl = state;
        }
        return state;
    };
    FlowsDataService.prototype.setSessionState = function (sessionState) {
        this.storagePersistanceService.sessionState = sessionState;
    };
    FlowsDataService.prototype.resetStorageFlowData = function () {
        this.storagePersistanceService.resetStorageFlowData();
    };
    FlowsDataService.prototype.getCodeVerifier = function () {
        return this.storagePersistanceService.codeVerifier;
    };
    FlowsDataService.prototype.createCodeVerifier = function () {
        var codeVerifier = this.randomService.createRandom(67);
        this.storagePersistanceService.codeVerifier = codeVerifier;
        return codeVerifier;
    };
    FlowsDataService.prototype.isSilentRenewRunning = function () {
        return this.storagePersistanceService.silentRenewRunning === 'running';
    };
    FlowsDataService.prototype.setSilentRenewRunning = function () {
        this.storagePersistanceService.silentRenewRunning = 'running';
    };
    FlowsDataService.prototype.resetSilentRenewRunning = function () {
        this.storagePersistanceService.silentRenewRunning = '';
    };
    FlowsDataService.ctorParameters = function () { return [
        { type: StoragePersistanceService },
        { type: RandomService }
    ]; };
    FlowsDataService = __decorate([
        Injectable()
    ], FlowsDataService);
    return FlowsDataService;
}());
export { FlowsDataService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd3MtZGF0YS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL2Zsb3dzL2Zsb3dzLWRhdGEuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNuRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHeEQ7SUFDSSwwQkFBb0IseUJBQW9ELEVBQW1CLGFBQTRCO1FBQW5HLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFBbUIsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFBRyxDQUFDO0lBRTNILHNDQUFXLEdBQVg7UUFDSSxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxtQ0FBUSxHQUFSLFVBQVMsS0FBYTtRQUNsQixJQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNyRCxDQUFDO0lBRUQsOENBQW1CLEdBQW5CO1FBQ0ksT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLENBQUM7SUFDM0QsQ0FBQztJQUNELDhDQUFtQixHQUFuQixVQUFvQixnQkFBd0I7UUFDeEMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0lBQ3ZFLENBQUM7SUFFRCw4REFBbUMsR0FBbkM7UUFDSSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLENBQUM7UUFDNUQsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNSLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1NBQzNEO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELDBDQUFlLEdBQWYsVUFBZ0IsWUFBaUI7UUFDN0IsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7SUFDL0QsQ0FBQztJQUVELCtDQUFvQixHQUFwQjtRQUNJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQzFELENBQUM7SUFFRCwwQ0FBZSxHQUFmO1FBQ0ksT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsWUFBWSxDQUFDO0lBQ3ZELENBQUM7SUFFRCw2Q0FBa0IsR0FBbEI7UUFDSSxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMseUJBQXlCLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUMzRCxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBRUQsK0NBQW9CLEdBQXBCO1FBQ0ksT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsa0JBQWtCLEtBQUssU0FBUyxDQUFDO0lBQzNFLENBQUM7SUFFRCxnREFBcUIsR0FBckI7UUFDSSxJQUFJLENBQUMseUJBQXlCLENBQUMsa0JBQWtCLEdBQUcsU0FBUyxDQUFDO0lBQ2xFLENBQUM7SUFDRCxrREFBdUIsR0FBdkI7UUFDSSxJQUFJLENBQUMseUJBQXlCLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0lBQzNELENBQUM7O2dCQXZEOEMseUJBQXlCO2dCQUFrQyxhQUFhOztJQUQ5RyxnQkFBZ0I7UUFENUIsVUFBVSxFQUFFO09BQ0EsZ0JBQWdCLENBeUQ1QjtJQUFELHVCQUFDO0NBQUEsQUF6REQsSUF5REM7U0F6RFksZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcbmltcG9ydCB7IFJhbmRvbVNlcnZpY2UgfSBmcm9tICcuL3JhbmRvbS9yYW5kb20uc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBGbG93c0RhdGFTZXJ2aWNlIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UsIHByaXZhdGUgcmVhZG9ubHkgcmFuZG9tU2VydmljZTogUmFuZG9tU2VydmljZSkge31cblxuICAgIGNyZWF0ZU5vbmNlKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IG5vbmNlID0gdGhpcy5yYW5kb21TZXJ2aWNlLmNyZWF0ZVJhbmRvbSg0MCk7XG4gICAgICAgIHRoaXMuc2V0Tm9uY2Uobm9uY2UpO1xuICAgICAgICByZXR1cm4gbm9uY2U7XG4gICAgfVxuXG4gICAgc2V0Tm9uY2Uobm9uY2U6IHN0cmluZykge1xuICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuYXV0aE5vbmNlID0gbm9uY2U7XG4gICAgfVxuXG4gICAgZ2V0QXV0aFN0YXRlQ29udHJvbCgpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmF1dGhTdGF0ZUNvbnRyb2w7XG4gICAgfVxuICAgIHNldEF1dGhTdGF0ZUNvbnRyb2woYXV0aFN0YXRlQ29udHJvbDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5hdXRoU3RhdGVDb250cm9sID0gYXV0aFN0YXRlQ29udHJvbDtcbiAgICB9XG5cbiAgICBnZXRFeGlzdGluZ09yQ3JlYXRlQXV0aFN0YXRlQ29udHJvbCgpOiBhbnkge1xuICAgICAgICBsZXQgc3RhdGUgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuYXV0aFN0YXRlQ29udHJvbDtcbiAgICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICAgICAgc3RhdGUgPSB0aGlzLnJhbmRvbVNlcnZpY2UuY3JlYXRlUmFuZG9tKDQwKTtcbiAgICAgICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5hdXRoU3RhdGVDb250cm9sID0gc3RhdGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cblxuICAgIHNldFNlc3Npb25TdGF0ZShzZXNzaW9uU3RhdGU6IGFueSkge1xuICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uuc2Vzc2lvblN0YXRlID0gc2Vzc2lvblN0YXRlO1xuICAgIH1cblxuICAgIHJlc2V0U3RvcmFnZUZsb3dEYXRhKCkge1xuICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVzZXRTdG9yYWdlRmxvd0RhdGEoKTtcbiAgICB9XG5cbiAgICBnZXRDb2RlVmVyaWZpZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuY29kZVZlcmlmaWVyO1xuICAgIH1cblxuICAgIGNyZWF0ZUNvZGVWZXJpZmllcigpIHtcbiAgICAgICAgY29uc3QgY29kZVZlcmlmaWVyID0gdGhpcy5yYW5kb21TZXJ2aWNlLmNyZWF0ZVJhbmRvbSg2Nyk7XG4gICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5jb2RlVmVyaWZpZXIgPSBjb2RlVmVyaWZpZXI7XG4gICAgICAgIHJldHVybiBjb2RlVmVyaWZpZXI7XG4gICAgfVxuXG4gICAgaXNTaWxlbnRSZW5ld1J1bm5pbmcoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uuc2lsZW50UmVuZXdSdW5uaW5nID09PSAncnVubmluZyc7XG4gICAgfVxuXG4gICAgc2V0U2lsZW50UmVuZXdSdW5uaW5nKCkge1xuICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uuc2lsZW50UmVuZXdSdW5uaW5nID0gJ3J1bm5pbmcnO1xuICAgIH1cbiAgICByZXNldFNpbGVudFJlbmV3UnVubmluZygpIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnNpbGVudFJlbmV3UnVubmluZyA9ICcnO1xuICAgIH1cbn1cbiJdfQ==