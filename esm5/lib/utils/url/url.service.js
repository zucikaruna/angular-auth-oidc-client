import { __assign, __decorate, __makeTemplateObject, __param, __read, __values } from "tslib";
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
export { UrlService };
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvdXRpbHMvdXJsL3VybC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUMxQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNyRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDbkYsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQy9ELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzNDO0lBR0ksb0JBQ3FCLHFCQUE0QyxFQUM1QyxhQUE0QixFQUM1QixnQkFBa0MsRUFDbEMsVUFBc0IsRUFDL0Isc0JBQThDLEVBQzlCLE1BQVc7UUFMbEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDL0IsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtRQUM5QixXQUFNLEdBQU4sTUFBTSxDQUFLO1FBUi9CLDZCQUF3QixHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVB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QztRQUV0RixJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ2pCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLHFDQUFxQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQ25GLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxPQUFPLGNBQWMsQ0FBQztJQUMxQixDQUFDO0lBRU8sNkNBQXdCLEdBQWhDOztRQUNJLElBQU0scUJBQXFCLFNBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQiwwQ0FBRSxxQkFBcUIsQ0FBQztRQUNwRyxJQUFJLENBQUMscUJBQXFCLEVBQUU7WUFDeEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsNENBQTRDLEVBQUUscUJBQXFCLENBQUMsQ0FBQztZQUNqRyxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxxQkFBcUIsQ0FBQztJQUNqQyxDQUFDO0lBRU8sZ0NBQVcsR0FBbkI7O1FBQ0ksSUFBTSxRQUFRLFNBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQiwwQ0FBRSxRQUFRLENBQUM7UUFDMUUsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNYLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLCtCQUErQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDOztnQkF6VjJDLHFCQUFxQjtnQkFDN0IsYUFBYTtnQkFDVixnQkFBZ0I7Z0JBQ3RCLFVBQVU7Z0JBQ1Asc0JBQXNCO2dEQUNyRCxNQUFNLFNBQUMsTUFBTTs7SUFUVCxVQUFVO1FBRHRCLFVBQVUsRUFBRTtRQVVKLFdBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO09BVFYsVUFBVSxDQThWdEI7SUFBRCxpQkFBQztDQUFBLEFBOVZELElBOFZDO1NBOVZZLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwUGFyYW1zIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xyXG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgb25lTGluZVRyaW0gfSBmcm9tICdjb21tb24tdGFncyc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uLy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUb2tlblZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vdmFsaWRhdGlvbi90b2tlbi12YWxpZGF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi4vZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgV0lORE9XIH0gZnJvbSAnLi4vd2luZG93L3dpbmRvdy5yZWZlcmVuY2UnO1xyXG5pbXBvcnQgeyBVcmlFbmNvZGVyIH0gZnJvbSAnLi91cmktZW5jb2Rlcic7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBVcmxTZXJ2aWNlIHtcclxuICAgIHByaXZhdGUgQ0FMTEJBQ0tfUEFSQU1TX1RPX0NIRUNLID0gWydjb2RlJywgJ3N0YXRlJywgJ3Rva2VuJywgJ2lkX3Rva2VuJ107XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBmbG93c0RhdGFTZXJ2aWNlOiBGbG93c0RhdGFTZXJ2aWNlLFxyXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgZmxvd0hlbHBlcjogRmxvd0hlbHBlcixcclxuICAgICAgICBwcml2YXRlIHRva2VuVmFsaWRhdGlvblNlcnZpY2U6IFRva2VuVmFsaWRhdGlvblNlcnZpY2UsXHJcbiAgICAgICAgQEluamVjdChXSU5ET1cpIHByaXZhdGUgd2luZG93OiBhbnlcclxuICAgICkge31cclxuXHJcbiAgICBnZXRVcmxQYXJhbWV0ZXIodXJsVG9DaGVjazogYW55LCBuYW1lOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgICAgIGlmICghdXJsVG9DaGVjaykge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpO1xyXG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgbmFtZSArICc9KFteJiNdKiknKTtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gcmVnZXguZXhlYyh1cmxUb0NoZWNrKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/ICcnIDogZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlzQ2FsbGJhY2tGcm9tU3RzKCkge1xyXG4gICAgICAgIGNvbnN0IGFueVBhcmFtZXRlcklzR2l2ZW4gPSB0aGlzLkNBTExCQUNLX1BBUkFNU19UT19DSEVDSy5zb21lKCh4KSA9PiAhIXRoaXMuZ2V0VXJsUGFyYW1ldGVyKHRoaXMud2luZG93LmxvY2F0aW9uLnRvU3RyaW5nKCksIHgpKTtcclxuICAgICAgICByZXR1cm4gYW55UGFyYW1ldGVySXNHaXZlbjtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSZWZyZXNoU2Vzc2lvblNpbGVudFJlbmV3VXJsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3coKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVVcmxDb2RlRmxvd1dpdGhTaWxlbnRSZW5ldygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlVXJsSW1wbGljaXRGbG93V2l0aFNpbGVudFJlbmV3KCkgfHwgJyc7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QXV0aG9yaXplVXJsKGN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KTogc3RyaW5nIHtcclxuICAgICAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVVybENvZGVGbG93QXV0aG9yaXplKGN1c3RvbVBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVVcmxJbXBsaWNpdEZsb3dBdXRob3JpemUoY3VzdG9tUGFyYW1zKSB8fCAnJztcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVFbmRTZXNzaW9uVXJsKGlkVG9rZW5IaW50OiBzdHJpbmcpIHtcclxuICAgICAgICBjb25zdCBlbmRTZXNzaW9uRW5kcG9pbnQgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci53ZWxsS25vd25FbmRwb2ludHM/LmVuZFNlc3Npb25FbmRwb2ludDtcclxuXHJcbiAgICAgICAgaWYgKCFlbmRTZXNzaW9uRW5kcG9pbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB1cmxQYXJ0cyA9IGVuZFNlc3Npb25FbmRwb2ludC5zcGxpdCgnPycpO1xyXG5cclxuICAgICAgICBjb25zdCBhdXRob3JpemF0aW9uRW5kc2Vzc2lvblVybCA9IHVybFBhcnRzWzBdO1xyXG5cclxuICAgICAgICBsZXQgcGFyYW1zID0gbmV3IEh0dHBQYXJhbXMoe1xyXG4gICAgICAgICAgICBmcm9tU3RyaW5nOiB1cmxQYXJ0c1sxXSxcclxuICAgICAgICAgICAgZW5jb2RlcjogbmV3IFVyaUVuY29kZXIoKSxcclxuICAgICAgICB9KTtcclxuICAgICAgICBwYXJhbXMgPSBwYXJhbXMuc2V0KCdpZF90b2tlbl9oaW50JywgaWRUb2tlbkhpbnQpO1xyXG5cclxuICAgICAgICBjb25zdCBwb3N0TG9nb3V0UmVkaXJlY3RVcmkgPSB0aGlzLmdldFBvc3RMb2dvdXRSZWRpcmVjdFVybCgpO1xyXG5cclxuICAgICAgICBpZiAocG9zdExvZ291dFJlZGlyZWN0VXJpKSB7XHJcbiAgICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3Bvc3RfbG9nb3V0X3JlZGlyZWN0X3VyaScsIHBvc3RMb2dvdXRSZWRpcmVjdFVyaSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYCR7YXV0aG9yaXphdGlvbkVuZHNlc3Npb25Vcmx9PyR7cGFyYW1zfWA7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUmV2b2NhdGlvbkVuZHBvaW50Qm9keUFjY2Vzc1Rva2VuKHRva2VuOiBhbnkpIHtcclxuICAgICAgICBjb25zdCBjbGllbnRJZCA9IHRoaXMuZ2V0Q2xpZW50SWQoKTtcclxuXHJcbiAgICAgICAgaWYgKCFjbGllbnRJZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBgY2xpZW50X2lkPSR7Y2xpZW50SWR9JnRva2VuPSR7dG9rZW59JnRva2VuX3R5cGVfaGludD1hY2Nlc3NfdG9rZW5gO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVJldm9jYXRpb25FbmRwb2ludEJvZHlSZWZyZXNoVG9rZW4odG9rZW46IGFueSkge1xyXG4gICAgICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5nZXRDbGllbnRJZCgpO1xyXG5cclxuICAgICAgICBpZiAoIWNsaWVudElkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGBjbGllbnRfaWQ9JHtjbGllbnRJZH0mdG9rZW49JHt0b2tlbn0mdG9rZW5fdHlwZV9oaW50PXJlZnJlc2hfdG9rZW5gO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJldm9jYXRpb25FbmRwb2ludFVybCgpIHtcclxuICAgICAgICBjb25zdCBlbmRTZXNzaW9uRW5kcG9pbnQgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci53ZWxsS25vd25FbmRwb2ludHM/LnJldm9jYXRpb25FbmRwb2ludDtcclxuXHJcbiAgICAgICAgaWYgKCFlbmRTZXNzaW9uRW5kcG9pbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB1cmxQYXJ0cyA9IGVuZFNlc3Npb25FbmRwb2ludC5zcGxpdCgnPycpO1xyXG5cclxuICAgICAgICBjb25zdCByZXZvY2F0aW9uRW5kcG9pbnRVcmwgPSB1cmxQYXJ0c1swXTtcclxuICAgICAgICByZXR1cm4gcmV2b2NhdGlvbkVuZHBvaW50VXJsO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUJvZHlGb3JDb2RlRmxvd0NvZGVSZXF1ZXN0KGNvZGU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgY29kZVZlcmlmaWVyID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldENvZGVWZXJpZmllcigpO1xyXG4gICAgICAgIGlmICghY29kZVZlcmlmaWVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgQ29kZVZlcmlmaWVyIGlzIG5vdCBzZXQgYCwgY29kZVZlcmlmaWVyKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBjbGllbnRJZCA9IHRoaXMuZ2V0Q2xpZW50SWQoKTtcclxuXHJcbiAgICAgICAgaWYgKCFjbGllbnRJZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGFGb3JCb2R5ID0gb25lTGluZVRyaW1gZ3JhbnRfdHlwZT1hdXRob3JpemF0aW9uX2NvZGVcclxuICAgICAgICAgICAgJmNsaWVudF9pZD0ke2NsaWVudElkfVxyXG4gICAgICAgICAgICAmY29kZV92ZXJpZmllcj0ke2NvZGVWZXJpZmllcn1cclxuICAgICAgICAgICAgJmNvZGU9JHtjb2RlfWA7XHJcblxyXG4gICAgICAgIGNvbnN0IHNpbGVudFJlbmV3VXJsID0gdGhpcy5nZXRTaWxlbnRSZW5ld1VybCgpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5mbG93c0RhdGFTZXJ2aWNlLmlzU2lsZW50UmVuZXdSdW5uaW5nKCkgJiYgc2lsZW50UmVuZXdVcmwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9uZUxpbmVUcmltYCR7ZGF0YUZvckJvZHl9JnJlZGlyZWN0X3VyaT0ke3NpbGVudFJlbmV3VXJsfWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCByZWRpcmVjdFVybCA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoKTtcclxuXHJcbiAgICAgICAgaWYgKCFyZWRpcmVjdFVybCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvbmVMaW5lVHJpbWAke2RhdGFGb3JCb2R5fSZyZWRpcmVjdF91cmk9JHtyZWRpcmVjdFVybH1gO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUJvZHlGb3JDb2RlRmxvd1JlZnJlc2hUb2tlbnNSZXF1ZXN0KHJlZnJlc2h0b2tlbjogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBjbGllbnRJZCA9IHRoaXMuZ2V0Q2xpZW50SWQoKTtcclxuXHJcbiAgICAgICAgaWYgKCFjbGllbnRJZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvbmVMaW5lVHJpbWBncmFudF90eXBlPXJlZnJlc2hfdG9rZW5cclxuICAgICAgICAgICZjbGllbnRfaWQ9JHtjbGllbnRJZH1cclxuICAgICAgICAgICZyZWZyZXNoX3Rva2VuPSR7cmVmcmVzaHRva2VufWA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVBdXRob3JpemVVcmwoXHJcbiAgICAgICAgY29kZUNoYWxsZW5nZTogc3RyaW5nLFxyXG4gICAgICAgIHJlZGlyZWN0VXJsOiBzdHJpbmcsXHJcbiAgICAgICAgbm9uY2U6IHN0cmluZyxcclxuICAgICAgICBzdGF0ZTogc3RyaW5nLFxyXG4gICAgICAgIHByb21wdD86IHN0cmluZyxcclxuICAgICAgICBjdXN0b21SZXF1ZXN0UGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH1cclxuICAgICk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgYXV0aG9yaXphdGlvbkVuZHBvaW50ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXI/LndlbGxLbm93bkVuZHBvaW50cz8uYXV0aG9yaXphdGlvbkVuZHBvaW50O1xyXG5cclxuICAgICAgICBpZiAoIWF1dGhvcml6YXRpb25FbmRwb2ludCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYENhbiBub3QgY3JlYXRlIGFuIGF1dGhvcml6ZSB1cmwgd2hlbiBhdXRob3JpemF0aW9uRW5kcG9pbnQgaXMgJyR7YXV0aG9yaXphdGlvbkVuZHBvaW50fSdgKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB7IGNsaWVudElkLCByZXNwb25zZVR5cGUsIHNjb3BlLCBoZFBhcmFtLCBjdXN0b21QYXJhbXMgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb247XHJcblxyXG4gICAgICAgIGlmICghY2xpZW50SWQpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBjcmVhdGVBdXRob3JpemVVcmwgY291bGQgbm90IGFkZCBjbGllbnRJZCBiZWNhdXNlIGl0IHdhczogYCwgY2xpZW50SWQpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcmVzcG9uc2VUeXBlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgY3JlYXRlQXV0aG9yaXplVXJsIGNvdWxkIG5vdCBhZGQgcmVzcG9uc2VUeXBlIGJlY2F1c2UgaXQgd2FzOiBgLCByZXNwb25zZVR5cGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc2NvcGUpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBjcmVhdGVBdXRob3JpemVVcmwgY291bGQgbm90IGFkZCBzY29wZSBiZWNhdXNlIGl0IHdhczogYCwgc2NvcGUpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHVybFBhcnRzID0gYXV0aG9yaXphdGlvbkVuZHBvaW50LnNwbGl0KCc/Jyk7XHJcbiAgICAgICAgY29uc3QgYXV0aG9yaXphdGlvblVybCA9IHVybFBhcnRzWzBdO1xyXG5cclxuICAgICAgICBsZXQgcGFyYW1zID0gbmV3IEh0dHBQYXJhbXMoe1xyXG4gICAgICAgICAgICBmcm9tU3RyaW5nOiB1cmxQYXJ0c1sxXSxcclxuICAgICAgICAgICAgZW5jb2RlcjogbmV3IFVyaUVuY29kZXIoKSxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGFyYW1zID0gcGFyYW1zLnNldCgnY2xpZW50X2lkJywgY2xpZW50SWQpO1xyXG4gICAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3JlZGlyZWN0X3VyaScsIHJlZGlyZWN0VXJsKTtcclxuICAgICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdyZXNwb25zZV90eXBlJywgcmVzcG9uc2VUeXBlKTtcclxuICAgICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdzY29wZScsIHNjb3BlKTtcclxuICAgICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdub25jZScsIG5vbmNlKTtcclxuICAgICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdzdGF0ZScsIHN0YXRlKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3coKSkge1xyXG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdjb2RlX2NoYWxsZW5nZScsIGNvZGVDaGFsbGVuZ2UpO1xyXG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdjb2RlX2NoYWxsZW5nZV9tZXRob2QnLCAnUzI1NicpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHByb21wdCkge1xyXG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdwcm9tcHQnLCBwcm9tcHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGhkUGFyYW0pIHtcclxuICAgICAgICAgICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZCgnaGQnLCBoZFBhcmFtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjdXN0b21QYXJhbXMgfHwgY3VzdG9tUmVxdWVzdFBhcmFtcykge1xyXG4gICAgICAgICAgICBjb25zdCBjdXN0b21QYXJhbXNUb0FkZCA9IHsgLi4uKGN1c3RvbVBhcmFtcyB8fCB7fSksIC4uLihjdXN0b21SZXF1ZXN0UGFyYW1zIHx8IHt9KSB9O1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY3VzdG9tUGFyYW1zVG9BZGQpKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKGtleSwgdmFsdWUudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBgJHthdXRob3JpemF0aW9uVXJsfT8ke3BhcmFtc31gO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3JlYXRlVXJsSW1wbGljaXRGbG93V2l0aFNpbGVudFJlbmV3KCk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woKTtcclxuICAgICAgICBjb25zdCBub25jZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5jcmVhdGVOb25jZSgpO1xyXG5cclxuICAgICAgICBjb25zdCBzaWxlbnRSZW5ld1VybCA9IHRoaXMuZ2V0U2lsZW50UmVuZXdVcmwoKTtcclxuXHJcbiAgICAgICAgaWYgKCFzaWxlbnRSZW5ld1VybCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnUmVmcmVzaFNlc3Npb24gY3JlYXRlZC4gYWRkaW5nIG15YXV0b3N0YXRlOiAnLCBzdGF0ZSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci53ZWxsS25vd25FbmRwb2ludHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQXV0aG9yaXplVXJsKCcnLCBzaWxlbnRSZW5ld1VybCwgbm9uY2UsIHN0YXRlLCAnbm9uZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKCdhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzIHVuZGVmaW5lZCcpO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3JlYXRlVXJsQ29kZUZsb3dXaXRoU2lsZW50UmVuZXcoKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRFeGlzdGluZ09yQ3JlYXRlQXV0aFN0YXRlQ29udHJvbCgpO1xyXG4gICAgICAgIGNvbnN0IG5vbmNlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZU5vbmNlKCk7XHJcblxyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnUmVmcmVzaFNlc3Npb24gY3JlYXRlZC4gYWRkaW5nIG15YXV0b3N0YXRlOiAnICsgc3RhdGUpO1xyXG5cclxuICAgICAgICAvLyBjb2RlX2NoYWxsZW5nZSB3aXRoIFwiUzI1NlwiXHJcbiAgICAgICAgY29uc3QgY29kZVZlcmlmaWVyID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZUNvZGVWZXJpZmllcigpO1xyXG4gICAgICAgIGNvbnN0IGNvZGVDaGFsbGVuZ2UgPSB0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UuZ2VuZXJhdGVDb2RlVmVyaWZpZXIoY29kZVZlcmlmaWVyKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2lsZW50UmVuZXdVcmwgPSB0aGlzLmdldFNpbGVudFJlbmV3VXJsKCk7XHJcblxyXG4gICAgICAgIGlmICghc2lsZW50UmVuZXdVcmwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIud2VsbEtub3duRW5kcG9pbnRzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUF1dGhvcml6ZVVybChjb2RlQ2hhbGxlbmdlLCBzaWxlbnRSZW5ld1VybCwgbm9uY2UsIHN0YXRlLCAnbm9uZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVVcmxJbXBsaWNpdEZsb3dBdXRob3JpemUoY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldEV4aXN0aW5nT3JDcmVhdGVBdXRoU3RhdGVDb250cm9sKCk7XHJcbiAgICAgICAgY29uc3Qgbm9uY2UgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlTm9uY2UoKTtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ0F1dGhvcml6ZSBjcmVhdGVkLiBhZGRpbmcgbXlhdXRvc3RhdGU6ICcgKyBzdGF0ZSk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gdGhpcy5nZXRSZWRpcmVjdFVybCgpO1xyXG5cclxuICAgICAgICBpZiAoIXJlZGlyZWN0VXJsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVBdXRob3JpemVVcmwoJycsIHJlZGlyZWN0VXJsLCBub25jZSwgc3RhdGUsIG51bGwsIGN1c3RvbVBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVVcmxDb2RlRmxvd0F1dGhvcml6ZShjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woKTtcclxuICAgICAgICBjb25zdCBub25jZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5jcmVhdGVOb25jZSgpO1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQXV0aG9yaXplIGNyZWF0ZWQuIGFkZGluZyBteWF1dG9zdGF0ZTogJyArIHN0YXRlKTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVkaXJlY3RVcmwgPSB0aGlzLmdldFJlZGlyZWN0VXJsKCk7XHJcblxyXG4gICAgICAgIGlmICghcmVkaXJlY3RVcmwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjb2RlX2NoYWxsZW5nZSB3aXRoIFwiUzI1NlwiXHJcbiAgICAgICAgY29uc3QgY29kZVZlcmlmaWVyID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZUNvZGVWZXJpZmllcigpO1xyXG4gICAgICAgIGNvbnN0IGNvZGVDaGFsbGVuZ2UgPSB0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UuZ2VuZXJhdGVDb2RlVmVyaWZpZXIoY29kZVZlcmlmaWVyKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVBdXRob3JpemVVcmwoY29kZUNoYWxsZW5nZSwgcmVkaXJlY3RVcmwsIG5vbmNlLCBzdGF0ZSwgbnVsbCwgY3VzdG9tUGFyYW1zKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQnKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFJlZGlyZWN0VXJsKCkge1xyXG4gICAgICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8ucmVkaXJlY3RVcmw7XHJcblxyXG4gICAgICAgIGlmICghcmVkaXJlY3RVcmwpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBjb3VsZCBub3QgZ2V0IHJlZGlyZWN0VXJsLCB3YXM6IGAsIHJlZGlyZWN0VXJsKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVkaXJlY3RVcmw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRTaWxlbnRSZW5ld1VybCgpIHtcclxuICAgICAgICBjb25zdCBzaWxlbnRSZW5ld1VybCA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24/LnNpbGVudFJlbmV3VXJsO1xyXG5cclxuICAgICAgICBpZiAoIXNpbGVudFJlbmV3VXJsKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgY291bGQgbm90IGdldCBzaWxlbnRSZW5ld1VybCwgd2FzOiBgLCBzaWxlbnRSZW5ld1VybCk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHNpbGVudFJlbmV3VXJsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0UG9zdExvZ291dFJlZGlyZWN0VXJsKCkge1xyXG4gICAgICAgIGNvbnN0IHBvc3RMb2dvdXRSZWRpcmVjdFVyaSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24/LnBvc3RMb2dvdXRSZWRpcmVjdFVyaTtcclxuICAgICAgICBpZiAoIXBvc3RMb2dvdXRSZWRpcmVjdFVyaSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNvdWxkIG5vdCBnZXQgcG9zdExvZ291dFJlZGlyZWN0VXJpLCB3YXM6IGAsIHBvc3RMb2dvdXRSZWRpcmVjdFVyaSk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHBvc3RMb2dvdXRSZWRpcmVjdFVyaTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldENsaWVudElkKCkge1xyXG4gICAgICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8uY2xpZW50SWQ7XHJcbiAgICAgICAgaWYgKCFjbGllbnRJZCkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNvdWxkIG5vdCBnZXQgY2xpZW50SWQsIHdhczogYCwgY2xpZW50SWQpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjbGllbnRJZDtcclxuICAgIH1cclxufVxyXG4iXX0=