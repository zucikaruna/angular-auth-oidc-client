import { __decorate, __param } from 'tslib';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID, InjectionToken, NgZone, ɵɵdefineInjectable, ɵɵinject, NgModule } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ReplaySubject, BehaviorSubject, of, throwError, Subject, interval, Observable } from 'rxjs';
import { KEYUTIL, KJUR, hextob64u } from 'jsrsasign-reduced';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { oneLineTrim } from 'common-tags';
import { Router } from '@angular/router';

let HttpBaseService = class HttpBaseService {
    constructor(http) {
        this.http = http;
    }
    get(url, params) {
        return this.http.get(url, params);
    }
    post(url, body, params) {
        return this.http.post(url, body, params);
    }
};
HttpBaseService.ctorParameters = () => [
    { type: HttpClient }
];
HttpBaseService = __decorate([
    Injectable()
], HttpBaseService);

let DataService = class DataService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    get(url, token) {
        const headers = this.prepareHeaders(token);
        return this.httpClient.get(url, {
            headers,
        });
    }
    post(url, body, headersParams) {
        const headers = headersParams || this.prepareHeaders();
        return this.httpClient.post(url, body, { headers });
    }
    prepareHeaders(token) {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/json');
        if (!!token) {
            headers = headers.set('Authorization', 'Bearer ' + decodeURIComponent(token));
        }
        return headers;
    }
};
DataService.ctorParameters = () => [
    { type: HttpBaseService }
];
DataService = __decorate([
    Injectable()
], DataService);

let PlatformProvider = class PlatformProvider {
    constructor(platformId) {
        this.platformId = platformId;
    }
    get isBrowser() {
        return isPlatformBrowser(this.platformId);
    }
};
PlatformProvider.ctorParameters = () => [
    { type: String, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] }
];
PlatformProvider = __decorate([
    Injectable(),
    __param(0, Inject(PLATFORM_ID))
], PlatformProvider);

var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Warn"] = 1] = "Warn";
    LogLevel[LogLevel["Error"] = 2] = "Error";
})(LogLevel || (LogLevel = {}));

const DEFAULT_CONFIG = {
    stsServer: 'https://please_set',
    authWellknownEndpoint: '',
    redirectUrl: 'https://please_set',
    clientId: 'please_set',
    responseType: 'code',
    scope: 'openid email profile',
    hdParam: '',
    postLogoutRedirectUri: 'https://please_set',
    startCheckSession: false,
    silentRenew: false,
    silentRenewUrl: 'https://please_set',
    renewTimeBeforeTokenExpiresInSeconds: 0,
    useRefreshToken: false,
    ignoreNonceAfterRefresh: false,
    postLoginRoute: '/',
    forbiddenRoute: '/forbidden',
    unauthorizedRoute: '/unauthorized',
    autoUserinfo: true,
    autoCleanStateAfterAuthentication: true,
    triggerAuthorizationResultEvent: false,
    logLevel: LogLevel.Warn,
    issValidationOff: false,
    historyCleanupOff: false,
    maxIdTokenIatOffsetAllowedInSeconds: 120,
    disableIatOffsetValidation: false,
    storage: typeof Storage !== 'undefined' ? sessionStorage : null,
    customParams: {},
    disableRefreshIdTokenAuthTimeValidation: false,
};

let ConfigurationProvider = class ConfigurationProvider {
    constructor(platformProvider) {
        this.platformProvider = platformProvider;
    }
    get openIDConfiguration() {
        if (!this.openIdConfigurationInternal) {
            return null;
        }
        return this.openIdConfigurationInternal;
    }
    get wellKnownEndpoints() {
        if (!this.wellKnownEndpointsInternal) {
            return null;
        }
        return this.wellKnownEndpointsInternal;
    }
    get configuration() {
        if (!this.hasValidConfig()) {
            return null;
        }
        return {
            configuration: Object.assign({}, this.openIDConfiguration),
            wellknown: Object.assign({}, this.wellKnownEndpoints),
        };
    }
    hasValidConfig() {
        return !!this.wellKnownEndpointsInternal && !!this.openIdConfigurationInternal;
    }
    setConfig(configuration, wellKnownEndpoints) {
        this.wellKnownEndpointsInternal = wellKnownEndpoints;
        this.openIdConfigurationInternal = Object.assign(Object.assign({}, DEFAULT_CONFIG), configuration);
        if (configuration === null || configuration === void 0 ? void 0 : configuration.storage) {
            console.warn('PLEASE NOTE: The storage in the config will be deprecated in future versions: Please pass the custom storage in forRoot() as documented');
        }
        this.setSpecialCases(this.openIdConfigurationInternal);
    }
    setSpecialCases(currentConfig) {
        if (!this.platformProvider.isBrowser) {
            currentConfig.startCheckSession = false;
            currentConfig.silentRenew = false;
            currentConfig.useRefreshToken = false;
        }
    }
};
ConfigurationProvider.ctorParameters = () => [
    { type: PlatformProvider }
];
ConfigurationProvider = __decorate([
    Injectable()
], ConfigurationProvider);

let LoggerService = class LoggerService {
    constructor(configurationProvider) {
        this.configurationProvider = configurationProvider;
    }
    logError(message, ...args) {
        args.length ? console.error(message, args) : console.error(message);
    }
    logWarning(message, ...args) {
        if (this.currentLogLevelIsEqualOrSmallerThan(LogLevel.Warn)) {
            args.length ? console.warn(message, args) : console.warn(message);
        }
    }
    logDebug(message, ...args) {
        if (this.currentLogLevelIsEqualOrSmallerThan(LogLevel.Debug)) {
            args.length ? console.log(message, args) : console.log(message);
        }
    }
    currentLogLevelIsEqualOrSmallerThan(logLevel) {
        return this.configurationProvider.openIDConfiguration.logLevel <= logLevel;
    }
};
LoggerService.ctorParameters = () => [
    { type: ConfigurationProvider }
];
LoggerService = __decorate([
    Injectable()
], LoggerService);

var EventTypes;
(function (EventTypes) {
    /**
     *  This only works in the AppModule Constructor
     */
    EventTypes[EventTypes["ConfigLoaded"] = 0] = "ConfigLoaded";
    EventTypes[EventTypes["CheckSessionReceived"] = 1] = "CheckSessionReceived";
    EventTypes[EventTypes["UserDataChanged"] = 2] = "UserDataChanged";
    EventTypes[EventTypes["NewAuthorizationResult"] = 3] = "NewAuthorizationResult";
    EventTypes[EventTypes["TokenExpired"] = 4] = "TokenExpired";
    EventTypes[EventTypes["IdTokenExpired"] = 5] = "IdTokenExpired";
})(EventTypes || (EventTypes = {}));

let PublicEventsService = class PublicEventsService {
    constructor() {
        this.notify = new ReplaySubject(1);
    }
    fireEvent(type, value) {
        this.notify.next({ type, value });
    }
    registerForEvents() {
        return this.notify.asObservable();
    }
};
PublicEventsService = __decorate([
    Injectable()
], PublicEventsService);

var AuthorizedState;
(function (AuthorizedState) {
    AuthorizedState["Authorized"] = "Authorized";
    AuthorizedState["Unauthorized"] = "Unauthorized";
    AuthorizedState["Unknown"] = "Unknown";
})(AuthorizedState || (AuthorizedState = {}));

/**
 * Implement this class-interface to create a custom storage.
 */
let AbstractSecurityStorage = class AbstractSecurityStorage {
};
AbstractSecurityStorage = __decorate([
    Injectable()
], AbstractSecurityStorage);

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

// TODO  TESTING
let FlowHelper = class FlowHelper {
    constructor(configurationProvider) {
        this.configurationProvider = configurationProvider;
    }
    isCurrentFlowCodeFlow() {
        return this.currentFlowIs('code');
    }
    isCurrentFlowAnyImplicitFlow() {
        return this.isCurrentFlowImplicitFlowWithAccessToken() || this.isCurrentFlowImplicitFlowWithoutAccessToken();
    }
    isCurrentFlowCodeFlowWithRefeshTokens() {
        if (this.isCurrentFlowCodeFlow() && this.configurationProvider.openIDConfiguration.useRefreshToken) {
            return true;
        }
        return false;
    }
    isCurrentFlowImplicitFlowWithAccessToken() {
        return this.currentFlowIs('id_token token');
    }
    isCurrentFlowImplicitFlowWithoutAccessToken() {
        return this.currentFlowIs('id_token');
    }
    currentFlowIs(flowTypes) {
        const currentFlow = this.configurationProvider.openIDConfiguration.responseType;
        if (Array.isArray(flowTypes)) {
            return flowTypes.some((x) => currentFlow === x);
        }
        return currentFlow === flowTypes;
    }
};
FlowHelper.ctorParameters = () => [
    { type: ConfigurationProvider }
];
FlowHelper = __decorate([
    Injectable()
], FlowHelper);

let TokenHelperService = class TokenHelperService {
    constructor(loggerService) {
        this.loggerService = loggerService;
        this.PARTS_OF_TOKEN = 3;
    }
    getTokenExpirationDate(dataIdToken) {
        if (!dataIdToken.hasOwnProperty('exp')) {
            return new Date();
        }
        const date = new Date(0); // The 0 here is the key, which sets the date to the epoch
        date.setUTCSeconds(dataIdToken.exp);
        return date;
    }
    getHeaderFromToken(token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 0, encoded);
    }
    getPayloadFromToken(token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 1, encoded);
    }
    getSignatureFromToken(token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 2, encoded);
    }
    getPartOfToken(token, index, encoded) {
        const partOfToken = this.extractPartOfToken(token, index);
        if (encoded) {
            return partOfToken;
        }
        const result = this.urlBase64Decode(partOfToken);
        return JSON.parse(result);
    }
    urlBase64Decode(str) {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw Error('Illegal base64url string!');
        }
        const decoded = typeof window !== 'undefined' ? window.atob(output) : Buffer.from(output, 'base64').toString('binary');
        try {
            // Going backwards: from bytestream, to percent-encoding, to original string.
            return decodeURIComponent(decoded
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''));
        }
        catch (err) {
            return decoded;
        }
    }
    tokenIsValid(token) {
        if (!token) {
            this.loggerService.logError(`token '${token}' is not valid --> token falsy`);
            return false;
        }
        if (!token.includes('.')) {
            this.loggerService.logError(`token '${token}' is not valid --> no dots included`);
            return false;
        }
        const parts = token.split('.');
        if (parts.length !== this.PARTS_OF_TOKEN) {
            this.loggerService.logError(`token '${token}' is not valid --> token has to have exactly ${this.PARTS_OF_TOKEN} dots`);
            return false;
        }
        return true;
    }
    extractPartOfToken(token, index) {
        return token.split('.')[index];
    }
};
TokenHelperService.ctorParameters = () => [
    { type: LoggerService }
];
TokenHelperService = __decorate([
    Injectable()
], TokenHelperService);

