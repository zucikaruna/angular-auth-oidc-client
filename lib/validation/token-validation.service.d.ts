import { LoggerService } from '../logging/logger.service';
import { FlowHelper } from '../utils/flowHelper/flow-helper.service';
import { TokenHelperService } from '../utils/tokenHelper/oidc-token-helper.service';
export declare class TokenValidationService {
    private tokenHelperService;
    private flowHelper;
    private loggerService;
    static RefreshTokenNoncePlaceholder: string;
    keyAlgorithms: string[];
    constructor(tokenHelperService: TokenHelperService, flowHelper: FlowHelper, loggerService: LoggerService);
    hasIdTokenExpired(token: string, offsetSeconds?: number): boolean;
    validateIdTokenExpNotExpired(decodedIdToken: string, offsetSeconds?: number): boolean;
    validateAccessTokenNotExpired(accessTokenExpiresAt: Date, offsetSeconds?: number): boolean;
    validateRequiredIdToken(dataIdToken: any): boolean;
    validateIdTokenIatMaxOffset(dataIdToken: any, maxOffsetAllowedInSeconds: number, disableIatOffsetValidation: boolean): boolean;
    validateIdTokenNonce(dataIdToken: any, localNonce: any, ignoreNonceAfterRefresh: boolean): boolean;
    validateIdTokenIss(dataIdToken: any, authWellKnownEndpointsIssuer: any): boolean;
    validateIdTokenAud(dataIdToken: any, aud: any): boolean;
    validateIdTokenAzpExistsIfMoreThanOneAud(dataIdToken: any): boolean;
    validateIdTokenAzpValid(dataIdToken: any, clientId: string): boolean;
    validateStateFromHashCallback(state: any, localState: any): boolean;
    validateSignatureIdToken(idToken: any, jwtkeys: any): boolean;
    configValidateResponseType(responseType: string): boolean;
    validateIdTokenAtHash(accessToken: any, atHash: any, isCodeFlow: boolean, idTokenAlg: string): boolean;
    private generateAtHash;
    generateCodeVerifier(codeChallenge: any): string;
}
