import { __decorate, __values } from "tslib";
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
export { TokenValidationService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tdmFsaWRhdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL3ZhbGlkYXRpb24vdG9rZW4tdmFsaWRhdGlvbi5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzdELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDckUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFFcEYsMkRBQTJEO0FBRTNELFdBQVc7QUFDWCw0R0FBNEc7QUFDNUcsMERBQTBEO0FBQzFELEVBQUU7QUFDRix1SUFBdUk7QUFDdkksdUlBQXVJO0FBQ3ZJLG9FQUFvRTtBQUNwRSxFQUFFO0FBQ0YsbUhBQW1IO0FBQ25ILEVBQUU7QUFDRiw4SEFBOEg7QUFDOUgsRUFBRTtBQUNGLGtJQUFrSTtBQUNsSSwrRkFBK0Y7QUFDL0YsRUFBRTtBQUNGLHFJQUFxSTtBQUNySSxXQUFXO0FBQ1gsK0JBQStCO0FBQy9CLEVBQUU7QUFDRix5SUFBeUk7QUFDekksbUJBQW1CO0FBQ25CLEVBQUU7QUFDRiwrR0FBK0c7QUFDL0csd0hBQXdIO0FBQ3hILEVBQUU7QUFDRix5SEFBeUg7QUFDekgsMklBQTJJO0FBQzNJLHNCQUFzQjtBQUN0QixFQUFFO0FBQ0Ysc0hBQXNIO0FBQ3RILG9GQUFvRjtBQUNwRixFQUFFO0FBQ0YsaUlBQWlJO0FBQ2pJLHNGQUFzRjtBQUV0RiwwQkFBMEI7QUFDMUIsaUlBQWlJO0FBQ2pJLHFJQUFxSTtBQUNySSxrRkFBa0Y7QUFDbEYsaUlBQWlJO0FBQ2pJ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V0FBZ0IsRUFBRSxHQUFXO1FBQ2hELElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0QsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyRCxJQUFNLFFBQVEsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFekMsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUVELHFEQUFvQixHQUFwQixVQUFxQixhQUFrQjtRQUNuQyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2xFLElBQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqQyxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDOztJQWpZTSxtREFBNEIsR0FBRyxrQkFBa0IsQ0FBQzs7Z0JBRWpCLGtCQUFrQjtnQkFBc0IsVUFBVTtnQkFBeUIsYUFBYTs7SUFIdkgsc0JBQXNCO1FBRGxDLFVBQVUsRUFBRTtPQUNBLHNCQUFzQixDQW1ZbEM7SUFBRCw2QkFBQztDQUFBLEFBbllELElBbVlDO1NBbllZLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGhleHRvYjY0dSwgS0VZVVRJTCwgS0pVUiB9IGZyb20gJ2pzcnNhc2lnbi1yZWR1Y2VkJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuLi91dGlscy9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgVG9rZW5IZWxwZXJTZXJ2aWNlIH0gZnJvbSAnLi4vdXRpbHMvdG9rZW5IZWxwZXIvb2lkYy10b2tlbi1oZWxwZXIuc2VydmljZSc7XG5cbi8vIGh0dHA6Ly9vcGVuaWQubmV0L3NwZWNzL29wZW5pZC1jb25uZWN0LWltcGxpY2l0LTFfMC5odG1sXG5cbi8vIGlkX3Rva2VuXG4vLyBpZF90b2tlbiBDMTogVGhlIElzc3VlciBJZGVudGlmaWVyIGZvciB0aGUgT3BlbklEIFByb3ZpZGVyICh3aGljaCBpcyB0eXBpY2FsbHkgb2J0YWluZWQgZHVyaW5nIERpc2NvdmVyeSlcbi8vIE1VU1QgZXhhY3RseSBtYXRjaCB0aGUgdmFsdWUgb2YgdGhlIGlzcyAoaXNzdWVyKSBDbGFpbS5cbi8vXG4vLyBpZF90b2tlbiBDMjogVGhlIENsaWVudCBNVVNUIHZhbGlkYXRlIHRoYXQgdGhlIGF1ZCAoYXVkaWVuY2UpIENsYWltIGNvbnRhaW5zIGl0cyBjbGllbnRfaWQgdmFsdWUgcmVnaXN0ZXJlZCBhdCB0aGUgSXNzdWVyIGlkZW50aWZpZWRcbi8vIGJ5IHRoZSBpc3MgKGlzc3VlcikgQ2xhaW0gYXMgYW4gYXVkaWVuY2UuVGhlIElEIFRva2VuIE1VU1QgYmUgcmVqZWN0ZWQgaWYgdGhlIElEIFRva2VuIGRvZXMgbm90IGxpc3QgdGhlIENsaWVudCBhcyBhIHZhbGlkIGF1ZGllbmNlLFxuLy8gb3IgaWYgaXQgY29udGFpbnMgYWRkaXRpb25hbCBhdWRpZW5jZXMgbm90IHRydXN0ZWQgYnkgdGhlIENsaWVudC5cbi8vXG4vLyBpZF90b2tlbiBDMzogSWYgdGhlIElEIFRva2VuIGNvbnRhaW5zIG11bHRpcGxlIGF1ZGllbmNlcywgdGhlIENsaWVudCBTSE9VTEQgdmVyaWZ5IHRoYXQgYW4gYXpwIENsYWltIGlzIHByZXNlbnQuXG4vL1xuLy8gaWRfdG9rZW4gQzQ6IElmIGFuIGF6cCAoYXV0aG9yaXplZCBwYXJ0eSkgQ2xhaW0gaXMgcHJlc2VudCwgdGhlIENsaWVudCBTSE9VTEQgdmVyaWZ5IHRoYXQgaXRzIGNsaWVudF9pZCBpcyB0aGUgQ2xhaW0gVmFsdWUuXG4vL1xuLy8gaWRfdG9rZW4gQzU6IFRoZSBDbGllbnQgTVVTVCB2YWxpZGF0ZSB0aGUgc2lnbmF0dXJlIG9mIHRoZSBJRCBUb2tlbiBhY2NvcmRpbmcgdG8gSldTIFtKV1NdIHVzaW5nIHRoZSBhbGdvcml0aG0gc3BlY2lmaWVkIGluIHRoZVxuLy8gYWxnIEhlYWRlciBQYXJhbWV0ZXIgb2YgdGhlIEpPU0UgSGVhZGVyLlRoZSBDbGllbnQgTVVTVCB1c2UgdGhlIGtleXMgcHJvdmlkZWQgYnkgdGhlIElzc3Vlci5cbi8vXG4vLyBpZF90b2tlbiBDNjogVGhlIGFsZyB2YWx1ZSBTSE9VTEQgYmUgUlMyNTYuIFZhbGlkYXRpb24gb2YgdG9rZW5zIHVzaW5nIG90aGVyIHNpZ25pbmcgYWxnb3JpdGhtcyBpcyBkZXNjcmliZWQgaW4gdGhlIE9wZW5JRCBDb25uZWN0XG4vLyBDb3JlIDEuMFxuLy8gW09wZW5JRC5Db3JlXSBzcGVjaWZpY2F0aW9uLlxuLy9cbi8vIGlkX3Rva2VuIEM3OiBUaGUgY3VycmVudCB0aW1lIE1VU1QgYmUgYmVmb3JlIHRoZSB0aW1lIHJlcHJlc2VudGVkIGJ5IHRoZSBleHAgQ2xhaW0gKHBvc3NpYmx5IGFsbG93aW5nIGZvciBzb21lIHNtYWxsIGxlZXdheSB0byBhY2NvdW50XG4vLyBmb3IgY2xvY2sgc2tldykuXG4vL1xuLy8gaWRfdG9rZW4gQzg6IFRoZSBpYXQgQ2xhaW0gY2FuIGJlIHVzZWQgdG8gcmVqZWN0IHRva2VucyB0aGF0IHdlcmUgaXNzdWVkIHRvbyBmYXIgYXdheSBmcm9tIHRoZSBjdXJyZW50IHRpbWUsXG4vLyBsaW1pdGluZyB0aGUgYW1vdW50IG9mIHRpbWUgdGhhdCBub25jZXMgbmVlZCB0byBiZSBzdG9yZWQgdG8gcHJldmVudCBhdHRhY2tzLlRoZSBhY2NlcHRhYmxlIHJhbmdlIGlzIENsaWVudCBzcGVjaWZpYy5cbi8vXG4vLyBpZF90b2tlbiBDOTogVGhlIHZhbHVlIG9mIHRoZSBub25jZSBDbGFpbSBNVVNUIGJlIGNoZWNrZWQgdG8gdmVyaWZ5IHRoYXQgaXQgaXMgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIG9uZSB0aGF0IHdhcyBzZW50XG4vLyBpbiB0aGUgQXV0aGVudGljYXRpb24gUmVxdWVzdC5UaGUgQ2xpZW50IFNIT1VMRCBjaGVjayB0aGUgbm9uY2UgdmFsdWUgZm9yIHJlcGxheSBhdHRhY2tzLlRoZSBwcmVjaXNlIG1ldGhvZCBmb3IgZGV0ZWN0aW5nIHJlcGxheSBhdHRhY2tzXG4vLyBpcyBDbGllbnQgc3BlY2lmaWMuXG4vL1xuLy8gaWRfdG9rZW4gQzEwOiBJZiB0aGUgYWNyIENsYWltIHdhcyByZXF1ZXN0ZWQsIHRoZSBDbGllbnQgU0hPVUxEIGNoZWNrIHRoYXQgdGhlIGFzc2VydGVkIENsYWltIFZhbHVlIGlzIGFwcHJvcHJpYXRlLlxuLy8gVGhlIG1lYW5pbmcgYW5kIHByb2Nlc3Npbmcgb2YgYWNyIENsYWltIFZhbHVlcyBpcyBvdXQgb2Ygc2NvcGUgZm9yIHRoaXMgZG9jdW1lbnQuXG4vL1xuLy8gaWRfdG9rZW4gQzExOiBXaGVuIGEgbWF4X2FnZSByZXF1ZXN0IGlzIG1hZGUsIHRoZSBDbGllbnQgU0hPVUxEIGNoZWNrIHRoZSBhdXRoX3RpbWUgQ2xhaW0gdmFsdWUgYW5kIHJlcXVlc3QgcmUtIGF1dGhlbnRpY2F0aW9uXG4vLyBpZiBpdCBkZXRlcm1pbmVzIHRvbyBtdWNoIHRpbWUgaGFzIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgRW5kLSBVc2VyIGF1dGhlbnRpY2F0aW9uLlxuXG4vLyBBY2Nlc3MgVG9rZW4gVmFsaWRhdGlvblxuLy8gYWNjZXNzX3Rva2VuIEMxOiBIYXNoIHRoZSBvY3RldHMgb2YgdGhlIEFTQ0lJIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhY2Nlc3NfdG9rZW4gd2l0aCB0aGUgaGFzaCBhbGdvcml0aG0gc3BlY2lmaWVkIGluIEpXQVtKV0FdXG4vLyBmb3IgdGhlIGFsZyBIZWFkZXIgUGFyYW1ldGVyIG9mIHRoZSBJRCBUb2tlbidzIEpPU0UgSGVhZGVyLiBGb3IgaW5zdGFuY2UsIGlmIHRoZSBhbGcgaXMgUlMyNTYsIHRoZSBoYXNoIGFsZ29yaXRobSB1c2VkIGlzIFNIQS0yNTYuXG4vLyBhY2Nlc3NfdG9rZW4gQzI6IFRha2UgdGhlIGxlZnQtIG1vc3QgaGFsZiBvZiB0aGUgaGFzaCBhbmQgYmFzZTY0dXJsLSBlbmNvZGUgaXQuXG4vLyBhY2Nlc3NfdG9rZW4gQzM6IFRoZSB2YWx1ZSBvZiBhdF9oYXNoIGluIHRoZSBJRCBUb2tlbiBNVVNUIG1hdGNoIHRoZSB2YWx1ZSBwcm9kdWNlZCBpbiB0aGUgcHJldmlvdXMgc3RlcCBpZiBhdF9oYXNoIGlzIHByZXNlbnRcbi8vIGluIHRoZSBJRCBUb2tlbi5cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRva2VuVmFsaWRhdGlvblNlcnZpY2Uge1xuICAgIHN0YXRpYyBSZWZyZXNoVG9rZW5Ob25jZVBsYWNlaG9sZGVyID0gJy0tUmVmcmVzaFRva2VuLS0nO1xuICAgIGtleUFsZ29yaXRobXM6IHN0cmluZ1tdID0gWydIUzI1NicsICdIUzM4NCcsICdIUzUxMicsICdSUzI1NicsICdSUzM4NCcsICdSUzUxMicsICdFUzI1NicsICdFUzM4NCcsICdQUzI1NicsICdQUzM4NCcsICdQUzUxMiddO1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgdG9rZW5IZWxwZXJTZXJ2aWNlOiBUb2tlbkhlbHBlclNlcnZpY2UsIHByaXZhdGUgZmxvd0hlbHBlcjogRmxvd0hlbHBlciwgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlKSB7IH1cblxuICAgIC8vIGlkX3Rva2VuIEM3OiBUaGUgY3VycmVudCB0aW1lIE1VU1QgYmUgYmVmb3JlIHRoZSB0aW1lIHJlcHJlc2VudGVkIGJ5IHRoZSBleHAgQ2xhaW1cbiAgICAvLyAocG9zc2libHkgYWxsb3dpbmcgZm9yIHNvbWUgc21hbGwgbGVld2F5IHRvIGFjY291bnQgZm9yIGNsb2NrIHNrZXcpLlxuICAgIGhhc0lkVG9rZW5FeHBpcmVkKHRva2VuOiBzdHJpbmcsIG9mZnNldFNlY29uZHM/OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IGRlY29kZWQ6IGFueTtcbiAgICAgICAgZGVjb2RlZCA9IHRoaXMudG9rZW5IZWxwZXJTZXJ2aWNlLmdldFBheWxvYWRGcm9tVG9rZW4odG9rZW4sIGZhbHNlKTtcblxuICAgICAgICByZXR1cm4gIXRoaXMudmFsaWRhdGVJZFRva2VuRXhwTm90RXhwaXJlZChkZWNvZGVkLCBvZmZzZXRTZWNvbmRzKTtcbiAgICB9XG5cbiAgICAvLyBpZF90b2tlbiBDNzogVGhlIGN1cnJlbnQgdGltZSBNVVNUIGJlIGJlZm9yZSB0aGUgdGltZSByZXByZXNlbnRlZCBieSB0aGUgZXhwIENsYWltXG4gICAgLy8gKHBvc3NpYmx5IGFsbG93aW5nIGZvciBzb21lIHNtYWxsIGxlZXdheSB0byBhY2NvdW50IGZvciBjbG9jayBza2V3KS5cbiAgICB2YWxpZGF0ZUlkVG9rZW5FeHBOb3RFeHBpcmVkKGRlY29kZWRJZFRva2VuOiBzdHJpbmcsIG9mZnNldFNlY29uZHM/OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgdG9rZW5FeHBpcmF0aW9uRGF0ZSA9IHRoaXMudG9rZW5IZWxwZXJTZXJ2aWNlLmdldFRva2VuRXhwaXJhdGlvbkRhdGUoZGVjb2RlZElkVG9rZW4pO1xuICAgICAgICBvZmZzZXRTZWNvbmRzID0gb2Zmc2V0U2Vjb25kcyB8fCAwO1xuXG4gICAgICAgIGlmICghdG9rZW5FeHBpcmF0aW9uRGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdG9rZW5FeHBpcmF0aW9uVmFsdWUgPSB0b2tlbkV4cGlyYXRpb25EYXRlLnZhbHVlT2YoKTtcbiAgICAgICAgY29uc3Qgbm93V2l0aE9mZnNldCA9IG5ldyBEYXRlKCkudmFsdWVPZigpICsgb2Zmc2V0U2Vjb25kcyAqIDEwMDA7XG4gICAgICAgIGNvbnN0IHRva2VuTm90RXhwaXJlZCA9IHRva2VuRXhwaXJhdGlvblZhbHVlID4gbm93V2l0aE9mZnNldDtcblxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYEhhcyBpZF90b2tlbiBleHBpcmVkOiAkeyF0b2tlbk5vdEV4cGlyZWR9LCAke3Rva2VuRXhwaXJhdGlvblZhbHVlfSA+ICR7bm93V2l0aE9mZnNldH1gKTtcblxuICAgICAgICAvLyBUb2tlbiBub3QgZXhwaXJlZD9cbiAgICAgICAgcmV0dXJuIHRva2VuTm90RXhwaXJlZDtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZUFjY2Vzc1Rva2VuTm90RXhwaXJlZChhY2Nlc3NUb2tlbkV4cGlyZXNBdDogRGF0ZSwgb2Zmc2V0U2Vjb25kcz86IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAvLyB2YWx1ZSBpcyBvcHRpb25hbCwgc28gaWYgaXQgZG9lcyBub3QgZXhpc3QsIHRoZW4gaXQgaGFzIG5vdCBleHBpcmVkXG4gICAgICAgIGlmICghYWNjZXNzVG9rZW5FeHBpcmVzQXQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgb2Zmc2V0U2Vjb25kcyA9IG9mZnNldFNlY29uZHMgfHwgMDtcbiAgICAgICAgY29uc3QgYWNjZXNzVG9rZW5FeHBpcmF0aW9uVmFsdWUgPSBhY2Nlc3NUb2tlbkV4cGlyZXNBdC52YWx1ZU9mKCk7XG4gICAgICAgIGNvbnN0IG5vd1dpdGhPZmZzZXQgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKSArIG9mZnNldFNlY29uZHMgKiAxMDAwO1xuICAgICAgICBjb25zdCB0b2tlbk5vdEV4cGlyZWQgPSBhY2Nlc3NUb2tlbkV4cGlyYXRpb25WYWx1ZSA+IG5vd1dpdGhPZmZzZXQ7XG5cbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBIYXMgYWNjZXNzX3Rva2VuIGV4cGlyZWQ6ICR7IXRva2VuTm90RXhwaXJlZH0sICR7YWNjZXNzVG9rZW5FeHBpcmF0aW9uVmFsdWV9ID4gJHtub3dXaXRoT2Zmc2V0fWApO1xuXG4gICAgICAgIC8vIGFjY2VzcyB0b2tlbiBub3QgZXhwaXJlZD9cbiAgICAgICAgcmV0dXJuIHRva2VuTm90RXhwaXJlZDtcbiAgICB9XG5cbiAgICAvLyBpc3NcbiAgICAvLyBSRVFVSVJFRC4gSXNzdWVyIElkZW50aWZpZXIgZm9yIHRoZSBJc3N1ZXIgb2YgdGhlIHJlc3BvbnNlLlRoZSBpc3MgdmFsdWUgaXMgYSBjYXNlLXNlbnNpdGl2ZSBVUkwgdXNpbmcgdGhlXG4gICAgLy8gaHR0cHMgc2NoZW1lIHRoYXQgY29udGFpbnMgc2NoZW1lLCBob3N0LFxuICAgIC8vIGFuZCBvcHRpb25hbGx5LCBwb3J0IG51bWJlciBhbmQgcGF0aCBjb21wb25lbnRzIGFuZCBubyBxdWVyeSBvciBmcmFnbWVudCBjb21wb25lbnRzLlxuICAgIC8vXG4gICAgLy8gc3ViXG4gICAgLy8gUkVRVUlSRUQuIFN1YmplY3QgSWRlbnRpZmllci5Mb2NhbGx5IHVuaXF1ZSBhbmQgbmV2ZXIgcmVhc3NpZ25lZCBpZGVudGlmaWVyIHdpdGhpbiB0aGUgSXNzdWVyIGZvciB0aGUgRW5kLSBVc2VyLFxuICAgIC8vIHdoaWNoIGlzIGludGVuZGVkIHRvIGJlIGNvbnN1bWVkIGJ5IHRoZSBDbGllbnQsIGUuZy4sIDI0NDAwMzIwIG9yIEFJdE9hd213dFd3Y1QwazUxQmF5ZXdOdnV0ckpVcXN2bDZxczdBNC5cbiAgICAvLyBJdCBNVVNUIE5PVCBleGNlZWQgMjU1IEFTQ0lJIGNoYXJhY3RlcnMgaW4gbGVuZ3RoLlRoZSBzdWIgdmFsdWUgaXMgYSBjYXNlLXNlbnNpdGl2ZSBzdHJpbmcuXG4gICAgLy9cbiAgICAvLyBhdWRcbiAgICAvLyBSRVFVSVJFRC4gQXVkaWVuY2UocykgdGhhdCB0aGlzIElEIFRva2VuIGlzIGludGVuZGVkIGZvci4gSXQgTVVTVCBjb250YWluIHRoZSBPQXV0aCAyLjAgY2xpZW50X2lkIG9mIHRoZSBSZWx5aW5nIFBhcnR5IGFzIGFuXG4gICAgLy8gYXVkaWVuY2UgdmFsdWUuXG4gICAgLy8gSXQgTUFZIGFsc28gY29udGFpbiBpZGVudGlmaWVycyBmb3Igb3RoZXIgYXVkaWVuY2VzLkluIHRoZSBnZW5lcmFsIGNhc2UsIHRoZSBhdWQgdmFsdWUgaXMgYW4gYXJyYXkgb2YgY2FzZS1zZW5zaXRpdmUgc3RyaW5ncy5cbiAgICAvLyBJbiB0aGUgY29tbW9uIHNwZWNpYWwgY2FzZSB3aGVuIHRoZXJlIGlzIG9uZSBhdWRpZW5jZSwgdGhlIGF1ZCB2YWx1ZSBNQVkgYmUgYSBzaW5nbGUgY2FzZS1zZW5zaXRpdmUgc3RyaW5nLlxuICAgIC8vXG4gICAgLy8gZXhwXG4gICAgLy8gUkVRVUlSRUQuIEV4cGlyYXRpb24gdGltZSBvbiBvciBhZnRlciB3aGljaCB0aGUgSUQgVG9rZW4gTVVTVCBOT1QgYmUgYWNjZXB0ZWQgZm9yIHByb2Nlc3NpbmcuXG4gICAgLy8gVGhlIHByb2Nlc3Npbmcgb2YgdGhpcyBwYXJhbWV0ZXIgcmVxdWlyZXMgdGhhdCB0aGUgY3VycmVudCBkYXRlLyB0aW1lIE1VU1QgYmUgYmVmb3JlIHRoZSBleHBpcmF0aW9uIGRhdGUvIHRpbWUgbGlzdGVkIGluIHRoZSB2YWx1ZS5cbiAgICAvLyBJbXBsZW1lbnRlcnMgTUFZIHByb3ZpZGUgZm9yIHNvbWUgc21hbGwgbGVld2F5LCB1c3VhbGx5IG5vIG1vcmUgdGhhbiBhIGZldyBtaW51dGVzLCB0byBhY2NvdW50IGZvciBjbG9jayBza2V3LlxuICAgIC8vIEl0cyB2YWx1ZSBpcyBhIEpTT04gW1JGQzcxNTldIG51bWJlciByZXByZXNlbnRpbmcgdGhlIG51bWJlciBvZiBzZWNvbmRzIGZyb20gMTk3MC0gMDEgLSAwMVQwMDogMDA6MDBaIGFzIG1lYXN1cmVkIGluIFVUQyB1bnRpbFxuICAgIC8vIHRoZSBkYXRlLyB0aW1lLlxuICAgIC8vIFNlZSBSRkMgMzMzOSBbUkZDMzMzOV0gZm9yIGRldGFpbHMgcmVnYXJkaW5nIGRhdGUvIHRpbWVzIGluIGdlbmVyYWwgYW5kIFVUQyBpbiBwYXJ0aWN1bGFyLlxuICAgIC8vXG4gICAgLy8gaWF0XG4gICAgLy8gUkVRVUlSRUQuIFRpbWUgYXQgd2hpY2ggdGhlIEpXVCB3YXMgaXNzdWVkLiBJdHMgdmFsdWUgaXMgYSBKU09OIG51bWJlciByZXByZXNlbnRpbmcgdGhlIG51bWJlciBvZiBzZWNvbmRzIGZyb21cbiAgICAvLyAxOTcwLSAwMSAtIDAxVDAwOiAwMDogMDBaIGFzIG1lYXN1cmVkXG4gICAgLy8gaW4gVVRDIHVudGlsIHRoZSBkYXRlLyB0aW1lLlxuICAgIHZhbGlkYXRlUmVxdWlyZWRJZFRva2VuKGRhdGFJZFRva2VuOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHZhbGlkYXRlZCA9IHRydWU7XG4gICAgICAgIGlmICghZGF0YUlkVG9rZW4uaGFzT3duUHJvcGVydHkoJ2lzcycpKSB7XG4gICAgICAgICAgICB2YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdpc3MgaXMgbWlzc2luZywgdGhpcyBpcyByZXF1aXJlZCBpbiB0aGUgaWRfdG9rZW4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZGF0YUlkVG9rZW4uaGFzT3duUHJvcGVydHkoJ3N1YicpKSB7XG4gICAgICAgICAgICB2YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdzdWIgaXMgbWlzc2luZywgdGhpcyBpcyByZXF1aXJlZCBpbiB0aGUgaWRfdG9rZW4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZGF0YUlkVG9rZW4uaGFzT3duUHJvcGVydHkoJ2F1ZCcpKSB7XG4gICAgICAgICAgICB2YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdWQgaXMgbWlzc2luZywgdGhpcyBpcyByZXF1aXJlZCBpbiB0aGUgaWRfdG9rZW4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZGF0YUlkVG9rZW4uaGFzT3duUHJvcGVydHkoJ2V4cCcpKSB7XG4gICAgICAgICAgICB2YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdleHAgaXMgbWlzc2luZywgdGhpcyBpcyByZXF1aXJlZCBpbiB0aGUgaWRfdG9rZW4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZGF0YUlkVG9rZW4uaGFzT3duUHJvcGVydHkoJ2lhdCcpKSB7XG4gICAgICAgICAgICB2YWxpZGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdpYXQgaXMgbWlzc2luZywgdGhpcyBpcyByZXF1aXJlZCBpbiB0aGUgaWRfdG9rZW4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWxpZGF0ZWQ7XG4gICAgfVxuXG4gICAgLy8gaWRfdG9rZW4gQzg6IFRoZSBpYXQgQ2xhaW0gY2FuIGJlIHVzZWQgdG8gcmVqZWN0IHRva2VucyB0aGF0IHdlcmUgaXNzdWVkIHRvbyBmYXIgYXdheSBmcm9tIHRoZSBjdXJyZW50IHRpbWUsXG4gICAgLy8gbGltaXRpbmcgdGhlIGFtb3VudCBvZiB0aW1lIHRoYXQgbm9uY2VzIG5lZWQgdG8gYmUgc3RvcmVkIHRvIHByZXZlbnQgYXR0YWNrcy5UaGUgYWNjZXB0YWJsZSByYW5nZSBpcyBDbGllbnQgc3BlY2lmaWMuXG4gICAgdmFsaWRhdGVJZFRva2VuSWF0TWF4T2Zmc2V0KGRhdGFJZFRva2VuOiBhbnksIG1heE9mZnNldEFsbG93ZWRJblNlY29uZHM6IG51bWJlciwgZGlzYWJsZUlhdE9mZnNldFZhbGlkYXRpb246IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICAgICAgaWYgKGRpc2FibGVJYXRPZmZzZXRWYWxpZGF0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZGF0YUlkVG9rZW4uaGFzT3duUHJvcGVydHkoJ2lhdCcpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkYXRlVGltZUlhdElkVG9rZW4gPSBuZXcgRGF0ZSgwKTsgLy8gVGhlIDAgaGVyZSBpcyB0aGUga2V5LCB3aGljaCBzZXRzIHRoZSBkYXRlIHRvIHRoZSBlcG9jaFxuICAgICAgICBkYXRlVGltZUlhdElkVG9rZW4uc2V0VVRDU2Vjb25kcyhkYXRhSWRUb2tlbi5pYXQpO1xuXG4gICAgICAgIG1heE9mZnNldEFsbG93ZWRJblNlY29uZHMgPSBtYXhPZmZzZXRBbGxvd2VkSW5TZWNvbmRzIHx8IDA7XG5cbiAgICAgICAgaWYgKGRhdGVUaW1lSWF0SWRUb2tlbiA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXG4gICAgICAgICAgICAndmFsaWRhdGVfaWRfdG9rZW5faWF0X21heF9vZmZzZXQ6ICcgK1xuICAgICAgICAgICAgKG5ldyBEYXRlKCkudmFsdWVPZigpIC0gZGF0ZVRpbWVJYXRJZFRva2VuLnZhbHVlT2YoKSkgK1xuICAgICAgICAgICAgJyA8ICcgK1xuICAgICAgICAgICAgbWF4T2Zmc2V0QWxsb3dlZEluU2Vjb25kcyAqIDEwMDBcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBkaWZmID0gbmV3IERhdGUoKS52YWx1ZU9mKCkgLSBkYXRlVGltZUlhdElkVG9rZW4udmFsdWVPZigpO1xuICAgICAgICBpZiAoZGlmZiA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBkaWZmIDwgbWF4T2Zmc2V0QWxsb3dlZEluU2Vjb25kcyAqIDEwMDA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gLWRpZmYgPCBtYXhPZmZzZXRBbGxvd2VkSW5TZWNvbmRzICogMTAwMDtcbiAgICB9XG5cbiAgICAvLyBpZF90b2tlbiBDOTogVGhlIHZhbHVlIG9mIHRoZSBub25jZSBDbGFpbSBNVVNUIGJlIGNoZWNrZWQgdG8gdmVyaWZ5IHRoYXQgaXQgaXMgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIG9uZVxuICAgIC8vIHRoYXQgd2FzIHNlbnQgaW4gdGhlIEF1dGhlbnRpY2F0aW9uIFJlcXVlc3QuVGhlIENsaWVudCBTSE9VTEQgY2hlY2sgdGhlIG5vbmNlIHZhbHVlIGZvciByZXBsYXkgYXR0YWNrcy5cbiAgICAvLyBUaGUgcHJlY2lzZSBtZXRob2QgZm9yIGRldGVjdGluZyByZXBsYXkgYXR0YWNrcyBpcyBDbGllbnQgc3BlY2lmaWMuXG5cbiAgICAvLyBIb3dldmVyIHRoZSBub25jZSBjbGFpbSBTSE9VTEQgbm90IGJlIHByZXNlbnQgZm9yIHRoZSByZWZlc2hfdG9rZW4gZ3JhbnQgdHlwZVxuICAgIC8vIGh0dHBzOi8vYml0YnVja2V0Lm9yZy9vcGVuaWQvY29ubmVjdC9pc3N1ZXMvMTAyNS9hbWJpZ3VpdHktd2l0aC1ob3ctbm9uY2UtaXMtaGFuZGxlZC1vblxuICAgIC8vIFRoZSBjdXJyZW50IHNwZWMgaXMgYW1iaWd1b3VzIGFuZCBLZXljbG9hayBkb2VzIHNlbmQgaXQuXG4gICAgdmFsaWRhdGVJZFRva2VuTm9uY2UoZGF0YUlkVG9rZW46IGFueSwgbG9jYWxOb25jZTogYW55LCBpZ25vcmVOb25jZUFmdGVyUmVmcmVzaDogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBpc0Zyb21SZWZyZXNoVG9rZW4gPVxuICAgICAgICAgICAgKGRhdGFJZFRva2VuLm5vbmNlID09PSB1bmRlZmluZWQgfHwgaWdub3JlTm9uY2VBZnRlclJlZnJlc2gpICYmXG4gICAgICAgICAgICBsb2NhbE5vbmNlID09PSBUb2tlblZhbGlkYXRpb25TZXJ2aWNlLlJlZnJlc2hUb2tlbk5vbmNlUGxhY2Vob2xkZXI7XG4gICAgICAgIGlmICghaXNGcm9tUmVmcmVzaFRva2VuICYmIGRhdGFJZFRva2VuLm5vbmNlICE9PSBsb2NhbE5vbmNlKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXG4gICAgICAgICAgICAgICAgJ1ZhbGlkYXRlX2lkX3Rva2VuX25vbmNlIGZhaWxlZCwgZGF0YUlkVG9rZW4ubm9uY2U6ICcgKyBkYXRhSWRUb2tlbi5ub25jZSArICcgbG9jYWxfbm9uY2U6JyArIGxvY2FsTm9uY2VcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBpZF90b2tlbiBDMTogVGhlIElzc3VlciBJZGVudGlmaWVyIGZvciB0aGUgT3BlbklEIFByb3ZpZGVyICh3aGljaCBpcyB0eXBpY2FsbHkgb2J0YWluZWQgZHVyaW5nIERpc2NvdmVyeSlcbiAgICAvLyBNVVNUIGV4YWN0bHkgbWF0Y2ggdGhlIHZhbHVlIG9mIHRoZSBpc3MgKGlzc3VlcikgQ2xhaW0uXG4gICAgdmFsaWRhdGVJZFRva2VuSXNzKGRhdGFJZFRva2VuOiBhbnksIGF1dGhXZWxsS25vd25FbmRwb2ludHNJc3N1ZXI6IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoKGRhdGFJZFRva2VuLmlzcyBhcyBzdHJpbmcpICE9PSAoYXV0aFdlbGxLbm93bkVuZHBvaW50c0lzc3VlciBhcyBzdHJpbmcpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXG4gICAgICAgICAgICAgICAgJ1ZhbGlkYXRlX2lkX3Rva2VuX2lzcyBmYWlsZWQsIGRhdGFJZFRva2VuLmlzczogJyArXG4gICAgICAgICAgICAgICAgZGF0YUlkVG9rZW4uaXNzICtcbiAgICAgICAgICAgICAgICAnIGF1dGhXZWxsS25vd25FbmRwb2ludHMgaXNzdWVyOicgK1xuICAgICAgICAgICAgICAgIGF1dGhXZWxsS25vd25FbmRwb2ludHNJc3N1ZXJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBpZF90b2tlbiBDMjogVGhlIENsaWVudCBNVVNUIHZhbGlkYXRlIHRoYXQgdGhlIGF1ZCAoYXVkaWVuY2UpIENsYWltIGNvbnRhaW5zIGl0cyBjbGllbnRfaWQgdmFsdWUgcmVnaXN0ZXJlZCBhdCB0aGUgSXNzdWVyIGlkZW50aWZpZWRcbiAgICAvLyBieSB0aGUgaXNzIChpc3N1ZXIpIENsYWltIGFzIGFuIGF1ZGllbmNlLlxuICAgIC8vIFRoZSBJRCBUb2tlbiBNVVNUIGJlIHJlamVjdGVkIGlmIHRoZSBJRCBUb2tlbiBkb2VzIG5vdCBsaXN0IHRoZSBDbGllbnQgYXMgYSB2YWxpZCBhdWRpZW5jZSwgb3IgaWYgaXQgY29udGFpbnMgYWRkaXRpb25hbCBhdWRpZW5jZXNcbiAgICAvLyBub3QgdHJ1c3RlZCBieSB0aGUgQ2xpZW50LlxuICAgIHZhbGlkYXRlSWRUb2tlbkF1ZChkYXRhSWRUb2tlbjogYW55LCBhdWQ6IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhSWRUb2tlbi5hdWQpKSB7XG4gICAgICAgICAgICAvLyBjb25zdCByZXN1bHQgPSB0aGlzLmFycmF5SGVscGVyU2VydmljZS5hcmVFcXVhbChkYXRhSWRUb2tlbi5hdWQsIGF1ZCk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBkYXRhSWRUb2tlbi5hdWQuaW5jbHVkZXMoYXVkKTtcblxuICAgICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXG4gICAgICAgICAgICAgICAgICAgICdWYWxpZGF0ZV9pZF90b2tlbl9hdWQgYXJyYXkgZmFpbGVkLCBkYXRhSWRUb2tlbi5hdWQ6ICcgKyBkYXRhSWRUb2tlbi5hdWQgKyAnIGNsaWVudF9pZDonICsgYXVkXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGFJZFRva2VuLmF1ZCAhPT0gYXVkKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1ZhbGlkYXRlX2lkX3Rva2VuX2F1ZCBmYWlsZWQsIGRhdGFJZFRva2VuLmF1ZDogJyArIGRhdGFJZFRva2VuLmF1ZCArICcgY2xpZW50X2lkOicgKyBhdWQpO1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YWxpZGF0ZUlkVG9rZW5BenBFeGlzdHNJZk1vcmVUaGFuT25lQXVkKGRhdGFJZFRva2VuOiBhbnkpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YUlkVG9rZW4uYXVkKSAmJiBkYXRhSWRUb2tlbi5hdWQubGVuZ3RoID4gMSAmJiAhZGF0YUlkVG9rZW4/LmF6cCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8vIElmIGFuIGF6cCAoYXV0aG9yaXplZCBwYXJ0eSkgQ2xhaW0gaXMgcHJlc2VudCwgdGhlIENsaWVudCBTSE9VTEQgdmVyaWZ5IHRoYXQgaXRzIGNsaWVudF9pZCBpcyB0aGUgQ2xhaW0gVmFsdWUuXG4gICAgdmFsaWRhdGVJZFRva2VuQXpwVmFsaWQoZGF0YUlkVG9rZW46IGFueSwgY2xpZW50SWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWRhdGFJZFRva2VuPy5henApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRhdGFJZFRva2VuLmF6cCA9PT0gY2xpZW50SWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhbGlkYXRlU3RhdGVGcm9tSGFzaENhbGxiYWNrKHN0YXRlOiBhbnksIGxvY2FsU3RhdGU6IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoKHN0YXRlIGFzIHN0cmluZykgIT09IChsb2NhbFN0YXRlIGFzIHN0cmluZykpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnVmFsaWRhdGVTdGF0ZUZyb21IYXNoQ2FsbGJhY2sgZmFpbGVkLCBzdGF0ZTogJyArIHN0YXRlICsgJyBsb2NhbF9zdGF0ZTonICsgbG9jYWxTdGF0ZSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBpZF90b2tlbiBDNTogVGhlIENsaWVudCBNVVNUIHZhbGlkYXRlIHRoZSBzaWduYXR1cmUgb2YgdGhlIElEIFRva2VuIGFjY29yZGluZyB0byBKV1MgW0pXU10gdXNpbmcgdGhlIGFsZ29yaXRobSBzcGVjaWZpZWQgaW4gdGhlIGFsZ1xuICAgIC8vIEhlYWRlciBQYXJhbWV0ZXIgb2YgdGhlIEpPU0UgSGVhZGVyLlRoZSBDbGllbnQgTVVTVCB1c2UgdGhlIGtleXMgcHJvdmlkZWQgYnkgdGhlIElzc3Vlci5cbiAgICAvLyBpZF90b2tlbiBDNjogVGhlIGFsZyB2YWx1ZSBTSE9VTEQgYmUgUlMyNTYuIFZhbGlkYXRpb24gb2YgdG9rZW5zIHVzaW5nIG90aGVyIHNpZ25pbmcgYWxnb3JpdGhtcyBpcyBkZXNjcmliZWQgaW4gdGhlXG4gICAgLy8gT3BlbklEIENvbm5lY3QgQ29yZSAxLjAgW09wZW5JRC5Db3JlXSBzcGVjaWZpY2F0aW9uLlxuICAgIHZhbGlkYXRlU2lnbmF0dXJlSWRUb2tlbihpZFRva2VuOiBhbnksIGp3dGtleXM6IGFueSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWp3dGtleXMgfHwgIWp3dGtleXMua2V5cykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaGVhZGVyRGF0YSA9IHRoaXMudG9rZW5IZWxwZXJTZXJ2aWNlLmdldEhlYWRlckZyb21Ub2tlbihpZFRva2VuLCBmYWxzZSk7XG5cbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKGhlYWRlckRhdGEpLmxlbmd0aCA9PT0gMCAmJiBoZWFkZXJEYXRhLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdpZCB0b2tlbiBoYXMgbm8gaGVhZGVyIGRhdGEnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGtpZCA9IGhlYWRlckRhdGEua2lkO1xuICAgICAgICBjb25zdCBhbGcgPSBoZWFkZXJEYXRhLmFsZztcblxuICAgICAgICBpZiAoIXRoaXMua2V5QWxnb3JpdGhtcy5pbmNsdWRlcyhhbGcgYXMgc3RyaW5nKSkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2FsZyBub3Qgc3VwcG9ydGVkJywgYWxnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBqd3RLdHlUb1VzZSA9ICdSU0EnO1xuICAgICAgICBpZiAoKGFsZyBhcyBzdHJpbmcpLmNoYXJBdCgwKSA9PT0gJ0UnKSB7XG4gICAgICAgICAgICBqd3RLdHlUb1VzZSA9ICdFQyc7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaXNWYWxpZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghaGVhZGVyRGF0YS5oYXNPd25Qcm9wZXJ0eSgna2lkJykpIHtcbiAgICAgICAgICAgIC8vIGV4YWN0bHkgMSBrZXkgaW4gdGhlIGp3dGtleXMgYW5kIG5vIGtpZCBpbiB0aGUgSm9zZSBoZWFkZXJcbiAgICAgICAgICAgIC8vIGt0eVx0XCJSU0FcIiBvciBFQyB1c2UgXCJzaWdcIlxuICAgICAgICAgICAgbGV0IGFtb3VudE9mTWF0Y2hpbmdLZXlzID0gMDtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IG9mIGp3dGtleXMua2V5cykge1xuICAgICAgICAgICAgICAgIGlmICgoa2V5Lmt0eSBhcyBzdHJpbmcpID09PSBqd3RLdHlUb1VzZSAmJiAoa2V5LnVzZSBhcyBzdHJpbmcpID09PSAnc2lnJykge1xuICAgICAgICAgICAgICAgICAgICBhbW91bnRPZk1hdGNoaW5nS2V5cyA9IGFtb3VudE9mTWF0Y2hpbmdLZXlzICsgMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhbW91bnRPZk1hdGNoaW5nS2V5cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdubyBrZXlzIGZvdW5kLCBpbmNvcnJlY3QgU2lnbmF0dXJlLCB2YWxpZGF0aW9uIGZhaWxlZCBmb3IgaWRfdG9rZW4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhbW91bnRPZk1hdGNoaW5nS2V5cyA+IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnbm8gSUQgVG9rZW4ga2lkIGNsYWltIGluIEpPU0UgaGVhZGVyIGFuZCBtdWx0aXBsZSBzdXBwbGllZCBpbiBqd2tzX3VyaScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgb2Ygand0a2V5cy5rZXlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKChrZXkua3R5IGFzIHN0cmluZykgPT09IGp3dEt0eVRvVXNlICYmIChrZXkudXNlIGFzIHN0cmluZykgPT09ICdzaWcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHB1YmxpY2tleSA9IEtFWVVUSUwuZ2V0S2V5KGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlzVmFsaWQgPSBLSlVSLmp3cy5KV1MudmVyaWZ5KGlkVG9rZW4sIHB1YmxpY2tleSwgW2FsZ10pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdpbmNvcnJlY3QgU2lnbmF0dXJlLCB2YWxpZGF0aW9uIGZhaWxlZCBmb3IgaWRfdG9rZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBraWQgaW4gdGhlIEpvc2UgaGVhZGVyIG9mIGlkX3Rva2VuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBqd3RrZXlzLmtleXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGtleS5raWQgYXMgc3RyaW5nKSA9PT0gKGtpZCBhcyBzdHJpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHB1YmxpY2tleSA9IEtFWVVUSUwuZ2V0S2V5KGtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlzVmFsaWQgPSBLSlVSLmp3cy5KV1MudmVyaWZ5KGlkVG9rZW4sIHB1YmxpY2tleSwgW2FsZ10pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdpbmNvcnJlY3QgU2lnbmF0dXJlLCB2YWxpZGF0aW9uIGZhaWxlZCBmb3IgaWRfdG9rZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9XG5cbiAgICBjb25maWdWYWxpZGF0ZVJlc3BvbnNlVHlwZShyZXNwb25zZVR5cGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dBbnlJbXBsaWNpdEZsb3coKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdtb2R1bGUgY29uZmlndXJlIGluY29ycmVjdCwgaW52YWxpZCByZXNwb25zZV90eXBlOicgKyByZXNwb25zZVR5cGUpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQWNjZXB0cyBJRCBUb2tlbiB3aXRob3V0ICdraWQnIGNsYWltIGluIEpPU0UgaGVhZGVyIGlmIG9ubHkgb25lIEpXSyBzdXBwbGllZCBpbiAnandrc191cmwnXG4gICAgLy8vLyBwcml2YXRlIHZhbGlkYXRlX25vX2tpZF9pbl9oZWFkZXJfb25seV9vbmVfYWxsb3dlZF9pbl9qd3RrZXlzKGhlYWRlcl9kYXRhOiBhbnksIGp3dGtleXM6IGFueSk6IGJvb2xlYW4ge1xuICAgIC8vLy8gICAgdGhpcy5vaWRjU2VjdXJpdHlDb21tb24ubG9nRGVidWcoJ2Ftb3VudCBvZiBqd3RrZXlzLmtleXM6ICcgKyBqd3RrZXlzLmtleXMubGVuZ3RoKTtcbiAgICAvLy8vICAgIGlmICghaGVhZGVyX2RhdGEuaGFzT3duUHJvcGVydHkoJ2tpZCcpKSB7XG4gICAgLy8vLyAgICAgICAgLy8gbm8ga2lkIGRlZmluZWQgaW4gSm9zZSBoZWFkZXJcbiAgICAvLy8vICAgICAgICBpZiAoand0a2V5cy5rZXlzLmxlbmd0aCAhPSAxKSB7XG4gICAgLy8vLyAgICAgICAgICAgIHRoaXMub2lkY1NlY3VyaXR5Q29tbW9uLmxvZ0RlYnVnKCdqd3RrZXlzLmtleXMubGVuZ3RoICE9IDEgYW5kIG5vIGtpZCBpbiBoZWFkZXInKTtcbiAgICAvLy8vICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIC8vLy8gICAgICAgIH1cbiAgICAvLy8vICAgIH1cblxuICAgIC8vLy8gICAgcmV0dXJuIHRydWU7XG4gICAgLy8vLyB9XG5cbiAgICAvLyBBY2Nlc3MgVG9rZW4gVmFsaWRhdGlvblxuICAgIC8vIGFjY2Vzc190b2tlbiBDMTogSGFzaCB0aGUgb2N0ZXRzIG9mIHRoZSBBU0NJSSByZXByZXNlbnRhdGlvbiBvZiB0aGUgYWNjZXNzX3Rva2VuIHdpdGggdGhlIGhhc2ggYWxnb3JpdGhtIHNwZWNpZmllZCBpbiBKV0FbSldBXVxuICAgIC8vIGZvciB0aGUgYWxnIEhlYWRlciBQYXJhbWV0ZXIgb2YgdGhlIElEIFRva2VuJ3MgSk9TRSBIZWFkZXIuIEZvciBpbnN0YW5jZSwgaWYgdGhlIGFsZyBpcyBSUzI1NiwgdGhlIGhhc2ggYWxnb3JpdGhtIHVzZWQgaXMgU0hBLTI1Ni5cbiAgICAvLyBhY2Nlc3NfdG9rZW4gQzI6IFRha2UgdGhlIGxlZnQtIG1vc3QgaGFsZiBvZiB0aGUgaGFzaCBhbmQgYmFzZTY0dXJsLSBlbmNvZGUgaXQuXG4gICAgLy8gYWNjZXNzX3Rva2VuIEMzOiBUaGUgdmFsdWUgb2YgYXRfaGFzaCBpbiB0aGUgSUQgVG9rZW4gTVVTVCBtYXRjaCB0aGUgdmFsdWUgcHJvZHVjZWQgaW4gdGhlIHByZXZpb3VzIHN0ZXAgaWYgYXRfaGFzaFxuICAgIC8vIGlzIHByZXNlbnQgaW4gdGhlIElEIFRva2VuLlxuICAgIHZhbGlkYXRlSWRUb2tlbkF0SGFzaChhY2Nlc3NUb2tlbjogYW55LCBhdEhhc2g6IGFueSwgaXNDb2RlRmxvdzogYm9vbGVhbiwgaWRUb2tlbkFsZzogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnYXRfaGFzaCBmcm9tIHRoZSBzZXJ2ZXI6JyArIGF0SGFzaCk7XG5cbiAgICAgICAgLy8gJ3NoYTI1NicgJ3NoYTM4NCcgJ3NoYTUxMidcbiAgICAgICAgbGV0IHNoYSA9ICdzaGEyNTYnO1xuICAgICAgICBpZiAoaWRUb2tlbkFsZy5pbmNsdWRlcygnMzg0JykpIHtcbiAgICAgICAgICAgIHNoYSA9ICdzaGEzODQnO1xuICAgICAgICB9IGVsc2UgaWYgKGlkVG9rZW5BbGcuaW5jbHVkZXMoJzUxMicpKSB7XG4gICAgICAgICAgICBzaGEgPSAnc2hhNTEyJztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRlc3RkYXRhID0gdGhpcy5nZW5lcmF0ZUF0SGFzaCgnJyArIGFjY2Vzc1Rva2VuLCBzaGEpO1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2F0X2hhc2ggY2xpZW50IHZhbGlkYXRpb24gbm90IGRlY29kZWQ6JyArIHRlc3RkYXRhKTtcbiAgICAgICAgaWYgKHRlc3RkYXRhID09PSAoYXRIYXNoIGFzIHN0cmluZykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBpc1ZhbGlkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdGVzdFZhbHVlID0gdGhpcy5nZW5lcmF0ZUF0SGFzaCgnJyArIGRlY29kZVVSSUNvbXBvbmVudChhY2Nlc3NUb2tlbiksIHNoYSk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJy1nZW4gYWNjZXNzLS0nICsgdGVzdFZhbHVlKTtcbiAgICAgICAgICAgIGlmICh0ZXN0VmFsdWUgPT09IChhdEhhc2ggYXMgc3RyaW5nKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyBpc1ZhbGlkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZUF0SGFzaChhY2Nlc3NUb2tlbjogYW55LCBzaGE6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGhhc2ggPSBLSlVSLmNyeXB0by5VdGlsLmhhc2hTdHJpbmcoYWNjZXNzVG9rZW4sIHNoYSk7XG4gICAgICAgIGNvbnN0IGZpcnN0MTI4Yml0cyA9IGhhc2guc3Vic3RyKDAsIGhhc2gubGVuZ3RoIC8gMik7XG4gICAgICAgIGNvbnN0IHRlc3RkYXRhID0gaGV4dG9iNjR1KGZpcnN0MTI4Yml0cyk7XG5cbiAgICAgICAgcmV0dXJuIHRlc3RkYXRhO1xuICAgIH1cblxuICAgIGdlbmVyYXRlQ29kZVZlcmlmaWVyKGNvZGVDaGFsbGVuZ2U6IGFueSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGhhc2ggPSBLSlVSLmNyeXB0by5VdGlsLmhhc2hTdHJpbmcoY29kZUNoYWxsZW5nZSwgJ3NoYTI1NicpO1xuICAgICAgICBjb25zdCB0ZXN0ZGF0YSA9IGhleHRvYjY0dShoYXNoKTtcblxuICAgICAgICByZXR1cm4gdGVzdGRhdGE7XG4gICAgfVxufVxuIl19