import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { ConfigurationProvider } from '../../config/config.provider';
// TODO  TESTING
var FlowHelper = /** @class */ (function () {
    function FlowHelper(configurationProvider) {
        this.configurationProvider = configurationProvider;
    }
    FlowHelper.prototype.isCurrentFlowCodeFlow = function () {
        return this.currentFlowIs('code');
    };
    FlowHelper.prototype.isCurrentFlowAnyImplicitFlow = function () {
        return this.isCurrentFlowImplicitFlowWithAccessToken() || this.isCurrentFlowImplicitFlowWithoutAccessToken();
    };
    FlowHelper.prototype.isCurrentFlowCodeFlowWithRefeshTokens = function () {
        if (this.isCurrentFlowCodeFlow() && this.configurationProvider.openIDConfiguration.useRefreshToken) {
            return true;
        }
        return false;
    };
    FlowHelper.prototype.isCurrentFlowImplicitFlowWithAccessToken = function () {
        return this.currentFlowIs('id_token token');
    };
    FlowHelper.prototype.isCurrentFlowImplicitFlowWithoutAccessToken = function () {
        return this.currentFlowIs('id_token');
    };
    FlowHelper.prototype.currentFlowIs = function (flowTypes) {
        var currentFlow = this.configurationProvider.openIDConfiguration.responseType;
        if (Array.isArray(flowTypes)) {
            return flowTypes.some(function (x) { return currentFlow === x; });
        }
        return currentFlow === flowTypes;
    };
    FlowHelper.ctorParameters = function () { return [
        { type: ConfigurationProvider }
    ]; };
    FlowHelper = __decorate([
        Injectable()
    ], FlowHelper);
    return FlowHelper;
}());
export { FlowHelper };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvdy1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC8iLCJzb3VyY2VzIjpbImxpYi91dGlscy9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFckUsZ0JBQWdCO0FBRWhCO0lBQ0ksb0JBQW9CLHFCQUE0QztRQUE1QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO0lBQUcsQ0FBQztJQUVwRSwwQ0FBcUIsR0FBckI7UUFDSSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELGlEQUE0QixHQUE1QjtRQUNJLE9BQU8sSUFBSSxDQUFDLHdDQUF3QyxFQUFFLElBQUksSUFBSSxDQUFDLDJDQUEyQyxFQUFFLENBQUM7SUFDakgsQ0FBQztJQUVELDBEQUFxQyxHQUFyQztRQUNJLElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRTtZQUNoRyxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELDZEQUF3QyxHQUF4QztRQUNJLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCxnRUFBMkMsR0FBM0M7UUFDSSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELGtDQUFhLEdBQWIsVUFBYyxTQUE0QjtRQUN0QyxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDO1FBRWhGLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUMxQixPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLElBQUssT0FBQSxXQUFXLEtBQUssQ0FBQyxFQUFqQixDQUFpQixDQUFDLENBQUM7U0FDbkQ7UUFFRCxPQUFPLFdBQVcsS0FBSyxTQUFTLENBQUM7SUFDckMsQ0FBQzs7Z0JBbEMwQyxxQkFBcUI7O0lBRHZELFVBQVU7UUFEdEIsVUFBVSxFQUFFO09BQ0EsVUFBVSxDQW9DdEI7SUFBRCxpQkFBQztDQUFBLEFBcENELElBb0NDO1NBcENZLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5cclxuLy8gVE9ETyAgVEVTVElOR1xyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBGbG93SGVscGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIpIHt9XHJcblxyXG4gICAgaXNDdXJyZW50Rmxvd0NvZGVGbG93KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRGbG93SXMoJ2NvZGUnKTtcclxuICAgIH1cclxuXHJcbiAgICBpc0N1cnJlbnRGbG93QW55SW1wbGljaXRGbG93KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4oKSB8fCB0aGlzLmlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRob3V0QWNjZXNzVG9rZW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBpc0N1cnJlbnRGbG93Q29kZUZsb3dXaXRoUmVmZXNoVG9rZW5zKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpICYmIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24udXNlUmVmcmVzaFRva2VuKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudEZsb3dJcygnaWRfdG9rZW4gdG9rZW4nKTtcclxuICAgIH1cclxuXHJcbiAgICBpc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aG91dEFjY2Vzc1Rva2VuKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRGbG93SXMoJ2lkX3Rva2VuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY3VycmVudEZsb3dJcyhmbG93VHlwZXM6IHN0cmluZ1tdIHwgc3RyaW5nKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudEZsb3cgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnJlc3BvbnNlVHlwZTtcclxuXHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZmxvd1R5cGVzKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmxvd1R5cGVzLnNvbWUoKHgpID0+IGN1cnJlbnRGbG93ID09PSB4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjdXJyZW50RmxvdyA9PT0gZmxvd1R5cGVzO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==