var TokenValidationService_1;
// http://openid.net/specs/openid-connect-implicit-1_0.html
// id_token
// id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
// MUST exactly match the value of the iss (issuer) Claim.
//
// id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
// by the iss (issuer) Claim as an audience.The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience,
// or if it contains additional audiences not trusted by the Client.
//
// id_token C3: If the ID Token contains multiple audiences, the Client SHOULD verify that an azp Claim is present.
//
// id_token C4: If an azp (authorized party) Claim is present, the Client SHOULD verify that its client_id is the Claim Value.
//
// id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the
// alg Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
//
// id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the OpenID Connect
// Core 1.0
// [OpenID.Core] specification.
//
// id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account
// for clock skew).
//
// id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
// limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
//
// id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one that was sent
// in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.The precise method for detecting replay attacks
// is Client specific.
//
// id_token C10: If the acr Claim was requested, the Client SHOULD check that the asserted Claim Value is appropriate.
// The meaning and processing of acr Claim Values is out of scope for this document.
//
// id_token C11: When a max_age request is made, the Client SHOULD check the auth_time Claim value and request re- authentication
// if it determines too much time has elapsed since the last End- User authentication.
// Access Token Validation
// access_token C1: Hash the octets of the ASCII representation of the access_token with the hash algorithm specified in JWA[JWA]
// for the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, the hash algorithm used is SHA-256.
// access_token C2: Take the left- most half of the hash and base64url- encode it.
// access_token C3: The value of at_hash in the ID Token MUST match the value produced in the previous step if at_hash is present
// in the ID Token.
let TokenValidationService = TokenValidationService_1 = class TokenValidationService {
    constructor(tokenHelperService, flowHelper, loggerService) {
        this.tokenHelperService = tokenHelperService;
        this.flowHelper = flowHelper;
        this.loggerService = loggerService;
        this.keyAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'PS256', 'PS384', 'PS512'];
    }
    // id_token C7: The current time MUST be before the time represented by the exp Claim
    // (possibly allowing for some small leeway to account for clock skew).
    hasIdTokenExpired(token, offsetSeconds) {
        let decoded;
        decoded = this.tokenHelperService.getPayloadFromToken(token, false);
        return !this.validateIdTokenExpNotExpired(decoded, offsetSeconds);
    }
    // id_token C7: The current time MUST be before the time represented by the exp Claim
    // (possibly allowing for some small leeway to account for clock skew).
    validateIdTokenExpNotExpired(decodedIdToken, offsetSeconds) {
        const tokenExpirationDate = this.tokenHelperService.getTokenExpirationDate(decodedIdToken);
        offsetSeconds = offsetSeconds || 0;
        if (!tokenExpirationDate) {
            return false;
        }
        const tokenExpirationValue = tokenExpirationDate.valueOf();
        const nowWithOffset = new Date().valueOf() + offsetSeconds * 1000;
        const tokenNotExpired = tokenExpirationValue > nowWithOffset;
        this.loggerService.logDebug(`Has id_token expired: ${!tokenNotExpired}, ${tokenExpirationValue} > ${nowWithOffset}`);
        // Token not expired?
        return tokenNotExpired;
    }
    validateAccessTokenNotExpired(accessTokenExpiresAt, offsetSeconds) {
        // value is optional, so if it does not exist, then it has not expired
        if (!accessTokenExpiresAt) {
            return true;
        }
        offsetSeconds = offsetSeconds || 0;
        const accessTokenExpirationValue = accessTokenExpiresAt.valueOf();
        const nowWithOffset = new Date().valueOf() + offsetSeconds * 1000;
        const tokenNotExpired = accessTokenExpirationValue > nowWithOffset;
        this.loggerService.logDebug(`Has access_token expired: ${!tokenNotExpired}, ${accessTokenExpirationValue} > ${nowWithOffset}`);
        // access token not expired?
        return tokenNotExpired;
    }
    // iss
    // REQUIRED. Issuer Identifier for the Issuer of the response.The iss value is a case-sensitive URL using the
    // https scheme that contains scheme, host,
    // and optionally, port number and path components and no query or fragment components.
    //
    // sub
    // REQUIRED. Subject Identifier.Locally unique and never reassigned identifier within the Issuer for the End- User,
    // which is intended to be consumed by the Client, e.g., 24400320 or AItOawmwtWwcT0k51BayewNvutrJUqsvl6qs7A4.
    // It MUST NOT exceed 255 ASCII characters in length.The sub value is a case-sensitive string.
    //
    // aud
    // REQUIRED. Audience(s) that this ID Token is intended for. It MUST contain the OAuth 2.0 client_id of the Relying Party as an
    // audience value.
    // It MAY also contain identifiers for other audiences.In the general case, the aud value is an array of case-sensitive strings.
    // In the common special case when there is one audience, the aud value MAY be a single case-sensitive string.
    //
    // exp
    // REQUIRED. Expiration time on or after which the ID Token MUST NOT be accepted for processing.
    // The processing of this parameter requires that the current date/ time MUST be before the expiration date/ time listed in the value.
    // Implementers MAY provide for some small leeway, usually no more than a few minutes, to account for clock skew.
    // Its value is a JSON [RFC7159] number representing the number of seconds from 1970- 01 - 01T00: 00:00Z as measured in UTC until
    // the date/ time.
    // See RFC 3339 [RFC3339] for details regarding date/ times in general and UTC in particular.
    //
    // iat
    // REQUIRED. Time at which the JWT was issued. Its value is a JSON number representing the number of seconds from
    // 1970- 01 - 01T00: 00: 00Z as measured
    // in UTC until the date/ time.
    validateRequiredIdToken(dataIdToken) {
        let validated = true;
        if (!dataIdToken.hasOwnProperty('iss')) {
            validated = false;
            this.loggerService.logWarning('iss is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('sub')) {
            validated = false;
            this.loggerService.logWarning('sub is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('aud')) {
            validated = false;
            this.loggerService.logWarning('aud is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('exp')) {
            validated = false;
            this.loggerService.logWarning('exp is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('iat')) {
            validated = false;
            this.loggerService.logWarning('iat is missing, this is required in the id_token');
        }
        return validated;
    }
    // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
    // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
    validateIdTokenIatMaxOffset(dataIdToken, maxOffsetAllowedInSeconds, disableIatOffsetValidation) {
        if (disableIatOffsetValidation) {
            return true;
        }
        if (!dataIdToken.hasOwnProperty('iat')) {
            return false;
        }
        const dateTimeIatIdToken = new Date(0); // The 0 here is the key, which sets the date to the epoch
        dateTimeIatIdToken.setUTCSeconds(dataIdToken.iat);
        maxOffsetAllowedInSeconds = maxOffsetAllowedInSeconds || 0;
        if (dateTimeIatIdToken == null) {
            return false;
        }
        this.loggerService.logDebug('validate_id_token_iat_max_offset: ' +
            (new Date().valueOf() - dateTimeIatIdToken.valueOf()) +
            ' < ' +
            maxOffsetAllowedInSeconds * 1000);
        const diff = new Date().valueOf() - dateTimeIatIdToken.valueOf();
        if (diff > 0) {
            return diff < maxOffsetAllowedInSeconds * 1000;
        }
        return -diff < maxOffsetAllowedInSeconds * 1000;
    }
    // id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one
    // that was sent in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.
    // The precise method for detecting replay attacks is Client specific.
    // However the nonce claim SHOULD not be present for the refesh_token grant type
    // https://bitbucket.org/openid/connect/issues/1025/ambiguity-with-how-nonce-is-handled-on
    // The current spec is ambiguous and Keycloak does send it.
    validateIdTokenNonce(dataIdToken, localNonce, ignoreNonceAfterRefresh) {
        const isFromRefreshToken = (dataIdToken.nonce === undefined || ignoreNonceAfterRefresh) &&
            localNonce === TokenValidationService_1.RefreshTokenNoncePlaceholder;
        if (!isFromRefreshToken && dataIdToken.nonce !== localNonce) {
            this.loggerService.logDebug('Validate_id_token_nonce failed, dataIdToken.nonce: ' + dataIdToken.nonce + ' local_nonce:' + localNonce);
            return false;
        }
        return true;
    }
    // id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
    // MUST exactly match the value of the iss (issuer) Claim.
    validateIdTokenIss(dataIdToken, authWellKnownEndpointsIssuer) {
        if (dataIdToken.iss !== authWellKnownEndpointsIssuer) {
            this.loggerService.logDebug('Validate_id_token_iss failed, dataIdToken.iss: ' +
                dataIdToken.iss +
                ' authWellKnownEndpoints issuer:' +
                authWellKnownEndpointsIssuer);
            return false;
        }
        return true;
    }
    // id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
    // by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience, or if it contains additional audiences
    // not trusted by the Client.
    validateIdTokenAud(dataIdToken, aud) {
        if (Array.isArray(dataIdToken.aud)) {
            // const result = this.arrayHelperService.areEqual(dataIdToken.aud, aud);
            const result = dataIdToken.aud.includes(aud);
            if (!result) {
                this.loggerService.logDebug('Validate_id_token_aud array failed, dataIdToken.aud: ' + dataIdToken.aud + ' client_id:' + aud);
                return false;
            }
            return true;
        }
        else if (dataIdToken.aud !== aud) {
            this.loggerService.logDebug('Validate_id_token_aud failed, dataIdToken.aud: ' + dataIdToken.aud + ' client_id:' + aud);
            return false;
        }
        return true;
    }
    validateIdTokenAzpExistsIfMoreThanOneAud(dataIdToken) {
        if (Array.isArray(dataIdToken.aud) && dataIdToken.aud.length > 1 && !(dataIdToken === null || dataIdToken === void 0 ? void 0 : dataIdToken.azp)) {
            return false;
        }
        return true;
    }
    // If an azp (authorized party) Claim is present, the Client SHOULD verify that its client_id is the Claim Value.
    validateIdTokenAzpValid(dataIdToken, clientId) {
        if (!(dataIdToken === null || dataIdToken === void 0 ? void 0 : dataIdToken.azp)) {
            return true;
        }
        if (dataIdToken.azp === clientId) {
            return true;
        }
        return false;
    }
    validateStateFromHashCallback(state, localState) {
        if (state !== localState) {
            this.loggerService.logDebug('ValidateStateFromHashCallback failed, state: ' + state + ' local_state:' + localState);
            return false;
        }
        return true;
    }
    // id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the alg
    // Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
    // id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the
    // OpenID Connect Core 1.0 [OpenID.Core] specification.
    validateSignatureIdToken(idToken, jwtkeys) {
        if (!jwtkeys || !jwtkeys.keys) {
            return false;
        }
        const headerData = this.tokenHelperService.getHeaderFromToken(idToken, false);
        if (Object.keys(headerData).length === 0 && headerData.constructor === Object) {
            this.loggerService.logWarning('id token has no header data');
            return false;
        }
        const kid = headerData.kid;
        const alg = headerData.alg;
        if (!this.keyAlgorithms.includes(alg)) {
            this.loggerService.logWarning('alg not supported', alg);
            return false;
        }
        let jwtKtyToUse = 'RSA';
        if (alg.charAt(0) === 'E') {
            jwtKtyToUse = 'EC';
        }
        let isValid = false;
        if (!headerData.hasOwnProperty('kid')) {
            // exactly 1 key in the jwtkeys and no kid in the Jose header
            // kty	"RSA" or EC use "sig"
            let amountOfMatchingKeys = 0;
            for (const key of jwtkeys.keys) {
                if (key.kty === jwtKtyToUse && key.use === 'sig') {
                    amountOfMatchingKeys = amountOfMatchingKeys + 1;
                }
            }
            if (amountOfMatchingKeys === 0) {
                this.loggerService.logWarning('no keys found, incorrect Signature, validation failed for id_token');
                return false;
            }
            if (amountOfMatchingKeys > 1) {
                this.loggerService.logWarning('no ID Token kid claim in JOSE header and multiple supplied in jwks_uri');
                return false;
            }
            for (const key of jwtkeys.keys) {
                if (key.kty === jwtKtyToUse && key.use === 'sig') {
                    const publickey = KEYUTIL.getKey(key);
                    isValid = KJUR.jws.JWS.verify(idToken, publickey, [alg]);
                    if (!isValid) {
                        this.loggerService.logWarning('incorrect Signature, validation failed for id_token');
                    }
                    return isValid;
                }
            }
        }
        else {
            // kid in the Jose header of id_token
            for (const key of jwtkeys.keys) {
                if (key.kid === kid) {
                    const publickey = KEYUTIL.getKey(key);
                    isValid = KJUR.jws.JWS.verify(idToken, publickey, [alg]);
                    if (!isValid) {
                        this.loggerService.logWarning('incorrect Signature, validation failed for id_token');
                    }
                    return isValid;
                }
            }
        }
        return isValid;
    }
    configValidateResponseType(responseType) {
        if (this.flowHelper.isCurrentFlowAnyImplicitFlow()) {
            return true;
        }
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            return true;
        }
        this.loggerService.logWarning('module configure incorrect, invalid response_type:' + responseType);
        return false;
    }
    // Accepts ID Token without 'kid' claim in JOSE header if only one JWK supplied in 'jwks_url'
    //// private validate_no_kid_in_header_only_one_allowed_in_jwtkeys(header_data: any, jwtkeys: any): boolean {
    ////    this.oidcSecurityCommon.logDebug('amount of jwtkeys.keys: ' + jwtkeys.keys.length);
    ////    if (!header_data.hasOwnProperty('kid')) {
    ////        // no kid defined in Jose header
    ////        if (jwtkeys.keys.length != 1) {
    ////            this.oidcSecurityCommon.logDebug('jwtkeys.keys.length != 1 and no kid in header');
    ////            return false;
    ////        }
    ////    }
    ////    return true;
    //// }
    // Access Token Validation
    // access_token C1: Hash the octets of the ASCII representation of the access_token with the hash algorithm specified in JWA[JWA]
    // for the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, the hash algorithm used is SHA-256.
    // access_token C2: Take the left- most half of the hash and base64url- encode it.
    // access_token C3: The value of at_hash in the ID Token MUST match the value produced in the previous step if at_hash
    // is present in the ID Token.
    validateIdTokenAtHash(accessToken, atHash, isCodeFlow, idTokenAlg) {
        this.loggerService.logDebug('at_hash from the server:' + atHash);
        // 'sha256' 'sha384' 'sha512'
        let sha = 'sha256';
        if (idTokenAlg.includes('384')) {
            sha = 'sha384';
        }
        else if (idTokenAlg.includes('512')) {
            sha = 'sha512';
        }
        const testdata = this.generateAtHash('' + accessToken, sha);
        this.loggerService.logDebug('at_hash client validation not decoded:' + testdata);
        if (testdata === atHash) {
            return true; // isValid;
        }
        else {
            const testValue = this.generateAtHash('' + decodeURIComponent(accessToken), sha);
            this.loggerService.logDebug('-gen access--' + testValue);
            if (testValue === atHash) {
                return true; // isValid
            }
        }
        return false;
    }
    generateAtHash(accessToken, sha) {
        const hash = KJUR.crypto.Util.hashString(accessToken, sha);
        const first128bits = hash.substr(0, hash.length / 2);
        const testdata = hextob64u(first128bits);
        return testdata;
    }
    generateCodeVerifier(codeChallenge) {
        const hash = KJUR.crypto.Util.hashString(codeChallenge, 'sha256');
        const testdata = hextob64u(hash);
        return testdata;
    }
};
TokenValidationService.RefreshTokenNoncePlaceholder = '--RefreshToken--';
TokenValidationService.ctorParameters = () => [
    { type: TokenHelperService },
    { type: FlowHelper },
    { type: LoggerService }
];
TokenValidationService = TokenValidationService_1 = __decorate([
    Injectable()
], TokenValidationService);

let AuthStateService = class AuthStateService {
    constructor(storagePersistanceService, loggerService, publicEventsService, configurationProvider, tokenValidationService) {
        this.storagePersistanceService = storagePersistanceService;
        this.loggerService = loggerService;
        this.publicEventsService = publicEventsService;
        this.configurationProvider = configurationProvider;
        this.tokenValidationService = tokenValidationService;
        // event which contains the state
        this.authorizedInternal$ = new BehaviorSubject(false);
        this.authState = AuthorizedState.Unknown;
    }
    get authorized$() {
        return this.authorizedInternal$.asObservable();
    }
    setAuthorizedAndFireEvent() {
        // set the correct values in storage
        this.authState = AuthorizedState.Authorized;
        this.persistAuthStateInStorage(this.authState);
        this.authorizedInternal$.next(true);
    }
    setUnauthorizedAndFireEvent() {
        // set the correct values in storage
        this.authState = AuthorizedState.Unauthorized;
        this.storagePersistanceService.resetAuthStateInStorage();
        this.authorizedInternal$.next(false);
    }
    initStateFromStorage() {
        const currentAuthorizedState = this.getCurrentlyPersistedAuthState();
        if (currentAuthorizedState === AuthorizedState.Authorized) {
            this.authState = AuthorizedState.Authorized;
        }
        else {
            this.authState = AuthorizedState.Unknown;
        }
    }
    updateAndPublishAuthState(authorizationResult) {
        this.publicEventsService.fireEvent(EventTypes.NewAuthorizationResult, authorizationResult);
    }
    setAuthorizationData(accessToken, idToken) {
        this.loggerService.logDebug(accessToken);
        this.loggerService.logDebug(idToken);
        this.loggerService.logDebug('storing to storage, getting the roles');
        this.storagePersistanceService.accessToken = accessToken;
        this.storagePersistanceService.idToken = idToken;
        this.setAuthorizedAndFireEvent();
    }
    getAccessToken() {
        if (!(this.authState === AuthorizedState.Authorized)) {
            return '';
        }
        const token = this.storagePersistanceService.getAccessToken();
        return decodeURIComponent(token);
    }
    getIdToken() {
        if (!(this.authState === AuthorizedState.Authorized)) {
            return '';
        }
        const token = this.storagePersistanceService.getIdToken();
        return decodeURIComponent(token);
    }
    getRefreshToken() {
        if (!(this.authState === AuthorizedState.Authorized)) {
            return '';
        }
        const token = this.storagePersistanceService.getRefreshToken();
        return decodeURIComponent(token);
    }
    areAuthStorageTokensValid() {
        const currentAuthState = this.getCurrentlyPersistedAuthState();
        if (currentAuthState !== AuthorizedState.Authorized) {
            return false;
        }
        this.loggerService.logDebug(`authorizedState in storage is ${currentAuthState}`);
        if (this.hasIdTokenExpired()) {
            this.loggerService.logDebug('persisted id_token is expired');
            return false;
        }
        if (this.hasAccessTokenExpiredIfExpiryExists()) {
            this.loggerService.logDebug('persisted access_token is expired');
            return false;
        }
        this.loggerService.logDebug('persisted id_token and access token are valid');
        return true;
    }
    setAuthResultInStorage(authResult) {
        this.storagePersistanceService.authResult = authResult;
    }
    hasIdTokenExpired() {
        const tokenToCheck = this.storagePersistanceService.idToken;
        const idTokenExpired = this.tokenValidationService.hasIdTokenExpired(tokenToCheck, this.configurationProvider.openIDConfiguration.renewTimeBeforeTokenExpiresInSeconds);
        if (idTokenExpired) {
            this.publicEventsService.fireEvent(EventTypes.IdTokenExpired, idTokenExpired);
        }
        return idTokenExpired;
    }
    hasAccessTokenExpiredIfExpiryExists() {
        const accessTokenExpiresIn = this.storagePersistanceService.accessTokenExpiresIn;
        const accessTokenHasNotExpired = this.tokenValidationService.validateAccessTokenNotExpired(accessTokenExpiresIn, this.configurationProvider.openIDConfiguration.renewTimeBeforeTokenExpiresInSeconds);
        const hasExpired = !accessTokenHasNotExpired;
        if (hasExpired) {
            this.publicEventsService.fireEvent(EventTypes.TokenExpired, hasExpired);
        }
        return hasExpired;
    }
    getCurrentlyPersistedAuthState() {
        return this.storagePersistanceService.authorizedState;
    }
    persistAuthStateInStorage(authState) {
        this.storagePersistanceService.authorizedState = authState;
    }
};
AuthStateService.ctorParameters = () => [
    { type: StoragePersistanceService },
    { type: LoggerService },
    { type: PublicEventsService },
    { type: ConfigurationProvider },
    { type: TokenValidationService }
];
AuthStateService = __decorate([
    Injectable()
], AuthStateService);

let OidcConfigService = class OidcConfigService {
    constructor(loggerService, http, configurationProvider, publicEventsService) {
        this.loggerService = loggerService;
        this.http = http;
        this.configurationProvider = configurationProvider;
        this.publicEventsService = publicEventsService;
        this.WELL_KNOWN_SUFFIX = `/.well-known/openid-configuration`;
    }
    withConfig(passedConfig) {
        if (!passedConfig.stsServer) {
            this.loggerService.logError('please provide at least an stsServer');
            return;
        }
        if (!passedConfig.authWellknownEndpoint) {
            passedConfig.authWellknownEndpoint = passedConfig.stsServer;
        }
        const loadConfig$ = this.getWellKnownDocument(passedConfig.authWellknownEndpoint).pipe(map((wellKnownEndpoints) => {
            return {
                issuer: wellKnownEndpoints.issuer,
                jwksUri: wellKnownEndpoints.jwks_uri,
                authorizationEndpoint: wellKnownEndpoints.authorization_endpoint,
                tokenEndpoint: wellKnownEndpoints.token_endpoint,
                userinfoEndpoint: wellKnownEndpoints.userinfo_endpoint,
                endSessionEndpoint: wellKnownEndpoints.end_session_endpoint,
                checkSessionIframe: wellKnownEndpoints.check_session_iframe,
                revocationEndpoint: wellKnownEndpoints.revocation_endpoint,
                introspectionEndpoint: wellKnownEndpoints.introspection_endpoint,
            };
        }), tap((mappedWellKnownEndpoints) => this.configurationProvider.setConfig(passedConfig, mappedWellKnownEndpoints)), tap((mappedWellKnownEndpoints) => this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, { passedConfig, mappedWellKnownEndpoints })));
        return loadConfig$.toPromise();
    }
    getWellKnownDocument(wellKnownEndpoint) {
        let url = wellKnownEndpoint;
        if (!wellKnownEndpoint.includes(this.WELL_KNOWN_SUFFIX)) {
            url = `${wellKnownEndpoint}${this.WELL_KNOWN_SUFFIX}`;
        }
        return this.http.get(url);
    }
};
OidcConfigService.ctorParameters = () => [
    { type: LoggerService },
    { type: DataService },
    { type: ConfigurationProvider },
    { type: PublicEventsService }
];
OidcConfigService = __decorate([
    Injectable()
], OidcConfigService);

let RandomService = class RandomService {
    constructor(loggerService) {
        this.loggerService = loggerService;
    }
    createRandom(requiredLength) {
        if (requiredLength <= 0) {
            return '';
        }
        if (requiredLength > 0 && requiredLength < 7) {
            this.loggerService.logWarning(`RandomService called with ${requiredLength} but 7 chars is the minimum, returning 10 chars`);
            requiredLength = 10;
        }
        const length = requiredLength - 6;
        const arr = new Uint8Array((length || length) / 2);
        this.getCrypto().getRandomValues(arr);
        return Array.from(arr, this.toHex).join('') + this.randomString(7);
    }
    toHex(dec) {
        return ('0' + dec.toString(16)).substr(-2);
    }
    randomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = new Uint32Array(length);
        this.getCrypto().getRandomValues(values);
        for (let i = 0; i < length; i++) {
            result += characters[values[i] % characters.length];
        }
        return result;
    }
    getCrypto() {
        // support for IE,  (window.crypto || window.msCrypto)
        return window.crypto || window.msCrypto;
    }
};
RandomService.ctorParameters = () => [
    { type: LoggerService }
];
RandomService = __decorate([
    Injectable()
], RandomService);

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

