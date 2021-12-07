import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { RandomService } from './random/random.service';
export declare class FlowsDataService {
    private storagePersistanceService;
    private readonly randomService;
    constructor(storagePersistanceService: StoragePersistanceService, randomService: RandomService);
    createNonce(): string;
    setNonce(nonce: string): void;
    getAuthStateControl(): any;
    setAuthStateControl(authStateControl: string): void;
    getExistingOrCreateAuthStateControl(): any;
    setSessionState(sessionState: any): void;
    resetStorageFlowData(): void;
    getCodeVerifier(): string;
    createCodeVerifier(): string;
    isSilentRenewRunning(): boolean;
    setSilentRenewRunning(): void;
    resetSilentRenewRunning(): void;
}
