import { __assign, __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { PlatformProvider } from '../utils/platform-provider/platform.provider';
import { DEFAULT_CONFIG } from './default-config';
var ConfigurationProvider = /** @class */ (function () {
    function ConfigurationProvider(platformProvider) {
        this.platformProvider = platformProvider;
    }
    Object.defineProperty(ConfigurationProvider.prototype, "openIDConfiguration", {
        get: function () {
            if (!this.openIdConfigurationInternal) {
                return null;
            }
            return this.openIdConfigurationInternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfigurationProvider.prototype, "wellKnownEndpoints", {
        get: function () {
            if (!this.wellKnownEndpointsInternal) {
                return null;
            }
            return this.wellKnownEndpointsInternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ConfigurationProvider.prototype, "configuration", {
        get: function () {
            if (!this.hasValidConfig()) {
                return null;
            }
            return {
                configuration: __assign({}, this.openIDConfiguration),
                wellknown: __assign({}, this.wellKnownEndpoints),
            };
        },
        enumerable: true,
        configurable: true
    });
    ConfigurationProvider.prototype.hasValidConfig = function () {
        return !!this.wellKnownEndpointsInternal && !!this.openIdConfigurationInternal;
    };
    ConfigurationProvider.prototype.setConfig = function (configuration, wellKnownEndpoints) {
        this.wellKnownEndpointsInternal = wellKnownEndpoints;
        this.openIdConfigurationInternal = __assign(__assign({}, DEFAULT_CONFIG), configuration);
        if (configuration === null || configuration === void 0 ? void 0 : configuration.storage) {
            console.warn('PLEASE NOTE: The storage in the config will be deprecated in future versions: Please pass the custom storage in forRoot() as documented');
        }
        this.setSpecialCases(this.openIdConfigurationInternal);
    };
    ConfigurationProvider.prototype.setSpecialCases = function (currentConfig) {
        if (!this.platformProvider.isBrowser) {
            currentConfig.startCheckSession = false;
            currentConfig.silentRenew = false;
            currentConfig.useRefreshToken = false;
        }
    };
    ConfigurationProvider.ctorParameters = function () { return [
        { type: PlatformProvider }
    ]; };
    ConfigurationProvider = __decorate([
        Injectable()
    ], ConfigurationProvider);
    return ConfigurationProvider;
}());
export { ConfigurationProvider };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL2NvbmZpZy9jb25maWcucHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFFaEYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBS2xEO0lBbUNJLCtCQUFvQixnQkFBa0M7UUFBbEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtJQUFHLENBQUM7SUEvQjFELHNCQUFJLHNEQUFtQjthQUF2QjtZQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUU7Z0JBQ25DLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFFRCxPQUFPLElBQUksQ0FBQywyQkFBMkIsQ0FBQztRQUM1QyxDQUFDOzs7T0FBQTtJQUVELHNCQUFJLHFEQUFrQjthQUF0QjtZQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUU7Z0JBQ2xDLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFFRCxPQUFPLElBQUksQ0FBQywwQkFBMEIsQ0FBQztRQUMzQyxDQUFDOzs7T0FBQTtJQUVELHNCQUFJLGdEQUFhO2FBQWpCO1lBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRTtnQkFDeEIsT0FBTyxJQUFJLENBQUM7YUFDZjtZQUVELE9BQU87Z0JBQ0gsYUFBYSxlQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBRTtnQkFDOUMsU0FBUyxlQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBRTthQUM1QyxDQUFDO1FBQ04sQ0FBQzs7O09BQUE7SUFFRCw4Q0FBYyxHQUFkO1FBQ0ksT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUM7SUFDbkYsQ0FBQztJQUlELHlDQUFTLEdBQVQsVUFBVSxhQUFrQyxFQUFFLGtCQUEwQztRQUNwRixJQUFJLENBQUMsMEJBQTBCLEdBQUcsa0JBQWtCLENBQUM7UUFDckQsSUFBSSxDQUFDLDJCQUEyQix5QkFBUSxjQUFjLEdBQUssYUFBYSxDQUFFLENBQUM7UUFFM0UsSUFBSSxhQUFhLGFBQWIsYUFBYSx1QkFBYixhQUFhLENBQUUsT0FBTyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQ1IseUlBQXlJLENBQzVJLENBQUM7U0FDTDtRQUVELElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVPLCtDQUFlLEdBQXZCLFVBQXdCLGFBQWtDO1FBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFO1lBQ2xDLGFBQWEsQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7WUFDeEMsYUFBYSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDbEMsYUFBYSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7U0FDekM7SUFDTCxDQUFDOztnQkFyQnFDLGdCQUFnQjs7SUFuQzdDLHFCQUFxQjtRQURqQyxVQUFVLEVBQUU7T0FDQSxxQkFBcUIsQ0F5RGpDO0lBQUQsNEJBQUM7Q0FBQSxBQXpERCxJQXlEQztTQXpEWSxxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFBsYXRmb3JtUHJvdmlkZXIgfSBmcm9tICcuLi91dGlscy9wbGF0Zm9ybS1wcm92aWRlci9wbGF0Zm9ybS5wcm92aWRlcic7XHJcbmltcG9ydCB7IEF1dGhXZWxsS25vd25FbmRwb2ludHMgfSBmcm9tICcuL2F1dGgtd2VsbC1rbm93bi1lbmRwb2ludHMnO1xyXG5pbXBvcnQgeyBERUZBVUxUX0NPTkZJRyB9IGZyb20gJy4vZGVmYXVsdC1jb25maWcnO1xyXG5pbXBvcnQgeyBPcGVuSWRDb25maWd1cmF0aW9uIH0gZnJvbSAnLi9vcGVuaWQtY29uZmlndXJhdGlvbic7XHJcbmltcG9ydCB7IFB1YmxpY0NvbmZpZ3VyYXRpb24gfSBmcm9tICcuL3B1YmxpYy1jb25maWd1cmF0aW9uJztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIENvbmZpZ3VyYXRpb25Qcm92aWRlciB7XHJcbiAgICBwcml2YXRlIHdlbGxLbm93bkVuZHBvaW50c0ludGVybmFsOiBBdXRoV2VsbEtub3duRW5kcG9pbnRzO1xyXG4gICAgcHJpdmF0ZSBvcGVuSWRDb25maWd1cmF0aW9uSW50ZXJuYWw6IE9wZW5JZENvbmZpZ3VyYXRpb247XHJcblxyXG4gICAgZ2V0IG9wZW5JRENvbmZpZ3VyYXRpb24oKTogT3BlbklkQ29uZmlndXJhdGlvbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm9wZW5JZENvbmZpZ3VyYXRpb25JbnRlcm5hbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm9wZW5JZENvbmZpZ3VyYXRpb25JbnRlcm5hbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgd2VsbEtub3duRW5kcG9pbnRzKCk6IEF1dGhXZWxsS25vd25FbmRwb2ludHMge1xyXG4gICAgICAgIGlmICghdGhpcy53ZWxsS25vd25FbmRwb2ludHNJbnRlcm5hbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLndlbGxLbm93bkVuZHBvaW50c0ludGVybmFsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBjb25maWd1cmF0aW9uKCk6IFB1YmxpY0NvbmZpZ3VyYXRpb24ge1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNWYWxpZENvbmZpZygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY29uZmlndXJhdGlvbjogeyAuLi50aGlzLm9wZW5JRENvbmZpZ3VyYXRpb24gfSxcclxuICAgICAgICAgICAgd2VsbGtub3duOiB7IC4uLnRoaXMud2VsbEtub3duRW5kcG9pbnRzIH0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBoYXNWYWxpZENvbmZpZygpIHtcclxuICAgICAgICByZXR1cm4gISF0aGlzLndlbGxLbm93bkVuZHBvaW50c0ludGVybmFsICYmICEhdGhpcy5vcGVuSWRDb25maWd1cmF0aW9uSW50ZXJuYWw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBwbGF0Zm9ybVByb3ZpZGVyOiBQbGF0Zm9ybVByb3ZpZGVyKSB7fVxyXG5cclxuICAgIHNldENvbmZpZyhjb25maWd1cmF0aW9uOiBPcGVuSWRDb25maWd1cmF0aW9uLCB3ZWxsS25vd25FbmRwb2ludHM6IEF1dGhXZWxsS25vd25FbmRwb2ludHMpIHtcclxuICAgICAgICB0aGlzLndlbGxLbm93bkVuZHBvaW50c0ludGVybmFsID0gd2VsbEtub3duRW5kcG9pbnRzO1xyXG4gICAgICAgIHRoaXMub3BlbklkQ29uZmlndXJhdGlvbkludGVybmFsID0geyAuLi5ERUZBVUxUX0NPTkZJRywgLi4uY29uZmlndXJhdGlvbiB9O1xyXG5cclxuICAgICAgICBpZiAoY29uZmlndXJhdGlvbj8uc3RvcmFnZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICAgICAgICAnUExFQVNFIE5PVEU6IFRoZSBzdG9yYWdlIGluIHRoZSBjb25maWcgd2lsbCBiZSBkZXByZWNhdGVkIGluIGZ1dHVyZSB2ZXJzaW9uczogUGxlYXNlIHBhc3MgdGhlIGN1c3RvbSBzdG9yYWdlIGluIGZvclJvb3QoKSBhcyBkb2N1bWVudGVkJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXRTcGVjaWFsQ2FzZXModGhpcy5vcGVuSWRDb25maWd1cmF0aW9uSW50ZXJuYWwpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0U3BlY2lhbENhc2VzKGN1cnJlbnRDb25maWc6IE9wZW5JZENvbmZpZ3VyYXRpb24pIHtcclxuICAgICAgICBpZiAoIXRoaXMucGxhdGZvcm1Qcm92aWRlci5pc0Jyb3dzZXIpIHtcclxuICAgICAgICAgICAgY3VycmVudENvbmZpZy5zdGFydENoZWNrU2Vzc2lvbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjdXJyZW50Q29uZmlnLnNpbGVudFJlbmV3ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGN1cnJlbnRDb25maWcudXNlUmVmcmVzaFRva2VuID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==