function _window() {
    return window;
}
const WINDOW = new InjectionToken('WindowToken');

class UriEncoder {
    encodeKey(key) {
        return encodeURIComponent(key);
    }
    encodeValue(value) {
        return encodeURIComponent(value);
    }
    decodeKey(key) {
        return decodeURIComponent(key);
    }
    decodeValue(value) {
        return decodeURIComponent(value);
    }
}

let UrlService = class UrlService {
    constructor(configurationProvider, loggerService, flowsDataService, flowHelper, tokenValidationService, window) {
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
        this.flowsDataService = flowsDataService;
        this.flowHelper = flowHelper;
        this.tokenValidationService = tokenValidationService;
        this.window = window;
        this.CALLBACK_PARAMS_TO_CHECK = ['code', 'state', 'token', 'id_token'];
    }
    getUrlParameter(urlToCheck, name) {
        if (!urlToCheck) {
            return '';
        }
        if (!name) {
            return '';
        }
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(urlToCheck);
        return results === null ? '' : decodeURIComponent(results[1]);
    }
    isCallbackFromSts() {
        const anyParameterIsGiven = this.CALLBACK_PARAMS_TO_CHECK.some((x) => !!this.getUrlParameter(this.window.location.toString(), x));
        return anyParameterIsGiven;
    }
    getRefreshSessionSilentRenewUrl() {
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            return this.createUrlCodeFlowWithSilentRenew();
        }
        return this.createUrlImplicitFlowWithSilentRenew() || '';
    }
    getAuthorizeUrl(customParams) {
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            return this.createUrlCodeFlowAuthorize(customParams);
        }
        return this.createUrlImplicitFlowAuthorize(customParams) || '';
    }
    createEndSessionUrl(idTokenHint) {
        var _a;
        const endSessionEndpoint = (_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.endSessionEndpoint;
        if (!endSessionEndpoint) {
            return null;
        }
        const urlParts = endSessionEndpoint.split('?');
        const authorizationEndsessionUrl = urlParts[0];
        let params = new HttpParams({
            fromString: urlParts[1],
            encoder: new UriEncoder(),
        });
        params = params.set('id_token_hint', idTokenHint);
        const postLogoutRedirectUri = this.getPostLogoutRedirectUrl();
        if (postLogoutRedirectUri) {
            params = params.append('post_logout_redirect_uri', postLogoutRedirectUri);
        }
        return `${authorizationEndsessionUrl}?${params}`;
    }
    createRevocationEndpointBodyAccessToken(token) {
        const clientId = this.getClientId();
        if (!clientId) {
            return null;
        }
        return `client_id=${clientId}&token=${token}&token_type_hint=access_token`;
    }
    createRevocationEndpointBodyRefreshToken(token) {
        const clientId = this.getClientId();
        if (!clientId) {
            return null;
        }
        return `client_id=${clientId}&token=${token}&token_type_hint=refresh_token`;
    }
    getRevocationEndpointUrl() {
        var _a;
        const endSessionEndpoint = (_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.revocationEndpoint;
        if (!endSessionEndpoint) {
            return null;
        }
        const urlParts = endSessionEndpoint.split('?');
        const revocationEndpointUrl = urlParts[0];
        return revocationEndpointUrl;
    }
    createBodyForCodeFlowCodeRequest(code) {
        const codeVerifier = this.flowsDataService.getCodeVerifier();
        if (!codeVerifier) {
            this.loggerService.logError(`CodeVerifier is not set `, codeVerifier);
            return null;
        }
        const clientId = this.getClientId();
        if (!clientId) {
            return null;
        }
        const dataForBody = oneLineTrim `grant_type=authorization_code
            &client_id=${clientId}
            &code_verifier=${codeVerifier}
            &code=${code}`;
        const silentRenewUrl = this.getSilentRenewUrl();
        if (this.flowsDataService.isSilentRenewRunning() && silentRenewUrl) {
            return oneLineTrim `${dataForBody}&redirect_uri=${silentRenewUrl}`;
        }
        const redirectUrl = this.getRedirectUrl();
        if (!redirectUrl) {
            return null;
        }
        return oneLineTrim `${dataForBody}&redirect_uri=${redirectUrl}`;
    }
    createBodyForCodeFlowRefreshTokensRequest(refreshtoken) {
        const clientId = this.getClientId();
        if (!clientId) {
            return null;
        }
        return oneLineTrim `grant_type=refresh_token
          &client_id=${clientId}
          &refresh_token=${refreshtoken}`;
    }
    createAuthorizeUrl(codeChallenge, redirectUrl, nonce, state, prompt, customRequestParams) {
        var _a, _b;
        const authorizationEndpoint = (_b = (_a = this.configurationProvider) === null || _a === void 0 ? void 0 : _a.wellKnownEndpoints) === null || _b === void 0 ? void 0 : _b.authorizationEndpoint;
        if (!authorizationEndpoint) {
            this.loggerService.logError(`Can not create an authorize url when authorizationEndpoint is '${authorizationEndpoint}'`);
            return null;
        }
        const { clientId, responseType, scope, hdParam, customParams } = this.configurationProvider.openIDConfiguration;
        if (!clientId) {
            this.loggerService.logError(`createAuthorizeUrl could not add clientId because it was: `, clientId);
            return null;
        }
        if (!responseType) {
            this.loggerService.logError(`createAuthorizeUrl could not add responseType because it was: `, responseType);
            return null;
        }
        if (!scope) {
            this.loggerService.logError(`createAuthorizeUrl could not add scope because it was: `, scope);
            return null;
        }
        const urlParts = authorizationEndpoint.split('?');
        const authorizationUrl = urlParts[0];
        let params = new HttpParams({
            fromString: urlParts[1],
            encoder: new UriEncoder(),
        });
        params = params.set('client_id', clientId);
        params = params.append('redirect_uri', redirectUrl);
        params = params.append('response_type', responseType);
        params = params.append('scope', scope);
        params = params.append('nonce', nonce);
        params = params.append('state', state);
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            params = params.append('code_challenge', codeChallenge);
            params = params.append('code_challenge_method', 'S256');
        }
        if (prompt) {
            params = params.append('prompt', prompt);
        }
        if (hdParam) {
            params = params.append('hd', hdParam);
        }
        if (customParams || customRequestParams) {
            const customParamsToAdd = Object.assign(Object.assign({}, (customParams || {})), (customRequestParams || {}));
            for (const [key, value] of Object.entries(customParamsToAdd)) {
                params = params.append(key, value.toString());
            }
        }
        return `${authorizationUrl}?${params}`;
    }
    createUrlImplicitFlowWithSilentRenew() {
        const state = this.flowsDataService.getExistingOrCreateAuthStateControl();
        const nonce = this.flowsDataService.createNonce();
        const silentRenewUrl = this.getSilentRenewUrl();
        if (!silentRenewUrl) {
            return null;
        }
        this.loggerService.logDebug('RefreshSession created. adding myautostate: ', state);
        if (this.configurationProvider.wellKnownEndpoints) {
            return this.createAuthorizeUrl('', silentRenewUrl, nonce, state, 'none');
        }
        this.loggerService.logError('authWellKnownEndpoints is undefined');
        return null;
    }
    createUrlCodeFlowWithSilentRenew() {
        const state = this.flowsDataService.getExistingOrCreateAuthStateControl();
        const nonce = this.flowsDataService.createNonce();
        this.loggerService.logDebug('RefreshSession created. adding myautostate: ' + state);
        // code_challenge with "S256"
        const codeVerifier = this.flowsDataService.createCodeVerifier();
        const codeChallenge = this.tokenValidationService.generateCodeVerifier(codeVerifier);
        const silentRenewUrl = this.getSilentRenewUrl();
        if (!silentRenewUrl) {
            return null;
        }
        if (this.configurationProvider.wellKnownEndpoints) {
            return this.createAuthorizeUrl(codeChallenge, silentRenewUrl, nonce, state, 'none');
        }
        this.loggerService.logWarning('authWellKnownEndpoints is undefined');
        return null;
    }
    createUrlImplicitFlowAuthorize(customParams) {
        const state = this.flowsDataService.getExistingOrCreateAuthStateControl();
        const nonce = this.flowsDataService.createNonce();
        this.loggerService.logDebug('Authorize created. adding myautostate: ' + state);
        const redirectUrl = this.getRedirectUrl();
        if (!redirectUrl) {
            return null;
        }
        if (this.configurationProvider.wellKnownEndpoints) {
            return this.createAuthorizeUrl('', redirectUrl, nonce, state, null, customParams);
        }
        this.loggerService.logError('authWellKnownEndpoints is undefined');
        return null;
    }
    createUrlCodeFlowAuthorize(customParams) {
        const state = this.flowsDataService.getExistingOrCreateAuthStateControl();
        const nonce = this.flowsDataService.createNonce();
        this.loggerService.logDebug('Authorize created. adding myautostate: ' + state);
        const redirectUrl = this.getRedirectUrl();
        if (!redirectUrl) {
            return null;
        }
        // code_challenge with "S256"
        const codeVerifier = this.flowsDataService.createCodeVerifier();
        const codeChallenge = this.tokenValidationService.generateCodeVerifier(codeVerifier);
        if (this.configurationProvider.wellKnownEndpoints) {
            return this.createAuthorizeUrl(codeChallenge, redirectUrl, nonce, state, null, customParams);
        }
        this.loggerService.logError('authWellKnownEndpoints is undefined');
        return null;
    }
    getRedirectUrl() {
        var _a;
        const redirectUrl = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.redirectUrl;
        if (!redirectUrl) {
            this.loggerService.logError(`could not get redirectUrl, was: `, redirectUrl);
            return null;
        }
        return redirectUrl;
    }
    getSilentRenewUrl() {
        var _a;
        const silentRenewUrl = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.silentRenewUrl;
        if (!silentRenewUrl) {
            this.loggerService.logError(`could not get silentRenewUrl, was: `, silentRenewUrl);
            return null;
        }
        return silentRenewUrl;
    }
    getPostLogoutRedirectUrl() {
        var _a;
        const postLogoutRedirectUri = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.postLogoutRedirectUri;
        if (!postLogoutRedirectUri) {
            this.loggerService.logError(`could not get postLogoutRedirectUri, was: `, postLogoutRedirectUri);
            return null;
        }
        return postLogoutRedirectUri;
    }
    getClientId() {
        var _a;
        const clientId = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.clientId;
        if (!clientId) {
            this.loggerService.logError(`could not get clientId, was: `, clientId);
            return null;
        }
        return clientId;
    }
};
UrlService.ctorParameters = () => [
    { type: ConfigurationProvider },
    { type: LoggerService },
    { type: FlowsDataService },
    { type: FlowHelper },
    { type: TokenValidationService },
    { type: undefined, decorators: [{ type: Inject, args: [WINDOW,] }] }
];
UrlService = __decorate([
    Injectable(),
    __param(5, Inject(WINDOW))
], UrlService);

