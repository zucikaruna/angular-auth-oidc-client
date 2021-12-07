var AuthModule_1;
import { __decorate } from "tslib";
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
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
import { BrowserStorageService } from './storage/browser-storage.service';
import { StoragePersistanceService } from './storage/storage-persistance.service';
import { UserService } from './userData/user-service';
import { EqualityService } from './utils/equality/equality.service';
import { FlowHelper } from './utils/flowHelper/flow-helper.service';
import { PlatformProvider } from './utils/platform-provider/platform.provider';
import { TokenHelperService } from './utils/tokenHelper/oidc-token-helper.service';
import { UrlService } from './utils/url/url.service';
import { WINDOW, _window } from './utils/window/window.reference';
import { StateValidationService } from './validation/state-validation.service';
import { TokenValidationService } from './validation/token-validation.service';
let AuthModule = AuthModule_1 = class AuthModule {
    static forRoot(token = {}) {
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
    }
};
AuthModule = AuthModule_1 = __decorate([
    NgModule({
        imports: [CommonModule],
        declarations: [],
        exports: [],
    })
], AuthModule);
export { AuthModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvYXV0aC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDakQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzFELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzlELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDOUQsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDdkUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ25FLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUNuRixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUM1RSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM5RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUMxRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUNsRixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwrQ0FBK0MsQ0FBQztBQUNuRixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDckQsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNsRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUMvRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQU8vRSxJQUFhLFVBQVUsa0JBQXZCLE1BQWEsVUFBVTtJQUNuQixNQUFNLENBQUMsT0FBTyxDQUFDLFFBQWUsRUFBRTtRQUM1QixPQUFPO1lBQ0gsUUFBUSxFQUFFLFlBQVU7WUFDcEIsU0FBUyxFQUFFO2dCQUNQLGlCQUFpQjtnQkFDakIsbUJBQW1CO2dCQUNuQixVQUFVO2dCQUNWLG1CQUFtQjtnQkFDbkIsc0JBQXNCO2dCQUN0QixnQkFBZ0I7Z0JBQ2hCLG1CQUFtQjtnQkFDbkIsZ0JBQWdCO2dCQUNoQixZQUFZO2dCQUNaLGtCQUFrQjtnQkFDbEIscUJBQXFCO2dCQUNyQix1QkFBdUI7Z0JBQ3ZCLFdBQVc7Z0JBQ1gsYUFBYTtnQkFDYixlQUFlO2dCQUNmLFVBQVU7Z0JBQ1YsZ0JBQWdCO2dCQUNoQixvQkFBb0I7Z0JBQ3BCLHlCQUF5QjtnQkFDekIsa0JBQWtCO2dCQUNsQixhQUFhO2dCQUNiLGFBQWE7Z0JBQ2IsZUFBZTtnQkFDZixXQUFXO2dCQUNYLHNCQUFzQjtnQkFDdEI7b0JBQ0ksT0FBTyxFQUFFLHVCQUF1QjtvQkFDaEMsUUFBUSxFQUFFLEtBQUssQ0FBQyxPQUFPLElBQUkscUJBQXFCO2lCQUNuRDtnQkFDRCxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO2FBQ3JEO1NBQ0osQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFBO0FBdENZLFVBQVU7SUFMdEIsUUFBUSxDQUFDO1FBQ04sT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3ZCLFlBQVksRUFBRSxFQUFFO1FBQ2hCLE9BQU8sRUFBRSxFQUFFO0tBQ2QsQ0FBQztHQUNXLFVBQVUsQ0FzQ3RCO1NBdENZLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi9hcGkvZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IEh0dHBCYXNlU2VydmljZSB9IGZyb20gJy4vYXBpL2h0dHAtYmFzZS5zZXJ2aWNlJztcbmltcG9ydCB7IEF1dGhTdGF0ZVNlcnZpY2UgfSBmcm9tICcuL2F1dGhTdGF0ZS9hdXRoLXN0YXRlLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IE9pZGNDb25maWdTZXJ2aWNlIH0gZnJvbSAnLi9jb25maWcvY29uZmlnLnNlcnZpY2UnO1xuaW1wb3J0IHsgRmxvd3NEYXRhU2VydmljZSB9IGZyb20gJy4vZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IEZsb3dzU2VydmljZSB9IGZyb20gJy4vZmxvd3MvZmxvd3Muc2VydmljZSc7XG5pbXBvcnQgeyBSYW5kb21TZXJ2aWNlIH0gZnJvbSAnLi9mbG93cy9yYW5kb20vcmFuZG9tLnNlcnZpY2UnO1xuaW1wb3J0IHsgU2lnbmluS2V5RGF0YVNlcnZpY2UgfSBmcm9tICcuL2Zsb3dzL3NpZ25pbi1rZXktZGF0YS5zZXJ2aWNlJztcbmltcG9ydCB7IENoZWNrU2Vzc2lvblNlcnZpY2UgfSBmcm9tICcuL2lmcmFtZS9jaGVjay1zZXNzaW9uLnNlcnZpY2UnO1xuaW1wb3J0IHsgSUZyYW1lU2VydmljZSB9IGZyb20gJy4vaWZyYW1lL2V4aXN0aW5nLWlmcmFtZS5zZXJ2aWNlJztcbmltcG9ydCB7IFNpbGVudFJlbmV3U2VydmljZSB9IGZyb20gJy4vaWZyYW1lL3NpbGVudC1yZW5ldy5zZXJ2aWNlJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9nb2ZmUmV2b2NhdGlvblNlcnZpY2UgfSBmcm9tICcuL2xvZ29mZlJldm9rZS9sb2dvZmYtcmV2b2NhdGlvbi5zZXJ2aWNlJztcbmltcG9ydCB7IE9pZGNTZWN1cml0eVNlcnZpY2UgfSBmcm9tICcuL29pZGMuc2VjdXJpdHkuc2VydmljZSc7XG5pbXBvcnQgeyBQdWJsaWNFdmVudHNTZXJ2aWNlIH0gZnJvbSAnLi9wdWJsaWMtZXZlbnRzL3B1YmxpYy1ldmVudHMuc2VydmljZSc7XG5pbXBvcnQgeyBBYnN0cmFjdFNlY3VyaXR5U3RvcmFnZSB9IGZyb20gJy4vc3RvcmFnZS9hYnN0cmFjdC1zZWN1cml0eS1zdG9yYWdlJztcbmltcG9ydCB7IEJyb3dzZXJTdG9yYWdlU2VydmljZSB9IGZyb20gJy4vc3RvcmFnZS9icm93c2VyLXN0b3JhZ2Uuc2VydmljZSc7XG5pbXBvcnQgeyBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlIH0gZnJvbSAnLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XG5pbXBvcnQgeyBVc2VyU2VydmljZSB9IGZyb20gJy4vdXNlckRhdGEvdXNlci1zZXJ2aWNlJztcbmltcG9ydCB7IEVxdWFsaXR5U2VydmljZSB9IGZyb20gJy4vdXRpbHMvZXF1YWxpdHkvZXF1YWxpdHkuc2VydmljZSc7XG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi91dGlscy9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xuaW1wb3J0IHsgUGxhdGZvcm1Qcm92aWRlciB9IGZyb20gJy4vdXRpbHMvcGxhdGZvcm0tcHJvdmlkZXIvcGxhdGZvcm0ucHJvdmlkZXInO1xuaW1wb3J0IHsgVG9rZW5IZWxwZXJTZXJ2aWNlIH0gZnJvbSAnLi91dGlscy90b2tlbkhlbHBlci9vaWRjLXRva2VuLWhlbHBlci5zZXJ2aWNlJztcbmltcG9ydCB7IFVybFNlcnZpY2UgfSBmcm9tICcuL3V0aWxzL3VybC91cmwuc2VydmljZSc7XG5pbXBvcnQgeyBXSU5ET1csIF93aW5kb3cgfSBmcm9tICcuL3V0aWxzL3dpbmRvdy93aW5kb3cucmVmZXJlbmNlJztcbmltcG9ydCB7IFN0YXRlVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuL3ZhbGlkYXRpb24vc3RhdGUtdmFsaWRhdGlvbi5zZXJ2aWNlJztcbmltcG9ydCB7IFRva2VuVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuL3ZhbGlkYXRpb24vdG9rZW4tdmFsaWRhdGlvbi5zZXJ2aWNlJztcblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtdLFxuICAgIGV4cG9ydHM6IFtdLFxufSlcbmV4cG9ydCBjbGFzcyBBdXRoTW9kdWxlIHtcbiAgICBzdGF0aWMgZm9yUm9vdCh0b2tlbjogVG9rZW4gPSB7fSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmdNb2R1bGU6IEF1dGhNb2R1bGUsXG4gICAgICAgICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgICAgICAgICBPaWRjQ29uZmlnU2VydmljZSxcbiAgICAgICAgICAgICAgICBQdWJsaWNFdmVudHNTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIEZsb3dIZWxwZXIsXG4gICAgICAgICAgICAgICAgT2lkY1NlY3VyaXR5U2VydmljZSxcbiAgICAgICAgICAgICAgICBUb2tlblZhbGlkYXRpb25TZXJ2aWNlLFxuICAgICAgICAgICAgICAgIFBsYXRmb3JtUHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgQ2hlY2tTZXNzaW9uU2VydmljZSxcbiAgICAgICAgICAgICAgICBGbG93c0RhdGFTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIEZsb3dzU2VydmljZSxcbiAgICAgICAgICAgICAgICBTaWxlbnRSZW5ld1NlcnZpY2UsXG4gICAgICAgICAgICAgICAgQ29uZmlndXJhdGlvblByb3ZpZGVyLFxuICAgICAgICAgICAgICAgIExvZ29mZlJldm9jYXRpb25TZXJ2aWNlLFxuICAgICAgICAgICAgICAgIFVzZXJTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIFJhbmRvbVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgSHR0cEJhc2VTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIFVybFNlcnZpY2UsXG4gICAgICAgICAgICAgICAgQXV0aFN0YXRlU2VydmljZSxcbiAgICAgICAgICAgICAgICBTaWduaW5LZXlEYXRhU2VydmljZSxcbiAgICAgICAgICAgICAgICBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIFRva2VuSGVscGVyU2VydmljZSxcbiAgICAgICAgICAgICAgICBMb2dnZXJTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIElGcmFtZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgRXF1YWxpdHlTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIERhdGFTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIFN0YXRlVmFsaWRhdGlvblNlcnZpY2UsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBwcm92aWRlOiBBYnN0cmFjdFNlY3VyaXR5U3RvcmFnZSxcbiAgICAgICAgICAgICAgICAgICAgdXNlQ2xhc3M6IHRva2VuLnN0b3JhZ2UgfHwgQnJvd3NlclN0b3JhZ2VTZXJ2aWNlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgeyBwcm92aWRlOiBXSU5ET1csIHVzZUZhY3Rvcnk6IF93aW5kb3csIGRlcHM6IFtdIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IHR5cGUgVHlwZTxUPiA9IG5ldyAoLi4uYXJnczogYW55W10pID0+IFQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVG9rZW4ge1xuICAgIHN0b3JhZ2U/OiBUeXBlPGFueT47XG59XG4iXX0=