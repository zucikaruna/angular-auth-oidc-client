import { ConfigurationProvider } from '../config/config.provider';
import { AbstractSecurityStorage } from './abstract-security-storage';
export declare type SilentRenewState = 'running' | '';
export declare class StoragePersistanceService {
    private readonly oidcSecurityStorage;
    private readonly configurationProvider;
    constructor(oidcSecurityStorage: AbstractSecurityStorage, configurationProvider: ConfigurationProvider);
    get authResult(): any;
    set authResult(value: any);
    get accessToken(): string;
    set accessToken(value: string);
    get idToken(): string;
    set idToken(value: string);
    get authorizedState(): string | undefined;
    set authorizedState(value: string | undefined);
    get userData(): any;
    set userData(value: any);
    get authNonce(): string;
    set authNonce(value: string);
    get codeVerifier(): string;
    set codeVerifier(value: string);
    get authStateControl(): string;
    set authStateControl(value: string);
    get sessionState(): any;
    set sessionState(value: any);
    get silentRenewRunning(): SilentRenewState;
    set silentRenewRunning(value: SilentRenewState);
    get accessTokenExpiresIn(): any;
    set accessTokenExpiresIn(value: any);
    private storageAuthResult;
    private storageAccessToken;
    private storageIdToken;
    private storageAuthorizedState;
    private storageUserData;
    private storageAuthNonce;
    private storageCodeVerifier;
    private storageAuthStateControl;
    private storageSessionState;
    private storageSilentRenewRunning;
    private storageAccessTokenExpiresIn;
    private retrieve;
    private store;
    resetStorageFlowData(): void;
    resetAuthStateInStorage(): void;
    getAccessToken(): any;
    getIdToken(): any;
    getRefreshToken(): any;
    private createKeyWithPrefix;
}