var ValidationResult;
(function (ValidationResult) {
    ValidationResult["NotSet"] = "NotSet";
    ValidationResult["StatesDoNotMatch"] = "StatesDoNotMatch";
    ValidationResult["SignatureFailed"] = "SignatureFailed";
    ValidationResult["IncorrectNonce"] = "IncorrectNonce";
    ValidationResult["RequiredPropertyMissing"] = "RequiredPropertyMissing";
    ValidationResult["MaxOffsetExpired"] = "MaxOffsetExpired";
    ValidationResult["IssDoesNotMatchIssuer"] = "IssDoesNotMatchIssuer";
    ValidationResult["NoAuthWellKnownEndPoints"] = "NoAuthWellKnownEndPoints";
    ValidationResult["IncorrectAud"] = "IncorrectAud";
    ValidationResult["IncorrectIdTokenClaimsAfterRefresh"] = "IncorrectIdTokenClaimsAfterRefresh";
    ValidationResult["IncorrectAzp"] = "IncorrectAzp";
    ValidationResult["TokenExpired"] = "TokenExpired";
    ValidationResult["IncorrectAtHash"] = "IncorrectAtHash";
    ValidationResult["Ok"] = "Ok";
    ValidationResult["LoginRequired"] = "LoginRequired";
    ValidationResult["SecureTokenServerError"] = "SecureTokenServerError";
})(ValidationResult || (ValidationResult = {}));

