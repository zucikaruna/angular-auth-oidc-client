import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { RandomService } from './random/random.service';
let FlowsDataService = class FlowsDataService {
    constructor(storagePersistanceService, randomService) {
        this.storagePersistanceService = storagePersistanceService;
        this.randomService = randomService;
    }
    createNonce() {
        const nonce = this.randomService.createRandom(40);
        this.setNonce(nonce);
        return nonce;
    }
    setNonce(nonce) {
        this.storagePersistanceService.authNonce = nonce;
    }
    getAuthStateControl() {
        return this.storagePersistanceService.authStateControl;
    }
    setAuthStateControl(authStateControl) {
        this.storagePersistanceService.authStateControl = authStateControl;
    }
    getExistingOrCreateAuthStateControl() {
        let state = this.storagePersistanceService.authStateControl;
        if (!state) {
            state = this.randomService.createRandom(40);
            this.storagePersistanceService.authStateControl = state;
        }
        return state;
    }
    setSessionState(sessionState) {
        this.storagePersistanceService.sessionState = sessionState;
    }
    resetStorageFlowData() {
        this.storagePersistanceService.resetStorageFlowData();
    }
    getCodeVerifier() {
        return this.storagePersistanceService.codeVerifier;
    }
    createCodeVerifier() {
        const codeVerifier = this.randomService.createRandom(67);
        this.storagePersistanceService.codeVerifier = codeVerifier;
        return codeVerifier;
    }
    isSilentRenewRunning() {
        return this.storagePersistanceService.silentRenewRunning === 'running';
    }
    setSilentRenewRunning() {
        this.storagePersistanceService.silentRenewRunning = 'running';
    }
    resetSilentRenewRunning() {
        this.storagePersistanceService.silentRenewRunning = '';
    }
};
FlowsDataService.ctorParameters = () => [
    { type: StoragePersistanceService },
    { type: RandomService }
];
FlowsDataService = __decorate([
    Injectable()
], FlowsDataService);
export { FlowsDataService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd3MtZGF0YS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL2Zsb3dzL2Zsb3dzLWRhdGEuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNuRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHeEQsSUFBYSxnQkFBZ0IsR0FBN0IsTUFBYSxnQkFBZ0I7SUFDekIsWUFBb0IseUJBQW9ELEVBQW1CLGFBQTRCO1FBQW5HLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBMkI7UUFBbUIsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFBRyxDQUFDO0lBRTNILFdBQVc7UUFDUCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxRQUFRLENBQUMsS0FBYTtRQUNsQixJQUFJLENBQUMseUJBQXlCLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUNyRCxDQUFDO0lBRUQsbUJBQW1CO1FBQ2YsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLENBQUM7SUFDM0QsQ0FBQztJQUNELG1CQUFtQixDQUFDLGdCQUF3QjtRQUN4QyxJQUFJLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7SUFDdkUsQ0FBQztJQUVELG1DQUFtQztRQUMvQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLENBQUM7UUFDNUQsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNSLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM1QyxJQUFJLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1NBQzNEO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELGVBQWUsQ0FBQyxZQUFpQjtRQUM3QixJQUFJLENBQUMseUJBQXlCLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztJQUMvRCxDQUFDO0lBRUQsb0JBQW9CO1FBQ2hCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQzFELENBQUM7SUFFRCxlQUFlO1FBQ1gsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsWUFBWSxDQUFDO0lBQ3ZELENBQUM7SUFFRCxrQkFBa0I7UUFDZCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMseUJBQXlCLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUMzRCxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBRUQsb0JBQW9CO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLGtCQUFrQixLQUFLLFNBQVMsQ0FBQztJQUMzRSxDQUFDO0lBRUQscUJBQXFCO1FBQ2pCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLENBQUM7SUFDbEUsQ0FBQztJQUNELHVCQUF1QjtRQUNuQixJQUFJLENBQUMseUJBQXlCLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0lBQzNELENBQUM7Q0FDSixDQUFBOztZQXhEa0QseUJBQXlCO1lBQWtDLGFBQWE7O0FBRDlHLGdCQUFnQjtJQUQ1QixVQUFVLEVBQUU7R0FDQSxnQkFBZ0IsQ0F5RDVCO1NBekRZLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XG5pbXBvcnQgeyBSYW5kb21TZXJ2aWNlIH0gZnJvbSAnLi9yYW5kb20vcmFuZG9tLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRmxvd3NEYXRhU2VydmljZSB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLCBwcml2YXRlIHJlYWRvbmx5IHJhbmRvbVNlcnZpY2U6IFJhbmRvbVNlcnZpY2UpIHt9XG5cbiAgICBjcmVhdGVOb25jZSgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBub25jZSA9IHRoaXMucmFuZG9tU2VydmljZS5jcmVhdGVSYW5kb20oNDApO1xuICAgICAgICB0aGlzLnNldE5vbmNlKG5vbmNlKTtcbiAgICAgICAgcmV0dXJuIG5vbmNlO1xuICAgIH1cblxuICAgIHNldE5vbmNlKG5vbmNlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmF1dGhOb25jZSA9IG5vbmNlO1xuICAgIH1cblxuICAgIGdldEF1dGhTdGF0ZUNvbnRyb2woKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5hdXRoU3RhdGVDb250cm9sO1xuICAgIH1cbiAgICBzZXRBdXRoU3RhdGVDb250cm9sKGF1dGhTdGF0ZUNvbnRyb2w6IHN0cmluZykge1xuICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuYXV0aFN0YXRlQ29udHJvbCA9IGF1dGhTdGF0ZUNvbnRyb2w7XG4gICAgfVxuXG4gICAgZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woKTogYW55IHtcbiAgICAgICAgbGV0IHN0YXRlID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmF1dGhTdGF0ZUNvbnRyb2w7XG4gICAgICAgIGlmICghc3RhdGUpIHtcbiAgICAgICAgICAgIHN0YXRlID0gdGhpcy5yYW5kb21TZXJ2aWNlLmNyZWF0ZVJhbmRvbSg0MCk7XG4gICAgICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuYXV0aFN0YXRlQ29udHJvbCA9IHN0YXRlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG5cbiAgICBzZXRTZXNzaW9uU3RhdGUoc2Vzc2lvblN0YXRlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnNlc3Npb25TdGF0ZSA9IHNlc3Npb25TdGF0ZTtcbiAgICB9XG5cbiAgICByZXNldFN0b3JhZ2VGbG93RGF0YSgpIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlc2V0U3RvcmFnZUZsb3dEYXRhKCk7XG4gICAgfVxuXG4gICAgZ2V0Q29kZVZlcmlmaWVyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmNvZGVWZXJpZmllcjtcbiAgICB9XG5cbiAgICBjcmVhdGVDb2RlVmVyaWZpZXIoKSB7XG4gICAgICAgIGNvbnN0IGNvZGVWZXJpZmllciA9IHRoaXMucmFuZG9tU2VydmljZS5jcmVhdGVSYW5kb20oNjcpO1xuICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuY29kZVZlcmlmaWVyID0gY29kZVZlcmlmaWVyO1xuICAgICAgICByZXR1cm4gY29kZVZlcmlmaWVyO1xuICAgIH1cblxuICAgIGlzU2lsZW50UmVuZXdSdW5uaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnNpbGVudFJlbmV3UnVubmluZyA9PT0gJ3J1bm5pbmcnO1xuICAgIH1cblxuICAgIHNldFNpbGVudFJlbmV3UnVubmluZygpIHtcbiAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnNpbGVudFJlbmV3UnVubmluZyA9ICdydW5uaW5nJztcbiAgICB9XG4gICAgcmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKSB7XG4gICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5zaWxlbnRSZW5ld1J1bm5pbmcgPSAnJztcbiAgICB9XG59XG4iXX0=