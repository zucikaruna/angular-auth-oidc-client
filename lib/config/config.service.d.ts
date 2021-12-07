import { DataService } from '../api/data.service';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { PublicEventsService } from '../public-events/public-events.service';
import { OpenIdConfiguration } from './openid-configuration';
export declare class OidcConfigService {
    private readonly loggerService;
    private readonly http;
    private readonly configurationProvider;
    private readonly publicEventsService;
    private WELL_KNOWN_SUFFIX;
    constructor(loggerService: LoggerService, http: DataService, configurationProvider: ConfigurationProvider, publicEventsService: PublicEventsService);
    withConfig(passedConfig: OpenIdConfiguration): Promise<{
        issuer: any;
        jwksUri: any;
        authorizationEndpoint: any;
        tokenEndpoint: any;
        userinfoEndpoint: any;
        endSessionEndpoint: any;
        checkSessionIframe: any;
        revocationEndpoint: any;
        introspectionEndpoint: any;
    }>;
    private getWellKnownDocument;
}
