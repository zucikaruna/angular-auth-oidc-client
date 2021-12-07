import { __decorate, __param } from "tslib";
import { HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { oneLineTrim } from 'common-tags';
import { ConfigurationProvider } from '../../config/config.provider';
import { FlowsDataService } from '../../flows/flows-data.service';
import { LoggerService } from '../../logging/logger.service';
import { TokenValidationService } from '../../validation/token-validation.service';
import { FlowHelper } from '../flowHelper/flow-helper.service';
import { WINDOW } from '../window/window.reference';
import { UriEncoder } from './uri-encoder';
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
export { UrlService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvdXRpbHMvdXJsL3VybC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUMxQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNyRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDbkYsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQy9ELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzNDLElBQWEsVUFBVSxHQUF2QixNQUFhLFVBQVU7SUFHbkIsWUFDcUIscUJBQTRDLEVBQzVDLGFBQTRCLEVBQzVCLGdCQUFrQyxFQUNsQyxVQUFzQixFQUMvQixzQkFBOEMsRUFDOUIsTUFBVztRQUxsQiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsZUFBVSxHQUFWLFVBQVUsQ0FBWTtRQUMvQiwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1FBQzlCLFdBQU0sR0FBTixNQUFNLENBQUs7UUFSL0IsNkJBQXdCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztJQVN2RSxDQUFDO0lBRUosZUFBZSxDQUFDLFVBQWUsRUFBRSxJQUFTO1FBQ3RDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDYixPQUFPLEVBQUUsQ0FBQztTQUNiO1FBRUQsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLE9BQU8sRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRCxNQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDdkMsT0FBTyxPQUFPLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFRCxpQkFBaUI7UUFDYixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEksT0FBTyxtQkFBbUIsQ0FBQztJQUMvQixDQUFDO0lBRUQsK0JBQStCO1FBQzNCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO1lBQ3pDLE9BQU8sSUFBSSxDQUFDLGdDQUFnQyxFQUFFLENBQUM7U0FDbEQ7UUFFRCxPQUFPLElBQUksQ0FBQyxvQ0FBb0MsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUM3RCxDQUFDO0lBRUQsZUFBZSxDQUFDLFlBQTJEO1FBQ3ZFLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO1lBQ3pDLE9BQU8sSUFBSSxDQUFDLDBCQUEwQixDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ3hEO1FBRUQsT0FBTyxJQUFJLENBQUMsOEJBQThCLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ25FLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxXQUFtQjs7UUFDbkMsTUFBTSxrQkFBa0IsU0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsa0JBQWtCLDBDQUFFLGtCQUFrQixDQUFDO1FBRTdGLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUNyQixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRS9DLE1BQU0sMEJBQTBCLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRS9DLElBQUksTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDO1lBQ3hCLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJLFVBQVUsRUFBRTtTQUM1QixDQUFDLENBQUM7UUFDSCxNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFbEQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUU5RCxJQUFJLHFCQUFxQixFQUFFO1lBQ3ZCLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLDBCQUEwQixFQUFFLHFCQUFxQixDQUFDLENBQUM7U0FDN0U7UUFFRCxPQUFPLEdBQUcsMEJBQTBCLElBQUksTUFBTSxFQUFFLENBQUM7SUFDckQsQ0FBQztJQUVELHVDQUF1QyxDQUFDLEtBQVU7UUFDOUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXBDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDWCxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxhQUFhLFFBQVEsVUFBVSxLQUFLLCtCQUErQixDQUFDO0lBQy9FLENBQUM7SUFFRCx3Q0FBd0MsQ0FBQyxLQUFVO1FBQy9DLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVwQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELE9BQU8sYUFBYSxRQUFRLFVBQVUsS0FBSyxnQ0FBZ0MsQ0FBQztJQUNoRixDQUFDO0lBRUQsd0JBQXdCOztRQUNwQixNQUFNLGtCQUFrQixTQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxrQkFBa0IsMENBQUUsa0JBQWtCLENBQUM7UUFFN0YsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQ3JCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxNQUFNLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFL0MsTUFBTSxxQkFBcUIsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsT0FBTyxxQkFBcUIsQ0FBQztJQUNqQyxDQUFDO0lBRUQsZ0NBQWdDLENBQUMsSUFBWTtRQUN6QyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDN0QsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNmLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3RFLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNYLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUE7eUJBQ2QsUUFBUTs2QkFDSixZQUFZO29CQUNyQixJQUFJLEVBQUUsQ0FBQztRQUVuQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUVoRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLGNBQWMsRUFBRTtZQUNoRSxPQUFPLFdBQVcsQ0FBQSxHQUFHLFdBQVcsaUJBQWlCLGNBQWMsRUFBRSxDQUFDO1NBQ3JFO1FBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDZCxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxXQUFXLENBQUEsR0FBRyxXQUFXLGlCQUFpQixXQUFXLEVBQUUsQ0FBQztJQUNuRSxDQUFDO0lBRUQseUNBQXlDLENBQUMsWUFBb0I7UUFDMUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXBDLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDWCxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxXQUFXLENBQUE7dUJBQ0gsUUFBUTsyQkFDSixZQUFZLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBRU8sa0JBQWtCLENBQ3RCLGFBQXFCLEVBQ3JCLFdBQW1CLEVBQ25CLEtBQWEsRUFDYixLQUFhLEVBQ2IsTUFBZSxFQUNmLG1CQUFrRTs7UUFFbEUsTUFBTSxxQkFBcUIsZUFBRyxJQUFJLENBQUMscUJBQXFCLDBDQUFFLGtCQUFrQiwwQ0FBRSxxQkFBcUIsQ0FBQztRQUVwRyxJQUFJLENBQUMscUJBQXFCLEVBQUU7WUFDeEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsa0VBQWtFLHFCQUFxQixHQUFHLENBQUMsQ0FBQztZQUN4SCxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsTUFBTSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUM7UUFFaEgsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNYLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLDREQUE0RCxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3BHLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsZ0VBQWdFLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDNUcsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDUixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyx5REFBeUQsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM5RixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsTUFBTSxRQUFRLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXJDLElBQUksTUFBTSxHQUFHLElBQUksVUFBVSxDQUFDO1lBQ3hCLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJLFVBQVUsRUFBRTtTQUM1QixDQUFDLENBQUM7UUFFSCxNQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDM0MsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN0RCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV2QyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUsRUFBRTtZQUN6QyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxhQUFhLENBQUMsQ0FBQztZQUN4RCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUMzRDtRQUVELElBQUksTUFBTSxFQUFFO1lBQ1IsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzVDO1FBRUQsSUFBSSxPQUFPLEVBQUU7WUFDVCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDekM7UUFFRCxJQUFJLFlBQVksSUFBSSxtQkFBbUIsRUFBRTtZQUNyQyxNQUFNLGlCQUFpQixtQ0FBUSxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsR0FBSyxDQUFDLG1CQUFtQixJQUFJLEVBQUUsQ0FBQyxDQUFFLENBQUM7WUFFdEYsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFBRTtnQkFDMUQsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQ2pEO1NBQ0o7UUFFRCxPQUFPLEdBQUcsZ0JBQWdCLElBQUksTUFBTSxFQUFFLENBQUM7SUFDM0MsQ0FBQztJQUVPLG9DQUFvQztRQUN4QyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUNBQW1DLEVBQUUsQ0FBQztRQUMxRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFbEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFaEQsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNqQixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsOENBQThDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFbkYsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsa0JBQWtCLEVBQUU7WUFDL0MsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzVFO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUNuRSxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU8sZ0NBQWdDO1FBQ3BDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxtQ0FBbUMsRUFBRSxDQUFDO1FBQzFFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVsRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyw4Q0FBOEMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUVwRiw2QkFBNkI7UUFDN0IsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDaEUsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXJGLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRWhELElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDakIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLGtCQUFrQixFQUFFO1lBQy9DLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztTQUN2RjtRQUVELElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDckUsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVPLDhCQUE4QixDQUFDLFlBQTJEO1FBQzlGLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxtQ0FBbUMsRUFBRSxDQUFDO1FBQzFFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNsRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyx5Q0FBeUMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUUvRSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFMUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNkLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxrQkFBa0IsRUFBRTtZQUMvQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQ3JGO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUNuRSxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU8sMEJBQTBCLENBQUMsWUFBMkQ7UUFDMUYsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1DQUFtQyxFQUFFLENBQUM7UUFDMUUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLHlDQUF5QyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBRS9FLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUUxQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2QsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELDZCQUE2QjtRQUM3QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUNoRSxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFckYsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsa0JBQWtCLEVBQUU7WUFDL0MsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztTQUNoRztRQUVELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDbkUsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVPLGNBQWM7O1FBQ2xCLE1BQU0sV0FBVyxTQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsMENBQUUsV0FBVyxDQUFDO1FBRWhGLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDZCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM3RSxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVPLGlCQUFpQjs7UUFDckIsTUFBTSxjQUFjLFNBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQiwwQ0FBRSxjQUFjLENBQUM7UUFFdEYsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNqQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNuRixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxjQUFjLENBQUM7SUFDMUIsQ0FBQztJQUVPLHdCQUF3Qjs7UUFDNUIsTUFBTSxxQkFBcUIsU0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLDBDQUFFLHFCQUFxQixDQUFDO1FBQ3BHLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtZQUN4QixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyw0Q0FBNEMsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1lBQ2pHLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxPQUFPLHFCQUFxQixDQUFDO0lBQ2pDLENBQUM7SUFFTyxXQUFXOztRQUNmLE1BQU0sUUFBUSxTQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsMENBQUUsUUFBUSxDQUFDO1FBQzFFLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDWCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN2RSxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztDQUNKLENBQUE7O1lBMVYrQyxxQkFBcUI7WUFDN0IsYUFBYTtZQUNWLGdCQUFnQjtZQUN0QixVQUFVO1lBQ1Asc0JBQXNCOzRDQUNyRCxNQUFNLFNBQUMsTUFBTTs7QUFUVCxVQUFVO0lBRHRCLFVBQVUsRUFBRTtJQVVKLFdBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0dBVFYsVUFBVSxDQThWdEI7U0E5VlksVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBQYXJhbXMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XHJcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBvbmVMaW5lVHJpbSB9IGZyb20gJ2NvbW1vbi10YWdzJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi8uLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFRva2VuVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuLi8uLi92YWxpZGF0aW9uL3Rva2VuLXZhbGlkYXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuLi9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBXSU5ET1cgfSBmcm9tICcuLi93aW5kb3cvd2luZG93LnJlZmVyZW5jZSc7XHJcbmltcG9ydCB7IFVyaUVuY29kZXIgfSBmcm9tICcuL3VyaS1lbmNvZGVyJztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIFVybFNlcnZpY2Uge1xyXG4gICAgcHJpdmF0ZSBDQUxMQkFDS19QQVJBTVNfVE9fQ0hFQ0sgPSBbJ2NvZGUnLCAnc3RhdGUnLCAndG9rZW4nLCAnaWRfdG9rZW4nXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBmbG93SGVscGVyOiBGbG93SGVscGVyLFxyXG4gICAgICAgIHByaXZhdGUgdG9rZW5WYWxpZGF0aW9uU2VydmljZTogVG9rZW5WYWxpZGF0aW9uU2VydmljZSxcclxuICAgICAgICBASW5qZWN0KFdJTkRPVykgcHJpdmF0ZSB3aW5kb3c6IGFueVxyXG4gICAgKSB7fVxyXG5cclxuICAgIGdldFVybFBhcmFtZXRlcih1cmxUb0NoZWNrOiBhbnksIG5hbWU6IGFueSk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKCF1cmxUb0NoZWNrKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghbmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyk7XHJcbiAgICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKCdbXFxcXD8mXScgKyBuYW1lICsgJz0oW14mI10qKScpO1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZWdleC5leGVjKHVybFRvQ2hlY2spO1xyXG4gICAgICAgIHJldHVybiByZXN1bHRzID09PSBudWxsID8gJycgOiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXSk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNDYWxsYmFja0Zyb21TdHMoKSB7XHJcbiAgICAgICAgY29uc3QgYW55UGFyYW1ldGVySXNHaXZlbiA9IHRoaXMuQ0FMTEJBQ0tfUEFSQU1TX1RPX0NIRUNLLnNvbWUoKHgpID0+ICEhdGhpcy5nZXRVcmxQYXJhbWV0ZXIodGhpcy53aW5kb3cubG9jYXRpb24udG9TdHJpbmcoKSwgeCkpO1xyXG4gICAgICAgIHJldHVybiBhbnlQYXJhbWV0ZXJJc0dpdmVuO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJlZnJlc2hTZXNzaW9uU2lsZW50UmVuZXdVcmwoKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVVybENvZGVGbG93V2l0aFNpbGVudFJlbmV3KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVVcmxJbXBsaWNpdEZsb3dXaXRoU2lsZW50UmVuZXcoKSB8fCAnJztcclxuICAgIH1cclxuXHJcbiAgICBnZXRBdXRob3JpemVVcmwoY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlVXJsQ29kZUZsb3dBdXRob3JpemUoY3VzdG9tUGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVVybEltcGxpY2l0Rmxvd0F1dGhvcml6ZShjdXN0b21QYXJhbXMpIHx8ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUVuZFNlc3Npb25VcmwoaWRUb2tlbkhpbnQ6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IGVuZFNlc3Npb25FbmRwb2ludCA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cz8uZW5kU2Vzc2lvbkVuZHBvaW50O1xyXG5cclxuICAgICAgICBpZiAoIWVuZFNlc3Npb25FbmRwb2ludCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHVybFBhcnRzID0gZW5kU2Vzc2lvbkVuZHBvaW50LnNwbGl0KCc/Jyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGF1dGhvcml6YXRpb25FbmRzZXNzaW9uVXJsID0gdXJsUGFydHNbMF07XHJcblxyXG4gICAgICAgIGxldCBwYXJhbXMgPSBuZXcgSHR0cFBhcmFtcyh7XHJcbiAgICAgICAgICAgIGZyb21TdHJpbmc6IHVybFBhcnRzWzFdLFxyXG4gICAgICAgICAgICBlbmNvZGVyOiBuZXcgVXJpRW5jb2RlcigpLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBhcmFtcyA9IHBhcmFtcy5zZXQoJ2lkX3Rva2VuX2hpbnQnLCBpZFRva2VuSGludCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHBvc3RMb2dvdXRSZWRpcmVjdFVyaSA9IHRoaXMuZ2V0UG9zdExvZ291dFJlZGlyZWN0VXJsKCk7XHJcblxyXG4gICAgICAgIGlmIChwb3N0TG9nb3V0UmVkaXJlY3RVcmkpIHtcclxuICAgICAgICAgICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZCgncG9zdF9sb2dvdXRfcmVkaXJlY3RfdXJpJywgcG9zdExvZ291dFJlZGlyZWN0VXJpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBgJHthdXRob3JpemF0aW9uRW5kc2Vzc2lvblVybH0/JHtwYXJhbXN9YDtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVSZXZvY2F0aW9uRW5kcG9pbnRCb2R5QWNjZXNzVG9rZW4odG9rZW46IGFueSkge1xyXG4gICAgICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5nZXRDbGllbnRJZCgpO1xyXG5cclxuICAgICAgICBpZiAoIWNsaWVudElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGBjbGllbnRfaWQ9JHtjbGllbnRJZH0mdG9rZW49JHt0b2tlbn0mdG9rZW5fdHlwZV9oaW50PWFjY2Vzc190b2tlbmA7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUmV2b2NhdGlvbkVuZHBvaW50Qm9keVJlZnJlc2hUb2tlbih0b2tlbjogYW55KSB7XHJcbiAgICAgICAgY29uc3QgY2xpZW50SWQgPSB0aGlzLmdldENsaWVudElkKCk7XHJcblxyXG4gICAgICAgIGlmICghY2xpZW50SWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYGNsaWVudF9pZD0ke2NsaWVudElkfSZ0b2tlbj0ke3Rva2VufSZ0b2tlbl90eXBlX2hpbnQ9cmVmcmVzaF90b2tlbmA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0UmV2b2NhdGlvbkVuZHBvaW50VXJsKCkge1xyXG4gICAgICAgIGNvbnN0IGVuZFNlc3Npb25FbmRwb2ludCA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cz8ucmV2b2NhdGlvbkVuZHBvaW50O1xyXG5cclxuICAgICAgICBpZiAoIWVuZFNlc3Npb25FbmRwb2ludCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHVybFBhcnRzID0gZW5kU2Vzc2lvbkVuZHBvaW50LnNwbGl0KCc/Jyk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJldm9jYXRpb25FbmRwb2ludFVybCA9IHVybFBhcnRzWzBdO1xyXG4gICAgICAgIHJldHVybiByZXZvY2F0aW9uRW5kcG9pbnRVcmw7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQm9keUZvckNvZGVGbG93Q29kZVJlcXVlc3QoY29kZTogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBjb2RlVmVyaWZpZXIgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0Q29kZVZlcmlmaWVyKCk7XHJcbiAgICAgICAgaWYgKCFjb2RlVmVyaWZpZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBDb2RlVmVyaWZpZXIgaXMgbm90IHNldCBgLCBjb2RlVmVyaWZpZXIpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5nZXRDbGllbnRJZCgpO1xyXG5cclxuICAgICAgICBpZiAoIWNsaWVudElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGF0YUZvckJvZHkgPSBvbmVMaW5lVHJpbWBncmFudF90eXBlPWF1dGhvcml6YXRpb25fY29kZVxyXG4gICAgICAgICAgICAmY2xpZW50X2lkPSR7Y2xpZW50SWR9XHJcbiAgICAgICAgICAgICZjb2RlX3ZlcmlmaWVyPSR7Y29kZVZlcmlmaWVyfVxyXG4gICAgICAgICAgICAmY29kZT0ke2NvZGV9YDtcclxuXHJcbiAgICAgICAgY29uc3Qgc2lsZW50UmVuZXdVcmwgPSB0aGlzLmdldFNpbGVudFJlbmV3VXJsKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmZsb3dzRGF0YVNlcnZpY2UuaXNTaWxlbnRSZW5ld1J1bm5pbmcoKSAmJiBzaWxlbnRSZW5ld1VybCkge1xyXG4gICAgICAgICAgICByZXR1cm4gb25lTGluZVRyaW1gJHtkYXRhRm9yQm9keX0mcmVkaXJlY3RfdXJpPSR7c2lsZW50UmVuZXdVcmx9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gdGhpcy5nZXRSZWRpcmVjdFVybCgpO1xyXG5cclxuICAgICAgICBpZiAoIXJlZGlyZWN0VXJsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG9uZUxpbmVUcmltYCR7ZGF0YUZvckJvZHl9JnJlZGlyZWN0X3VyaT0ke3JlZGlyZWN0VXJsfWA7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQm9keUZvckNvZGVGbG93UmVmcmVzaFRva2Vuc1JlcXVlc3QocmVmcmVzaHRva2VuOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5nZXRDbGllbnRJZCgpO1xyXG5cclxuICAgICAgICBpZiAoIWNsaWVudElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG9uZUxpbmVUcmltYGdyYW50X3R5cGU9cmVmcmVzaF90b2tlblxyXG4gICAgICAgICAgJmNsaWVudF9pZD0ke2NsaWVudElkfVxyXG4gICAgICAgICAgJnJlZnJlc2hfdG9rZW49JHtyZWZyZXNodG9rZW59YDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNyZWF0ZUF1dGhvcml6ZVVybChcclxuICAgICAgICBjb2RlQ2hhbGxlbmdlOiBzdHJpbmcsXHJcbiAgICAgICAgcmVkaXJlY3RVcmw6IHN0cmluZyxcclxuICAgICAgICBub25jZTogc3RyaW5nLFxyXG4gICAgICAgIHN0YXRlOiBzdHJpbmcsXHJcbiAgICAgICAgcHJvbXB0Pzogc3RyaW5nLFxyXG4gICAgICAgIGN1c3RvbVJlcXVlc3RQYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfVxyXG4gICAgKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBhdXRob3JpemF0aW9uRW5kcG9pbnQgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlcj8ud2VsbEtub3duRW5kcG9pbnRzPy5hdXRob3JpemF0aW9uRW5kcG9pbnQ7XHJcblxyXG4gICAgICAgIGlmICghYXV0aG9yaXphdGlvbkVuZHBvaW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgQ2FuIG5vdCBjcmVhdGUgYW4gYXV0aG9yaXplIHVybCB3aGVuIGF1dGhvcml6YXRpb25FbmRwb2ludCBpcyAnJHthdXRob3JpemF0aW9uRW5kcG9pbnR9J2ApO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHsgY2xpZW50SWQsIHJlc3BvbnNlVHlwZSwgc2NvcGUsIGhkUGFyYW0sIGN1c3RvbVBhcmFtcyB9ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbjtcclxuXHJcbiAgICAgICAgaWYgKCFjbGllbnRJZCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNyZWF0ZUF1dGhvcml6ZVVybCBjb3VsZCBub3QgYWRkIGNsaWVudElkIGJlY2F1c2UgaXQgd2FzOiBgLCBjbGllbnRJZCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFyZXNwb25zZVR5cGUpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBjcmVhdGVBdXRob3JpemVVcmwgY291bGQgbm90IGFkZCByZXNwb25zZVR5cGUgYmVjYXVzZSBpdCB3YXM6IGAsIHJlc3BvbnNlVHlwZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFzY29wZSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNyZWF0ZUF1dGhvcml6ZVVybCBjb3VsZCBub3QgYWRkIHNjb3BlIGJlY2F1c2UgaXQgd2FzOiBgLCBzY29wZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdXJsUGFydHMgPSBhdXRob3JpemF0aW9uRW5kcG9pbnQuc3BsaXQoJz8nKTtcclxuICAgICAgICBjb25zdCBhdXRob3JpemF0aW9uVXJsID0gdXJsUGFydHNbMF07XHJcblxyXG4gICAgICAgIGxldCBwYXJhbXMgPSBuZXcgSHR0cFBhcmFtcyh7XHJcbiAgICAgICAgICAgIGZyb21TdHJpbmc6IHVybFBhcnRzWzFdLFxyXG4gICAgICAgICAgICBlbmNvZGVyOiBuZXcgVXJpRW5jb2RlcigpLFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBwYXJhbXMgPSBwYXJhbXMuc2V0KCdjbGllbnRfaWQnLCBjbGllbnRJZCk7XHJcbiAgICAgICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZCgncmVkaXJlY3RfdXJpJywgcmVkaXJlY3RVcmwpO1xyXG4gICAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3Jlc3BvbnNlX3R5cGUnLCByZXNwb25zZVR5cGUpO1xyXG4gICAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3Njb3BlJywgc2NvcGUpO1xyXG4gICAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ25vbmNlJywgbm9uY2UpO1xyXG4gICAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3N0YXRlJywgc3RhdGUpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpKSB7XHJcbiAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ2NvZGVfY2hhbGxlbmdlJywgY29kZUNoYWxsZW5nZSk7XHJcbiAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ2NvZGVfY2hhbGxlbmdlX21ldGhvZCcsICdTMjU2Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocHJvbXB0KSB7XHJcbiAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3Byb21wdCcsIHByb21wdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaGRQYXJhbSkge1xyXG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdoZCcsIGhkUGFyYW0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGN1c3RvbVBhcmFtcyB8fCBjdXN0b21SZXF1ZXN0UGFyYW1zKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbVBhcmFtc1RvQWRkID0geyAuLi4oY3VzdG9tUGFyYW1zIHx8IHt9KSwgLi4uKGN1c3RvbVJlcXVlc3RQYXJhbXMgfHwge30pIH07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhjdXN0b21QYXJhbXNUb0FkZCkpIHtcclxuICAgICAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoa2V5LCB2YWx1ZS50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGAke2F1dGhvcml6YXRpb25Vcmx9PyR7cGFyYW1zfWA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVVcmxJbXBsaWNpdEZsb3dXaXRoU2lsZW50UmVuZXcoKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRFeGlzdGluZ09yQ3JlYXRlQXV0aFN0YXRlQ29udHJvbCgpO1xyXG4gICAgICAgIGNvbnN0IG5vbmNlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZU5vbmNlKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHNpbGVudFJlbmV3VXJsID0gdGhpcy5nZXRTaWxlbnRSZW5ld1VybCgpO1xyXG5cclxuICAgICAgICBpZiAoIXNpbGVudFJlbmV3VXJsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdSZWZyZXNoU2Vzc2lvbiBjcmVhdGVkLiBhZGRpbmcgbXlhdXRvc3RhdGU6ICcsIHN0YXRlKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVBdXRob3JpemVVcmwoJycsIHNpbGVudFJlbmV3VXJsLCBub25jZSwgc3RhdGUsICdub25lJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVVcmxDb2RlRmxvd1dpdGhTaWxlbnRSZW5ldygpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldEV4aXN0aW5nT3JDcmVhdGVBdXRoU3RhdGVDb250cm9sKCk7XHJcbiAgICAgICAgY29uc3Qgbm9uY2UgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlTm9uY2UoKTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdSZWZyZXNoU2Vzc2lvbiBjcmVhdGVkLiBhZGRpbmcgbXlhdXRvc3RhdGU6ICcgKyBzdGF0ZSk7XHJcblxyXG4gICAgICAgIC8vIGNvZGVfY2hhbGxlbmdlIHdpdGggXCJTMjU2XCJcclxuICAgICAgICBjb25zdCBjb2RlVmVyaWZpZXIgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlQ29kZVZlcmlmaWVyKCk7XHJcbiAgICAgICAgY29uc3QgY29kZUNoYWxsZW5nZSA9IHRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS5nZW5lcmF0ZUNvZGVWZXJpZmllcihjb2RlVmVyaWZpZXIpO1xyXG5cclxuICAgICAgICBjb25zdCBzaWxlbnRSZW5ld1VybCA9IHRoaXMuZ2V0U2lsZW50UmVuZXdVcmwoKTtcclxuXHJcbiAgICAgICAgaWYgKCFzaWxlbnRSZW5ld1VybCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci53ZWxsS25vd25FbmRwb2ludHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQXV0aG9yaXplVXJsKGNvZGVDaGFsbGVuZ2UsIHNpbGVudFJlbmV3VXJsLCBub25jZSwgc3RhdGUsICdub25lJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQnKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNyZWF0ZVVybEltcGxpY2l0Rmxvd0F1dGhvcml6ZShjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woKTtcclxuICAgICAgICBjb25zdCBub25jZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5jcmVhdGVOb25jZSgpO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQXV0aG9yaXplIGNyZWF0ZWQuIGFkZGluZyBteWF1dG9zdGF0ZTogJyArIHN0YXRlKTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVkaXJlY3RVcmwgPSB0aGlzLmdldFJlZGlyZWN0VXJsKCk7XHJcblxyXG4gICAgICAgIGlmICghcmVkaXJlY3RVcmwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIud2VsbEtub3duRW5kcG9pbnRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUF1dGhvcml6ZVVybCgnJywgcmVkaXJlY3RVcmwsIG5vbmNlLCBzdGF0ZSwgbnVsbCwgY3VzdG9tUGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQnKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNyZWF0ZVVybENvZGVGbG93QXV0aG9yaXplKGN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRFeGlzdGluZ09yQ3JlYXRlQXV0aFN0YXRlQ29udHJvbCgpO1xyXG4gICAgICAgIGNvbnN0IG5vbmNlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZU5vbmNlKCk7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdBdXRob3JpemUgY3JlYXRlZC4gYWRkaW5nIG15YXV0b3N0YXRlOiAnICsgc3RhdGUpO1xyXG5cclxuICAgICAgICBjb25zdCByZWRpcmVjdFVybCA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoKTtcclxuXHJcbiAgICAgICAgaWYgKCFyZWRpcmVjdFVybCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNvZGVfY2hhbGxlbmdlIHdpdGggXCJTMjU2XCJcclxuICAgICAgICBjb25zdCBjb2RlVmVyaWZpZXIgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlQ29kZVZlcmlmaWVyKCk7XHJcbiAgICAgICAgY29uc3QgY29kZUNoYWxsZW5nZSA9IHRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS5nZW5lcmF0ZUNvZGVWZXJpZmllcihjb2RlVmVyaWZpZXIpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIud2VsbEtub3duRW5kcG9pbnRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUF1dGhvcml6ZVVybChjb2RlQ2hhbGxlbmdlLCByZWRpcmVjdFVybCwgbm9uY2UsIHN0YXRlLCBudWxsLCBjdXN0b21QYXJhbXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKCdhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzIHVuZGVmaW5lZCcpO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0UmVkaXJlY3RVcmwoKSB7XHJcbiAgICAgICAgY29uc3QgcmVkaXJlY3RVcmwgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uPy5yZWRpcmVjdFVybDtcclxuXHJcbiAgICAgICAgaWYgKCFyZWRpcmVjdFVybCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNvdWxkIG5vdCBnZXQgcmVkaXJlY3RVcmwsIHdhczogYCwgcmVkaXJlY3RVcmwpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZWRpcmVjdFVybDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFNpbGVudFJlbmV3VXJsKCkge1xyXG4gICAgICAgIGNvbnN0IHNpbGVudFJlbmV3VXJsID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8uc2lsZW50UmVuZXdVcmw7XHJcblxyXG4gICAgICAgIGlmICghc2lsZW50UmVuZXdVcmwpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBjb3VsZCBub3QgZ2V0IHNpbGVudFJlbmV3VXJsLCB3YXM6IGAsIHNpbGVudFJlbmV3VXJsKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2lsZW50UmVuZXdVcmw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRQb3N0TG9nb3V0UmVkaXJlY3RVcmwoKSB7XHJcbiAgICAgICAgY29uc3QgcG9zdExvZ291dFJlZGlyZWN0VXJpID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8ucG9zdExvZ291dFJlZGlyZWN0VXJpO1xyXG4gICAgICAgIGlmICghcG9zdExvZ291dFJlZGlyZWN0VXJpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgY291bGQgbm90IGdldCBwb3N0TG9nb3V0UmVkaXJlY3RVcmksIHdhczogYCwgcG9zdExvZ291dFJlZGlyZWN0VXJpKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcG9zdExvZ291dFJlZGlyZWN0VXJpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q2xpZW50SWQoKSB7XHJcbiAgICAgICAgY29uc3QgY2xpZW50SWQgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uPy5jbGllbnRJZDtcclxuICAgICAgICBpZiAoIWNsaWVudElkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgY291bGQgbm90IGdldCBjbGllbnRJZCwgd2FzOiBgLCBjbGllbnRJZCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNsaWVudElkO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==