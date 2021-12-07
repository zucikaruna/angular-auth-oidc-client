import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { ConfigurationProvider } from '../config/config.provider';
import { LogLevel } from './log-level';
var LoggerService = /** @class */ (function () {
    function LoggerService(configurationProvider) {
        this.configurationProvider = configurationProvider;
    }
    LoggerService.prototype.logError = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        args.length ? console.error(message, args) : console.error(message);
    };
    LoggerService.prototype.logWarning = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.currentLogLevelIsEqualOrSmallerThan(LogLevel.Warn)) {
            args.length ? console.warn(message, args) : console.warn(message);
        }
    };
    LoggerService.prototype.logDebug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.currentLogLevelIsEqualOrSmallerThan(LogLevel.Debug)) {
            args.length ? console.log(message, args) : console.log(message);
        }
    };
    LoggerService.prototype.currentLogLevelIsEqualOrSmallerThan = function (logLevel) {
        return this.configurationProvider.openIDConfiguration.logLevel <= logLevel;
    };
    LoggerService.ctorParameters = function () { return [
        { type: ConfigurationProvider }
    ]; };
    LoggerService = __decorate([
        Injectable()
    ], LoggerService);
    return LoggerService;
}());
export { LoggerService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvbG9nZ2luZy9sb2dnZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBR3ZDO0lBQ0ksdUJBQW9CLHFCQUE0QztRQUE1QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO0lBQUcsQ0FBQztJQUVwRSxnQ0FBUSxHQUFSLFVBQVMsT0FBWTtRQUFFLGNBQWM7YUFBZCxVQUFjLEVBQWQscUJBQWMsRUFBZCxJQUFjO1lBQWQsNkJBQWM7O1FBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRCxrQ0FBVSxHQUFWLFVBQVcsT0FBWTtRQUFFLGNBQWlCO2FBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtZQUFqQiw2QkFBaUI7O1FBQ3RDLElBQUksSUFBSSxDQUFDLG1DQUFtQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN6RCxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNyRTtJQUNMLENBQUM7SUFFRCxnQ0FBUSxHQUFSLFVBQVMsT0FBWTtRQUFFLGNBQWlCO2FBQWpCLFVBQWlCLEVBQWpCLHFCQUFpQixFQUFqQixJQUFpQjtZQUFqQiw2QkFBaUI7O1FBQ3BDLElBQUksSUFBSSxDQUFDLG1DQUFtQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMxRCxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNuRTtJQUNMLENBQUM7SUFFTywyREFBbUMsR0FBM0MsVUFBNEMsUUFBa0I7UUFDMUQsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQztJQUMvRSxDQUFDOztnQkFwQjBDLHFCQUFxQjs7SUFEdkQsYUFBYTtRQUR6QixVQUFVLEVBQUU7T0FDQSxhQUFhLENBc0J6QjtJQUFELG9CQUFDO0NBQUEsQUF0QkQsSUFzQkM7U0F0QlksYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xuaW1wb3J0IHsgTG9nTGV2ZWwgfSBmcm9tICcuL2xvZy1sZXZlbCc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBMb2dnZXJTZXJ2aWNlIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyKSB7fVxuXG4gICAgbG9nRXJyb3IobWVzc2FnZTogYW55LCAuLi5hcmdzOiBhbnlbXSkge1xuICAgICAgICBhcmdzLmxlbmd0aCA/IGNvbnNvbGUuZXJyb3IobWVzc2FnZSwgYXJncykgOiBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGxvZ1dhcm5pbmcobWVzc2FnZTogYW55LCAuLi5hcmdzOiBzdHJpbmdbXSkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50TG9nTGV2ZWxJc0VxdWFsT3JTbWFsbGVyVGhhbihMb2dMZXZlbC5XYXJuKSkge1xuICAgICAgICAgICAgYXJncy5sZW5ndGggPyBjb25zb2xlLndhcm4obWVzc2FnZSwgYXJncykgOiBjb25zb2xlLndhcm4obWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2dEZWJ1ZyhtZXNzYWdlOiBhbnksIC4uLmFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRMb2dMZXZlbElzRXF1YWxPclNtYWxsZXJUaGFuKExvZ0xldmVsLkRlYnVnKSkge1xuICAgICAgICAgICAgYXJncy5sZW5ndGggPyBjb25zb2xlLmxvZyhtZXNzYWdlLCBhcmdzKSA6IGNvbnNvbGUubG9nKG1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjdXJyZW50TG9nTGV2ZWxJc0VxdWFsT3JTbWFsbGVyVGhhbihsb2dMZXZlbDogTG9nTGV2ZWwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24ubG9nTGV2ZWwgPD0gbG9nTGV2ZWw7XG4gICAgfVxufVxuIl19