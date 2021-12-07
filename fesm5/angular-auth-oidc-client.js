import { __decorate, __param, __assign, __values, __makeTemplateObject, __read } from 'tslib';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Injectable, Inject, PLATFORM_ID, InjectionToken, NgZone, ɵɵdefineInjectable, ɵɵinject, NgModule } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ReplaySubject, BehaviorSubject, of, throwError, Subject, interval, Observable } from 'rxjs';
import { KEYUTIL, KJUR, hextob64u } from 'jsrsasign-reduced';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { oneLineTrim } from 'common-tags';
import { Router } from '@angular/router';

var HttpBaseService = /** @class */ (function () {
    function HttpBaseService(http) {
        this.http = http;
    }
    HttpBaseService.prototype.get = function (url, params) {
        return this.http.get(url, params);
    };
    HttpBaseService.prototype.post = function (url, body, params) {
        return this.http.post(url, body, params);
    };
    HttpBaseService.ctorParameters = function () { return [
        { type: HttpClient }
    ]; };
    HttpBaseService = __decorate([
        Injectable()
    ], HttpBaseService);
    return HttpBaseService;
}());

var DataService = /** @class */ (function () {
    function DataService(httpClient) {
        this.httpClient = httpClient;
    }
    DataService.prototype.get = function (url, token) {
        var headers = this.prepareHeaders(token);
        return this.httpClient.get(url, {
            headers: headers,
        });
    };
    DataService.prototype.post = function (url, body, headersParams) {
        var headers = headersParams || this.prepareHeaders();
        return this.httpClient.post(url, body, { headers: headers });
    };
    DataService.prototype.prepareHeaders = function (token) {
        var headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/json');
        if (!!token) {
            headers = headers.set('Authorization', 'Bearer ' + decodeURIComponent(token));
        }
        return headers;
    };
    DataService.ctorParameters = function () { return [
        { type: HttpBaseService }
    ]; };
    DataService = __decorate([
        Injectable()
    ], DataService);
    return DataService;
}());

var PlatformProvider = /** @class */ (function () {
    function PlatformProvider(platformId) {
        this.platformId = platformId;
    }
    Object.defineProperty(PlatformProvider.prototype, "isBrowser", {
        get: function () {
            return isPlatformBrowser(this.platformId);
        },
        enumerable: true,
        configurable: true
    });
    PlatformProvider.ctorParameters = function () { return [
        { type: String, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] }
    ]; };
    PlatformProvider = __decorate([
        Injectable(),
        __param(0, Inject(PLATFORM_ID))
    ], PlatformProvider);
    return PlatformProvider;
}());

var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Warn"] = 1] = "Warn";
    LogLevel[LogLevel["Error"] = 2] = "Error";
})(LogLevel || (LogLevel = {}));

var DEFAULT_CONFIG = {
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

var ConfigurationProvider = /** @class */ (function () {
    function ConfigurationProvider(platformProvider) {
        this.platformProvider = platformProvider;
    }
    Object.defineProperty(ConfigurationProvider.prototype, "openIDConfiguration", {
        get: function () {
            if (!this.openIdConfigurationInternal) {
                return null;
            }
            return this.openIdConfigurationInternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfigurationProvider.prototype, "wellKnownEndpoints", {
        get: function () {
            if (!this.wellKnownEndpointsInternal) {
                return null;
            }
            return this.wellKnownEndpointsInternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfigurationProvider.prototype, "configuration", {
        get: function () {
            if (!this.hasValidConfig()) {
                return null;
            }
            return {
                configuration: __assign({}, this.openIDConfiguration),
                wellknown: __assign({}, this.wellKnownEndpoints),
            };
        },
        enumerable: true,
        configurable: true
    });
    ConfigurationProvider.prototype.hasValidConfig = function () {
        return !!this.wellKnownEndpointsInternal && !!this.openIdConfigurationInternal;
    };
    ConfigurationProvider.prototype.setConfig = function (configuration, wellKnownEndpoints) {
        this.wellKnownEndpointsInternal = wellKnownEndpoints;
        this.openIdConfigurationInternal = __assign(__assign({}, DEFAULT_CONFIG), configuration);
        if (configuration === null || configuration === void 0 ? void 0 : configuration.storage) {
            console.warn('PLEASE NOTE: The storage in the config will be deprecated in future versions: Please pass the custom storage in forRoot() as documented');
        }
        this.setSpecialCases(this.openIdConfigurationInternal);
    };
    ConfigurationProvider.prototype.setSpecialCases = function (currentConfig) {
        if (!this.platformProvider.isBrowser) {
            currentConfig.startCheckSession = false;
            currentConfig.silentRenew = false;
            currentConfig.useRefreshToken = false;
        }
    };
    ConfigurationProvider.ctorParameters = function () { return [
        { type: PlatformProvider }
    ]; };
    ConfigurationProvider = __decorate([
        Injectable()
    ], ConfigurationProvider);
    return ConfigurationProvider;
}());

var LoggerService = /** @class */ (function () {
    function LoggerService(configurationProvider) {
        this.configurationProvider = configurationProvider;
    }
    LoggerService.prototype.logError = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        args.length ? console.error(message, args) : console.error(message);
    };
    LoggerService.prototype.logWarning = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.currentLogLevelIsEqualOrSmallerThan(LogLevel.Warn)) {
            args.length ? console.warn(message, args) : console.warn(message);
        }
    };
    LoggerService.prototype.logDebug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.currentLogLevelIsEqualOrSmallerThan(LogLevel.Debug)) {
            args.length ? console.log(message, args) : console.log(message);
        }
    };
    LoggerService.prototype.currentLogLevelIsEqualOrSmallerThan = function (logLevel) {
        return this.configurationProvider.openIDConfiguration.logLevel <= logLevel;
    };
    LoggerService.ctorParameters = function () { return [
        { type: ConfigurationProvider }
    ]; };
    LoggerService = __decorate([
        Injectable()
    ], LoggerService);
    return LoggerService;
}());

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

var PublicEventsService = /** @class */ (function () {
    function PublicEventsService() {
        this.notify = new ReplaySubject(1);
    }
    PublicEventsService.prototype.fireEvent = function (type, value) {
        this.notify.next({ type: type, value: value });
    };
    PublicEventsService.prototype.registerForEvents = function () {
        return this.notify.asObservable();
    };
    PublicEventsService = __decorate([
        Injectable()
    ], PublicEventsService);
    return PublicEventsService;
}());

var AuthorizedState;
(function (AuthorizedState) {
    AuthorizedState["Authorized"] = "Authorized";
    AuthorizedState["Unauthorized"] = "Unauthorized";
    AuthorizedState["Unknown"] = "Unknown";
})(AuthorizedState || (AuthorizedState = {}));

/**
 * Implement this class-interface to create a custom storage.
 */
var AbstractSecurityStorage = /** @class */ (function () {
    function AbstractSecurityStorage() {
    }
    AbstractSecurityStorage = __decorate([
        Injectable()
    ], AbstractSecurityStorage);
    return AbstractSecurityStorage;
}());

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

// TODO  TESTING
var FlowHelper = /** @class */ (function () {
    function FlowHelper(configurationProvider) {
        this.configurationProvider = configurationProvider;
    }
    FlowHelper.prototype.isCurrentFlowCodeFlow = function () {
        return this.currentFlowIs('code');
    };
    FlowHelper.prototype.isCurrentFlowAnyImplicitFlow = function () {
        return this.isCurrentFlowImplicitFlowWithAccessToken() || this.isCurrentFlowImplicitFlowWithoutAccessToken();
    };
    FlowHelper.prototype.isCurrentFlowCodeFlowWithRefeshTokens = function () {
        if (this.isCurrentFlowCodeFlow() && this.configurationProvider.openIDConfiguration.useRefreshToken) {
            return true;
        }
        return false;
    };
    FlowHelper.prototype.isCurrentFlowImplicitFlowWithAccessToken = function () {
        return this.currentFlowIs('id_token token');
    };
    FlowHelper.prototype.isCurrentFlowImplicitFlowWithoutAccessToken = function () {
        return this.currentFlowIs('id_token');
    };
    FlowHelper.prototype.currentFlowIs = function (flowTypes) {
        var currentFlow = this.configurationProvider.openIDConfiguration.responseType;
        if (Array.isArray(flowTypes)) {
            return flowTypes.some(function (x) { return currentFlow === x; });
        }
        return currentFlow === flowTypes;
    };
    FlowHelper.ctorParameters = function () { return [
        { type: ConfigurationProvider }
    ]; };
    FlowHelper = __decorate([
        Injectable()
    ], FlowHelper);
    return FlowHelper;
}());

