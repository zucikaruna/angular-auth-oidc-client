import { DataService } from './api/data.service';
import { HttpBaseService } from './api/http-base.service';
import { AuthStateService } from './authState/auth-state.service';
import { ConfigurationProvider } from './config/config.provider';
import { OidcConfigService } from './config/config.service';
import { FlowsDataService } from './flows/flows-data.service';
import { FlowsService } from './flows/flows.service';
import { RandomService } from './flows/random/random.service';
import { SigninKeyDataService } from './flows/signin-key-data.service';
import { CheckSessionService } from './iframe/check-session.service';
import { IFrameService } from './iframe/existing-iframe.service';
import { SilentRenewService } from './iframe/silent-renew.service';
import { LoggerService } from './logging/logger.service';
import { LogoffRevocationService } from './logoffRevoke/logoff-revocation.service';
import { OidcSecurityService } from './oidc.security.service';
import { PublicEventsService } from './public-events/public-events.service';
import { AbstractSecurityStorage } from './storage/abstract-security-storage';
import { StoragePersistanceService } from './storage/storage-persistance.service';
import { UserService } from './userData/user-service';
import { EqualityService } from './utils/equality/equality.service';
import { FlowHelper } from './utils/flowHelper/flow-helper.service';
import { PlatformProvider } from './utils/platform-provider/platform.provider';
import { TokenHelperService } from './utils/tokenHelper/oidc-token-helper.service';
import { UrlService } from './utils/url/url.service';
import { _window } from './utils/window/window.reference';
import { StateValidationService } from './validation/state-validation.service';
import { TokenValidationService } from './validation/token-validation.service';
export declare class AuthModule {
    static forRoot(token?: Token): {
        ngModule: typeof AuthModule;
        providers: (typeof HttpBaseService | typeof DataService | typeof PlatformProvider | typeof ConfigurationProvider | typeof LoggerService | typeof PublicEventsService | typeof StoragePersistanceService | typeof FlowHelper | typeof TokenHelperService | typeof TokenValidationService | typeof AuthStateService | typeof OidcConfigService | typeof RandomService | typeof FlowsDataService | typeof UserService | typeof UrlService | typeof StateValidationService | typeof SigninKeyDataService | typeof FlowsService | typeof IFrameService | typeof CheckSessionService | typeof SilentRenewService | typeof LogoffRevocationService | typeof OidcSecurityService | typeof EqualityService | {
            provide: typeof AbstractSecurityStorage;
            useClass: Type<any>;
            useFactory?: undefined;
            deps?: undefined;
        } | {
            provide: import("@angular/core").InjectionToken<unknown>;
            useFactory: typeof _window;
            deps: any[];
            useClass?: undefined;
        })[];
    };
}
export declare type Type<T> = new (...args: any[]) => T;
export interface Token {
    storage?: Type<any>;
}
