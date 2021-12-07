var TokenValidationService_1;
import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { hextob64u, KEYUTIL, KJUR } from 'jsrsasign-reduced';
import { LoggerService } from '../logging/logger.service';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { TokenHelperService } from '../utils/tokenHelper/oidc-token-helper.service';
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
export { TokenValidationService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tdmFsaWRhdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL3ZhbGlkYXRpb24vdG9rZW4tdmFsaWRhdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBRXBGLDJEQUEyRDtBQUUzRCxXQUFXO0FBQ1gsNEdBQTRHO0FBQzVHLDBEQUEwRDtBQUMxRCxFQUFFO0FBQ0YsdUlBQXVJO0FBQ3ZJLHVJQUF1STtBQUN2SSxvRUFBb0U7QUFDcEUsRUFBRTtBQUNGLG1IQUFtSDtBQUNuSCxFQUFFO0FBQ0YsOEhBQThIO0FBQzlILEVBQUU7QUFDRixrSUFBa0k7QUFDbEksK0ZBQStGO0FBQy9GLEVBQUU7QUFDRixxSUFBcUk7QUFDckksV0FBVztBQUNYLCtCQUErQjtBQUMvQixFQUFFO0FBQ0YseUlBQXlJO0FBQ3pJLG1CQUFtQjtBQUNuQixFQUFFO0FBQ0YsK0dBQStHO0FBQy9HLHdIQUF3SDtBQUN4SCxFQUFFO0FBQ0YseUhBQXlIO0FBQ3pILDJJQUEySTtBQUMzSSxzQkFBc0I7QUFDdEIsRUFBRTtBQUNGLHNIQUFzSDtBQUN0SCxvRkFBb0Y7QUFDcEYsRUFBRTtBQUNGLGlJQUFpSTtBQUNqSSxzRkFBc0Y7QUFFdEYsMEJBQTBCO0FBQzFCLGlJQUFpSTtBQUNqSSxxSUFBcUk7QUFDckksa0ZBQWtGO0FBQ2xGLGlJQUFpSTtBQUNq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QUFDLFlBQVksQ0FBQyxDQUFDO1FBRXpDLE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxhQUFrQjtRQUNuQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqQyxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0NBQ0osQ0FBQTtBQWxZVSxtREFBNEIsR0FBRyxrQkFBa0IsQ0FBQzs7WUFFakIsa0JBQWtCO1lBQXNCLFVBQVU7WUFBeUIsYUFBYTs7QUFIdkgsc0JBQXNCO0lBRGxDLFVBQVUsRUFBRTtHQUNBLHNCQUFzQixDQW1ZbEM7U0FuWVksc0JBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgaGV4dG9iNjR1LCBLRVlVVElMLCBLSlVSIH0gZnJvbSAnanNyc2FzaWduLXJlZHVjZWQnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XG5pbXBvcnQgeyBUb2tlbkhlbHBlclNlcnZpY2UgfSBmcm9tICcuLi91dGlscy90b2tlbkhlbHBlci9vaWRjLXRva2VuLWhlbHBlci5zZXJ2aWNlJztcblxuLy8gaHR0cDovL29wZW5pZC5uZXQvc3BlY3Mvb3BlbmlkLWNvbm5lY3QtaW1wbGljaXQtMV8wLmh0bWxcblxuLy8gaWRfdG9rZW5cbi8vIGlkX3Rva2VuIEMxOiBUaGUgSXNzdWVyIElkZW50aWZpZXIgZm9yIHRoZSBPcGVuSUQgUHJvdmlkZXIgKHdoaWNoIGlzIHR5cGljYWxseSBvYnRhaW5lZCBkdXJpbmcgRGlzY292ZXJ5KVxuLy8gTVVTVCBleGFjdGx5IG1hdGNoIHRoZSB2YWx1ZSBvZiB0aGUgaXNzIChpc3N1ZXIpIENsYWltLlxuLy9cbi8vIGlkX3Rva2VuIEMyOiBUaGUgQ2xpZW50IE1VU1QgdmFsaWRhdGUgdGhhdCB0aGUgYXVkIChhdWRpZW5jZSkgQ2xhaW0gY29udGFpbnMgaXRzIGNsaWVudF9pZCB2YWx1ZSByZWdpc3RlcmVkIGF0IHRoZSBJc3N1ZXIgaWRlbnRpZmllZFxuLy8gYnkgdGhlIGlzcyAoaXNzdWVyKSBDbGFpbSBhcyBhbiBhdWRpZW5jZS5UaGUgSUQgVG9rZW4gTVVTVCBiZSByZWplY3RlZCBpZiB0aGUgSUQgVG9rZW4gZG9lcyBub3QgbGlzdCB0aGUgQ2xpZW50IGFzIGEgdmFsaWQgYXVkaWVuY2UsXG4vLyBvciBpZiBpdCBjb250YWlucyBhZGRpdGlvbmFsIGF1ZGllbmNlcyBub3QgdHJ1c3RlZCBieSB0aGUgQ2xpZW50LlxuLy9cbi8vIGlkX3Rva2VuIEMzOiBJZiB0aGUgSUQgVG9rZW4gY29udGFpbnMgbXVsdGlwbGUgYXVkaWVuY2VzLCB0aGUgQ2xpZW50IFNIT1VMRCB2ZXJpZnkgdGhhdCBhbiBhenAgQ2xhaW0gaXMgcHJlc2VudC5cbi8vXG4vLyBpZF90b2tlbiBDNDogSWYgYW4gYXpwIChhdXRob3JpemVkIHBhcnR5KSBDbGFpbSBpcyBwcmVzZW50LCB0aGUgQ2xpZW50IFNIT1VMRCB2ZXJpZnkgdGhhdCBpdHMgY2xpZW50X2lkIGlzIHRoZSBDbGFpbSBWYWx1ZS5cbi8vXG4vLyBpZF90b2tlbiBDNTogVGhlIENsaWVudCBNVVNUIHZhbGlkYXRlIHRoZSBzaWduYXR1cmUgb2YgdGhlIElEIFRva2VuIGFjY29yZGluZyB0byBKV1MgW0pXU10gdXNpbmcgdGhlIGFsZ29yaXRobSBzcGVjaWZpZWQgaW4gdGhlXG4vLyBhbGcgSGVhZGVyIFBhcmFtZXRlciBvZiB0aGUgSk9TRSBIZWFkZXIuVGhlIENsaWVudCBNVVNUIHVzZSB0aGUga2V5cyBwcm92aWRlZCBieSB0aGUgSXNzdWVyLlxuLy9cbi8vIGlkX3Rva2VuIEM2OiBUaGUgYWxnIHZhbHVlIFNIT1VMRCBiZSBSUzI1Ni4gVmFsaWRhdGlvbiBvZiB0b2tlbnMgdXNpbmcgb3RoZXIgc2lnbmluZyBhbGdvcml0aG1zIGlzIGRlc2NyaWJlZCBpbiB0aGUgT3BlbklEIENvbm5lY3Rcbi8vIENvcmUgMS4wXG4vLyBbT3BlbklELkNvcmVdIHNwZWNpZmljYXRpb24uXG4vL1xuLy8gaWRfdG9rZW4gQzc6IFRoZSBjdXJyZW50IHRpbWUgTVVTVCBiZSBiZWZvcmUgdGhlIHRpbWUgcmVwcmVzZW50ZWQgYnkgdGhlIGV4cCBDbGFpbSAocG9zc2libHkgYWxsb3dpbmcgZm9yIHNvbWUgc21hbGwgbGVld2F5IHRvIGFjY291bnRcbi8vIGZvciBjbG9jayBza2V3KS5cbi8vXG4vLyBpZF90b2tlbiBDODogVGhlIGlhdCBDbGFpbSBjYW4gYmUgdXNlZCB0byByZWplY3QgdG9rZW5zIHRoYXQgd2VyZSBpc3N1ZWQgdG9vIGZhciBhd2F5IGZyb20gdGhlIGN1cnJlbnQgdGltZSxcbi8vIGxpbWl0aW5nIHRoZSBhbW91bnQgb2YgdGltZSB0aGF0IG5vbmNlcyBuZWVkIHRvIGJlIHN0b3JlZCB0byBwcmV2ZW50IGF0dGFja3MuVGhlIGFjY2VwdGFibGUgcmFuZ2UgaXMgQ2xpZW50IHNwZWNpZmljLlxuLy9cbi8vIGlkX3Rva2VuIEM5OiBUaGUgdmFsdWUgb2YgdGhlIG5vbmNlIENsYWltIE1VU1QgYmUgY2hlY2tlZCB0byB2ZXJpZnkgdGhhdCBpdCBpcyB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgb25lIHRoYXQgd2FzIHNlbnRcbi8vIGluIHRoZSBBdXRoZW50aWNhdGlvbiBSZXF1ZXN0LlRoZSBDbGllbnQgU0hPVUxEIGNoZWNrIHRoZSBub25jZSB2YWx1ZSBmb3IgcmVwbGF5IGF0dGFja3MuVGhlIHByZWNpc2UgbWV0aG9kIGZvciBkZXRlY3RpbmcgcmVwbGF5IGF0dGFja3Ncbi8vIGlzIENsaWVudCBzcGVjaWZpYy5cbi8vXG4vLyBpZF90b2tlbiBDMTA6IElmIHRoZSBhY3IgQ2xhaW0gd2FzIHJlcXVlc3RlZCwgdGhlIENsaWVudCBTSE9VTEQgY2hlY2sgdGhhdCB0aGUgYXNzZXJ0ZWQgQ2xhaW0gVmFsdWUgaXMgYXBwcm9wcmlhdGUuXG4vLyBUaGUgbWVhbmluZyBhbmQgcHJvY2Vzc2luZyBvZiBhY3IgQ2xhaW0gVmFsdWVzIGlzIG91dCBvZiBzY29wZSBmb3IgdGhpcyBkb2N1bWVudC5cbi8vXG4vLyBpZF90b2tlbiBDMTE6IFdoZW4gYSBtYXhfYWdlIHJlcXVlc3QgaXMgbWFkZSwgdGhlIENsaWVudCBTSE9VTEQgY2hlY2sgdGhlIGF1dGhfdGltZSBDbGFpbSB2YWx1ZSBhbmQgcmVxdWVzdCByZS0gYXV0aGVudGljYXRpb25cbi8vIGlmIGl0IGRldGVybWluZXMgdG9vIG11Y2ggdGltZSBoYXMgZWxhcHNlZCBzaW5jZSB0aGUgbGFzdCBFbmQtIFVzZXIgYXV0aGVudGljYXRpb24uXG5cbi8vIEFjY2VzcyBUb2tlbiBWYWxpZGF0aW9uXG4vLyBhY2Nlc3NfdG9rZW4gQzE6IEhhc2ggdGhlIG9jdGV0cyBvZiB0aGUgQVNDSUkgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFjY2Vzc190b2tlbiB3aXRoIHRoZSBoYXNoIGFsZ29yaXRobSBzcGVjaWZpZWQgaW4gSldBW0pXQV1cbi8vIGZvciB0aGUgYWxnIEhlYWRlciBQYXJhbWV0ZXIgb2YgdGhlIElEIFRva2VuJ3MgSk9TRSBIZWFkZXIuIEZvciBpbnN0YW5jZSwgaWYgdGhlIGFsZyBpcyBSUzI1NiwgdGhlIGhhc2ggYWxnb3JpdGhtIHVzZWQgaXMgU0hBLTI1Ni5cbi8vIGFjY2Vzc190b2tlbiBDMjogVGFrZSB0aGUgbGVmdC0gbW9zdCBoYWxmIG9mIHRoZSBoYXNoIGFuZCBiYXNlNjR1cmwtIGVuY29kZSBpdC5cbi8vIGFjY2Vzc190b2tlbiBDMzogVGhlIHZhbHVlIG9mIGF0X2hhc2ggaW4gdGhlIElEIFRva2VuIE1VU1QgbWF0Y2ggdGhlIHZhbHVlIHByb2R1Y2VkIGluIHRoZSBwcmV2aW91cyBzdGVwIGlmIGF0X2hhc2ggaXMgcHJlc2VudFxuLy8gaW4gdGhlIElEIFRva2VuLlxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVG9rZW5WYWxpZGF0aW9uU2VydmljZSB7XG4gICAgc3RhdGljIFJlZnJlc2hUb2tlbk5vbmNlUGxhY2Vob2xkZXIgPSAnLS1SZWZyZXNoVG9rZW4tLSc7XG4gICAga2V5QWxnb3JpdGhtczogc3RyaW5nW10gPSBbJ0hTMjU2JywgJ0hTMzg0JywgJ0hTNTEyJywgJ1JTMjU2JywgJ1JTMzg0JywgJ1JTNTEyJywgJ0VTMjU2JywgJ0VTMzg0JywgJ1BTMjU2JywgJ1BTMzg0JywgJ1BTNTEyJ107XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSB0b2tlbkhlbHBlclNlcnZpY2U6IFRva2VuSGVscGVyU2VydmljZSwgcHJpdmF0ZSBmbG93SGVscGVyOiBGbG93SGVscGVyLCBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UpIHsgfVxuXG4gICAgLy8gaWRfdG9rZW4gQzc6IFRoZSBjdXJyZW50IHRpbWUgTVVTVCBiZSBiZWZvcmUgdGhlIHRpbWUgcmVwcmVzZW50ZWQgYnkgdGhlIGV4cCBDbGFpbVxuICAgIC8vIChwb3NzaWJseSBhbGxvd2luZyBmb3Igc29tZSBzbWFsbCBsZWV3YXkgdG8gYWNjb3VudCBmb3IgY2xvY2sgc2tldykuXG4gICAgaGFzSWRUb2tlbkV4cGlyZWQodG9rZW46IHN0cmluZywgb2Zmc2V0U2Vjb25kcz86IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgZGVjb2RlZDogYW55O1xuICAgICAgICBkZWNvZGVkID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0UGF5bG9hZEZyb21Ub2tlbih0b2tlbiwgZmFsc2UpO1xuXG4gICAgICAgIHJldHVybiAhdGhpcy52YWxpZGF0ZUlkVG9rZW5FeHBOb3RFeHBpcmVkKGRlY29kZWQsIG9mZnNldFNlY29uZHMpO1xuICAgIH1cblxuICAgIC8vIGlkX3Rva2VuIEM3OiBUaGUgY3VycmVudCB0aW1lIE1VU1QgYmUgYmVmb3JlIHRoZSB0aW1lIHJlcHJlc2VudGVkIGJ5IHRoZSBleHAgQ2xhaW1cbiAgICAvLyAocG9zc2libHkgYWxsb3dpbmcgZm9yIHNvbWUgc21hbGwgbGVld2F5IHRvIGFjY291bnQgZm9yIGNsb2NrIHNrZXcpLlxuICAgIHZhbGlkYXRlSWRUb2tlbkV4cE5vdEV4cGlyZWQoZGVjb2RlZElkVG9rZW46IHN0cmluZywgb2Zmc2V0U2Vjb25kcz86IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCB0b2tlbkV4cGlyYXRpb25EYXRlID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0VG9rZW5FeHBpcmF0aW9uRGF0ZShkZWNvZGVkSWRUb2tlbik7XG4gICAgICAgIG9mZnNldFNlY29uZHMgPSBvZmZzZXRTZWNvbmRzIHx8IDA7XG5cbiAgICAgICAgaWYgKCF0b2tlbkV4cGlyYXRpb25EYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b2tlbkV4cGlyYXRpb25WYWx1ZSA9IHRva2VuRXhwaXJhdGlvbkRhdGUudmFsdWVPZigpO1xuICAgICAgICBjb25zdCBub3dXaXRoT2Zmc2V0ID0gbmV3IERhdGUoKS52YWx1ZU9mKCkgKyBvZmZzZXRTZWNvbmRzICogMTAwMDtcbiAgICAgICAgY29uc3QgdG9rZW5Ob3RFeHBpcmVkID0gdG9rZW5FeHBpcmF0aW9uVmFsdWUgPiBub3dXaXRoT2Zmc2V0O1xuXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgSGFzIGlkX3Rva2VuIGV4cGlyZWQ6ICR7IXRva2VuTm90RXhwaXJlZH0sICR7dG9rZW5FeHBpcmF0aW9uVmFsdWV9ID4gJHtub3dXaXRoT2Zmc2V0fWApO1xuXG4gICAgICAgIC8vIFRva2VuIG5vdCBleHBpcmVkP1xuICAgICAgICByZXR1cm4gdG9rZW5Ob3RFeHBpcmVkO1xuICAgIH1cblxuICAgIHZhbGlkYXRlQWNjZXNzVG9rZW5Ob3RFeHBpcmVkKGFjY2Vzc1Rva2VuRXhwaXJlc0F0OiBEYXRlLCBvZmZzZXRTZWNvbmRzPzogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIHZhbHVlIGlzIG9wdGlvbmFsLCBzbyBpZiBpdCBkb2VzIG5vdCBleGlzdCwgdGhlbiBpdCBoYXMgbm90IGV4cGlyZWRcbiAgICAgICAgaWYgKCFhY2Nlc3NUb2tlbkV4cGlyZXNBdCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBvZmZzZXRTZWNvbmRzID0gb2Zmc2V0U2Vjb25kcyB8fCAwO1xuICAgICAgICBjb25zdCBhY2Nlc3NUb2tlbkV4cGlyYXRpb25WYWx1ZSA9IGFjY2Vzc1Rva2VuRXhwaXJlc0F0LnZhbHVlT2YoKTtcbiAgICAgICAgY29uc3Qgbm93V2l0aE9mZnNldCA9IG5ldyBEYXRlKCkudmFsdWVPZigpICsgb2Zmc2V0U2Vjb25kcyAqIDEwMDA7XG4gICAgICAgIGNvbnN0IHRva2VuTm90RXhwaXJlZCA9IGFjY2Vzc1Rva2VuRXhwaXJhdGlvblZhbHVlID4gbm93V2l0aE9mZnNldDtcblxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYEhhcyBhY2Nlc3NfdG9rZW4gZXhwaXJlZDogJHshdG9rZW5Ob3RFeHBpcmVkfSwgJHthY2Nlc3NUb2tlbkV4cGlyYXRpb25WYWx1ZX0gPiAke25vd1dpdGhPZmZzZXR9YCk7XG5cbiAgICAgICAgLy8gYWNjZXNzIHRva2VuIG5vdCBleHBpcmVkP1xuICAgICAgICByZXR1cm4gdG9rZW5Ob3RFeHBpcmVkO1xuICAgIH1cblxuICAgIC8vIGlzc1xuICAgIC8vIFJFUVVJUkVELiBJc3N1ZXIgSWRlbnRpZmllciBmb3IgdGhlIElzc3VlciBvZiB0aGUgcmVzcG9uc2UuVGhlIGlzcyB2YWx1ZSBpcyBhIGNhc2Utc2Vuc2l0aXZlIFVSTCB1c2luZyB0aGVcbiAgICAvLyBodHRwcyBzY2hlbWUgdGhhdCBjb250YWlucyBzY2hlbWUsIGhvc3QsXG4gICAgLy8gYW5kIG9wdGlvbmFsbHksIHBvcnQgbnVtYmVyIGFuZCBwYXRoIGNvbXBvbmVudHMgYW5kIG5vIHF1ZXJ5IG9yIGZyYWdtZW50IGNvbXBvbmVudHMuXG4gICAgLy9cbiAgICAvLyBzdWJcbiAgICAvLyBSRVFVSVJFRC4gU3ViamVjdCBJZGVudGlmaWVyLkxvY2FsbHkgdW5pcXVlIGFuZCBuZXZlciByZWFzc2lnbmVkIGlkZW50aWZpZXIgd2l0aGluIHRoZSBJc3N1ZXIgZm9yIHRoZSBFbmQtIFVzZXIsXG4gICAgLy8gd2hpY2ggaXMgaW50ZW5kZWQgdG8gYmUgY29uc3VtZWQgYnkgdGhlIENsaWVudCwgZS5nLiwgMjQ0MDAzMjAgb3IgQUl0T2F3bXd0V3djVDBrNTFCYXlld052dXRySlVxc3ZsNnFzN0E0LlxuICAgIC8vIEl0IE1VU1QgTk9UIGV4Y2VlZCAyNTUgQVNDSUkgY2hhcmFjdGVycyBpbiBsZW5ndGguVGhlIHN1YiB2YWx1ZSBpcyBhIGNhc2Utc2Vuc2l0aXZlIHN0cmluZy5cbiAgICAvL1xuICAgIC8vIGF1ZFxuICAgIC8vIFJFUVVJUkVELiBBdWRpZW5jZShzKSB0aGF0IHRoaXMgSUQgVG9rZW4gaXMgaW50ZW5kZWQgZm9yLiBJdCBNVVNUIGNvbnRhaW4gdGhlIE9BdXRoIDIuMCBjbGllbnRfaWQgb2YgdGhlIFJlbHlpbmcgUGFydHkgYXMgYW5cbiAgICAvLyBhdWRpZW5jZSB2YWx1ZS5cbiAgICAvLyBJdCBNQVkgYWxzbyBjb250YWluIGlkZW50aWZpZXJzIGZvciBvdGhlciBhdWRpZW5jZXMuSW4gdGhlIGdlbmVyYWwgY2FzZSwgdGhlIGF1ZCB2YWx1ZSBpcyBhbiBhcnJheSBvZiBjYXNlLXNlbnNpdGl2ZSBzdHJpbmdzLlxuICAgIC8vIEluIHRoZSBjb21tb24gc3BlY2lhbCBjYXNlIHdoZW4gdGhlcmUgaXMgb25lIGF1ZGllbmNlLCB0aGUgYXVkIHZhbHVlIE1BWSBiZSBhIHNpbmdsZSBjYXNlLXNlbnNpdGl2ZSBzdHJpbmcuXG4gICAgLy9cbiAgICAvLyBleHBcbiAgICAvLyBSRVFVSVJFRC4gRXhwaXJhdGlvbiB0aW1lIG9uIG9yIGFmdGVyIHdoaWNoIHRoZSBJRCBUb2tlbiBNVVNUIE5PVCBiZSBhY2NlcHRlZCBmb3IgcHJvY2Vzc2luZy5cbiAgICAvLyBUaGUgcHJvY2Vzc2luZyBvZiB0aGlzIHBhcmFtZXRlciByZXF1aXJlcyB0aGF0IHRoZSBjdXJyZW50IGRhdGUvIHRpbWUgTVVTVCBiZSBiZWZvcmUgdGhlIGV4cGlyYXRpb24gZGF0ZS8gdGltZSBsaXN0ZWQgaW4gdGhlIHZhbHVlLlxuICAgIC8vIEltcGxlbWVudGVycyBNQVkgcHJvdmlkZSBmb3Igc29tZSBzbWFsbCBsZWV3YXksIHVzdWFsbHkgbm8gbW9yZSB0aGFuIGEgZmV3IG1pbnV0ZXMsIHRvIGFjY291bnQgZm9yIGNsb2NrIHNrZXcuXG4gICAgLy8gSXRzIHZhbHVlIGlzIGEgSlNPTiBbUkZDNzE1OV0gbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgbnVtYmVyIG9mIHNlY29uZHMgZnJvbSAxOTcwLSAwMSAtIDAxVDAwOiAwMDowMFogYXMgbWVhc3VyZWQgaW4gVVRDIHVudGlsXG4gICAgLy8gdGhlIGRhdGUvIHRpbWUuXG4gICAgLy8gU2VlIFJGQyAzMzM5IFtSRkMzMzM5XSBmb3IgZGV0YWlscyByZWdhcmRpbmcgZGF0ZS8gdGltZXMgaW4gZ2VuZXJhbCBhbmQgVVRDIGluIHBhcnRpY3VsYXIuXG4gICAgLy9cbiAgICAvLyBpYXRcbiAgICAvLyBSRVFVSVJFRC4gVGltZSBhdCB3aGljaCB0aGUgSldUIHdhcyBpc3N1ZWQuIEl0cyB2YWx1ZSBpcyBhIEpTT04gbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgbnVtYmVyIG9mIHNlY29uZHMgZnJvbVxuICAgIC8vIDE5NzAtIDAxIC0gMDFUMDA6IDAwOiAwMFogYXMgbWVhc3VyZWRcbiAgICAvLyBpbiBVVEMgdW50aWwgdGhlIGRhdGUvIHRpbWUuXG4gICAgdmFsaWRhdGVSZXF1aXJlZElkVG9rZW4oZGF0YUlkVG9rZW46IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgdmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKCFkYXRhSWRUb2tlbi5oYXNPd25Qcm9wZXJ0eSgnaXNzJykpIHtcbiAgICAgICAgICAgIHZhbGlkYXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2lzcyBpcyBtaXNzaW5nLCB0aGlzIGlzIHJlcXVpcmVkIGluIHRoZSBpZF90b2tlbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFkYXRhSWRUb2tlbi5oYXNPd25Qcm9wZXJ0eSgnc3ViJykpIHtcbiAgICAgICAgICAgIHZhbGlkYXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ3N1YiBpcyBtaXNzaW5nLCB0aGlzIGlzIHJlcXVpcmVkIGluIHRoZSBpZF90b2tlbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFkYXRhSWRUb2tlbi5oYXNPd25Qcm9wZXJ0eSgnYXVkJykpIHtcbiAgICAgICAgICAgIHZhbGlkYXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1ZCBpcyBtaXNzaW5nLCB0aGlzIGlzIHJlcXVpcmVkIGluIHRoZSBpZF90b2tlbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFkYXRhSWRUb2tlbi5oYXNPd25Qcm9wZXJ0eSgnZXhwJykpIHtcbiAgICAgICAgICAgIHZhbGlkYXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2V4cCBpcyBtaXNzaW5nLCB0aGlzIGlzIHJlcXVpcmVkIGluIHRoZSBpZF90b2tlbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFkYXRhSWRUb2tlbi5oYXNPd25Qcm9wZXJ0eSgnaWF0JykpIHtcbiAgICAgICAgICAgIHZhbGlkYXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2lhdCBpcyBtaXNzaW5nLCB0aGlzIGlzIHJlcXVpcmVkIGluIHRoZSBpZF90b2tlbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbGlkYXRlZDtcbiAgICB9XG5cbiAgICAvLyBpZF90b2tlbiBDODogVGhlIGlhdCBDbGFpbSBjYW4gYmUgdXNlZCB0byByZWplY3QgdG9rZW5zIHRoYXQgd2VyZSBpc3N1ZWQgdG9vIGZhciBhd2F5IGZyb20gdGhlIGN1cnJlbnQgdGltZSxcbiAgICAvLyBsaW1pdGluZyB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCBub25jZXMgbmVlZCB0byBiZSBzdG9yZWQgdG8gcHJldmVudCBhdHRhY2tzLlRoZSBhY2NlcHRhYmxlIHJhbmdlIGlzIENsaWVudCBzcGVjaWZpYy5cbiAgICB2YWxpZGF0ZUlkVG9rZW5JYXRNYXhPZmZzZXQoZGF0YUlkVG9rZW46IGFueSwgbWF4T2Zmc2V0QWxsb3dlZEluU2Vjb25kczogbnVtYmVyLCBkaXNhYmxlSWF0T2Zmc2V0VmFsaWRhdGlvbjogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoZGlzYWJsZUlhdE9mZnNldFZhbGlkYXRpb24pIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFkYXRhSWRUb2tlbi5oYXNPd25Qcm9wZXJ0eSgnaWF0JykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRhdGVUaW1lSWF0SWRUb2tlbiA9IG5ldyBEYXRlKDApOyAvLyBUaGUgMCBoZXJlIGlzIHRoZSBrZXksIHdoaWNoIHNldHMgdGhlIGRhdGUgdG8gdGhlIGVwb2NoXG4gICAgICAgIGRhdGVUaW1lSWF0SWRUb2tlbi5zZXRVVENTZWNvbmRzKGRhdGFJZFRva2VuLmlhdCk7XG5cbiAgICAgICAgbWF4T2Zmc2V0QWxsb3dlZEluU2Vjb25kcyA9IG1heE9mZnNldEFsbG93ZWRJblNlY29uZHMgfHwgMDtcblxuICAgICAgICBpZiAoZGF0ZVRpbWVJYXRJZFRva2VuID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcbiAgICAgICAgICAgICd2YWxpZGF0ZV9pZF90b2tlbl9pYXRfbWF4X29mZnNldDogJyArXG4gICAgICAgICAgICAobmV3IERhdGUoKS52YWx1ZU9mKCkgLSBkYXRlVGltZUlhdElkVG9rZW4udmFsdWVPZigpKSArXG4gICAgICAgICAgICAnIDwgJyArXG4gICAgICAgICAgICBtYXhPZmZzZXRBbGxvd2VkSW5TZWNvbmRzICogMTAwMFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGRpZmYgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKSAtIGRhdGVUaW1lSWF0SWRUb2tlbi52YWx1ZU9mKCk7XG4gICAgICAgIGlmIChkaWZmID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGRpZmYgPCBtYXhPZmZzZXRBbGxvd2VkSW5TZWNvbmRzICogMTAwMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAtZGlmZiA8IG1heE9mZnNldEFsbG93ZWRJblNlY29uZHMgKiAxMDAwO1xuICAgIH1cblxuICAgIC8vIGlkX3Rva2VuIEM5OiBUaGUgdmFsdWUgb2YgdGhlIG5vbmNlIENsYWltIE1VU1QgYmUgY2hlY2tlZCB0byB2ZXJpZnkgdGhhdCBpdCBpcyB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgb25lXG4gICAgLy8gdGhhdCB3YXMgc2VudCBpbiB0aGUgQXV0aGVudGljYXRpb24gUmVxdWVzdC5UaGUgQ2xpZW50IFNIT1VMRCBjaGVjayB0aGUgbm9uY2UgdmFsdWUgZm9yIHJlcGxheSBhdHRhY2tzLlxuICAgIC8vIFRoZSBwcmVjaXNlIG1ldGhvZCBmb3IgZGV0ZWN0aW5nIHJlcGxheSBhdHRhY2tzIGlzIENsaWVudCBzcGVjaWZpYy5cblxuICAgIC8vIEhvd2V2ZXIgdGhlIG5vbmNlIGNsYWltIFNIT1VMRCBub3QgYmUgcHJlc2VudCBmb3IgdGhlIHJlZmVzaF90b2tlbiBncmFudCB0eXBlXG4gICAgLy8gaHR0cHM6Ly9iaXRidWNrZXQub3JnL29wZW5pZC9jb25uZWN0L2lzc3Vlcy8xMDI1L2FtYmlndWl0eS13aXRoLWhvdy1ub25jZS1pcy1oYW5kbGVkLW9uXG4gICAgLy8gVGhlIGN1cnJlbnQgc3BlYyBpcyBhbWJpZ3VvdXMgYW5kIEtleWNsb2FrIGRvZXMgc2VuZCBpdC5cbiAgICB2YWxpZGF0ZUlkVG9rZW5Ob25jZShkYXRhSWRUb2tlbjogYW55LCBsb2NhbE5vbmNlOiBhbnksIGlnbm9yZU5vbmNlQWZ0ZXJSZWZyZXNoOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IGlzRnJvbVJlZnJlc2hUb2tlbiA9XG4gICAgICAgICAgICAoZGF0YUlkVG9rZW4ubm9uY2UgPT09IHVuZGVmaW5lZCB8fCBpZ25vcmVOb25jZUFmdGVyUmVmcmVzaCkgJiZcbiAgICAgICAgICAgIGxvY2FsTm9uY2UgPT09IFRva2VuVmFsaWRhdGlvblNlcnZpY2UuUmVmcmVzaFRva2VuTm9uY2VQbGFjZWhvbGRlcjtcbiAgICAgICAgaWYgKCFpc0Zyb21SZWZyZXNoVG9rZW4gJiYgZGF0YUlkVG9rZW4ubm9uY2UgIT09IGxvY2FsTm9uY2UpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcbiAgICAgICAgICAgICAgICAnVmFsaWRhdGVfaWRfdG9rZW5fbm9uY2UgZmFpbGVkLCBkYXRhSWRUb2tlbi5ub25jZTogJyArIGRhdGFJZFRva2VuLm5vbmNlICsgJyBsb2NhbF9ub25jZTonICsgbG9jYWxOb25jZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIGlkX3Rva2VuIEMxOiBUaGUgSXNzdWVyIElkZW50aWZpZXIgZm9yIHRoZSBPcGVuSUQgUHJvdmlkZXIgKHdoaWNoIGlzIHR5cGljYWxseSBvYnRhaW5lZCBkdXJpbmcgRGlzY292ZXJ5KVxuICAgIC8vIE1VU1QgZXhhY3RseSBtYXRjaCB0aGUgdmFsdWUgb2YgdGhlIGlzcyAoaXNzdWVyKSBDbGFpbS5cbiAgICB2YWxpZGF0ZUlkVG9rZW5Jc3MoZGF0YUlkVG9rZW46IGFueSwgYXV0aFdlbGxLbm93bkVuZHBvaW50c0lzc3VlcjogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgoZGF0YUlkVG9rZW4uaXNzIGFzIHN0cmluZykgIT09IChhdXRoV2VsbEtub3duRW5kcG9pbnRzSXNzdWVyIGFzIHN0cmluZykpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcbiAgICAgICAgICAgICAgICAnVmFsaWRhdGVfaWRfdG9rZW5faXNzIGZhaWxlZCwgZGF0YUlkVG9rZW4uaXNzOiAnICtcbiAgICAgICAgICAgICAgICBkYXRhSWRUb2tlbi5pc3MgK1xuICAgICAgICAgICAgICAgICcgYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpc3N1ZXI6JyArXG4gICAgICAgICAgICAgICAgYXV0aFdlbGxLbm93bkVuZHBvaW50c0lzc3VlclxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIGlkX3Rva2VuIEMyOiBUaGUgQ2xpZW50IE1VU1QgdmFsaWRhdGUgdGhhdCB0aGUgYXVkIChhdWRpZW5jZSkgQ2xhaW0gY29udGFpbnMgaXRzIGNsaWVudF9pZCB2YWx1ZSByZWdpc3RlcmVkIGF0IHRoZSBJc3N1ZXIgaWRlbnRpZmllZFxuICAgIC8vIGJ5IHRoZSBpc3MgKGlzc3VlcikgQ2xhaW0gYXMgYW4gYXVkaWVuY2UuXG4gICAgLy8gVGhlIElEIFRva2VuIE1VU1QgYmUgcmVqZWN0ZWQgaWYgdGhlIElEIFRva2VuIGRvZXMgbm90IGxpc3QgdGhlIENsaWVudCBhcyBhIHZhbGlkIGF1ZGllbmNlLCBvciBpZiBpdCBjb250YWlucyBhZGRpdGlvbmFsIGF1ZGllbmNlc1xuICAgIC8vIG5vdCB0cnVzdGVkIGJ5IHRoZSBDbGllbnQuXG4gICAgdmFsaWRhdGVJZFRva2VuQXVkKGRhdGFJZFRva2VuOiBhbnksIGF1ZDogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGFJZFRva2VuLmF1ZCkpIHtcbiAgICAgICAgICAgIC8vIGNvbnN0IHJlc3VsdCA9IHRoaXMuYXJyYXlIZWxwZXJTZXJ2aWNlLmFyZUVxdWFsKGRhdGFJZFRva2VuLmF1ZCwgYXVkKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGFJZFRva2VuLmF1ZC5pbmNsdWRlcyhhdWQpO1xuXG4gICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhcbiAgICAgICAgICAgICAgICAgICAgJ1ZhbGlkYXRlX2lkX3Rva2VuX2F1ZCBhcnJheSBmYWlsZWQsIGRhdGFJZFRva2VuLmF1ZDogJyArIGRhdGFJZFRva2VuLmF1ZCArICcgY2xpZW50X2lkOicgKyBhdWRcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YUlkVG9rZW4uYXVkICE9PSBhdWQpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnVmFsaWRhdGVfaWRfdG9rZW5fYXVkIGZhaWxlZCwgZGF0YUlkVG9rZW4uYXVkOiAnICsgZGF0YUlkVG9rZW4uYXVkICsgJyBjbGllbnRfaWQ6JyArIGF1ZCk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHZhbGlkYXRlSWRUb2tlbkF6cEV4aXN0c0lmTW9yZVRoYW5PbmVBdWQoZGF0YUlkVG9rZW46IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhSWRUb2tlbi5hdWQpICYmIGRhdGFJZFRva2VuLmF1ZC5sZW5ndGggPiAxICYmICFkYXRhSWRUb2tlbj8uYXpwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gSWYgYW4gYXpwIChhdXRob3JpemVkIHBhcnR5KSBDbGFpbSBpcyBwcmVzZW50LCB0aGUgQ2xpZW50IFNIT1VMRCB2ZXJpZnkgdGhhdCBpdHMgY2xpZW50X2lkIGlzIHRoZSBDbGFpbSBWYWx1ZS5cbiAgICB2YWxpZGF0ZUlkVG9rZW5BenBWYWxpZChkYXRhSWRUb2tlbjogYW55LCBjbGllbnRJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghZGF0YUlkVG9rZW4/LmF6cCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YUlkVG9rZW4uYXpwID09PSBjbGllbnRJZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFsaWRhdGVTdGF0ZUZyb21IYXNoQ2FsbGJhY2soc3RhdGU6IGFueSwgbG9jYWxTdGF0ZTogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICgoc3RhdGUgYXMgc3RyaW5nKSAhPT0gKGxvY2FsU3RhdGUgYXMgc3RyaW5nKSkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdWYWxpZGF0ZVN0YXRlRnJvbUhhc2hDYWxsYmFjayBmYWlsZWQsIHN0YXRlOiAnICsgc3RhdGUgKyAnIGxvY2FsX3N0YXRlOicgKyBsb2NhbFN0YXRlKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIGlkX3Rva2VuIEM1OiBUaGUgQ2xpZW50IE1VU1QgdmFsaWRhdGUgdGhlIHNpZ25hdHVyZSBvZiB0aGUgSUQgVG9rZW4gYWNjb3JkaW5nIHRvIEpXUyBbSldTXSB1c2luZyB0aGUgYWxnb3JpdGhtIHNwZWNpZmllZCBpbiB0aGUgYWxnXG4gICAgLy8gSGVhZGVyIFBhcmFtZXRlciBvZiB0aGUgSk9TRSBIZWFkZXIuVGhlIENsaWVudCBNVVNUIHVzZSB0aGUga2V5cyBwcm92aWRlZCBieSB0aGUgSXNzdWVyLlxuICAgIC8vIGlkX3Rva2VuIEM2OiBUaGUgYWxnIHZhbHVlIFNIT1VMRCBiZSBSUzI1Ni4gVmFsaWRhdGlvbiBvZiB0b2tlbnMgdXNpbmcgb3RoZXIgc2lnbmluZyBhbGdvcml0aG1zIGlzIGRlc2NyaWJlZCBpbiB0aGVcbiAgICAvLyBPcGVuSUQgQ29ubmVjdCBDb3JlIDEuMCBbT3BlbklELkNvcmVdIHNwZWNpZmljYXRpb24uXG4gICAgdmFsaWRhdGVTaWduYXR1cmVJZFRva2VuKGlkVG9rZW46IGFueSwgand0a2V5czogYW55KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghand0a2V5cyB8fCAhand0a2V5cy5rZXlzKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBoZWFkZXJEYXRhID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0SGVhZGVyRnJvbVRva2VuKGlkVG9rZW4sIGZhbHNlKTtcblxuICAgICAgICBpZiAoT2JqZWN0LmtleXMoaGVhZGVyRGF0YSkubGVuZ3RoID09PSAwICYmIGhlYWRlckRhdGEuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2lkIHRva2VuIGhhcyBubyBoZWFkZXIgZGF0YScpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qga2lkID0gaGVhZGVyRGF0YS5raWQ7XG4gICAgICAgIGNvbnN0IGFsZyA9IGhlYWRlckRhdGEuYWxnO1xuXG4gICAgICAgIGlmICghdGhpcy5rZXlBbGdvcml0aG1zLmluY2x1ZGVzKGFsZyBhcyBzdHJpbmcpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYWxnIG5vdCBzdXBwb3J0ZWQnLCBhbGcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGp3dEt0eVRvVXNlID0gJ1JTQSc7XG4gICAgICAgIGlmICgoYWxnIGFzIHN0cmluZykuY2hhckF0KDApID09PSAnRScpIHtcbiAgICAgICAgICAgIGp3dEt0eVRvVXNlID0gJ0VDJztcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpc1ZhbGlkID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFoZWFkZXJEYXRhLmhhc093blByb3BlcnR5KCdraWQnKSkge1xuICAgICAgICAgICAgLy8gZXhhY3RseSAxIGtleSBpbiB0aGUgand0a2V5cyBhbmQgbm8ga2lkIGluIHRoZSBKb3NlIGhlYWRlclxuICAgICAgICAgICAgLy8ga3R5XHRcIlJTQVwiIG9yIEVDIHVzZSBcInNpZ1wiXG4gICAgICAgICAgICBsZXQgYW1vdW50T2ZNYXRjaGluZ0tleXMgPSAwO1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2Ygand0a2V5cy5rZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKChrZXkua3R5IGFzIHN0cmluZykgPT09IGp3dEt0eVRvVXNlICYmIChrZXkudXNlIGFzIHN0cmluZykgPT09ICdzaWcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGFtb3VudE9mTWF0Y2hpbmdLZXlzID0gYW1vdW50T2ZNYXRjaGluZ0tleXMgKyAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFtb3VudE9mTWF0Y2hpbmdLZXlzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ25vIGtleXMgZm91bmQsIGluY29ycmVjdCBTaWduYXR1cmUsIHZhbGlkYXRpb24gZmFpbGVkIGZvciBpZF90b2tlbicpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFtb3VudE9mTWF0Y2hpbmdLZXlzID4gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdubyBJRCBUb2tlbiBraWQgY2xhaW0gaW4gSk9TRSBoZWFkZXIgYW5kIG11bHRpcGxlIHN1cHBsaWVkIGluIGp3a3NfdXJpJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBqd3RrZXlzLmtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGtleS5rdHkgYXMgc3RyaW5nKSA9PT0gand0S3R5VG9Vc2UgJiYgKGtleS51c2UgYXMgc3RyaW5nKSA9PT0gJ3NpZycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHVibGlja2V5ID0gS0VZVVRJTC5nZXRLZXkoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaXNWYWxpZCA9IEtKVVIuandzLkpXUy52ZXJpZnkoaWRUb2tlbiwgcHVibGlja2V5LCBbYWxnXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2luY29ycmVjdCBTaWduYXR1cmUsIHZhbGlkYXRpb24gZmFpbGVkIGZvciBpZF90b2tlbicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGtpZCBpbiB0aGUgSm9zZSBoZWFkZXIgb2YgaWRfdG9rZW5cbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGp3dGtleXMua2V5cykge1xuICAgICAgICAgICAgICAgIGlmICgoa2V5LmtpZCBhcyBzdHJpbmcpID09PSAoa2lkIGFzIHN0cmluZykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHVibGlja2V5ID0gS0VZVVRJTC5nZXRLZXkoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgaXNWYWxpZCA9IEtKVVIuandzLkpXUy52ZXJpZnkoaWRUb2tlbiwgcHVibGlja2V5LCBbYWxnXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2luY29ycmVjdCBTaWduYXR1cmUsIHZhbGlkYXRpb24gZmFpbGVkIGZvciBpZF90b2tlbicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpc1ZhbGlkO1xuICAgIH1cblxuICAgIGNvbmZpZ1ZhbGlkYXRlUmVzcG9uc2VUeXBlKHJlc3BvbnNlVHlwZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0FueUltcGxpY2l0RmxvdygpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ21vZHVsZSBjb25maWd1cmUgaW5jb3JyZWN0LCBpbnZhbGlkIHJlc3BvbnNlX3R5cGU6JyArIHJlc3BvbnNlVHlwZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBBY2NlcHRzIElEIFRva2VuIHdpdGhvdXQgJ2tpZCcgY2xhaW0gaW4gSk9TRSBoZWFkZXIgaWYgb25seSBvbmUgSldLIHN1cHBsaWVkIGluICdqd2tzX3VybCdcbiAgICAvLy8vIHByaXZhdGUgdmFsaWRhdGVfbm9fa2lkX2luX2hlYWRlcl9vbmx5X29uZV9hbGxvd2VkX2luX2p3dGtleXMoaGVhZGVyX2RhdGE6IGFueSwgand0a2V5czogYW55KTogYm9vbGVhbiB7XG4gICAgLy8vLyAgICB0aGlzLm9pZGNTZWN1cml0eUNvbW1vbi5sb2dEZWJ1ZygnYW1vdW50IG9mIGp3dGtleXMua2V5czogJyArIGp3dGtleXMua2V5cy5sZW5ndGgpO1xuICAgIC8vLy8gICAgaWYgKCFoZWFkZXJfZGF0YS5oYXNPd25Qcm9wZXJ0eSgna2lkJykpIHtcbiAgICAvLy8vICAgICAgICAvLyBubyBraWQgZGVmaW5lZCBpbiBKb3NlIGhlYWRlclxuICAgIC8vLy8gICAgICAgIGlmIChqd3RrZXlzLmtleXMubGVuZ3RoICE9IDEpIHtcbiAgICAvLy8vICAgICAgICAgICAgdGhpcy5vaWRjU2VjdXJpdHlDb21tb24ubG9nRGVidWcoJ2p3dGtleXMua2V5cy5sZW5ndGggIT0gMSBhbmQgbm8ga2lkIGluIGhlYWRlcicpO1xuICAgIC8vLy8gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgLy8vLyAgICAgICAgfVxuICAgIC8vLy8gICAgfVxuXG4gICAgLy8vLyAgICByZXR1cm4gdHJ1ZTtcbiAgICAvLy8vIH1cblxuICAgIC8vIEFjY2VzcyBUb2tlbiBWYWxpZGF0aW9uXG4gICAgLy8gYWNjZXNzX3Rva2VuIEMxOiBIYXNoIHRoZSBvY3RldHMgb2YgdGhlIEFTQ0lJIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhY2Nlc3NfdG9rZW4gd2l0aCB0aGUgaGFzaCBhbGdvcml0aG0gc3BlY2lmaWVkIGluIEpXQVtKV0FdXG4gICAgLy8gZm9yIHRoZSBhbGcgSGVhZGVyIFBhcmFtZXRlciBvZiB0aGUgSUQgVG9rZW4ncyBKT1NFIEhlYWRlci4gRm9yIGluc3RhbmNlLCBpZiB0aGUgYWxnIGlzIFJTMjU2LCB0aGUgaGFzaCBhbGdvcml0aG0gdXNlZCBpcyBTSEEtMjU2LlxuICAgIC8vIGFjY2Vzc190b2tlbiBDMjogVGFrZSB0aGUgbGVmdC0gbW9zdCBoYWxmIG9mIHRoZSBoYXNoIGFuZCBiYXNlNjR1cmwtIGVuY29kZSBpdC5cbiAgICAvLyBhY2Nlc3NfdG9rZW4gQzM6IFRoZSB2YWx1ZSBvZiBhdF9oYXNoIGluIHRoZSBJRCBUb2tlbiBNVVNUIG1hdGNoIHRoZSB2YWx1ZSBwcm9kdWNlZCBpbiB0aGUgcHJldmlvdXMgc3RlcCBpZiBhdF9oYXNoXG4gICAgLy8gaXMgcHJlc2VudCBpbiB0aGUgSUQgVG9rZW4uXG4gICAgdmFsaWRhdGVJZFRva2VuQXRIYXNoKGFjY2Vzc1Rva2VuOiBhbnksIGF0SGFzaDogYW55LCBpc0NvZGVGbG93OiBib29sZWFuLCBpZFRva2VuQWxnOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdhdF9oYXNoIGZyb20gdGhlIHNlcnZlcjonICsgYXRIYXNoKTtcblxuICAgICAgICAvLyAnc2hhMjU2JyAnc2hhMzg0JyAnc2hhNTEyJ1xuICAgICAgICBsZXQgc2hhID0gJ3NoYTI1Nic7XG4gICAgICAgIGlmIChpZFRva2VuQWxnLmluY2x1ZGVzKCczODQnKSkge1xuICAgICAgICAgICAgc2hhID0gJ3NoYTM4NCc7XG4gICAgICAgIH0gZWxzZSBpZiAoaWRUb2tlbkFsZy5pbmNsdWRlcygnNTEyJykpIHtcbiAgICAgICAgICAgIHNoYSA9ICdzaGE1MTInO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGVzdGRhdGEgPSB0aGlzLmdlbmVyYXRlQXRIYXNoKCcnICsgYWNjZXNzVG9rZW4sIHNoYSk7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnYXRfaGFzaCBjbGllbnQgdmFsaWRhdGlvbiBub3QgZGVjb2RlZDonICsgdGVzdGRhdGEpO1xuICAgICAgICBpZiAodGVzdGRhdGEgPT09IChhdEhhc2ggYXMgc3RyaW5nKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIGlzVmFsaWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0ZXN0VmFsdWUgPSB0aGlzLmdlbmVyYXRlQXRIYXNoKCcnICsgZGVjb2RlVVJJQ29tcG9uZW50KGFjY2Vzc1Rva2VuKSwgc2hhKTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnLWdlbiBhY2Nlc3MtLScgKyB0ZXN0VmFsdWUpO1xuICAgICAgICAgICAgaWYgKHRlc3RWYWx1ZSA9PT0gKGF0SGFzaCBhcyBzdHJpbmcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIGlzVmFsaWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlQXRIYXNoKGFjY2Vzc1Rva2VuOiBhbnksIHNoYTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgaGFzaCA9IEtKVVIuY3J5cHRvLlV0aWwuaGFzaFN0cmluZyhhY2Nlc3NUb2tlbiwgc2hhKTtcbiAgICAgICAgY29uc3QgZmlyc3QxMjhiaXRzID0gaGFzaC5zdWJzdHIoMCwgaGFzaC5sZW5ndGggLyAyKTtcbiAgICAgICAgY29uc3QgdGVzdGRhdGEgPSBoZXh0b2I2NHUoZmlyc3QxMjhiaXRzKTtcblxuICAgICAgICByZXR1cm4gdGVzdGRhdGE7XG4gICAgfVxuXG4gICAgZ2VuZXJhdGVDb2RlVmVyaWZpZXIoY29kZUNoYWxsZW5nZTogYW55KTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgaGFzaCA9IEtKVVIuY3J5cHRvLlV0aWwuaGFzaFN0cmluZyhjb2RlQ2hhbGxlbmdlLCAnc2hhMjU2Jyk7XG4gICAgICAgIGNvbnN0IHRlc3RkYXRhID0gaGV4dG9iNjR1KGhhc2gpO1xuXG4gICAgICAgIHJldHVybiB0ZXN0ZGF0YTtcbiAgICB9XG59XG4iXX0=