var TokenHelperService = /** @class */ (function () {
    function TokenHelperService(loggerService) {
        this.loggerService = loggerService;
        this.PARTS_OF_TOKEN = 3;
    }
    TokenHelperService.prototype.getTokenExpirationDate = function (dataIdToken) {
        if (!dataIdToken.hasOwnProperty('exp')) {
            return new Date();
        }
        var date = new Date(0); // The 0 here is the key, which sets the date to the epoch
        date.setUTCSeconds(dataIdToken.exp);
        return date;
    };
    TokenHelperService.prototype.getHeaderFromToken = function (token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 0, encoded);
    };
    TokenHelperService.prototype.getPayloadFromToken = function (token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 1, encoded);
    };
    TokenHelperService.prototype.getSignatureFromToken = function (token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 2, encoded);
    };
    TokenHelperService.prototype.getPartOfToken = function (token, index, encoded) {
        var partOfToken = this.extractPartOfToken(token, index);
        if (encoded) {
            return partOfToken;
        }
        var result = this.urlBase64Decode(partOfToken);
        return JSON.parse(result);
    };
    TokenHelperService.prototype.urlBase64Decode = function (str) {
        var output = str.replace(/-/g, '+').replace(/_/g, '/');
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
        var decoded = typeof window !== 'undefined' ? window.atob(output) : Buffer.from(output, 'base64').toString('binary');
        try {
            // Going backwards: from bytestream, to percent-encoding, to original string.
            return decodeURIComponent(decoded
                .split('')
                .map(function (c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); })
                .join(''));
        }
        catch (err) {
            return decoded;
        }
    };
    TokenHelperService.prototype.tokenIsValid = function (token) {
        if (!token) {
            this.loggerService.logError("token '" + token + "' is not valid --> token falsy");
            return false;
        }
        if (!token.includes('.')) {
            this.loggerService.logError("token '" + token + "' is not valid --> no dots included");
            return false;
        }
        var parts = token.split('.');
        if (parts.length !== this.PARTS_OF_TOKEN) {
            this.loggerService.logError("token '" + token + "' is not valid --> token has to have exactly " + this.PARTS_OF_TOKEN + " dots");
            return false;
        }
        return true;
    };
    TokenHelperService.prototype.extractPartOfToken = function (token, index) {
        return token.split('.')[index];
    };
    TokenHelperService.ctorParameters = function () { return [
        { type: LoggerService }
    ]; };
    TokenHelperService = __decorate([
        Injectable()
    ], TokenHelperService);
    return TokenHelperService;
}());

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
var TokenValidationService = /** @class */ (function () {
    function TokenValidationService(tokenHelperService, flowHelper, loggerService) {
        this.tokenHelperService = tokenHelperService;
        this.flowHelper = flowHelper;
        this.loggerService = loggerService;
        this.keyAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'PS256', 'PS384', 'PS512'];
    }
    TokenValidationService_1 = TokenValidationService;
    // id_token C7: The current time MUST be before the time represented by the exp Claim
    // (possibly allowing for some small leeway to account for clock skew).
    TokenValidationService.prototype.hasIdTokenExpired = function (token, offsetSeconds) {
        var decoded;
        decoded = this.tokenHelperService.getPayloadFromToken(token, false);
        return !this.validateIdTokenExpNotExpired(decoded, offsetSeconds);
    };
    // id_token C7: The current time MUST be before the time represented by the exp Claim
    // (possibly allowing for some small leeway to account for clock skew).
    TokenValidationService.prototype.validateIdTokenExpNotExpired = function (decodedIdToken, offsetSeconds) {
        var tokenExpirationDate = this.tokenHelperService.getTokenExpirationDate(decodedIdToken);
        offsetSeconds = offsetSeconds || 0;
        if (!tokenExpirationDate) {
            return false;
        }
        var tokenExpirationValue = tokenExpirationDate.valueOf();
        var nowWithOffset = new Date().valueOf() + offsetSeconds * 1000;
        var tokenNotExpired = tokenExpirationValue > nowWithOffset;
        this.loggerService.logDebug("Has id_token expired: " + !tokenNotExpired + ", " + tokenExpirationValue + " > " + nowWithOffset);
        // Token not expired?
        return tokenNotExpired;
    };
    TokenValidationService.prototype.validateAccessTokenNotExpired = function (accessTokenExpiresAt, offsetSeconds) {
        // value is optional, so if it does not exist, then it has not expired
        if (!accessTokenExpiresAt) {
            return true;
        }
        offsetSeconds = offsetSeconds || 0;
        var accessTokenExpirationValue = accessTokenExpiresAt.valueOf();
        var nowWithOffset = new Date().valueOf() + offsetSeconds * 1000;
        var tokenNotExpired = accessTokenExpirationValue > nowWithOffset;
        this.loggerService.logDebug("Has access_token expired: " + !tokenNotExpired + ", " + accessTokenExpirationValue + " > " + nowWithOffset);
        // access token not expired?
        return tokenNotExpired;
    };
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
    TokenValidationService.prototype.validateRequiredIdToken = function (dataIdToken) {
        var validated = true;
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
    };
    // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
    // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
    TokenValidationService.prototype.validateIdTokenIatMaxOffset = function (dataIdToken, maxOffsetAllowedInSeconds, disableIatOffsetValidation) {
        if (disableIatOffsetValidation) {
            return true;
        }
        if (!dataIdToken.hasOwnProperty('iat')) {
            return false;
        }
        var dateTimeIatIdToken = new Date(0); // The 0 here is the key, which sets the date to the epoch
        dateTimeIatIdToken.setUTCSeconds(dataIdToken.iat);
        maxOffsetAllowedInSeconds = maxOffsetAllowedInSeconds || 0;
        if (dateTimeIatIdToken == null) {
            return false;
        }
        this.loggerService.logDebug('validate_id_token_iat_max_offset: ' +
            (new Date().valueOf() - dateTimeIatIdToken.valueOf()) +
            ' < ' +
            maxOffsetAllowedInSeconds * 1000);
        var diff = new Date().valueOf() - dateTimeIatIdToken.valueOf();
        if (diff > 0) {
            return diff < maxOffsetAllowedInSeconds * 1000;
        }
        return -diff < maxOffsetAllowedInSeconds * 1000;
    };
    // id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one
    // that was sent in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.
    // The precise method for detecting replay attacks is Client specific.
    // However the nonce claim SHOULD not be present for the refesh_token grant type
    // https://bitbucket.org/openid/connect/issues/1025/ambiguity-with-how-nonce-is-handled-on
    // The current spec is ambiguous and Keycloak does send it.
    TokenValidationService.prototype.validateIdTokenNonce = function (dataIdToken, localNonce, ignoreNonceAfterRefresh) {
        var isFromRefreshToken = (dataIdToken.nonce === undefined || ignoreNonceAfterRefresh) &&
            localNonce === TokenValidationService_1.RefreshTokenNoncePlaceholder;
        if (!isFromRefreshToken && dataIdToken.nonce !== localNonce) {
            this.loggerService.logDebug('Validate_id_token_nonce failed, dataIdToken.nonce: ' + dataIdToken.nonce + ' local_nonce:' + localNonce);
            return false;
        }
        return true;
    };
    // id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
    // MUST exactly match the value of the iss (issuer) Claim.
    TokenValidationService.prototype.validateIdTokenIss = function (dataIdToken, authWellKnownEndpointsIssuer) {
        if (dataIdToken.iss !== authWellKnownEndpointsIssuer) {
            this.loggerService.logDebug('Validate_id_token_iss failed, dataIdToken.iss: ' +
                dataIdToken.iss +
                ' authWellKnownEndpoints issuer:' +
                authWellKnownEndpointsIssuer);
            return false;
        }
        return true;
    };
    // id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
    // by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience, or if it contains additional audiences
    // not trusted by the Client.
    TokenValidationService.prototype.validateIdTokenAud = function (dataIdToken, aud) {
        if (Array.isArray(dataIdToken.aud)) {
            // const result = this.arrayHelperService.areEqual(dataIdToken.aud, aud);
            var result = dataIdToken.aud.includes(aud);
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
    };
    TokenValidationService.prototype.validateIdTokenAzpExistsIfMoreThanOneAud = function (dataIdToken) {
        if (Array.isArray(dataIdToken.aud) && dataIdToken.aud.length > 1 && !(dataIdToken === null || dataIdToken === void 0 ? void 0 : dataIdToken.azp)) {
            return false;
        }
        return true;
    };
    // If an azp (authorized party) Claim is present, the Client SHOULD verify that its client_id is the Claim Value.
    TokenValidationService.prototype.validateIdTokenAzpValid = function (dataIdToken, clientId) {
        if (!(dataIdToken === null || dataIdToken === void 0 ? void 0 : dataIdToken.azp)) {
            return true;
        }
        if (dataIdToken.azp === clientId) {
            return true;
        }
        return false;
    };
    TokenValidationService.prototype.validateStateFromHashCallback = function (state, localState) {
        if (state !== localState) {
            this.loggerService.logDebug('ValidateStateFromHashCallback failed, state: ' + state + ' local_state:' + localState);
            return false;
        }
        return true;
    };
    // id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the alg
    // Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
    // id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the
    // OpenID Connect Core 1.0 [OpenID.Core] specification.
    TokenValidationService.prototype.validateSignatureIdToken = function (idToken, jwtkeys) {
        var e_1, _a, e_2, _b, e_3, _c;
        if (!jwtkeys || !jwtkeys.keys) {
            return false;
        }
        var headerData = this.tokenHelperService.getHeaderFromToken(idToken, false);
        if (Object.keys(headerData).length === 0 && headerData.constructor === Object) {
            this.loggerService.logWarning('id token has no header data');
            return false;
        }
        var kid = headerData.kid;
        var alg = headerData.alg;
        if (!this.keyAlgorithms.includes(alg)) {
            this.loggerService.logWarning('alg not supported', alg);
            return false;
        }
        var jwtKtyToUse = 'RSA';
        if (alg.charAt(0) === 'E') {
            jwtKtyToUse = 'EC';
        }
        var isValid = false;
        if (!headerData.hasOwnProperty('kid')) {
            // exactly 1 key in the jwtkeys and no kid in the Jose header
            // kty	"RSA" or EC use "sig"
            var amountOfMatchingKeys = 0;
            try {
                for (var _d = __values(jwtkeys.keys), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var key = _e.value;
                    if (key.kty === jwtKtyToUse && key.use === 'sig') {
                        amountOfMatchingKeys = amountOfMatchingKeys + 1;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (amountOfMatchingKeys === 0) {
                this.loggerService.logWarning('no keys found, incorrect Signature, validation failed for id_token');
                return false;
            }
            if (amountOfMatchingKeys > 1) {
                this.loggerService.logWarning('no ID Token kid claim in JOSE header and multiple supplied in jwks_uri');
                return false;
            }
            try {
                for (var _f = __values(jwtkeys.keys), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var key = _g.value;
                    if (key.kty === jwtKtyToUse && key.use === 'sig') {
                        var publickey = KEYUTIL.getKey(key);
                        isValid = KJUR.jws.JWS.verify(idToken, publickey, [alg]);
                        if (!isValid) {
                            this.loggerService.logWarning('incorrect Signature, validation failed for id_token');
                        }
                        return isValid;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
        else {
            try {
                // kid in the Jose header of id_token
                for (var _h = __values(jwtkeys.keys), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var key = _j.value;
                    if (key.kid === kid) {
                        var publickey = KEYUTIL.getKey(key);
                        isValid = KJUR.jws.JWS.verify(idToken, publickey, [alg]);
                        if (!isValid) {
                            this.loggerService.logWarning('incorrect Signature, validation failed for id_token');
                        }
                        return isValid;
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        return isValid;
    };
    TokenValidationService.prototype.configValidateResponseType = function (responseType) {
        if (this.flowHelper.isCurrentFlowAnyImplicitFlow()) {
            return true;
        }
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            return true;
        }
        this.loggerService.logWarning('module configure incorrect, invalid response_type:' + responseType);
        return false;
    };
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
    TokenValidationService.prototype.validateIdTokenAtHash = function (accessToken, atHash, isCodeFlow, idTokenAlg) {
        this.loggerService.logDebug('at_hash from the server:' + atHash);
        // 'sha256' 'sha384' 'sha512'
        var sha = 'sha256';
        if (idTokenAlg.includes('384')) {
            sha = 'sha384';
        }
        else if (idTokenAlg.includes('512')) {
            sha = 'sha512';
        }
        var testdata = this.generateAtHash('' + accessToken, sha);
        this.loggerService.logDebug('at_hash client validation not decoded:' + testdata);
        if (testdata === atHash) {
            return true; // isValid;
        }
        else {
            var testValue = this.generateAtHash('' + decodeURIComponent(accessToken), sha);
            this.loggerService.logDebug('-gen access--' + testValue);
            if (testValue === atHash) {
                return true; // isValid
            }
        }
        return false;
    };
    TokenValidationService.prototype.generateAtHash = function (accessToken, sha) {
        var hash = KJUR.crypto.Util.hashString(accessToken, sha);
        var first128bits = hash.substr(0, hash.length / 2);
        var testdata = hextob64u(first128bits);
        return testdata;
    };
    TokenValidationService.prototype.generateCodeVerifier = function (codeChallenge) {
        var hash = KJUR.crypto.Util.hashString(codeChallenge, 'sha256');
        var testdata = hextob64u(hash);
        return testdata;
    };
    var TokenValidationService_1;
    TokenValidationService.RefreshTokenNoncePlaceholder = '--RefreshToken--';
    TokenValidationService.ctorParameters = function () { return [
        { type: TokenHelperService },
        { type: FlowHelper },
        { type: LoggerService }
    ]; };
    TokenValidationService = TokenValidationService_1 = __decorate([
        Injectable()
    ], TokenValidationService);
    return TokenValidationService;
}());

var AuthStateService = /** @class */ (function () {
    function AuthStateService(storagePersistanceService, loggerService, publicEventsService, configurationProvider, tokenValidationService) {
        this.storagePersistanceService = storagePersistanceService;
        this.loggerService = loggerService;
        this.publicEventsService = publicEventsService;
        this.configurationProvider = configurationProvider;
        this.tokenValidationService = tokenValidationService;
        // event which contains the state
        this.authorizedInternal$ = new BehaviorSubject(false);
        this.authState = AuthorizedState.Unknown;
    }
    Object.defineProperty(AuthStateService.prototype, "authorized$", {
        get: function () {
            return this.authorizedInternal$.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    AuthStateService.prototype.setAuthorizedAndFireEvent = function () {
        // set the correct values in storage
        this.authState = AuthorizedState.Authorized;
        this.persistAuthStateInStorage(this.authState);
        this.authorizedInternal$.next(true);
    };
    AuthStateService.prototype.setUnauthorizedAndFireEvent = function () {
        // set the correct values in storage
        this.authState = AuthorizedState.Unauthorized;
        this.storagePersistanceService.resetAuthStateInStorage();
        this.authorizedInternal$.next(false);
    };
    AuthStateService.prototype.initStateFromStorage = function () {
        var currentAuthorizedState = this.getCurrentlyPersistedAuthState();
        if (currentAuthorizedState === AuthorizedState.Authorized) {
            this.authState = AuthorizedState.Authorized;
        }
        else {
            this.authState = AuthorizedState.Unknown;
        }
    };
    AuthStateService.prototype.updateAndPublishAuthState = function (authorizationResult) {
        this.publicEventsService.fireEvent(EventTypes.NewAuthorizationResult, authorizationResult);
    };
    AuthStateService.prototype.setAuthorizationData = function (accessToken, idToken) {
        this.loggerService.logDebug(accessToken);
        this.loggerService.logDebug(idToken);
        this.loggerService.logDebug('storing to storage, getting the roles');
        this.storagePersistanceService.accessToken = accessToken;
        this.storagePersistanceService.idToken = idToken;
        this.setAuthorizedAndFireEvent();
    };
    AuthStateService.prototype.getAccessToken = function () {
        if (!(this.authState === AuthorizedState.Authorized)) {
            return '';
        }
        var token = this.storagePersistanceService.getAccessToken();
        return decodeURIComponent(token);
    };
    AuthStateService.prototype.getIdToken = function () {
        if (!(this.authState === AuthorizedState.Authorized)) {
            return '';
        }
        var token = this.storagePersistanceService.getIdToken();
        return decodeURIComponent(token);
    };
    AuthStateService.prototype.getRefreshToken = function () {
        if (!(this.authState === AuthorizedState.Authorized)) {
            return '';
        }
        var token = this.storagePersistanceService.getRefreshToken();
        return decodeURIComponent(token);
    };
    AuthStateService.prototype.areAuthStorageTokensValid = function () {
        var currentAuthState = this.getCurrentlyPersistedAuthState();
        if (currentAuthState !== AuthorizedState.Authorized) {
            return false;
        }
        this.loggerService.logDebug("authorizedState in storage is " + currentAuthState);
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
    };
    AuthStateService.prototype.setAuthResultInStorage = function (authResult) {
        this.storagePersistanceService.authResult = authResult;
    };
    AuthStateService.prototype.hasIdTokenExpired = function () {
        var tokenToCheck = this.storagePersistanceService.idToken;
        var idTokenExpired = this.tokenValidationService.hasIdTokenExpired(tokenToCheck, this.configurationProvider.openIDConfiguration.renewTimeBeforeTokenExpiresInSeconds);
        if (idTokenExpired) {
            this.publicEventsService.fireEvent(EventTypes.IdTokenExpired, idTokenExpired);
        }
        return idTokenExpired;
    };
    AuthStateService.prototype.hasAccessTokenExpiredIfExpiryExists = function () {
        var accessTokenExpiresIn = this.storagePersistanceService.accessTokenExpiresIn;
        var accessTokenHasNotExpired = this.tokenValidationService.validateAccessTokenNotExpired(accessTokenExpiresIn, this.configurationProvider.openIDConfiguration.renewTimeBeforeTokenExpiresInSeconds);
        var hasExpired = !accessTokenHasNotExpired;
        if (hasExpired) {
            this.publicEventsService.fireEvent(EventTypes.TokenExpired, hasExpired);
        }
        return hasExpired;
    };
    AuthStateService.prototype.getCurrentlyPersistedAuthState = function () {
        return this.storagePersistanceService.authorizedState;
    };
    AuthStateService.prototype.persistAuthStateInStorage = function (authState) {
        this.storagePersistanceService.authorizedState = authState;
    };
    AuthStateService.ctorParameters = function () { return [
        { type: StoragePersistanceService },
        { type: LoggerService },
        { type: PublicEventsService },
        { type: ConfigurationProvider },
        { type: TokenValidationService }
    ]; };
    AuthStateService = __decorate([
        Injectable()
    ], AuthStateService);
    return AuthStateService;
}());

var OidcConfigService = /** @class */ (function () {
    function OidcConfigService(loggerService, http, configurationProvider, publicEventsService) {
        this.loggerService = loggerService;
        this.http = http;
        this.configurationProvider = configurationProvider;
        this.publicEventsService = publicEventsService;
        this.WELL_KNOWN_SUFFIX = "/.well-known/openid-configuration";
    }
    OidcConfigService.prototype.withConfig = function (passedConfig) {
        var _this = this;
        if (!passedConfig.stsServer) {
            this.loggerService.logError('please provide at least an stsServer');
            return;
        }
        if (!passedConfig.authWellknownEndpoint) {
            passedConfig.authWellknownEndpoint = passedConfig.stsServer;
        }
        var loadConfig$ = this.getWellKnownDocument(passedConfig.authWellknownEndpoint).pipe(map(function (wellKnownEndpoints) {
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
        }), tap(function (mappedWellKnownEndpoints) { return _this.configurationProvider.setConfig(passedConfig, mappedWellKnownEndpoints); }), tap(function (mappedWellKnownEndpoints) {
            return _this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, { passedConfig: passedConfig, mappedWellKnownEndpoints: mappedWellKnownEndpoints });
        }));
        return loadConfig$.toPromise();
    };
    OidcConfigService.prototype.getWellKnownDocument = function (wellKnownEndpoint) {
        var url = wellKnownEndpoint;
        if (!wellKnownEndpoint.includes(this.WELL_KNOWN_SUFFIX)) {
            url = "" + wellKnownEndpoint + this.WELL_KNOWN_SUFFIX;
        }
        return this.http.get(url);
    };
    OidcConfigService.ctorParameters = function () { return [
        { type: LoggerService },
        { type: DataService },
        { type: ConfigurationProvider },
        { type: PublicEventsService }
    ]; };
    OidcConfigService = __decorate([
        Injectable()
    ], OidcConfigService);
    return OidcConfigService;
}());

var RandomService = /** @class */ (function () {
    function RandomService(loggerService) {
        this.loggerService = loggerService;
    }
    RandomService.prototype.createRandom = function (requiredLength) {
        if (requiredLength <= 0) {
            return '';
        }
        if (requiredLength > 0 && requiredLength < 7) {
            this.loggerService.logWarning("RandomService called with " + requiredLength + " but 7 chars is the minimum, returning 10 chars");
            requiredLength = 10;
        }
        var length = requiredLength - 6;
        var arr = new Uint8Array((length || length) / 2);
        this.getCrypto().getRandomValues(arr);
        return Array.from(arr, this.toHex).join('') + this.randomString(7);
    };
    RandomService.prototype.toHex = function (dec) {
        return ('0' + dec.toString(16)).substr(-2);
    };
    RandomService.prototype.randomString = function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var values = new Uint32Array(length);
        this.getCrypto().getRandomValues(values);
        for (var i = 0; i < length; i++) {
            result += characters[values[i] % characters.length];
        }
        return result;
    };
    RandomService.prototype.getCrypto = function () {
        // support for IE,  (window.crypto || window.msCrypto)
        return window.crypto || window.msCrypto;
    };
    RandomService.ctorParameters = function () { return [
        { type: LoggerService }
    ]; };
    RandomService = __decorate([
        Injectable()
    ], RandomService);
    return RandomService;
}());

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

function _window() {
    return window;
}
var WINDOW = new InjectionToken('WindowToken');

var UriEncoder = /** @class */ (function () {
    function UriEncoder() {
    }
    UriEncoder.prototype.encodeKey = function (key) {
        return encodeURIComponent(key);
    };
    UriEncoder.prototype.encodeValue = function (value) {
        return encodeURIComponent(value);
    };
    UriEncoder.prototype.decodeKey = function (key) {
        return decodeURIComponent(key);
    };
    UriEncoder.prototype.decodeValue = function (value) {
        return decodeURIComponent(value);
    };
    return UriEncoder;
}());

var UrlService = /** @class */ (function () {
    function UrlService(configurationProvider, loggerService, flowsDataService, flowHelper, tokenValidationService, window) {
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
        this.flowsDataService = flowsDataService;
        this.flowHelper = flowHelper;
        this.tokenValidationService = tokenValidationService;
        this.window = window;
        this.CALLBACK_PARAMS_TO_CHECK = ['code', 'state', 'token', 'id_token'];
    }
    UrlService.prototype.getUrlParameter = function (urlToCheck, name) {
        if (!urlToCheck) {
            return '';
        }
        if (!name) {
            return '';
        }
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(urlToCheck);
        return results === null ? '' : decodeURIComponent(results[1]);
    };
    UrlService.prototype.isCallbackFromSts = function () {
        var _this = this;
        var anyParameterIsGiven = this.CALLBACK_PARAMS_TO_CHECK.some(function (x) { return !!_this.getUrlParameter(_this.window.location.toString(), x); });
        return anyParameterIsGiven;
    };
    UrlService.prototype.getRefreshSessionSilentRenewUrl = function () {
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            return this.createUrlCodeFlowWithSilentRenew();
        }
        return this.createUrlImplicitFlowWithSilentRenew() || '';
    };
    UrlService.prototype.getAuthorizeUrl = function (customParams) {
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            return this.createUrlCodeFlowAuthorize(customParams);
        }
        return this.createUrlImplicitFlowAuthorize(customParams) || '';
    };
    UrlService.prototype.createEndSessionUrl = function (idTokenHint) {
        var _a;
        var endSessionEndpoint = (_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.endSessionEndpoint;
        if (!endSessionEndpoint) {
            return null;
        }
        var urlParts = endSessionEndpoint.split('?');
        var authorizationEndsessionUrl = urlParts[0];
        var params = new HttpParams({
            fromString: urlParts[1],
            encoder: new UriEncoder(),
        });
        params = params.set('id_token_hint', idTokenHint);
        var postLogoutRedirectUri = this.getPostLogoutRedirectUrl();
        if (postLogoutRedirectUri) {
            params = params.append('post_logout_redirect_uri', postLogoutRedirectUri);
        }
        return authorizationEndsessionUrl + "?" + params;
    };
    UrlService.prototype.createRevocationEndpointBodyAccessToken = function (token) {
        var clientId = this.getClientId();
        if (!clientId) {
            return null;
        }
        return "client_id=" + clientId + "&token=" + token + "&token_type_hint=access_token";
    };
    UrlService.prototype.createRevocationEndpointBodyRefreshToken = function (token) {
        var clientId = this.getClientId();
        if (!clientId) {
            return null;
        }
        return "client_id=" + clientId + "&token=" + token + "&token_type_hint=refresh_token";
    };
    UrlService.prototype.getRevocationEndpointUrl = function () {
        var _a;
        var endSessionEndpoint = (_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.revocationEndpoint;
        if (!endSessionEndpoint) {
            return null;
        }
        var urlParts = endSessionEndpoint.split('?');
        var revocationEndpointUrl = urlParts[0];
        return revocationEndpointUrl;
    };
    UrlService.prototype.createBodyForCodeFlowCodeRequest = function (code) {
        var codeVerifier = this.flowsDataService.getCodeVerifier();
        if (!codeVerifier) {
            this.loggerService.logError("CodeVerifier is not set ", codeVerifier);
            return null;
        }
        var clientId = this.getClientId();
        if (!clientId) {
            return null;
        }
        var dataForBody = oneLineTrim(templateObject_1 || (templateObject_1 = __makeTemplateObject(["grant_type=authorization_code\n            &client_id=", "\n            &code_verifier=", "\n            &code=", ""], ["grant_type=authorization_code\n            &client_id=", "\n            &code_verifier=", "\n            &code=", ""])), clientId, codeVerifier, code);
        var silentRenewUrl = this.getSilentRenewUrl();
        if (this.flowsDataService.isSilentRenewRunning() && silentRenewUrl) {
            return oneLineTrim(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", "&redirect_uri=", ""], ["", "&redirect_uri=", ""])), dataForBody, silentRenewUrl);
        }
        var redirectUrl = this.getRedirectUrl();
        if (!redirectUrl) {
            return null;
        }
        return oneLineTrim(templateObject_3 || (templateObject_3 = __makeTemplateObject(["", "&redirect_uri=", ""], ["", "&redirect_uri=", ""])), dataForBody, redirectUrl);
    };
    UrlService.prototype.createBodyForCodeFlowRefreshTokensRequest = function (refreshtoken) {
        var clientId = this.getClientId();
        if (!clientId) {
            return null;
        }
        return oneLineTrim(templateObject_4 || (templateObject_4 = __makeTemplateObject(["grant_type=refresh_token\n          &client_id=", "\n          &refresh_token=", ""], ["grant_type=refresh_token\n          &client_id=", "\n          &refresh_token=", ""])), clientId, refreshtoken);
    };
    UrlService.prototype.createAuthorizeUrl = function (codeChallenge, redirectUrl, nonce, state, prompt, customRequestParams) {
        var e_1, _a;
        var _b, _c;
        var authorizationEndpoint = (_c = (_b = this.configurationProvider) === null || _b === void 0 ? void 0 : _b.wellKnownEndpoints) === null || _c === void 0 ? void 0 : _c.authorizationEndpoint;
        if (!authorizationEndpoint) {
            this.loggerService.logError("Can not create an authorize url when authorizationEndpoint is '" + authorizationEndpoint + "'");
            return null;
        }
        var _d = this.configurationProvider.openIDConfiguration, clientId = _d.clientId, responseType = _d.responseType, scope = _d.scope, hdParam = _d.hdParam, customParams = _d.customParams;
        if (!clientId) {
            this.loggerService.logError("createAuthorizeUrl could not add clientId because it was: ", clientId);
            return null;
        }
        if (!responseType) {
            this.loggerService.logError("createAuthorizeUrl could not add responseType because it was: ", responseType);
            return null;
        }
        if (!scope) {
            this.loggerService.logError("createAuthorizeUrl could not add scope because it was: ", scope);
            return null;
        }
        var urlParts = authorizationEndpoint.split('?');
        var authorizationUrl = urlParts[0];
        var params = new HttpParams({
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
            var customParamsToAdd = __assign(__assign({}, (customParams || {})), (customRequestParams || {}));
            try {
                for (var _e = __values(Object.entries(customParamsToAdd)), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var _g = __read(_f.value, 2), key = _g[0], value = _g[1];
                    params = params.append(key, value.toString());
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        return authorizationUrl + "?" + params;
    };
    UrlService.prototype.createUrlImplicitFlowWithSilentRenew = function () {
        var state = this.flowsDataService.getExistingOrCreateAuthStateControl();
        var nonce = this.flowsDataService.createNonce();
        var silentRenewUrl = this.getSilentRenewUrl();
        if (!silentRenewUrl) {
            return null;
        }
        this.loggerService.logDebug('RefreshSession created. adding myautostate: ', state);
        if (this.configurationProvider.wellKnownEndpoints) {
            return this.createAuthorizeUrl('', silentRenewUrl, nonce, state, 'none');
        }
        this.loggerService.logError('authWellKnownEndpoints is undefined');
        return null;
    };
    UrlService.prototype.createUrlCodeFlowWithSilentRenew = function () {
        var state = this.flowsDataService.getExistingOrCreateAuthStateControl();
        var nonce = this.flowsDataService.createNonce();
        this.loggerService.logDebug('RefreshSession created. adding myautostate: ' + state);
        // code_challenge with "S256"
        var codeVerifier = this.flowsDataService.createCodeVerifier();
        var codeChallenge = this.tokenValidationService.generateCodeVerifier(codeVerifier);
        var silentRenewUrl = this.getSilentRenewUrl();
        if (!silentRenewUrl) {
            return null;
        }
        if (this.configurationProvider.wellKnownEndpoints) {
            return this.createAuthorizeUrl(codeChallenge, silentRenewUrl, nonce, state, 'none');
        }
        this.loggerService.logWarning('authWellKnownEndpoints is undefined');
        return null;
    };
    UrlService.prototype.createUrlImplicitFlowAuthorize = function (customParams) {
        var state = this.flowsDataService.getExistingOrCreateAuthStateControl();
        var nonce = this.flowsDataService.createNonce();
        this.loggerService.logDebug('Authorize created. adding myautostate: ' + state);
        var redirectUrl = this.getRedirectUrl();
        if (!redirectUrl) {
            return null;
        }
        if (this.configurationProvider.wellKnownEndpoints) {
            return this.createAuthorizeUrl('', redirectUrl, nonce, state, null, customParams);
        }
        this.loggerService.logError('authWellKnownEndpoints is undefined');
        return null;
    };
    UrlService.prototype.createUrlCodeFlowAuthorize = function (customParams) {
        var state = this.flowsDataService.getExistingOrCreateAuthStateControl();
        var nonce = this.flowsDataService.createNonce();
        this.loggerService.logDebug('Authorize created. adding myautostate: ' + state);
        var redirectUrl = this.getRedirectUrl();
        if (!redirectUrl) {
            return null;
        }
        // code_challenge with "S256"
        var codeVerifier = this.flowsDataService.createCodeVerifier();
        var codeChallenge = this.tokenValidationService.generateCodeVerifier(codeVerifier);
        if (this.configurationProvider.wellKnownEndpoints) {
            return this.createAuthorizeUrl(codeChallenge, redirectUrl, nonce, state, null, customParams);
        }
        this.loggerService.logError('authWellKnownEndpoints is undefined');
        return null;
    };
    UrlService.prototype.getRedirectUrl = function () {
        var _a;
        var redirectUrl = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.redirectUrl;
        if (!redirectUrl) {
            this.loggerService.logError("could not get redirectUrl, was: ", redirectUrl);
            return null;
        }
        return redirectUrl;
    };
    UrlService.prototype.getSilentRenewUrl = function () {
        var _a;
        var silentRenewUrl = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.silentRenewUrl;
        if (!silentRenewUrl) {
            this.loggerService.logError("could not get silentRenewUrl, was: ", silentRenewUrl);
            return null;
        }
        return silentRenewUrl;
    };
    UrlService.prototype.getPostLogoutRedirectUrl = function () {
        var _a;
        var postLogoutRedirectUri = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.postLogoutRedirectUri;
        if (!postLogoutRedirectUri) {
            this.loggerService.logError("could not get postLogoutRedirectUri, was: ", postLogoutRedirectUri);
            return null;
        }
        return postLogoutRedirectUri;
    };
    UrlService.prototype.getClientId = function () {
        var _a;
        var clientId = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.clientId;
        if (!clientId) {
            this.loggerService.logError("could not get clientId, was: ", clientId);
            return null;
        }
        return clientId;
    };
    UrlService.ctorParameters = function () { return [
        { type: ConfigurationProvider },
        { type: LoggerService },
        { type: FlowsDataService },
        { type: FlowHelper },
        { type: TokenValidationService },
        { type: undefined, decorators: [{ type: Inject, args: [WINDOW,] }] }
    ]; };
    UrlService = __decorate([
        Injectable(),
        __param(5, Inject(WINDOW))
    ], UrlService);
    return UrlService;
}());
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;

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

var StateValidationResult = /** @class */ (function () {
    function StateValidationResult(accessToken, idToken, authResponseIsValid, decodedIdToken, state) {
        if (accessToken === void 0) { accessToken = ''; }
        if (idToken === void 0) { idToken = ''; }
        if (authResponseIsValid === void 0) { authResponseIsValid = false; }
        if (decodedIdToken === void 0) { decodedIdToken = {}; }
        if (state === void 0) { state = ValidationResult.NotSet; }
        this.accessToken = accessToken;
        this.idToken = idToken;
        this.authResponseIsValid = authResponseIsValid;
        this.decodedIdToken = decodedIdToken;
        this.state = state;
    }
    return StateValidationResult;
}());

var StateValidationService = /** @class */ (function () {
    function StateValidationService(storagePersistanceService, tokenValidationService, tokenHelperService, loggerService, configurationProvider, flowHelper) {
        this.storagePersistanceService = storagePersistanceService;
        this.tokenValidationService = tokenValidationService;
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.flowHelper = flowHelper;
    }
    StateValidationService.prototype.getValidatedStateResult = function (callbackContext) {
        if (callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult.error) {
            return new StateValidationResult('', '', false, {});
        }
        return this.validateState(callbackContext);
    };
    StateValidationService.prototype.isIdTokenAfterRefreshTokenRequestValid = function (callbackContext, newIdToken) {
        if (!this.configurationProvider.openIDConfiguration.useRefreshToken) {
            return true;
        }
        if (!callbackContext.existingIdToken) {
            return true;
        }
        var decodedIdToken = this.tokenHelperService.getPayloadFromToken(callbackContext.existingIdToken, false);
        // Upon successful validation of the Refresh Token, the response body is the Token Response of Section 3.1.3.3
        // except that it might not contain an id_token.
        // If an ID Token is returned as a result of a token refresh request, the following requirements apply:
        // its iss Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.iss !== newIdToken.iss) {
            this.loggerService.logDebug("iss do not match: " + decodedIdToken.iss + " " + newIdToken.iss);
            return false;
        }
        // its azp Claim Value MUST be the same as in the ID Token issued when the original authentication occurred;
        //   if no azp Claim was present in the original ID Token, one MUST NOT be present in the new ID Token, and
        // otherwise, the same rules apply as apply when issuing an ID Token at the time of the original authentication.
        if (decodedIdToken.azp !== newIdToken.azp) {
            this.loggerService.logDebug("azp do not match: " + decodedIdToken.azp + " " + newIdToken.azp);
            return false;
        }
        // its sub Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.sub !== newIdToken.sub) {
            this.loggerService.logDebug("sub do not match: " + decodedIdToken.sub + " " + newIdToken.sub);
            return false;
        }
        // its aud Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.aud !== newIdToken.aud) {
            this.loggerService.logDebug("aud do not match: " + decodedIdToken.aud + " " + newIdToken.aud);
            return false;
        }
        if (this.configurationProvider.openIDConfiguration.disableRefreshIdTokenAuthTimeValidation) {
            return true;
        }
        // its iat Claim MUST represent the time that the new ID Token is issued,
        // if the ID Token contains an auth_time Claim, its value MUST represent the time of the original authentication
        // - not the time that the new ID token is issued,
        if (decodedIdToken.auth_time !== newIdToken.auth_time) {
            this.loggerService.logDebug("auth_time do not match: " + decodedIdToken.auth_time + " " + newIdToken.auth_time);
            return false;
        }
        return true;
    };
    StateValidationService.prototype.validateState = function (callbackContext) {
        var toReturn = new StateValidationResult();
        if (!this.tokenValidationService.validateStateFromHashCallback(callbackContext.authResult.state, this.storagePersistanceService.authStateControl)) {
            this.loggerService.logWarning('authorizedCallback incorrect state');
            toReturn.state = ValidationResult.StatesDoNotMatch;
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        var isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken();
        var isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
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
        var idTokenHeader = this.tokenHelperService.getHeaderFromToken(toReturn.idToken, false);
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
    };
    StateValidationService.prototype.handleSuccessfulValidation = function () {
        this.storagePersistanceService.authNonce = '';
        if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
            this.storagePersistanceService.authStateControl = '';
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) validated, continue');
    };
    StateValidationService.prototype.handleUnsuccessfulValidation = function () {
        this.storagePersistanceService.authNonce = '';
        if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
            this.storagePersistanceService.authStateControl = '';
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) invalid');
    };
    StateValidationService.ctorParameters = function () { return [
        { type: StoragePersistanceService },
        { type: TokenValidationService },
        { type: TokenHelperService },
        { type: LoggerService },
        { type: ConfigurationProvider },
        { type: FlowHelper }
    ]; };
    StateValidationService = __decorate([
        Injectable()
    ], StateValidationService);
    return StateValidationService;
}());

var SigninKeyDataService = /** @class */ (function () {
    function SigninKeyDataService(configurationProvider, loggerService, dataService) {
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
        this.dataService = dataService;
    }
    SigninKeyDataService.prototype.getSigningKeys = function () {
        var _a, _b;
        if (!((_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.jwksUri)) {
            var error = "getSigningKeys: authWellKnownEndpoints.jwksUri is: '" + ((_b = this.configurationProvider.wellKnownEndpoints) === null || _b === void 0 ? void 0 : _b.jwksUri) + "'";
            this.loggerService.logWarning(error);
            return throwError(error);
        }
        this.loggerService.logDebug('Getting signinkeys from ', this.configurationProvider.wellKnownEndpoints.jwksUri);
        return this.dataService
            .get(this.configurationProvider.wellKnownEndpoints.jwksUri)
            .pipe(catchError(this.handleErrorGetSigningKeys));
    };
    SigninKeyDataService.prototype.handleErrorGetSigningKeys = function (error) {
        var errMsg;
        if (error instanceof Response) {
            var body = error.json() || {};
            var err = JSON.stringify(body);
            errMsg = error.status + " - " + (error.statusText || '') + " " + err;
        }
        else {
            errMsg = error.message ? error.message : error.toString();
        }
        this.loggerService.logError(errMsg);
        return throwError(errMsg);
    };
    SigninKeyDataService.ctorParameters = function () { return [
        { type: ConfigurationProvider },
        { type: LoggerService },
        { type: DataService }
    ]; };
    SigninKeyDataService = __decorate([
        Injectable()
    ], SigninKeyDataService);
    return SigninKeyDataService;
}());

var FlowsService = /** @class */ (function () {
    function FlowsService(urlService, loggerService, tokenValidationService, configurationProvider, authStateService, flowsDataService, signinKeyDataService, dataService, userService, stateValidationService) {
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
    FlowsService.prototype.resetAuthorizationData = function () {
        if (this.configurationProvider.openIDConfiguration.autoUserinfo) {
            // Clear user data. Fixes #97.
            this.userService.resetUserDataInStore();
        }
        this.flowsDataService.resetStorageFlowData();
        this.authStateService.setUnauthorizedAndFireEvent();
    };
    FlowsService.prototype.processCodeFlowCallback = function (urlToCheck) {
        var _this = this;
        return this.codeFlowCallback(urlToCheck).pipe(switchMap(function (callbackContext) { return _this.codeFlowCodeRequest(callbackContext); }), switchMap(function (callbackContext) { return _this.codeFlowSilentRenewCheck(callbackContext); }), switchMap(function (callbackContext) { return _this.callbackHistoryAndResetJwtKeys(callbackContext); }), switchMap(function (callbackContext) { return _this.callbackStateValidation(callbackContext); }), switchMap(function (callbackContext) { return _this.callbackUser(callbackContext); }));
    };
    FlowsService.prototype.processSilentRenewCodeFlowCallback = function (firstContext) {
        var _this = this;
        return this.codeFlowCodeRequest(firstContext).pipe(switchMap(function (callbackContext) { return _this.codeFlowSilentRenewCheck(callbackContext); }), switchMap(function (callbackContext) { return _this.callbackHistoryAndResetJwtKeys(callbackContext); }), switchMap(function (callbackContext) { return _this.callbackStateValidation(callbackContext); }), switchMap(function (callbackContext) { return _this.callbackUser(callbackContext); }));
    };
    FlowsService.prototype.processImplicitFlowCallback = function (hash) {
        var _this = this;
        return this.implicitFlowCallback(hash).pipe(switchMap(function (callbackContext) { return _this.callbackHistoryAndResetJwtKeys(callbackContext); }), switchMap(function (callbackContext) { return _this.callbackStateValidation(callbackContext); }), switchMap(function (callbackContext) { return _this.callbackUser(callbackContext); }));
    };
    FlowsService.prototype.processRefreshToken = function () {
        var _this = this;
        return this.refreshSessionWithRefreshTokens().pipe(switchMap(function (callbackContext) { return _this.refreshTokensRequestTokens(callbackContext); }), switchMap(function (callbackContext) { return _this.codeFlowSilentRenewCheck(callbackContext); }), switchMap(function (callbackContext) { return _this.callbackHistoryAndResetJwtKeys(callbackContext); }), switchMap(function (callbackContext) { return _this.callbackStateValidation(callbackContext); }), switchMap(function (callbackContext) { return _this.callbackUser(callbackContext); }));
    };
    // STEP 1 Code Flow
    FlowsService.prototype.codeFlowCallback = function (urlToCheck) {
        var code = this.urlService.getUrlParameter(urlToCheck, 'code');
        var state = this.urlService.getUrlParameter(urlToCheck, 'state');
        var sessionState = this.urlService.getUrlParameter(urlToCheck, 'session_state') || null;
        if (!state) {
            this.loggerService.logDebug('no state in url');
            return throwError('no state in url');
        }
        if (!code) {
            this.loggerService.logDebug('no code in url');
            return throwError('no code in url');
        }
        this.loggerService.logDebug('running validation for callback' + urlToCheck);
        var initialCallbackContext = {
            code: code,
            refreshToken: null,
            state: state,
            sessionState: sessionState,
            authResult: null,
            isRenewProcess: false,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return of(initialCallbackContext);
    };
    // STEP 1 Implicit Flow
    FlowsService.prototype.implicitFlowCallback = function (hash) {
        var isRenewProcessData = this.flowsDataService.isSilentRenewRunning();
        this.loggerService.logDebug('BEGIN authorizedCallback, no auth data');
        if (!isRenewProcessData) {
            this.resetAuthorizationData();
        }
        hash = hash || window.location.hash.substr(1);
        var authResult = hash.split('&').reduce(function (resultData, item) {
            var parts = item.split('=');
            resultData[parts.shift()] = parts.join('=');
            return resultData;
        }, {});
        var callbackContext = {
            code: null,
            refreshToken: null,
            state: null,
            sessionState: null,
            authResult: authResult,
            isRenewProcess: isRenewProcessData,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return of(callbackContext);
    };
    // STEP 1 Refresh session
    FlowsService.prototype.refreshSessionWithRefreshTokens = function () {
        var stateData = this.flowsDataService.getExistingOrCreateAuthStateControl();
        this.loggerService.logDebug('RefreshSession created. adding myautostate: ' + stateData);
        var refreshToken = this.authStateService.getRefreshToken();
        var idToken = this.authStateService.getIdToken();
        // TODO add id_token data
        if (refreshToken) {
            var callbackContext = {
                code: null,
                refreshToken: refreshToken,
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
            var errorMessage = 'no refresh token found, please login';
            this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }
    };
    // STEP 2 Refresh Token
    FlowsService.prototype.refreshTokensRequestTokens = function (callbackContext) {
        var _this = this;
        var headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        var tokenRequestUrl = this.getTokenEndpoint();
        if (!tokenRequestUrl) {
            return throwError('Token Endpoint not defined');
        }
        var data = this.urlService.createBodyForCodeFlowRefreshTokensRequest(callbackContext.refreshToken);
        return this.dataService.post(tokenRequestUrl, data, headers).pipe(switchMap(function (response) {
            _this.loggerService.logDebug('token refresh response: ', response);
            var authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), catchError(function (error) {
            var errorMessage = "OidcService code request " + _this.configurationProvider.openIDConfiguration.stsServer + ": " + error;
            _this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }));
    };
    // STEP 2 Code Flow //  Code Flow Silent Renew starts here
    FlowsService.prototype.codeFlowCodeRequest = function (callbackContext) {
        var _this = this;
        var isStateCorrect = this.tokenValidationService.validateStateFromHashCallback(callbackContext.state, this.flowsDataService.getAuthStateControl());
        if (!isStateCorrect) {
            this.loggerService.logWarning('codeFlowCodeRequest incorrect state');
            return throwError('codeFlowCodeRequest incorrect state');
        }
        var tokenRequestUrl = this.getTokenEndpoint();
        if (!tokenRequestUrl) {
            return throwError('Token Endpoint not defined');
        }
        var headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        var bodyForCodeFlow = this.urlService.createBodyForCodeFlowCodeRequest(callbackContext.code);
        return this.dataService.post(tokenRequestUrl, bodyForCodeFlow, headers).pipe(switchMap(function (response) {
            var authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            authResult.session_state = callbackContext.sessionState;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), catchError(function (error) {
            var errorMessage = "OidcService code request " + _this.configurationProvider.openIDConfiguration.stsServer + " with error " + error;
            _this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }));
    };
    // STEP 3 Code Flow, STEP 3 Refresh Token
    FlowsService.prototype.codeFlowSilentRenewCheck = function (callbackContext) {
        callbackContext.isRenewProcess = this.flowsDataService.isSilentRenewRunning();
        this.loggerService.logDebug('BEGIN authorized Code Flow Callback, no auth data');
        if (!callbackContext.isRenewProcess) {
            this.resetAuthorizationData();
        }
        return of(callbackContext);
    };
    // STEP 4 Code Flow, STEP 2 Implicit Flow, STEP 4 Refresh Token
    FlowsService.prototype.callbackHistoryAndResetJwtKeys = function (callbackContext) {
        var _this = this;
        this.authStateService.setAuthResultInStorage(callbackContext.authResult);
        if (this.historyCleanUpTurnedOn() && !callbackContext.isRenewProcess) {
            this.resetBrowserHistory();
        }
        else {
            this.loggerService.logDebug('history clean up inactive');
        }
        if (callbackContext.authResult.error) {
            var errorMessage = "authorizedCallbackProcedure came with error: " + callbackContext.authResult.error;
            this.loggerService.logDebug(errorMessage);
            this.resetAuthorizationData();
            this.flowsDataService.setNonce('');
            this.handleResultErrorFromCallback(callbackContext.authResult, callbackContext.isRenewProcess);
            return throwError(errorMessage);
        }
        this.loggerService.logDebug(callbackContext.authResult);
        this.loggerService.logDebug('authorizedCallback created, begin token validation');
        return this.signinKeyDataService.getSigningKeys().pipe(switchMap(function (jwtKeys) {
            if (jwtKeys) {
                callbackContext.jwtKeys = jwtKeys;
                return of(callbackContext);
            }
            var errorMessage = "Failed to retrieve signing key";
            _this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }), catchError(function (err) {
            var errorMessage = "Failed to retrieve signing key with error: " + err;
            _this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }));
    };
    // STEP 5 All flows
    FlowsService.prototype.callbackStateValidation = function (callbackContext) {
        var validationResult = this.stateValidationService.getValidatedStateResult(callbackContext);
        callbackContext.validationResult = validationResult;
        if (validationResult.authResponseIsValid) {
            this.authStateService.setAuthorizationData(validationResult.accessToken, validationResult.idToken);
            return of(callbackContext);
        }
        else {
            var errorMessage = "authorizedCallback, token(s) validation failed, resetting. Hash: " + window.location.hash;
            this.loggerService.logWarning(errorMessage);
            this.resetAuthorizationData();
            this.publishUnauthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
            return throwError(errorMessage);
        }
    };
    // STEP 6 userData
    FlowsService.prototype.callbackUser = function (callbackContext) {
        var _this = this;
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
            .pipe(switchMap(function (userData) {
            if (!!userData) {
                _this.flowsDataService.setSessionState(callbackContext.authResult.session_state);
                _this.publishAuthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                return of(callbackContext);
            }
            else {
                _this.resetAuthorizationData();
                _this.publishUnauthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                var errorMessage = "Called for userData but they were " + userData;
                _this.loggerService.logWarning(errorMessage);
                return throwError(errorMessage);
            }
        }), catchError(function (err) {
            var errorMessage = "Failed to retreive user info with error:  " + err;
            _this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }));
    };
    FlowsService.prototype.publishAuthorizedState = function (stateValidationResult, isRenewProcess) {
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Authorized,
            validationResult: stateValidationResult.state,
            isRenewProcess: isRenewProcess,
        });
    };
    FlowsService.prototype.publishUnauthorizedState = function (stateValidationResult, isRenewProcess) {
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Unauthorized,
            validationResult: stateValidationResult.state,
            isRenewProcess: isRenewProcess,
        });
    };
    FlowsService.prototype.handleResultErrorFromCallback = function (result, isRenewProcess) {
        var validationResult = ValidationResult.SecureTokenServerError;
        if (result.error === 'login_required') {
            validationResult = ValidationResult.LoginRequired;
        }
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Unauthorized,
            validationResult: validationResult,
            isRenewProcess: isRenewProcess,
        });
    };
    FlowsService.prototype.getTokenEndpoint = function () {
        var _a;
        return ((_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.tokenEndpoint) || null;
    };
    FlowsService.prototype.historyCleanUpTurnedOn = function () {
        return !this.configurationProvider.openIDConfiguration.historyCleanupOff;
    };
    FlowsService.prototype.resetBrowserHistory = function () {
        window.history.replaceState({}, window.document.title, window.location.origin + window.location.pathname);
    };
    FlowsService.ctorParameters = function () { return [
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
    ]; };
    FlowsService = __decorate([
        Injectable()
    ], FlowsService);
    return FlowsService;
}());

var IFrameService = /** @class */ (function () {
    function IFrameService(loggerService) {
        this.loggerService = loggerService;
    }
    IFrameService.prototype.getExistingIFrame = function (identifier) {
        var iFrameOnParent = this.getIFrameFromParentWindow(identifier);
        if (this.isIFrameElement(iFrameOnParent)) {
            return iFrameOnParent;
        }
        var iFrameOnSelf = this.getIFrameFromWindow(identifier);
        if (this.isIFrameElement(iFrameOnSelf)) {
            return iFrameOnSelf;
        }
        return null;
    };
    IFrameService.prototype.addIFrameToWindowBody = function (identifier) {
        var sessionIframe = window.document.createElement('iframe');
        sessionIframe.id = identifier;
        this.loggerService.logDebug(sessionIframe);
        sessionIframe.style.display = 'none';
        window.document.body.appendChild(sessionIframe);
        return sessionIframe;
    };
    IFrameService.prototype.getIFrameFromParentWindow = function (identifier) {
        try {
            var iFrameElement = window.parent.document.getElementById(identifier);
            if (this.isIFrameElement(iFrameElement)) {
                return iFrameElement;
            }
            return null;
        }
        catch (e) {
            return null;
        }
    };
    IFrameService.prototype.getIFrameFromWindow = function (identifier) {
        var iFrameElement = window.document.getElementById(identifier);
        if (this.isIFrameElement(iFrameElement)) {
            return iFrameElement;
        }
        return null;
    };
    IFrameService.prototype.isIFrameElement = function (element) {
        return !!element && element instanceof HTMLIFrameElement;
    };
    IFrameService.ctorParameters = function () { return [
        { type: LoggerService }
    ]; };
    IFrameService = __decorate([
        Injectable()
    ], IFrameService);
    return IFrameService;
}());

var IFRAME_FOR_CHECK_SESSION_IDENTIFIER = 'myiFrameForCheckSession';
// http://openid.net/specs/openid-connect-session-1_0-ID4.html
var CheckSessionService = /** @class */ (function () {
    function CheckSessionService(storagePersistanceService, loggerService, iFrameService, zone, eventService, configurationProvider) {
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
    Object.defineProperty(CheckSessionService.prototype, "checkSessionChanged$", {
        get: function () {
            return this.checkSessionChangedInternal$.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    CheckSessionService.prototype.isCheckSessionConfigured = function () {
        return this.configurationProvider.openIDConfiguration.startCheckSession;
    };
    CheckSessionService.prototype.start = function () {
        if (!!this.scheduledHeartBeatRunning) {
            return;
        }
        this.init();
        var clientId = this.configurationProvider.openIDConfiguration.clientId;
        this.pollServerSession(clientId);
    };
    CheckSessionService.prototype.stop = function () {
        if (!this.scheduledHeartBeatRunning) {
            return;
        }
        this.clearScheduledHeartBeat();
        this.checkSessionReceived = false;
    };
    CheckSessionService.prototype.serverStateChanged = function () {
        return this.configurationProvider.openIDConfiguration.startCheckSession && this.checkSessionReceived;
    };
    CheckSessionService.prototype.init = function () {
        var _this = this;
        if (this.lastIFrameRefresh + this.iframeRefreshInterval > Date.now()) {
            return;
        }
        if (!this.configurationProvider.wellKnownEndpoints) {
            this.loggerService.logWarning('init check session: authWellKnownEndpoints is undefined. Returning.');
            return;
        }
        var existingIframe = this.getOrCreateIframe();
        if (this.configurationProvider.wellKnownEndpoints.checkSessionIframe) {
            existingIframe.contentWindow.location.replace(this.configurationProvider.wellKnownEndpoints.checkSessionIframe);
        }
        else {
            this.loggerService.logWarning('init check session: checkSessionIframe is not configured to run');
        }
        this.bindMessageEventToIframe();
        existingIframe.onload = function () {
            _this.lastIFrameRefresh = Date.now();
        };
    };
    CheckSessionService.prototype.pollServerSession = function (clientId) {
        var _this = this;
        this.outstandingMessages = 0;
        var pollServerSessionRecur = function () {
            var existingIframe = _this.getExistingIframe();
            if (existingIframe && clientId) {
                _this.loggerService.logDebug(existingIframe);
                var sessionState = _this.storagePersistanceService.sessionState;
                if (sessionState) {
                    _this.outstandingMessages++;
                    existingIframe.contentWindow.postMessage(clientId + ' ' + sessionState, _this.configurationProvider.openIDConfiguration.stsServer);
                }
                else {
                    _this.loggerService.logDebug('OidcSecurityCheckSession pollServerSession session_state is blank');
                }
            }
            else {
                _this.loggerService.logWarning('OidcSecurityCheckSession pollServerSession checkSession IFrame does not exist');
                _this.loggerService.logDebug(clientId);
                _this.loggerService.logDebug(existingIframe);
            }
            // after sending three messages with no response, fail.
            if (_this.outstandingMessages > 3) {
                _this.loggerService.logError("OidcSecurityCheckSession not receiving check session response messages. Outstanding messages: " + _this.outstandingMessages + ". Server unreachable?");
            }
        };
        this.zone.runOutsideAngular(function () {
            _this.scheduledHeartBeatRunning = setInterval(pollServerSessionRecur, _this.heartBeatInterval);
        });
    };
    CheckSessionService.prototype.clearScheduledHeartBeat = function () {
        clearTimeout(this.scheduledHeartBeatRunning);
        this.scheduledHeartBeatRunning = null;
    };
    CheckSessionService.prototype.messageHandler = function (e) {
        var existingIFrame = this.getExistingIframe();
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
    };
    CheckSessionService.prototype.getExistingIframe = function () {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
    };
    CheckSessionService.prototype.bindMessageEventToIframe = function () {
        var iframeMessageEvent = this.messageHandler.bind(this);
        window.addEventListener('message', iframeMessageEvent, false);
    };
    CheckSessionService.prototype.getOrCreateIframe = function () {
        var existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            return this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
        }
        return existingIframe;
    };
    CheckSessionService.ctorParameters = function () { return [
        { type: StoragePersistanceService },
        { type: LoggerService },
        { type: IFrameService },
        { type: NgZone },
        { type: PublicEventsService },
        { type: ConfigurationProvider }
    ]; };
    CheckSessionService = __decorate([
        Injectable()
    ], CheckSessionService);
    return CheckSessionService;
}());

var IFRAME_FOR_SILENT_RENEW_IDENTIFIER = 'myiFrameForSilentRenew';
var SilentRenewService = /** @class */ (function () {
    function SilentRenewService(configurationProvider, iFrameService) {
        this.configurationProvider = configurationProvider;
        this.iFrameService = iFrameService;
    }
    SilentRenewService.prototype.getOrCreateIframe = function () {
        var existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            return this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
        }
        return existingIframe;
    };
    SilentRenewService.prototype.isSilentRenewConfigured = function () {
        return (!this.configurationProvider.openIDConfiguration.useRefreshToken && this.configurationProvider.openIDConfiguration.silentRenew);
    };
    SilentRenewService.prototype.getExistingIframe = function () {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
    };
    SilentRenewService.ctorParameters = function () { return [
        { type: ConfigurationProvider },
        { type: IFrameService }
    ]; };
    SilentRenewService = __decorate([
        Injectable()
    ], SilentRenewService);
    return SilentRenewService;
}());

var RedirectService = /** @class */ (function () {
    function RedirectService(window) {
        this.window = window;
    }
    RedirectService.prototype.redirectTo = function (url) {
        this.window.location.href = url;
    };
    RedirectService.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [WINDOW,] }] }
    ]; };
    RedirectService.ɵprov = ɵɵdefineInjectable({ factory: function RedirectService_Factory() { return new RedirectService(ɵɵinject(WINDOW)); }, token: RedirectService, providedIn: "root" });
    RedirectService = __decorate([
        Injectable({ providedIn: 'root' }),
        __param(0, Inject(WINDOW))
    ], RedirectService);
    return RedirectService;
}());

var LogoffRevocationService = /** @class */ (function () {
    function LogoffRevocationService(dataService, storagePersistanceService, loggerService, urlService, checkSessionService, flowsService, redirectService, configurationProvider) {
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
    LogoffRevocationService.prototype.logoff = function (urlHandler) {
        this.loggerService.logDebug('logoff, remove auth ');
        var endSessionUrl = this.getEndSessionUrl();
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
    };
    LogoffRevocationService.prototype.logoffLocal = function () {
        this.flowsService.resetAuthorizationData();
    };
    // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
    // only the access token is revoked. Then the logout run.
    LogoffRevocationService.prototype.logoffAndRevokeTokens = function (urlHandler) {
        var _this = this;
        var _a;
        if (!((_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.revocationEndpoint)) {
            this.loggerService.logDebug('revocation endpoint not supported');
            this.logoff(urlHandler);
        }
        if (this.storagePersistanceService.getRefreshToken()) {
            return this.revokeRefreshToken().pipe(switchMap(function (result) { return _this.revokeAccessToken(result); }), catchError(function (error) {
                var errorMessage = "revoke token failed " + error;
                _this.loggerService.logError(errorMessage);
                return throwError(errorMessage);
            }), tap(function () { return _this.logoff(urlHandler); }));
        }
        else {
            return this.revokeAccessToken().pipe(catchError(function (error) {
                var errorMessage = "revoke access token failed " + error;
                _this.loggerService.logError(errorMessage);
                return throwError(errorMessage);
            }), tap(function () { return _this.logoff(urlHandler); }));
        }
    };
    // https://tools.ietf.org/html/rfc7009
    // revokes an access token on the STS. If no token is provided, then the token from
    // the storage is revoked. You can pass any token to revoke. This makes it possible to
    // manage your own tokens. The is a public API.
    LogoffRevocationService.prototype.revokeAccessToken = function (accessToken) {
        var _this = this;
        var accessTok = accessToken || this.storagePersistanceService.accessToken;
        var body = this.urlService.createRevocationEndpointBodyAccessToken(accessTok);
        var url = this.urlService.getRevocationEndpointUrl();
        var headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        return this.dataService.post(url, body, headers).pipe(switchMap(function (response) {
            _this.loggerService.logDebug('revocation endpoint post response: ', response);
            return of(response);
        }), catchError(function (error) {
            var errorMessage = "Revocation request failed " + error;
            _this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }));
    };
    // https://tools.ietf.org/html/rfc7009
    // revokes an refresh token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    LogoffRevocationService.prototype.revokeRefreshToken = function (refreshToken) {
        var _this = this;
        var refreshTok = refreshToken || this.storagePersistanceService.getRefreshToken();
        var body = this.urlService.createRevocationEndpointBodyRefreshToken(refreshTok);
        var url = this.urlService.getRevocationEndpointUrl();
        var headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        return this.dataService.post(url, body, headers).pipe(switchMap(function (response) {
            _this.loggerService.logDebug('revocation endpoint post response: ', response);
            return of(response);
        }), catchError(function (error) {
            var errorMessage = "Revocation request failed " + error;
            _this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }));
    };
    LogoffRevocationService.prototype.getEndSessionUrl = function () {
        var idTokenHint = this.storagePersistanceService.idToken;
        return this.urlService.createEndSessionUrl(idTokenHint);
    };
    LogoffRevocationService.ctorParameters = function () { return [
        { type: DataService },
        { type: StoragePersistanceService },
        { type: LoggerService },
        { type: UrlService },
        { type: CheckSessionService },
        { type: FlowsService },
        { type: RedirectService },
        { type: ConfigurationProvider }
    ]; };
    LogoffRevocationService = __decorate([
        Injectable()
    ], LogoffRevocationService);
    return LogoffRevocationService;
}());

var CallbackService = /** @class */ (function () {
    function CallbackService(urlService, flowsService, flowHelper, configurationProvider, router, flowsDataService, loggerService, silentRenewService, userService, authStateService) {
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
    Object.defineProperty(CallbackService.prototype, "stsCallback$", {
        get: function () {
            return this.stsCallbackInternal$.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    CallbackService.prototype.handlePossibleStsCallback = function (currentCallbackUrl) {
        var _this = this;
        var callback$;
        if (!this.urlService.isCallbackFromSts()) {
            callback$ = of(null);
        }
        else if (this.flowHelper.isCurrentFlowCodeFlow()) {
            callback$ = this.authorizedCallbackWithCode(currentCallbackUrl);
        }
        else if (this.flowHelper.isCurrentFlowAnyImplicitFlow()) {
            callback$ = this.authorizedImplicitFlowCallback();
        }
        return callback$.pipe(tap(function () { return _this.stsCallbackInternal$.next(); }));
    };
    CallbackService.prototype.startTokenValidationPeriodically = function (repeatAfterSeconds) {
        var _this = this;
        if (!!this.runTokenValidationRunning || !this.configurationProvider.openIDConfiguration.silentRenew) {
            return;
        }
        var millisecondsDelayBetweenTokenCheck = repeatAfterSeconds * 1000;
        this.loggerService.logDebug("starting token validation check every " + repeatAfterSeconds + "s (" + millisecondsDelayBetweenTokenCheck + "ms)");
        var periodicallyCheck$ = interval(millisecondsDelayBetweenTokenCheck).pipe(switchMap(function () {
            var idToken = _this.authStateService.getIdToken();
            var isSilentRenewRunning = _this.flowsDataService.isSilentRenewRunning();
            var userDataFromStore = _this.userService.getUserDataFromStore();
            _this.loggerService.logDebug("Checking: silentRenewRunning: " + isSilentRenewRunning + " id_token: " + !!idToken + " userData: " + !!userDataFromStore);
            var shouldBeExecuted = userDataFromStore && !isSilentRenewRunning && idToken;
            if (!shouldBeExecuted) {
                return of(null);
            }
            var idTokenHasExpired = _this.authStateService.hasIdTokenExpired();
            var accessTokenHasExpired = _this.authStateService.hasAccessTokenExpiredIfExpiryExists();
            if (!idTokenHasExpired && !accessTokenHasExpired) {
                return of(null);
            }
            _this.loggerService.logDebug('IsAuthorized: id_token idTokenHasExpired, start silent renew if active');
            if (!_this.configurationProvider.openIDConfiguration.silentRenew) {
                _this.flowsService.resetAuthorizationData();
                return of(null);
            }
            _this.flowsDataService.setSilentRenewRunning();
            if (_this.flowHelper.isCurrentFlowCodeFlowWithRefeshTokens()) {
                // Refresh Session using Refresh tokens
                return _this.refreshSessionWithRefreshTokens();
            }
            return _this.refreshSessionWithIframe();
        }));
        this.runTokenValidationRunning = periodicallyCheck$
            .pipe(catchError(function () {
            _this.flowsDataService.resetSilentRenewRunning();
            return throwError('periodically check failed');
        }))
            .subscribe(function () {
            if (_this.flowHelper.isCurrentFlowCodeFlowWithRefeshTokens()) {
                _this.flowsDataService.resetSilentRenewRunning();
            }
        });
    };
    CallbackService.prototype.stopPeriodicallTokenCheck = function () {
        if (this.scheduledHeartBeatInternal) {
            clearTimeout(this.scheduledHeartBeatInternal);
            this.scheduledHeartBeatInternal = null;
            this.runTokenValidationRunning.unsubscribe();
            this.runTokenValidationRunning = null;
        }
    };
    // Code Flow Callback
    CallbackService.prototype.authorizedCallbackWithCode = function (urlToCheck) {
        var _this = this;
        return this.flowsService.processCodeFlowCallback(urlToCheck).pipe(tap(function (callbackContext) {
            if (!_this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent && !callbackContext.isRenewProcess) {
                _this.router.navigate([_this.configurationProvider.openIDConfiguration.postLoginRoute]);
            }
        }), catchError(function (error) {
            _this.flowsDataService.resetSilentRenewRunning();
            if (!_this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent /* TODO && !this.isRenewProcess */) {
                _this.router.navigate([_this.configurationProvider.openIDConfiguration.unauthorizedRoute]);
            }
            _this.stopPeriodicallTokenCheck();
            return throwError(error);
        }));
    };
    // Implicit Flow Callback
    CallbackService.prototype.authorizedImplicitFlowCallback = function (hash) {
        var _this = this;
        return this.flowsService.processImplicitFlowCallback(hash).pipe(tap(function (callbackContext) {
            if (!_this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent && !callbackContext.isRenewProcess) {
                _this.router.navigate([_this.configurationProvider.openIDConfiguration.postLoginRoute]);
            }
        }), catchError(function (error) {
            _this.flowsDataService.resetSilentRenewRunning();
            if (!_this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent /* TODO && !this.isRenewProcess */) {
                _this.router.navigate([_this.configurationProvider.openIDConfiguration.unauthorizedRoute]);
            }
            _this.stopPeriodicallTokenCheck();
            return throwError(error);
        }));
    };
    CallbackService.prototype.refreshSessionWithIframe = function () {
        this.loggerService.logDebug('BEGIN refresh session Authorize Iframe renew');
        var url = this.urlService.getRefreshSessionSilentRenewUrl();
        return this.sendAuthorizeReqestUsingSilentRenew(url);
    };
    CallbackService.prototype.refreshSessionWithRefreshTokens = function () {
        var _this = this;
        this.loggerService.logDebug('BEGIN refresh session Authorize');
        return this.flowsService.processRefreshToken().pipe(catchError(function (error) {
            if (!_this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent /* TODO && !this.isRenewProcess */) {
                _this.router.navigate([_this.configurationProvider.openIDConfiguration.unauthorizedRoute]);
            }
            _this.stopPeriodicallTokenCheck();
            _this.flowsService.resetAuthorizationData();
            return throwError(error);
        }));
    };
    CallbackService.prototype.sendAuthorizeReqestUsingSilentRenew = function (url) {
        var _this = this;
        var sessionIframe = this.silentRenewService.getOrCreateIframe();
        this.initSilentRenewRequest();
        this.loggerService.logDebug('sendAuthorizeReqestUsingSilentRenew for URL:' + url);
        return new Observable(function (observer) {
            var onLoadHandler = function () {
                sessionIframe.removeEventListener('load', onLoadHandler);
                _this.loggerService.logDebug('removed event listener from IFrame');
                observer.next(true);
                observer.complete();
            };
            sessionIframe.addEventListener('load', onLoadHandler);
            sessionIframe.src = url;
        });
    };
    CallbackService.prototype.silentRenewEventHandler = function (e) {
        var _this = this;
        this.loggerService.logDebug('silentRenewEventHandler');
        if (!e.detail) {
            return;
        }
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            var urlParts = e.detail.toString().split('?');
            // Code Flow Callback silent renew iframe
            this.codeFlowCallbackSilentRenewIframe(urlParts).subscribe(function () {
                _this.flowsDataService.resetSilentRenewRunning();
            }, function (err) {
                _this.loggerService.logError('Error: ' + err);
                _this.flowsDataService.resetSilentRenewRunning();
            });
        }
        else {
            // Implicit Flow Callback silent renew iframe
            this.authorizedImplicitFlowCallback(e.detail).subscribe(function () {
                _this.flowsDataService.resetSilentRenewRunning();
            }, function (err) {
                _this.loggerService.logError('Error: ' + err);
                _this.flowsDataService.resetSilentRenewRunning();
            });
        }
    };
    CallbackService.prototype.codeFlowCallbackSilentRenewIframe = function (urlParts) {
        var _this = this;
        var params = new HttpParams({
            fromString: urlParts[1],
        });
        var error = params.get('error');
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
        var code = params.get('code');
        var state = params.get('state');
        var sessionState = params.get('session_state');
        var callbackContext = {
            code: code,
            refreshToken: null,
            state: state,
            sessionState: sessionState,
            authResult: null,
            isRenewProcess: false,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return this.flowsService.processSilentRenewCodeFlowCallback(callbackContext).pipe(catchError(function (errorFromFlow) {
            _this.stopPeriodicallTokenCheck();
            _this.flowsService.resetAuthorizationData();
            return throwError(errorFromFlow);
        }));
    };
    CallbackService.prototype.initSilentRenewRequest = function () {
        var _this = this;
        var instanceId = Math.random();
        this.silentRenewService.getOrCreateIframe();
        // Support authorization via DOM events.
        // Deregister if OidcSecurityService.setupModule is called again by any instance.
        //      We only ever want the latest setup service to be reacting to this event.
        this.boundSilentRenewEvent = this.silentRenewEventHandler.bind(this);
        var boundSilentRenewInitEvent = (function (e) {
            if (e.detail !== instanceId) {
                window.removeEventListener('oidc-silent-renew-message', _this.boundSilentRenewEvent);
                window.removeEventListener('oidc-silent-renew-init', boundSilentRenewInitEvent);
            }
        }).bind(this);
        window.addEventListener('oidc-silent-renew-init', boundSilentRenewInitEvent, false);
        window.addEventListener('oidc-silent-renew-message', this.boundSilentRenewEvent, false);
        window.dispatchEvent(new CustomEvent('oidc-silent-renew-init', {
            detail: instanceId,
        }));
    };
    CallbackService.ctorParameters = function () { return [
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
    ]; };
    CallbackService.ɵprov = ɵɵdefineInjectable({ factory: function CallbackService_Factory() { return new CallbackService(ɵɵinject(UrlService), ɵɵinject(FlowsService), ɵɵinject(FlowHelper), ɵɵinject(ConfigurationProvider), ɵɵinject(Router), ɵɵinject(FlowsDataService), ɵɵinject(LoggerService), ɵɵinject(SilentRenewService), ɵɵinject(UserService), ɵɵinject(AuthStateService)); }, token: CallbackService, providedIn: "root" });
    CallbackService = __decorate([
        Injectable({ providedIn: 'root' })
    ], CallbackService);
    return CallbackService;
}());

var OidcSecurityService = /** @class */ (function () {
    function OidcSecurityService(checkSessionService, silentRenewService, userService, tokenValidationService, tokenHelperService, loggerService, configurationProvider, urlService, authStateService, flowsDataService, flowsService, callbackService, logoffRevocationService, redirectService) {
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
    Object.defineProperty(OidcSecurityService.prototype, "configuration", {
        get: function () {
            return this.configurationProvider.configuration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OidcSecurityService.prototype, "userData$", {
        get: function () {
            return this.userService.userData$;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OidcSecurityService.prototype, "isAuthenticated$", {
        get: function () {
            return this.authStateService.authorized$;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OidcSecurityService.prototype, "checkSessionChanged$", {
        get: function () {
            return this.checkSessionService.checkSessionChanged$;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OidcSecurityService.prototype, "stsCallback$", {
        get: function () {
            return this.callbackService.stsCallback$;
        },
        enumerable: true,
        configurable: true
    });
    OidcSecurityService.prototype.checkAuth = function () {
        var _this = this;
        if (!this.configurationProvider.hasValidConfig()) {
            this.loggerService.logError('Please provide a configuration before setting up the module');
            return of(false);
        }
        this.loggerService.logDebug('STS server: ' + this.configurationProvider.openIDConfiguration.stsServer);
        var currentUrl = window.location.toString();
        return this.callbackService.handlePossibleStsCallback(currentUrl).pipe(map(function () {
            var isAuthenticated = _this.authStateService.areAuthStorageTokensValid();
            if (isAuthenticated) {
                _this.authStateService.setAuthorizedAndFireEvent();
                _this.userService.publishUserdataIfExists();
                if (_this.checkSessionService.isCheckSessionConfigured()) {
                    _this.checkSessionService.start();
                }
                _this.callbackService.startTokenValidationPeriodically(_this.TOKEN_REFRESH_INTERVALL_IN_SECONDS);
                if (_this.silentRenewService.isSilentRenewConfigured()) {
                    _this.silentRenewService.getOrCreateIframe();
                }
            }
            _this.loggerService.logDebug('checkAuth completed fire events, auth: ' + isAuthenticated);
            return isAuthenticated;
        }));
    };
    OidcSecurityService.prototype.getToken = function () {
        return this.authStateService.getAccessToken();
    };
    OidcSecurityService.prototype.getIdToken = function () {
        return this.authStateService.getIdToken();
    };
    OidcSecurityService.prototype.getRefreshToken = function () {
        return this.authStateService.getRefreshToken();
    };
    OidcSecurityService.prototype.getPayloadFromIdToken = function (encode) {
        if (encode === void 0) { encode = false; }
        var token = this.getIdToken();
        return this.tokenHelperService.getPayloadFromToken(token, encode);
    };
    OidcSecurityService.prototype.setState = function (state) {
        this.flowsDataService.setAuthStateControl(state);
    };
    OidcSecurityService.prototype.getState = function () {
        return this.flowsDataService.getAuthStateControl();
    };
    // Code Flow with PCKE or Implicit Flow
    OidcSecurityService.prototype.authorize = function (authOptions) {
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
        var _a = authOptions || {}, urlHandler = _a.urlHandler, customParams = _a.customParams;
        var url = this.urlService.getAuthorizeUrl(customParams);
        if (urlHandler) {
            urlHandler(url);
        }
        else {
            this.redirectService.redirectTo(url);
        }
    };
    // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
    // only the access token is revoked. Then the logout run.
    OidcSecurityService.prototype.logoffAndRevokeTokens = function (urlHandler) {
        return this.logoffRevocationService.logoffAndRevokeTokens(urlHandler);
    };
    // Logs out on the server and the local client.
    // If the server state has changed, checksession, then only a local logout.
    OidcSecurityService.prototype.logoff = function (urlHandler) {
        return this.logoffRevocationService.logoff(urlHandler);
    };
    OidcSecurityService.prototype.logoffLocal = function () {
        return this.logoffRevocationService.logoffLocal();
    };
    // https://tools.ietf.org/html/rfc7009
    // revokes an access token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    OidcSecurityService.prototype.revokeAccessToken = function (accessToken) {
        return this.logoffRevocationService.revokeAccessToken(accessToken);
    };
    // https://tools.ietf.org/html/rfc7009
    // revokes a refresh token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    OidcSecurityService.prototype.revokeRefreshToken = function (refreshToken) {
        return this.logoffRevocationService.revokeRefreshToken(refreshToken);
    };
    OidcSecurityService.prototype.getEndSessionUrl = function () {
        return this.logoffRevocationService.getEndSessionUrl();
    };
    OidcSecurityService.ctorParameters = function () { return [
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
    ]; };
    OidcSecurityService = __decorate([
        Injectable()
    ], OidcSecurityService);
    return OidcSecurityService;
}());

var BrowserStorageService = /** @class */ (function () {
    function BrowserStorageService(configProvider, loggerService) {
        this.configProvider = configProvider;
        this.loggerService = loggerService;
    }
    BrowserStorageService.prototype.read = function (key) {
        var _a;
        if (!this.hasStorage()) {
            this.loggerService.logDebug("Wanted to read '" + key + "' but Storage was undefined");
            return false;
        }
        var item = (_a = this.getStorage()) === null || _a === void 0 ? void 0 : _a.getItem(key);
        if (!item) {
            this.loggerService.logDebug("Wanted to read '" + key + "' but nothing was found");
            return false;
        }
        return JSON.parse(item);
    };
    BrowserStorageService.prototype.write = function (key, value) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug("Wanted to write '" + key + "/" + value + "' but Storage was falsy");
            return false;
        }
        var storage = this.getStorage();
        if (!storage) {
            this.loggerService.logDebug("Wanted to write '" + key + "/" + value + "' but Storage was falsy");
            return false;
        }
        value = value || null;
        storage.setItem("" + key, JSON.stringify(value));
        return true;
    };
    BrowserStorageService.prototype.getStorage = function () {
        var _a;
        return (_a = this.configProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.storage;
    };
    BrowserStorageService.prototype.hasStorage = function () {
        return typeof Storage !== 'undefined';
    };
    BrowserStorageService.ctorParameters = function () { return [
        { type: ConfigurationProvider },
        { type: LoggerService }
    ]; };
    BrowserStorageService = __decorate([
        Injectable()
    ], BrowserStorageService);
    return BrowserStorageService;
}());

var EqualityService = /** @class */ (function () {
    function EqualityService() {
    }
    EqualityService.prototype.areEqual = function (value1, value2) {
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
    };
    EqualityService.prototype.oneValueIsStringAndTheOtherIsArray = function (value1, value2) {
        return (Array.isArray(value1) && this.valueIsString(value2)) || (Array.isArray(value2) && this.valueIsString(value1));
    };
    EqualityService.prototype.bothValuesAreObjects = function (value1, value2) {
        return this.valueIsObject(value1) && this.valueIsObject(value2);
    };
    EqualityService.prototype.bothValuesAreStrings = function (value1, value2) {
        return this.valueIsString(value1) && this.valueIsString(value2);
    };
    EqualityService.prototype.bothValuesAreArrays = function (value1, value2) {
        return Array.isArray(value1) && Array.isArray(value2);
    };
    EqualityService.prototype.valueIsString = function (value) {
        return typeof value === 'string' || value instanceof String;
    };
    EqualityService.prototype.valueIsObject = function (value) {
        return typeof value === 'object';
    };
    EqualityService.prototype.arraysEqual = function (arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (var i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    };
    EqualityService = __decorate([
        Injectable()
    ], EqualityService);
    return EqualityService;
}());

var AuthModule = /** @class */ (function () {
    function AuthModule() {
    }
    AuthModule_1 = AuthModule;
    AuthModule.forRoot = function (token) {
        if (token === void 0) { token = {}; }
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
    };
    var AuthModule_1;
    AuthModule = AuthModule_1 = __decorate([
        NgModule({
            imports: [CommonModule],
            declarations: [],
            exports: [],
        })
    ], AuthModule);
    return AuthModule;
}());

var JwtKeys = /** @class */ (function () {
    function JwtKeys() {
        this.keys = [];
    }
    return JwtKeys;
}());
var JwtKey = /** @class */ (function () {
    function JwtKey() {
        this.kty = '';
        this.use = '';
        this.kid = '';
        this.x5t = '';
        this.e = '';
        this.n = '';
        this.x5c = [];
    }
    return JwtKey;
}());

// Public classes.

/*
 * Public API Surface of angular-auth-oidc-client
 */

/**
 * Generated bundle index. Do not edit.
 */

export { AbstractSecurityStorage, AuthModule, AuthorizedState, EventTypes, JwtKey, JwtKeys, LogLevel, LoggerService, OidcConfigService, OidcSecurityService, PublicEventsService, StateValidationResult, TokenHelperService, TokenValidationService, ValidationResult, ConfigurationProvider as ɵa, PlatformProvider as ɵb, DataService as ɵc, HttpBaseService as ɵd, FlowHelper as ɵe, CheckSessionService as ɵf, StoragePersistanceService as ɵg, IFrameService as ɵh, SilentRenewService as ɵi, UserService as ɵj, UrlService as ɵk, _window as ɵl, WINDOW as ɵm, FlowsDataService as ɵn, RandomService as ɵo, AuthStateService as ɵp, FlowsService as ɵq, SigninKeyDataService as ɵr, StateValidationService as ɵs, CallbackService as ɵt, LogoffRevocationService as ɵu, RedirectService as ɵv, EqualityService as ɵw, BrowserStorageService as ɵx };
//# sourceMappingURL=angular-auth-oidc-client.js.map
