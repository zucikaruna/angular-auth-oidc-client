import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { PlatformProvider } from '../utils/platform-provider/platform.provider';
import { DEFAULT_CONFIG } from './default-config';
let ConfigurationProvider = class ConfigurationProvider {
    constructor(platformProvider) {
        this.platformProvider = platformProvider;
    }
    get openIDConfiguration() {
        if (!this.openIdConfigurationInternal) {
            return null;
        }
        return this.openIdConfigurationInternal;
    }
    get wellKnownEndpoints() {
        if (!this.wellKnownEndpointsInternal) {
            return null;
        }
        return this.wellKnownEndpointsInternal;
    }
    get configuration() {
        if (!this.hasValidConfig()) {
            return null;
        }
        return {
            configuration: Object.assign({}, this.openIDConfiguration),
            wellknown: Object.assign({}, this.wellKnownEndpoints),
        };
    }
    hasValidConfig() {
        return !!this.wellKnownEndpointsInternal && !!this.openIdConfigurationInternal;
    }
    setConfig(configuration, wellKnownEndpoints) {
        this.wellKnownEndpointsInternal = wellKnownEndpoints;
        this.openIdConfigurationInternal = Object.assign(Object.assign({}, DEFAULT_CONFIG), configuration);
        if (configuration === null || configuration === void 0 ? void 0 : configuration.storage) {
            console.warn('PLEASE NOTE: The storage in the config will be deprecated in future versions: Please pass the custom storage in forRoot() as documented');
        }
        this.setSpecialCases(this.openIdConfigurationInternal);
    }
    setSpecialCases(currentConfig) {
        if (!this.platformProvider.isBrowser) {
            currentConfig.startCheckSession = false;
            currentConfig.silentRenew = false;
            currentConfig.useRefreshToken = false;
        }
    }
};
ConfigurationProvider.ctorParameters = () => [
    { type: PlatformProvider }
];
ConfigurationProvider = __decorate([
    Injectable()
], ConfigurationProvider);
export { ConfigurationProvider };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL2NvbmZpZy9jb25maWcucHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFFaEYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBS2xELElBQWEscUJBQXFCLEdBQWxDLE1BQWEscUJBQXFCO0lBbUM5QixZQUFvQixnQkFBa0M7UUFBbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtJQUFHLENBQUM7SUEvQjFELElBQUksbUJBQW1CO1FBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUU7WUFDbkMsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELE9BQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDO0lBQzVDLENBQUM7SUFFRCxJQUFJLGtCQUFrQjtRQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFO1lBQ2xDLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQztJQUMzQyxDQUFDO0lBRUQsSUFBSSxhQUFhO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRTtZQUN4QixPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTztZQUNILGFBQWEsb0JBQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFFO1lBQzlDLFNBQVMsb0JBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFFO1NBQzVDLENBQUM7SUFDTixDQUFDO0lBRUQsY0FBYztRQUNWLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQywwQkFBMEIsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDO0lBQ25GLENBQUM7SUFJRCxTQUFTLENBQUMsYUFBa0MsRUFBRSxrQkFBMEM7UUFDcEYsSUFBSSxDQUFDLDBCQUEwQixHQUFHLGtCQUFrQixDQUFDO1FBQ3JELElBQUksQ0FBQywyQkFBMkIsbUNBQVEsY0FBYyxHQUFLLGFBQWEsQ0FBRSxDQUFDO1FBRTNFLElBQUksYUFBYSxhQUFiLGFBQWEsdUJBQWIsYUFBYSxDQUFFLE9BQU8sRUFBRTtZQUN4QixPQUFPLENBQUMsSUFBSSxDQUNSLHlJQUF5SSxDQUM1SSxDQUFDO1NBQ0w7UUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFTyxlQUFlLENBQUMsYUFBa0M7UUFDdEQsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUU7WUFDbEMsYUFBYSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztZQUN4QyxhQUFhLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUNsQyxhQUFhLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztTQUN6QztJQUNMLENBQUM7Q0FDSixDQUFBOztZQXRCeUMsZ0JBQWdCOztBQW5DN0MscUJBQXFCO0lBRGpDLFVBQVUsRUFBRTtHQUNBLHFCQUFxQixDQXlEakM7U0F6RFkscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBQbGF0Zm9ybVByb3ZpZGVyIH0gZnJvbSAnLi4vdXRpbHMvcGxhdGZvcm0tcHJvdmlkZXIvcGxhdGZvcm0ucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBBdXRoV2VsbEtub3duRW5kcG9pbnRzIH0gZnJvbSAnLi9hdXRoLXdlbGwta25vd24tZW5kcG9pbnRzJztcclxuaW1wb3J0IHsgREVGQVVMVF9DT05GSUcgfSBmcm9tICcuL2RlZmF1bHQtY29uZmlnJztcclxuaW1wb3J0IHsgT3BlbklkQ29uZmlndXJhdGlvbiB9IGZyb20gJy4vb3BlbmlkLWNvbmZpZ3VyYXRpb24nO1xyXG5pbXBvcnQgeyBQdWJsaWNDb25maWd1cmF0aW9uIH0gZnJvbSAnLi9wdWJsaWMtY29uZmlndXJhdGlvbic7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBDb25maWd1cmF0aW9uUHJvdmlkZXIge1xyXG4gICAgcHJpdmF0ZSB3ZWxsS25vd25FbmRwb2ludHNJbnRlcm5hbDogQXV0aFdlbGxLbm93bkVuZHBvaW50cztcclxuICAgIHByaXZhdGUgb3BlbklkQ29uZmlndXJhdGlvbkludGVybmFsOiBPcGVuSWRDb25maWd1cmF0aW9uO1xyXG5cclxuICAgIGdldCBvcGVuSURDb25maWd1cmF0aW9uKCk6IE9wZW5JZENvbmZpZ3VyYXRpb24ge1xyXG4gICAgICAgIGlmICghdGhpcy5vcGVuSWRDb25maWd1cmF0aW9uSW50ZXJuYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5vcGVuSWRDb25maWd1cmF0aW9uSW50ZXJuYWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHdlbGxLbm93bkVuZHBvaW50cygpOiBBdXRoV2VsbEtub3duRW5kcG9pbnRzIHtcclxuICAgICAgICBpZiAoIXRoaXMud2VsbEtub3duRW5kcG9pbnRzSW50ZXJuYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy53ZWxsS25vd25FbmRwb2ludHNJbnRlcm5hbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgY29uZmlndXJhdGlvbigpOiBQdWJsaWNDb25maWd1cmF0aW9uIHtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzVmFsaWRDb25maWcoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb246IHsgLi4udGhpcy5vcGVuSURDb25maWd1cmF0aW9uIH0sXHJcbiAgICAgICAgICAgIHdlbGxrbm93bjogeyAuLi50aGlzLndlbGxLbm93bkVuZHBvaW50cyB9LFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaGFzVmFsaWRDb25maWcoKSB7XHJcbiAgICAgICAgcmV0dXJuICEhdGhpcy53ZWxsS25vd25FbmRwb2ludHNJbnRlcm5hbCAmJiAhIXRoaXMub3BlbklkQ29uZmlndXJhdGlvbkludGVybmFsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcGxhdGZvcm1Qcm92aWRlcjogUGxhdGZvcm1Qcm92aWRlcikge31cclxuXHJcbiAgICBzZXRDb25maWcoY29uZmlndXJhdGlvbjogT3BlbklkQ29uZmlndXJhdGlvbiwgd2VsbEtub3duRW5kcG9pbnRzOiBBdXRoV2VsbEtub3duRW5kcG9pbnRzKSB7XHJcbiAgICAgICAgdGhpcy53ZWxsS25vd25FbmRwb2ludHNJbnRlcm5hbCA9IHdlbGxLbm93bkVuZHBvaW50cztcclxuICAgICAgICB0aGlzLm9wZW5JZENvbmZpZ3VyYXRpb25JbnRlcm5hbCA9IHsgLi4uREVGQVVMVF9DT05GSUcsIC4uLmNvbmZpZ3VyYXRpb24gfTtcclxuXHJcbiAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24/LnN0b3JhZ2UpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICAgICAgICAgJ1BMRUFTRSBOT1RFOiBUaGUgc3RvcmFnZSBpbiB0aGUgY29uZmlnIHdpbGwgYmUgZGVwcmVjYXRlZCBpbiBmdXR1cmUgdmVyc2lvbnM6IFBsZWFzZSBwYXNzIHRoZSBjdXN0b20gc3RvcmFnZSBpbiBmb3JSb290KCkgYXMgZG9jdW1lbnRlZCdcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3BlY2lhbENhc2VzKHRoaXMub3BlbklkQ29uZmlndXJhdGlvbkludGVybmFsKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFNwZWNpYWxDYXNlcyhjdXJyZW50Q29uZmlnOiBPcGVuSWRDb25maWd1cmF0aW9uKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnBsYXRmb3JtUHJvdmlkZXIuaXNCcm93c2VyKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb25maWcuc3RhcnRDaGVja1Nlc3Npb24gPSBmYWxzZTtcclxuICAgICAgICAgICAgY3VycmVudENvbmZpZy5zaWxlbnRSZW5ldyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjdXJyZW50Q29uZmlnLnVzZVJlZnJlc2hUb2tlbiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXX0=