class StateValidationResult {
    constructor(accessToken = '', idToken = '', authResponseIsValid = false, decodedIdToken = {}, state = ValidationResult.NotSet) {
        this.accessToken = accessToken;
        this.idToken = idToken;
        this.authResponseIsValid = authResponseIsValid;
        this.decodedIdToken = decodedIdToken;
        this.state = state;
    }
}

let StateValidationService = class StateValidationService {
    constructor(storagePersistanceService, tokenValidationService, tokenHelperService, loggerService, configurationProvider, flowHelper) {
        this.storagePersistanceService = storagePersistanceService;
        this.tokenValidationService = tokenValidationService;
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.flowHelper = flowHelper;
    }
    getValidatedStateResult(callbackContext) {
        if (callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult.error) {
            return new StateValidationResult('', '', false, {});
        }
        return this.validateState(callbackContext);
    }
    isIdTokenAfterRefreshTokenRequestValid(callbackContext, newIdToken) {
        if (!this.configurationProvider.openIDConfiguration.useRefreshToken) {
            return true;
        }
        if (!callbackContext.existingIdToken) {
            return true;
        }
        const decodedIdToken = this.tokenHelperService.getPayloadFromToken(callbackContext.existingIdToken, false);
        // Upon successful validation of the Refresh Token, the response body is the Token Response of Section 3.1.3.3
        // except that it might not contain an id_token.
        // If an ID Token is returned as a result of a token refresh request, the following requirements apply:
        // its iss Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.iss !== newIdToken.iss) {
            this.loggerService.logDebug(`iss do not match: ${decodedIdToken.iss} ${newIdToken.iss}`);
            return false;
        }
        // its azp Claim Value MUST be the same as in the ID Token issued when the original authentication occurred;
        //   if no azp Claim was present in the original ID Token, one MUST NOT be present in the new ID Token, and
        // otherwise, the same rules apply as apply when issuing an ID Token at the time of the original authentication.
        if (decodedIdToken.azp !== newIdToken.azp) {
            this.loggerService.logDebug(`azp do not match: ${decodedIdToken.azp} ${newIdToken.azp}`);
            return false;
        }
        // its sub Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.sub !== newIdToken.sub) {
            this.loggerService.logDebug(`sub do not match: ${decodedIdToken.sub} ${newIdToken.sub}`);
            return false;
        }
        // its aud Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.aud !== newIdToken.aud) {
            this.loggerService.logDebug(`aud do not match: ${decodedIdToken.aud} ${newIdToken.aud}`);
            return false;
        }
        if (this.configurationProvider.openIDConfiguration.disableRefreshIdTokenAuthTimeValidation) {
            return true;
        }
        // its iat Claim MUST represent the time that the new ID Token is issued,
        // if the ID Token contains an auth_time Claim, its value MUST represent the time of the original authentication
        // - not the time that the new ID token is issued,
        if (decodedIdToken.auth_time !== newIdToken.auth_time) {
            this.loggerService.logDebug(`auth_time do not match: ${decodedIdToken.auth_time} ${newIdToken.auth_time}`);
            return false;
        }
        return true;
    }
    validateState(callbackContext) {
        const toReturn = new StateValidationResult();
        if (!this.tokenValidationService.validateStateFromHashCallback(callbackContext.authResult.state, this.storagePersistanceService.authStateControl)) {
            this.loggerService.logWarning('authorizedCallback incorrect state');
            toReturn.state = ValidationResult.StatesDoNotMatch;
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        const isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken();
        const isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
        if (isCurrentFlowImplicitFlowWithAccessToken || isCurrentFlowCodeFlow) {
            toReturn.accessToken = callbackContext.authResult.access_token;
        }
        if (callbackContext.authResult.id_token) {
            toReturn.idToken = callbackContext.authResult.id_token;
            toReturn.decodedIdToken = this.tokenHelperService.getPayloadFromToken(toReturn.idToken, false);
            if (!this.tokenValidationService.validateSignatureIdToken(toReturn.idToken, callbackContext.jwtKeys)) {
                this.loggerService.logDebug('authorizedCallback Signature validation failed id_token');
                toReturn.state = ValidationResult.SignatureFailed;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenNonce(toReturn.decodedIdToken, this.storagePersistanceService.authNonce, this.configurationProvider.openIDConfiguration.ignoreNonceAfterRefresh)) {
                this.loggerService.logWarning('authorizedCallback incorrect nonce');
                toReturn.state = ValidationResult.IncorrectNonce;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateRequiredIdToken(toReturn.decodedIdToken)) {
                this.loggerService.logDebug('authorizedCallback Validation, one of the REQUIRED properties missing from id_token');
                toReturn.state = ValidationResult.RequiredPropertyMissing;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenIatMaxOffset(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.maxIdTokenIatOffsetAllowedInSeconds, this.configurationProvider.openIDConfiguration.disableIatOffsetValidation)) {
                this.loggerService.logWarning('authorizedCallback Validation, iat rejected id_token was issued too far away from the current time');
                toReturn.state = ValidationResult.MaxOffsetExpired;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (this.configurationProvider.wellKnownEndpoints) {
                if (this.configurationProvider.openIDConfiguration.issValidationOff) {
                    this.loggerService.logDebug('iss validation is turned off, this is not recommended!');
                }
                else if (!this.configurationProvider.openIDConfiguration.issValidationOff &&
                    !this.tokenValidationService.validateIdTokenIss(toReturn.decodedIdToken, this.configurationProvider.wellKnownEndpoints.issuer)) {
                    this.loggerService.logWarning('authorizedCallback incorrect iss does not match authWellKnownEndpoints issuer');
                    toReturn.state = ValidationResult.IssDoesNotMatchIssuer;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
            }
            else {
                this.loggerService.logWarning('authWellKnownEndpoints is undefined');
                toReturn.state = ValidationResult.NoAuthWellKnownEndPoints;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAud(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.clientId)) {
                this.loggerService.logWarning('authorizedCallback incorrect aud');
                toReturn.state = ValidationResult.IncorrectAud;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAzpExistsIfMoreThanOneAud(toReturn.decodedIdToken)) {
                this.loggerService.logWarning('authorizedCallback missing azp');
                toReturn.state = ValidationResult.IncorrectAzp;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAzpValid(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.clientId)) {
                this.loggerService.logWarning('authorizedCallback incorrect azp');
                toReturn.state = ValidationResult.IncorrectAzp;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.isIdTokenAfterRefreshTokenRequestValid(callbackContext, toReturn.decodedIdToken)) {
                this.loggerService.logWarning('authorizedCallback pre, post id_token claims do not match in refresh');
                toReturn.state = ValidationResult.IncorrectIdTokenClaimsAfterRefresh;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenExpNotExpired(toReturn.decodedIdToken)) {
                this.loggerService.logWarning('authorizedCallback id token expired');
                toReturn.state = ValidationResult.TokenExpired;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
        }
        else {
            this.loggerService.logDebug('No id_token found, skipping id_token validation');
        }
        // flow id_token
        if (!isCurrentFlowImplicitFlowWithAccessToken && !isCurrentFlowCodeFlow) {
            toReturn.authResponseIsValid = true;
            toReturn.state = ValidationResult.Ok;
            this.handleSuccessfulValidation();
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        const idTokenHeader = this.tokenHelperService.getHeaderFromToken(toReturn.idToken, false);
        // The at_hash is optional for the code flow
        if (isCurrentFlowCodeFlow && !toReturn.decodedIdToken.at_hash) {
            this.loggerService.logDebug('Code Flow active, and no at_hash in the id_token, skipping check!');
        }
        else if (!this.tokenValidationService.validateIdTokenAtHash(toReturn.accessToken, toReturn.decodedIdToken.at_hash, isCurrentFlowCodeFlow, idTokenHeader.alg // 'RSA256'
        ) ||
            !toReturn.accessToken) {
            this.loggerService.logWarning('authorizedCallback incorrect at_hash');
            toReturn.state = ValidationResult.IncorrectAtHash;
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        toReturn.authResponseIsValid = true;
        toReturn.state = ValidationResult.Ok;
        this.handleSuccessfulValidation();
        return toReturn;
    }
    handleSuccessfulValidation() {
        this.storagePersistanceService.authNonce = '';
        if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
            this.storagePersistanceService.authStateControl = '';
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) validated, continue');
    }
    handleUnsuccessfulValidation() {
        this.storagePersistanceService.authNonce = '';
        if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
            this.storagePersistanceService.authStateControl = '';
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) invalid');
    }
};
StateValidationService.ctorParameters = () => [
    { type: StoragePersistanceService },
    { type: TokenValidationService },
    { type: TokenHelperService },
    { type: LoggerService },
    { type: ConfigurationProvider },
    { type: FlowHelper }
];
StateValidationService = __decorate([
    Injectable()
], StateValidationService);

let SigninKeyDataService = class SigninKeyDataService {
    constructor(configurationProvider, loggerService, dataService) {
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
        this.dataService = dataService;
    }
    getSigningKeys() {
        var _a, _b;
        if (!((_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.jwksUri)) {
            const error = `getSigningKeys: authWellKnownEndpoints.jwksUri is: '${(_b = this.configurationProvider.wellKnownEndpoints) === null || _b === void 0 ? void 0 : _b.jwksUri}'`;
            this.loggerService.logWarning(error);
            return throwError(error);
        }
        this.loggerService.logDebug('Getting signinkeys from ', this.configurationProvider.wellKnownEndpoints.jwksUri);
        return this.dataService
            .get(this.configurationProvider.wellKnownEndpoints.jwksUri)
            .pipe(catchError(this.handleErrorGetSigningKeys));
    }
    handleErrorGetSigningKeys(error) {
        let errMsg;
        if (error instanceof Response) {
            const body = error.json() || {};
            const err = JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        }
        else {
            errMsg = error.message ? error.message : error.toString();
        }
        this.loggerService.logError(errMsg);
        return throwError(errMsg);
    }
};
SigninKeyDataService.ctorParameters = () => [
    { type: ConfigurationProvider },
    { type: LoggerService },
    { type: DataService }
];
SigninKeyDataService = __decorate([
    Injectable()
], SigninKeyDataService);

let FlowsService = class FlowsService {
    constructor(urlService, loggerService, tokenValidationService, configurationProvider, authStateService, flowsDataService, signinKeyDataService, dataService, userService, stateValidationService) {
        this.urlService = urlService;
        this.loggerService = loggerService;
        this.tokenValidationService = tokenValidationService;
        this.configurationProvider = configurationProvider;
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
        this.signinKeyDataService = signinKeyDataService;
        this.dataService = dataService;
        this.userService = userService;
        this.stateValidationService = stateValidationService;
    }
    resetAuthorizationData() {
        if (this.configurationProvider.openIDConfiguration.autoUserinfo) {
            // Clear user data. Fixes #97.
            this.userService.resetUserDataInStore();
        }
        this.flowsDataService.resetStorageFlowData();
        this.authStateService.setUnauthorizedAndFireEvent();
    }
    processCodeFlowCallback(urlToCheck) {
        return this.codeFlowCallback(urlToCheck).pipe(switchMap((callbackContext) => this.codeFlowCodeRequest(callbackContext)), switchMap((callbackContext) => this.codeFlowSilentRenewCheck(callbackContext)), switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    processSilentRenewCodeFlowCallback(firstContext) {
        return this.codeFlowCodeRequest(firstContext).pipe(switchMap((callbackContext) => this.codeFlowSilentRenewCheck(callbackContext)), switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    processImplicitFlowCallback(hash) {
        return this.implicitFlowCallback(hash).pipe(switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    processRefreshToken() {
        return this.refreshSessionWithRefreshTokens().pipe(switchMap((callbackContext) => this.refreshTokensRequestTokens(callbackContext)), switchMap((callbackContext) => this.codeFlowSilentRenewCheck(callbackContext)), switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    // STEP 1 Code Flow
    codeFlowCallback(urlToCheck) {
        const code = this.urlService.getUrlParameter(urlToCheck, 'code');
        const state = this.urlService.getUrlParameter(urlToCheck, 'state');
        const sessionState = this.urlService.getUrlParameter(urlToCheck, 'session_state') || null;
        if (!state) {
            this.loggerService.logDebug('no state in url');
            return throwError('no state in url');
        }
        if (!code) {
            this.loggerService.logDebug('no code in url');
            return throwError('no code in url');
        }
        this.loggerService.logDebug('running validation for callback' + urlToCheck);
        const initialCallbackContext = {
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
        return of(initialCallbackContext);
    }
    // STEP 1 Implicit Flow
    implicitFlowCallback(hash) {
        const isRenewProcessData = this.flowsDataService.isSilentRenewRunning();
        this.loggerService.logDebug('BEGIN authorizedCallback, no auth data');
        if (!isRenewProcessData) {
            this.resetAuthorizationData();
        }
        hash = hash || window.location.hash.substr(1);
        const authResult = hash.split('&').reduce((resultData, item) => {
            const parts = item.split('=');
            resultData[parts.shift()] = parts.join('=');
            return resultData;
        }, {});
        const callbackContext = {
            code: null,
            refreshToken: null,
            state: null,
            sessionState: null,
            authResult,
            isRenewProcess: isRenewProcessData,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return of(callbackContext);
    }
    // STEP 1 Refresh session
    refreshSessionWithRefreshTokens() {
        const stateData = this.flowsDataService.getExistingOrCreateAuthStateControl();
        this.loggerService.logDebug('RefreshSession created. adding myautostate: ' + stateData);
        const refreshToken = this.authStateService.getRefreshToken();
        const idToken = this.authStateService.getIdToken();
        // TODO add id_token data
        if (refreshToken) {
            const callbackContext = {
                code: null,
                refreshToken,
                state: stateData,
                sessionState: null,
                authResult: null,
                isRenewProcess: false,
                jwtKeys: null,
                validationResult: null,
                existingIdToken: idToken,
            };
            this.loggerService.logDebug('found refresh code, obtaining new credentials with refresh code');
            // Nonce is not used with refresh tokens; but Keycloak may send it anyway
            this.flowsDataService.setNonce(TokenValidationService.RefreshTokenNoncePlaceholder);
            return of(callbackContext);
        }
        else {
            const errorMessage = 'no refresh token found, please login';
            this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }
    }
    // STEP 2 Refresh Token
    refreshTokensRequestTokens(callbackContext) {
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const tokenRequestUrl = this.getTokenEndpoint();
        if (!tokenRequestUrl) {
            return throwError('Token Endpoint not defined');
        }
        const data = this.urlService.createBodyForCodeFlowRefreshTokensRequest(callbackContext.refreshToken);
        return this.dataService.post(tokenRequestUrl, data, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug('token refresh response: ', response);
            let authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), catchError((error) => {
            const errorMessage = `OidcService code request ${this.configurationProvider.openIDConfiguration.stsServer}: ${error}`;
            this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }));
    }
    // STEP 2 Code Flow //  Code Flow Silent Renew starts here
    codeFlowCodeRequest(callbackContext) {
        const isStateCorrect = this.tokenValidationService.validateStateFromHashCallback(callbackContext.state, this.flowsDataService.getAuthStateControl());
        if (!isStateCorrect) {
            this.loggerService.logWarning('codeFlowCodeRequest incorrect state');
            return throwError('codeFlowCodeRequest incorrect state');
        }
        const tokenRequestUrl = this.getTokenEndpoint();
        if (!tokenRequestUrl) {
            return throwError('Token Endpoint not defined');
        }
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const bodyForCodeFlow = this.urlService.createBodyForCodeFlowCodeRequest(callbackContext.code);
        return this.dataService.post(tokenRequestUrl, bodyForCodeFlow, headers).pipe(switchMap((response) => {
            let authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            authResult.session_state = callbackContext.sessionState;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), catchError((error) => {
            const errorMessage = `OidcService code request ${this.configurationProvider.openIDConfiguration.stsServer} with error ${error}`;
            this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }));
    }
    // STEP 3 Code Flow, STEP 3 Refresh Token
    codeFlowSilentRenewCheck(callbackContext) {
        callbackContext.isRenewProcess = this.flowsDataService.isSilentRenewRunning();
        this.loggerService.logDebug('BEGIN authorized Code Flow Callback, no auth data');
        if (!callbackContext.isRenewProcess) {
            this.resetAuthorizationData();
        }
        return of(callbackContext);
    }
    // STEP 4 Code Flow, STEP 2 Implicit Flow, STEP 4 Refresh Token
    callbackHistoryAndResetJwtKeys(callbackContext) {
        this.authStateService.setAuthResultInStorage(callbackContext.authResult);
        if (this.historyCleanUpTurnedOn() && !callbackContext.isRenewProcess) {
            this.resetBrowserHistory();
        }
        else {
            this.loggerService.logDebug('history clean up inactive');
        }
        if (callbackContext.authResult.error) {
            const errorMessage = `authorizedCallbackProcedure came with error: ${callbackContext.authResult.error}`;
            this.loggerService.logDebug(errorMessage);
            this.resetAuthorizationData();
            this.flowsDataService.setNonce('');
            this.handleResultErrorFromCallback(callbackContext.authResult, callbackContext.isRenewProcess);
            return throwError(errorMessage);
        }
        this.loggerService.logDebug(callbackContext.authResult);
        this.loggerService.logDebug('authorizedCallback created, begin token validation');
        return this.signinKeyDataService.getSigningKeys().pipe(switchMap((jwtKeys) => {
            if (jwtKeys) {
                callbackContext.jwtKeys = jwtKeys;
                return of(callbackContext);
            }
            const errorMessage = `Failed to retrieve signing key`;
            this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }), catchError((err) => {
            const errorMessage = `Failed to retrieve signing key with error: ${err}`;
            this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }));
    }
    // STEP 5 All flows
    callbackStateValidation(callbackContext) {
        const validationResult = this.stateValidationService.getValidatedStateResult(callbackContext);
        callbackContext.validationResult = validationResult;
        if (validationResult.authResponseIsValid) {
            this.authStateService.setAuthorizationData(validationResult.accessToken, validationResult.idToken);
            return of(callbackContext);
        }
        else {
            const errorMessage = `authorizedCallback, token(s) validation failed, resetting. Hash: ${window.location.hash}`;
            this.loggerService.logWarning(errorMessage);
            this.resetAuthorizationData();
            this.publishUnauthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
            return throwError(errorMessage);
        }
    }
    // STEP 6 userData
    callbackUser(callbackContext) {
        if (!this.configurationProvider.openIDConfiguration.autoUserinfo) {
            if (!callbackContext.isRenewProcess) {
                // userData is set to the id_token decoded, auto get user data set to false
                this.userService.setUserDataToStore(callbackContext.validationResult.decodedIdToken);
            }
            this.publishAuthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
            return of(callbackContext);
        }
        return this.userService
            .getAndPersistUserDataInStore(callbackContext.isRenewProcess, callbackContext.validationResult.idToken, callbackContext.validationResult.decodedIdToken)
            .pipe(switchMap((userData) => {
            if (!!userData) {
                this.flowsDataService.setSessionState(callbackContext.authResult.session_state);
                this.publishAuthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                return of(callbackContext);
            }
            else {
                this.resetAuthorizationData();
                this.publishUnauthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                const errorMessage = `Called for userData but they were ${userData}`;
                this.loggerService.logWarning(errorMessage);
                return throwError(errorMessage);
            }
        }), catchError((err) => {
            const errorMessage = `Failed to retreive user info with error:  ${err}`;
            this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }));
    }
    publishAuthorizedState(stateValidationResult, isRenewProcess) {
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Authorized,
            validationResult: stateValidationResult.state,
            isRenewProcess,
        });
    }
    publishUnauthorizedState(stateValidationResult, isRenewProcess) {
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Unauthorized,
            validationResult: stateValidationResult.state,
            isRenewProcess,
        });
    }
    handleResultErrorFromCallback(result, isRenewProcess) {
        let validationResult = ValidationResult.SecureTokenServerError;
        if (result.error === 'login_required') {
            validationResult = ValidationResult.LoginRequired;
        }
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Unauthorized,
            validationResult,
            isRenewProcess,
        });
    }
    getTokenEndpoint() {
        var _a;
        return ((_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.tokenEndpoint) || null;
    }
    historyCleanUpTurnedOn() {
        return !this.configurationProvider.openIDConfiguration.historyCleanupOff;
    }
    resetBrowserHistory() {
        window.history.replaceState({}, window.document.title, window.location.origin + window.location.pathname);
    }
};
FlowsService.ctorParameters = () => [
    { type: UrlService },
    { type: LoggerService },
    { type: TokenValidationService },
    { type: ConfigurationProvider },
    { type: AuthStateService },
    { type: FlowsDataService },
    { type: SigninKeyDataService },
    { type: DataService },
    { type: UserService },
    { type: StateValidationService }
];
FlowsService = __decorate([
    Injectable()
], FlowsService);

let IFrameService = class IFrameService {
    constructor(loggerService) {
        this.loggerService = loggerService;
    }
    getExistingIFrame(identifier) {
        const iFrameOnParent = this.getIFrameFromParentWindow(identifier);
        if (this.isIFrameElement(iFrameOnParent)) {
            return iFrameOnParent;
        }
        const iFrameOnSelf = this.getIFrameFromWindow(identifier);
        if (this.isIFrameElement(iFrameOnSelf)) {
            return iFrameOnSelf;
        }
        return null;
    }
    addIFrameToWindowBody(identifier) {
        const sessionIframe = window.document.createElement('iframe');
        sessionIframe.id = identifier;
        this.loggerService.logDebug(sessionIframe);
        sessionIframe.style.display = 'none';
        window.document.body.appendChild(sessionIframe);
        return sessionIframe;
    }
    getIFrameFromParentWindow(identifier) {
        try {
            const iFrameElement = window.parent.document.getElementById(identifier);
            if (this.isIFrameElement(iFrameElement)) {
                return iFrameElement;
            }
            return null;
        }
        catch (e) {
            return null;
        }
    }
    getIFrameFromWindow(identifier) {
        const iFrameElement = window.document.getElementById(identifier);
        if (this.isIFrameElement(iFrameElement)) {
            return iFrameElement;
        }
        return null;
    }
    isIFrameElement(element) {
        return !!element && element instanceof HTMLIFrameElement;
    }
};
IFrameService.ctorParameters = () => [
    { type: LoggerService }
];
IFrameService = __decorate([
    Injectable()
], IFrameService);

const IFRAME_FOR_CHECK_SESSION_IDENTIFIER = 'myiFrameForCheckSession';
// http://openid.net/specs/openid-connect-session-1_0-ID4.html
let CheckSessionService = class CheckSessionService {
    constructor(storagePersistanceService, loggerService, iFrameService, zone, eventService, configurationProvider) {
        this.storagePersistanceService = storagePersistanceService;
        this.loggerService = loggerService;
        this.iFrameService = iFrameService;
        this.zone = zone;
        this.eventService = eventService;
        this.configurationProvider = configurationProvider;
        this.checkSessionReceived = false;
        this.lastIFrameRefresh = 0;
        this.outstandingMessages = 0;
        this.heartBeatInterval = 3000;
        this.iframeRefreshInterval = 60000;
        this.checkSessionChangedInternal$ = new BehaviorSubject(false);
    }
    get checkSessionChanged$() {
        return this.checkSessionChangedInternal$.asObservable();
    }
    isCheckSessionConfigured() {
        return this.configurationProvider.openIDConfiguration.startCheckSession;
    }
    start() {
        if (!!this.scheduledHeartBeatRunning) {
            return;
        }
        this.init();
        const clientId = this.configurationProvider.openIDConfiguration.clientId;
        this.pollServerSession(clientId);
    }
    stop() {
        if (!this.scheduledHeartBeatRunning) {
            return;
        }
        this.clearScheduledHeartBeat();
        this.checkSessionReceived = false;
    }
    serverStateChanged() {
        return this.configurationProvider.openIDConfiguration.startCheckSession && this.checkSessionReceived;
    }
    init() {
        if (this.lastIFrameRefresh + this.iframeRefreshInterval > Date.now()) {
            return;
        }
        if (!this.configurationProvider.wellKnownEndpoints) {
            this.loggerService.logWarning('init check session: authWellKnownEndpoints is undefined. Returning.');
            return;
        }
        const existingIframe = this.getOrCreateIframe();
        if (this.configurationProvider.wellKnownEndpoints.checkSessionIframe) {
            existingIframe.contentWindow.location.replace(this.configurationProvider.wellKnownEndpoints.checkSessionIframe);
        }
        else {
            this.loggerService.logWarning('init check session: checkSessionIframe is not configured to run');
        }
        this.bindMessageEventToIframe();
        existingIframe.onload = () => {
            this.lastIFrameRefresh = Date.now();
        };
    }
    pollServerSession(clientId) {
        this.outstandingMessages = 0;
        const pollServerSessionRecur = () => {
            const existingIframe = this.getExistingIframe();
            if (existingIframe && clientId) {
                this.loggerService.logDebug(existingIframe);
                const sessionState = this.storagePersistanceService.sessionState;
                if (sessionState) {
                    this.outstandingMessages++;
                    existingIframe.contentWindow.postMessage(clientId + ' ' + sessionState, this.configurationProvider.openIDConfiguration.stsServer);
                }
                else {
                    this.loggerService.logDebug('OidcSecurityCheckSession pollServerSession session_state is blank');
                }
            }
            else {
                this.loggerService.logWarning('OidcSecurityCheckSession pollServerSession checkSession IFrame does not exist');
                this.loggerService.logDebug(clientId);
                this.loggerService.logDebug(existingIframe);
            }
            // after sending three messages with no response, fail.
            if (this.outstandingMessages > 3) {
                this.loggerService.logError(`OidcSecurityCheckSession not receiving check session response messages. Outstanding messages: ${this.outstandingMessages}. Server unreachable?`);
            }
        };
        this.zone.runOutsideAngular(() => {
            this.scheduledHeartBeatRunning = setInterval(pollServerSessionRecur, this.heartBeatInterval);
        });
    }
    clearScheduledHeartBeat() {
        clearTimeout(this.scheduledHeartBeatRunning);
        this.scheduledHeartBeatRunning = null;
    }
    messageHandler(e) {
        const existingIFrame = this.getExistingIframe();
        this.outstandingMessages = 0;
        if (existingIFrame &&
            this.configurationProvider.openIDConfiguration.stsServer.startsWith(e.origin) &&
            e.source === existingIFrame.contentWindow) {
            if (e.data === 'error') {
                this.loggerService.logWarning('error from checksession messageHandler');
            }
            else if (e.data === 'changed') {
                this.loggerService.logDebug(e);
                this.checkSessionReceived = true;
                this.eventService.fireEvent(EventTypes.CheckSessionReceived, e.data);
                this.checkSessionChangedInternal$.next(true);
            }
            else {
                this.eventService.fireEvent(EventTypes.CheckSessionReceived, e.data);
                this.loggerService.logDebug(e.data + ' from checksession messageHandler');
            }
        }
    }
    getExistingIframe() {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
    }
    bindMessageEventToIframe() {
        const iframeMessageEvent = this.messageHandler.bind(this);
        window.addEventListener('message', iframeMessageEvent, false);
    }
    getOrCreateIframe() {
        const existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            return this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
        }
        return existingIframe;
    }
};
CheckSessionService.ctorParameters = () => [
    { type: StoragePersistanceService },
    { type: LoggerService },
    { type: IFrameService },
    { type: NgZone },
    { type: PublicEventsService },
    { type: ConfigurationProvider }
];
CheckSessionService = __decorate([
    Injectable()
], CheckSessionService);

const IFRAME_FOR_SILENT_RENEW_IDENTIFIER = 'myiFrameForSilentRenew';
let SilentRenewService = class SilentRenewService {
    constructor(configurationProvider, iFrameService) {
        this.configurationProvider = configurationProvider;
        this.iFrameService = iFrameService;
    }
    getOrCreateIframe() {
        const existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            return this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
        }
        return existingIframe;
    }
    isSilentRenewConfigured() {
        return (!this.configurationProvider.openIDConfiguration.useRefreshToken && this.configurationProvider.openIDConfiguration.silentRenew);
    }
    getExistingIframe() {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
    }
};
SilentRenewService.ctorParameters = () => [
    { type: ConfigurationProvider },
    { type: IFrameService }
];
SilentRenewService = __decorate([
    Injectable()
], SilentRenewService);

let RedirectService = class RedirectService {
    constructor(window) {
        this.window = window;
    }
    redirectTo(url) {
        this.window.location.href = url;
    }
};
RedirectService.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [WINDOW,] }] }
];
RedirectService.ɵprov = ɵɵdefineInjectable({ factory: function RedirectService_Factory() { return new RedirectService(ɵɵinject(WINDOW)); }, token: RedirectService, providedIn: "root" });
RedirectService = __decorate([
    Injectable({ providedIn: 'root' }),
    __param(0, Inject(WINDOW))
], RedirectService);

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
CallbackService.ɵprov = ɵɵdefineInjectable({ factory: function CallbackService_Factory() { return new CallbackService(ɵɵinject(UrlService), ɵɵinject(FlowsService), ɵɵinject(FlowHelper), ɵɵinject(ConfigurationProvider), ɵɵinject(Router), ɵɵinject(FlowsDataService), ɵɵinject(LoggerService), ɵɵinject(SilentRenewService), ɵɵinject(UserService), ɵɵinject(AuthStateService)); }, token: CallbackService, providedIn: "root" });
CallbackService = __decorate([
    Injectable({ providedIn: 'root' })
], CallbackService);

let OidcSecurityService = class OidcSecurityService {
    constructor(checkSessionService, silentRenewService, userService, tokenValidationService, tokenHelperService, loggerService, configurationProvider, urlService, authStateService, flowsDataService, flowsService, callbackService, logoffRevocationService, redirectService) {
        this.checkSessionService = checkSessionService;
        this.silentRenewService = silentRenewService;
        this.userService = userService;
        this.tokenValidationService = tokenValidationService;
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.urlService = urlService;
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
        this.flowsService = flowsService;
        this.callbackService = callbackService;
        this.logoffRevocationService = logoffRevocationService;
        this.redirectService = redirectService;
        this.TOKEN_REFRESH_INTERVALL_IN_SECONDS = 3;
    }
    get configuration() {
        return this.configurationProvider.configuration;
    }
    get userData$() {
        return this.userService.userData$;
    }
    get isAuthenticated$() {
        return this.authStateService.authorized$;
    }
    get checkSessionChanged$() {
        return this.checkSessionService.checkSessionChanged$;
    }
    get stsCallback$() {
        return this.callbackService.stsCallback$;
    }
    checkAuth() {
        if (!this.configurationProvider.hasValidConfig()) {
            this.loggerService.logError('Please provide a configuration before setting up the module');
            return of(false);
        }
        this.loggerService.logDebug('STS server: ' + this.configurationProvider.openIDConfiguration.stsServer);
        const currentUrl = window.location.toString();
        return this.callbackService.handlePossibleStsCallback(currentUrl).pipe(map(() => {
            const isAuthenticated = this.authStateService.areAuthStorageTokensValid();
            if (isAuthenticated) {
                this.authStateService.setAuthorizedAndFireEvent();
                this.userService.publishUserdataIfExists();
                if (this.checkSessionService.isCheckSessionConfigured()) {
                    this.checkSessionService.start();
                }
                this.callbackService.startTokenValidationPeriodically(this.TOKEN_REFRESH_INTERVALL_IN_SECONDS);
                if (this.silentRenewService.isSilentRenewConfigured()) {
                    this.silentRenewService.getOrCreateIframe();
                }
            }
            this.loggerService.logDebug('checkAuth completed fire events, auth: ' + isAuthenticated);
            return isAuthenticated;
        }));
    }
    getToken() {
        return this.authStateService.getAccessToken();
    }
    getIdToken() {
        return this.authStateService.getIdToken();
    }
    getRefreshToken() {
        return this.authStateService.getRefreshToken();
    }
    getPayloadFromIdToken(encode = false) {
        const token = this.getIdToken();
        return this.tokenHelperService.getPayloadFromToken(token, encode);
    }
    setState(state) {
        this.flowsDataService.setAuthStateControl(state);
    }
    getState() {
        return this.flowsDataService.getAuthStateControl();
    }
    // Code Flow with PCKE or Implicit Flow
    authorize(authOptions) {
        if (!this.configurationProvider.hasValidConfig()) {
            this.loggerService.logError('Well known endpoints must be loaded before user can login!');
            return;
        }
        if (!this.tokenValidationService.configValidateResponseType(this.configurationProvider.openIDConfiguration.responseType)) {
            this.loggerService.logError('Invalid response type!');
            return;
        }
        this.flowsService.resetAuthorizationData();
        this.loggerService.logDebug('BEGIN Authorize OIDC Flow, no auth data');
        const { urlHandler, customParams } = authOptions || {};
        const url = this.urlService.getAuthorizeUrl(customParams);
        if (urlHandler) {
            urlHandler(url);
        }
        else {
            this.redirectService.redirectTo(url);
        }
    }
    // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
    // only the access token is revoked. Then the logout run.
    logoffAndRevokeTokens(urlHandler) {
        return this.logoffRevocationService.logoffAndRevokeTokens(urlHandler);
    }
    // Logs out on the server and the local client.
    // If the server state has changed, checksession, then only a local logout.
    logoff(urlHandler) {
        return this.logoffRevocationService.logoff(urlHandler);
    }
    logoffLocal() {
        return this.logoffRevocationService.logoffLocal();
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes an access token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    revokeAccessToken(accessToken) {
        return this.logoffRevocationService.revokeAccessToken(accessToken);
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes a refresh token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    revokeRefreshToken(refreshToken) {
        return this.logoffRevocationService.revokeRefreshToken(refreshToken);
    }
    getEndSessionUrl() {
        return this.logoffRevocationService.getEndSessionUrl();
    }
};
OidcSecurityService.ctorParameters = () => [
    { type: CheckSessionService },
    { type: SilentRenewService },
    { type: UserService },
    { type: TokenValidationService },
    { type: TokenHelperService },
    { type: LoggerService },
    { type: ConfigurationProvider },
    { type: UrlService },
    { type: AuthStateService },
    { type: FlowsDataService },
    { type: FlowsService },
    { type: CallbackService },
    { type: LogoffRevocationService },
    { type: RedirectService }
];
OidcSecurityService = __decorate([
    Injectable()
], OidcSecurityService);

let BrowserStorageService = class BrowserStorageService {
    constructor(configProvider, loggerService) {
        this.configProvider = configProvider;
        this.loggerService = loggerService;
    }
    read(key) {
        var _a;
        if (!this.hasStorage()) {
            this.loggerService.logDebug(`Wanted to read '${key}' but Storage was undefined`);
            return false;
        }
        const item = (_a = this.getStorage()) === null || _a === void 0 ? void 0 : _a.getItem(key);
        if (!item) {
            this.loggerService.logDebug(`Wanted to read '${key}' but nothing was found`);
            return false;
        }
        return JSON.parse(item);
    }
    write(key, value) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug(`Wanted to write '${key}/${value}' but Storage was falsy`);
            return false;
        }
        const storage = this.getStorage();
        if (!storage) {
            this.loggerService.logDebug(`Wanted to write '${key}/${value}' but Storage was falsy`);
            return false;
        }
        value = value || null;
        storage.setItem(`${key}`, JSON.stringify(value));
        return true;
    }
    getStorage() {
        var _a;
        return (_a = this.configProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.storage;
    }
    hasStorage() {
        return typeof Storage !== 'undefined';
    }
};
BrowserStorageService.ctorParameters = () => [
    { type: ConfigurationProvider },
    { type: LoggerService }
];
BrowserStorageService = __decorate([
    Injectable()
], BrowserStorageService);

let EqualityService = class EqualityService {
    areEqual(value1, value2) {
        if (!value1 || !value2) {
            return false;
        }
        if (this.bothValuesAreArrays(value1, value2)) {
            return this.arraysEqual(value1, value2);
        }
        if (this.bothValuesAreStrings(value1, value2)) {
            return value1 === value2;
        }
        if (this.bothValuesAreObjects(value1, value2)) {
            return JSON.stringify(value1).toLowerCase() === JSON.stringify(value2).toLowerCase();
        }
        if (this.oneValueIsStringAndTheOtherIsArray(value1, value2)) {
            if (Array.isArray(value1) && this.valueIsString(value2)) {
                return value1[0] === value2;
            }
            if (Array.isArray(value2) && this.valueIsString(value1)) {
                return value2[0] === value1;
            }
        }
    }
    oneValueIsStringAndTheOtherIsArray(value1, value2) {
        return (Array.isArray(value1) && this.valueIsString(value2)) || (Array.isArray(value2) && this.valueIsString(value1));
    }
    bothValuesAreObjects(value1, value2) {
        return this.valueIsObject(value1) && this.valueIsObject(value2);
    }
    bothValuesAreStrings(value1, value2) {
        return this.valueIsString(value1) && this.valueIsString(value2);
    }
    bothValuesAreArrays(value1, value2) {
        return Array.isArray(value1) && Array.isArray(value2);
    }
    valueIsString(value) {
        return typeof value === 'string' || value instanceof String;
    }
    valueIsObject(value) {
        return typeof value === 'object';
    }
    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }
};
EqualityService = __decorate([
    Injectable()
], EqualityService);

var AuthModule_1;
let AuthModule = AuthModule_1 = class AuthModule {
    static forRoot(token = {}) {
        return {
            ngModule: AuthModule_1,
            providers: [
                OidcConfigService,
                PublicEventsService,
                FlowHelper,
                OidcSecurityService,
                TokenValidationService,
                PlatformProvider,
                CheckSessionService,
                FlowsDataService,
                FlowsService,
                SilentRenewService,
                ConfigurationProvider,
                LogoffRevocationService,
                UserService,
                RandomService,
                HttpBaseService,
                UrlService,
                AuthStateService,
                SigninKeyDataService,
                StoragePersistanceService,
                TokenHelperService,
                LoggerService,
                IFrameService,
                EqualityService,
                DataService,
                StateValidationService,
                {
                    provide: AbstractSecurityStorage,
                    useClass: token.storage || BrowserStorageService,
                },
                { provide: WINDOW, useFactory: _window, deps: [] },
            ],
        };
    }
};
AuthModule = AuthModule_1 = __decorate([
    NgModule({
        imports: [CommonModule],
        declarations: [],
        exports: [],
    })
], AuthModule);

class JwtKeys {
    constructor() {
        this.keys = [];
    }
}
class JwtKey {
    constructor() {
        this.kty = '';
        this.use = '';
        this.kid = '';
        this.x5t = '';
        this.e = '';
        this.n = '';
        this.x5c = [];
    }
}

// Public classes.

/*
 * Public API Surface of angular-auth-oidc-client
 */

/**
 * Generated bundle index. Do not edit.
 */

export { AbstractSecurityStorage, AuthModule, AuthorizedState, EventTypes, JwtKey, JwtKeys, LogLevel, LoggerService, OidcConfigService, OidcSecurityService, PublicEventsService, StateValidationResult, TokenHelperService, TokenValidationService, ValidationResult, ConfigurationProvider as ɵa, PlatformProvider as ɵb, DataService as ɵc, HttpBaseService as ɵd, FlowHelper as ɵe, CheckSessionService as ɵf, StoragePersistanceService as ɵg, IFrameService as ɵh, SilentRenewService as ɵi, UserService as ɵj, UrlService as ɵk, _window as ɵl, WINDOW as ɵm, FlowsDataService as ɵn, RandomService as ɵo, AuthStateService as ɵp, FlowsService as ɵq, SigninKeyDataService as ɵr, StateValidationService as ɵs, CallbackService as ɵt, LogoffRevocationService as ɵu, RedirectService as ɵv, EqualityService as ɵw, BrowserStorageService as ɵx };
//# sourceMappingURL=angular-auth-oidc-client.js.map
