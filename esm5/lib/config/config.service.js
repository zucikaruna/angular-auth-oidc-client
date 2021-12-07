import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { DataService } from '../api/data.service';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { EventTypes } from '../public-events/event-types';
import { PublicEventsService } from '../public-events/public-events.service';
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
export { OidcConfigService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvY29uZmlnL2NvbmZpZy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDMUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDMUQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFJN0U7SUFFSSwyQkFDcUIsYUFBNEIsRUFDNUIsSUFBaUIsRUFDakIscUJBQTRDLEVBQzVDLG1CQUF3QztRQUh4QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1QixTQUFJLEdBQUosSUFBSSxDQUFhO1FBQ2pCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtRQUxyRCxzQkFBaUIsR0FBRyxtQ0FBbUMsQ0FBQztJQU03RCxDQUFDO0lBRUosc0NBQVUsR0FBVixVQUFXLFlBQWlDO1FBQTVDLGlCQStCQztRQTlCRyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRTtZQUN6QixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQ3BFLE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxZQUFZLENBQUMscUJBQXFCLEVBQUU7WUFDckMsWUFBWSxDQUFDLHFCQUFxQixHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUM7U0FDL0Q7UUFFRCxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUNsRixHQUFHLENBQUMsVUFBQyxrQkFBa0I7WUFDbkIsT0FBTztnQkFDSCxNQUFNLEVBQUUsa0JBQWtCLENBQUMsTUFBTTtnQkFDakMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLFFBQVE7Z0JBQ3BDLHFCQUFxQixFQUFFLGtCQUFrQixDQUFDLHNCQUFzQjtnQkFDaEUsYUFBYSxFQUFFLGtCQUFrQixDQUFDLGNBQWM7Z0JBQ2hELGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLGlCQUFpQjtnQkFDdEQsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsb0JBQW9CO2dCQUMzRCxrQkFBa0IsRUFBRSxrQkFBa0IsQ0FBQyxvQkFBb0I7Z0JBQzNELGtCQUFrQixFQUFFLGtCQUFrQixDQUFDLG1CQUFtQjtnQkFDMUQscUJBQXFCLEVBQUUsa0JBQWtCLENBQUMsc0JBQXNCO2FBQ25FLENBQUM7UUFDTixDQUFDLENBQUMsRUFDRixHQUFHLENBQUMsVUFBQyx3QkFBd0IsSUFBSyxPQUFBLEtBQUksQ0FBQyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLHdCQUF3QixDQUFDLEVBQTVFLENBQTRFLENBQUMsRUFDL0csR0FBRyxDQUFDLFVBQUMsd0JBQXdCO1lBQ3pCLE9BQUEsS0FBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLEVBQUUsWUFBWSxjQUFBLEVBQUUsd0JBQXdCLDBCQUFBLEVBQUUsQ0FBQztRQUF2RyxDQUF1RyxDQUMxRyxDQUNKLENBQUM7UUFFRixPQUFPLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRU8sZ0RBQW9CLEdBQTVCLFVBQTZCLGlCQUF5QjtRQUNsRCxJQUFJLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQztRQUU1QixJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1lBQ3JELEdBQUcsR0FBRyxLQUFHLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBbUIsQ0FBQztTQUN6RDtRQUVELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQU0sR0FBRyxDQUFDLENBQUM7SUFDbkMsQ0FBQzs7Z0JBL0NtQyxhQUFhO2dCQUN0QixXQUFXO2dCQUNNLHFCQUFxQjtnQkFDdkIsbUJBQW1COztJQU5wRCxpQkFBaUI7UUFEN0IsVUFBVSxFQUFFO09BQ0EsaUJBQWlCLENBbUQ3QjtJQUFELHdCQUFDO0NBQUEsQUFuREQsSUFtREM7U0FuRFksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgbWFwLCB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5pbXBvcnQgeyBEYXRhU2VydmljZSB9IGZyb20gJy4uL2FwaS9kYXRhLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBFdmVudFR5cGVzIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9ldmVudC10eXBlcyc7XG5pbXBvcnQgeyBQdWJsaWNFdmVudHNTZXJ2aWNlIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9wdWJsaWMtZXZlbnRzLnNlcnZpY2UnO1xuaW1wb3J0IHsgT3BlbklkQ29uZmlndXJhdGlvbiB9IGZyb20gJy4vb3BlbmlkLWNvbmZpZ3VyYXRpb24nO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgT2lkY0NvbmZpZ1NlcnZpY2Uge1xuICAgIHByaXZhdGUgV0VMTF9LTk9XTl9TVUZGSVggPSBgLy53ZWxsLWtub3duL29wZW5pZC1jb25maWd1cmF0aW9uYDtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGh0dHA6IERhdGFTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IHB1YmxpY0V2ZW50c1NlcnZpY2U6IFB1YmxpY0V2ZW50c1NlcnZpY2VcbiAgICApIHt9XG5cbiAgICB3aXRoQ29uZmlnKHBhc3NlZENvbmZpZzogT3BlbklkQ29uZmlndXJhdGlvbikge1xuICAgICAgICBpZiAoIXBhc3NlZENvbmZpZy5zdHNTZXJ2ZXIpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcigncGxlYXNlIHByb3ZpZGUgYXQgbGVhc3QgYW4gc3RzU2VydmVyJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXBhc3NlZENvbmZpZy5hdXRoV2VsbGtub3duRW5kcG9pbnQpIHtcbiAgICAgICAgICAgIHBhc3NlZENvbmZpZy5hdXRoV2VsbGtub3duRW5kcG9pbnQgPSBwYXNzZWRDb25maWcuc3RzU2VydmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbG9hZENvbmZpZyQgPSB0aGlzLmdldFdlbGxLbm93bkRvY3VtZW50KHBhc3NlZENvbmZpZy5hdXRoV2VsbGtub3duRW5kcG9pbnQpLnBpcGUoXG4gICAgICAgICAgICBtYXAoKHdlbGxLbm93bkVuZHBvaW50cykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGlzc3Vlcjogd2VsbEtub3duRW5kcG9pbnRzLmlzc3VlcixcbiAgICAgICAgICAgICAgICAgICAgandrc1VyaTogd2VsbEtub3duRW5kcG9pbnRzLmp3a3NfdXJpLFxuICAgICAgICAgICAgICAgICAgICBhdXRob3JpemF0aW9uRW5kcG9pbnQ6IHdlbGxLbm93bkVuZHBvaW50cy5hdXRob3JpemF0aW9uX2VuZHBvaW50LFxuICAgICAgICAgICAgICAgICAgICB0b2tlbkVuZHBvaW50OiB3ZWxsS25vd25FbmRwb2ludHMudG9rZW5fZW5kcG9pbnQsXG4gICAgICAgICAgICAgICAgICAgIHVzZXJpbmZvRW5kcG9pbnQ6IHdlbGxLbm93bkVuZHBvaW50cy51c2VyaW5mb19lbmRwb2ludCxcbiAgICAgICAgICAgICAgICAgICAgZW5kU2Vzc2lvbkVuZHBvaW50OiB3ZWxsS25vd25FbmRwb2ludHMuZW5kX3Nlc3Npb25fZW5kcG9pbnQsXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrU2Vzc2lvbklmcmFtZTogd2VsbEtub3duRW5kcG9pbnRzLmNoZWNrX3Nlc3Npb25faWZyYW1lLFxuICAgICAgICAgICAgICAgICAgICByZXZvY2F0aW9uRW5kcG9pbnQ6IHdlbGxLbm93bkVuZHBvaW50cy5yZXZvY2F0aW9uX2VuZHBvaW50LFxuICAgICAgICAgICAgICAgICAgICBpbnRyb3NwZWN0aW9uRW5kcG9pbnQ6IHdlbGxLbm93bkVuZHBvaW50cy5pbnRyb3NwZWN0aW9uX2VuZHBvaW50LFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIHRhcCgobWFwcGVkV2VsbEtub3duRW5kcG9pbnRzKSA9PiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5zZXRDb25maWcocGFzc2VkQ29uZmlnLCBtYXBwZWRXZWxsS25vd25FbmRwb2ludHMpKSxcbiAgICAgICAgICAgIHRhcCgobWFwcGVkV2VsbEtub3duRW5kcG9pbnRzKSA9PlxuICAgICAgICAgICAgICAgIHRoaXMucHVibGljRXZlbnRzU2VydmljZS5maXJlRXZlbnQoRXZlbnRUeXBlcy5Db25maWdMb2FkZWQsIHsgcGFzc2VkQ29uZmlnLCBtYXBwZWRXZWxsS25vd25FbmRwb2ludHMgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gbG9hZENvbmZpZyQudG9Qcm9taXNlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRXZWxsS25vd25Eb2N1bWVudCh3ZWxsS25vd25FbmRwb2ludDogc3RyaW5nKSB7XG4gICAgICAgIGxldCB1cmwgPSB3ZWxsS25vd25FbmRwb2ludDtcblxuICAgICAgICBpZiAoIXdlbGxLbm93bkVuZHBvaW50LmluY2x1ZGVzKHRoaXMuV0VMTF9LTk9XTl9TVUZGSVgpKSB7XG4gICAgICAgICAgICB1cmwgPSBgJHt3ZWxsS25vd25FbmRwb2ludH0ke3RoaXMuV0VMTF9LTk9XTl9TVUZGSVh9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmh0dHAuZ2V0PGFueT4odXJsKTtcbiAgICB9XG59XG4iXX0=