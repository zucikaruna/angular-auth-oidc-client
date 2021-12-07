import { PlatformProvider } from '../utils/platform-provider/platform.provider';
import { AuthWellKnownEndpoints } from './auth-well-known-endpoints';
import { OpenIdConfiguration } from './openid-configuration';
import { PublicConfiguration } from './public-configuration';
export declare class ConfigurationProvider {
    private platformProvider;
    private wellKnownEndpointsInternal;
    private openIdConfigurationInternal;
    get openIDConfiguration(): OpenIdConfiguration;
    get wellKnownEndpoints(): AuthWellKnownEndpoints;
    get configuration(): PublicConfiguration;
    hasValidConfig(): boolean;
    constructor(platformProvider: PlatformProvider);
    setConfig(configuration: OpenIdConfiguration, wellKnownEndpoints: AuthWellKnownEndpoints): void;
    private setSpecialCases;
}
