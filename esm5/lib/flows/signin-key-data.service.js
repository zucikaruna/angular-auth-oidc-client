import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DataService } from '../api/data.service';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
var SigninKeyDataService = /** @class */ (function () {
    function SigninKeyDataService(configurationProvider, loggerService, dataService) {
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
        this.dataService = dataService;
    }
    SigninKeyDataService.prototype.getSigningKeys = function () {
        var _a, _b;
        if (!((_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.jwksUri)) {
            var error = "getSigningKeys: authWellKnownEndpoints.jwksUri is: '" + ((_b = this.configurationProvider.wellKnownEndpoints) === null || _b === void 0 ? void 0 : _b.jwksUri) + "'";
            this.loggerService.logWarning(error);
            return throwError(error);
        }
        this.loggerService.logDebug('Getting signinkeys from ', this.configurationProvider.wellKnownEndpoints.jwksUri);
        return this.dataService
            .get(this.configurationProvider.wellKnownEndpoints.jwksUri)
            .pipe(catchError(this.handleErrorGetSigningKeys));
    };
    SigninKeyDataService.prototype.handleErrorGetSigningKeys = function (error) {
        var errMsg;
        if (error instanceof Response) {
            var body = error.json() || {};
            var err = JSON.stringify(body);
            errMsg = error.status + " - " + (error.statusText || '') + " " + err;
        }
        else {
            errMsg = error.message ? error.message : error.toString();
        }
        this.loggerService.logError(errMsg);
        return throwError(errMsg);
    };
    SigninKeyDataService.ctorParameters = function () { return [
        { type: ConfigurationProvider },
        { type: LoggerService },
        { type: DataService }
    ]; };
    SigninKeyDataService = __decorate([
        Injectable()
    ], SigninKeyDataService);
    return SigninKeyDataService;
}());
export { SigninKeyDataService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmluLWtleS1kYXRhLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvZmxvd3Mvc2lnbmluLWtleS1kYXRhLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNsQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUkxRDtJQUNJLDhCQUNZLHFCQUE0QyxFQUM1QyxhQUE0QixFQUM1QixXQUF3QjtRQUZ4QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO0lBQ2pDLENBQUM7SUFFSiw2Q0FBYyxHQUFkOztRQUNJLElBQUksUUFBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsa0JBQWtCLDBDQUFFLE9BQU8sQ0FBQSxFQUFFO1lBQ3pELElBQU0sS0FBSyxHQUFHLGdFQUF1RCxJQUFJLENBQUMscUJBQXFCLENBQUMsa0JBQWtCLDBDQUFFLE9BQU8sT0FBRyxDQUFDO1lBQy9ILElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzVCO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRS9HLE9BQU8sSUFBSSxDQUFDLFdBQVc7YUFDbEIsR0FBRyxDQUFVLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUM7YUFDbkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFTyx3REFBeUIsR0FBakMsVUFBa0MsS0FBcUI7UUFDbkQsSUFBSSxNQUFjLENBQUM7UUFDbkIsSUFBSSxLQUFLLFlBQVksUUFBUSxFQUFFO1lBQzNCLElBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7WUFDaEMsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqQyxNQUFNLEdBQU0sS0FBSyxDQUFDLE1BQU0sWUFBTSxLQUFLLENBQUMsVUFBVSxJQUFJLEVBQUUsVUFBSSxHQUFLLENBQUM7U0FDakU7YUFBTTtZQUNILE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDN0Q7UUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxPQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5QixDQUFDOztnQkE5QmtDLHFCQUFxQjtnQkFDN0IsYUFBYTtnQkFDZixXQUFXOztJQUozQixvQkFBb0I7UUFEaEMsVUFBVSxFQUFFO09BQ0Esb0JBQW9CLENBaUNoQztJQUFELDJCQUFDO0NBQUEsQUFqQ0QsSUFpQ0M7U0FqQ1ksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGNhdGNoRXJyb3IgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vYXBpL2RhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IEp3dEtleXMgfSBmcm9tICcuLi92YWxpZGF0aW9uL2p3dGtleXMnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgU2lnbmluS2V5RGF0YVNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgICAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICAgICAgcHJpdmF0ZSBkYXRhU2VydmljZTogRGF0YVNlcnZpY2VcclxuICAgICkge31cclxuXHJcbiAgICBnZXRTaWduaW5nS2V5cygpIHtcclxuICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cz8uandrc1VyaSkge1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IGBnZXRTaWduaW5nS2V5czogYXV0aFdlbGxLbm93bkVuZHBvaW50cy5qd2tzVXJpIGlzOiAnJHt0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci53ZWxsS25vd25FbmRwb2ludHM/Lmp3a3NVcml9J2A7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKGVycm9yKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdHZXR0aW5nIHNpZ25pbmtleXMgZnJvbSAnLCB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci53ZWxsS25vd25FbmRwb2ludHMuandrc1VyaSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFTZXJ2aWNlXHJcbiAgICAgICAgICAgIC5nZXQ8Snd0S2V5cz4odGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIud2VsbEtub3duRW5kcG9pbnRzLmp3a3NVcmkpXHJcbiAgICAgICAgICAgIC5waXBlKGNhdGNoRXJyb3IodGhpcy5oYW5kbGVFcnJvckdldFNpZ25pbmdLZXlzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBoYW5kbGVFcnJvckdldFNpZ25pbmdLZXlzKGVycm9yOiBSZXNwb25zZSB8IGFueSkge1xyXG4gICAgICAgIGxldCBlcnJNc2c6IHN0cmluZztcclxuICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBSZXNwb25zZSkge1xyXG4gICAgICAgICAgICBjb25zdCBib2R5ID0gZXJyb3IuanNvbigpIHx8IHt9O1xyXG4gICAgICAgICAgICBjb25zdCBlcnIgPSBKU09OLnN0cmluZ2lmeShib2R5KTtcclxuICAgICAgICAgICAgZXJyTXNnID0gYCR7ZXJyb3Iuc3RhdHVzfSAtICR7ZXJyb3Iuc3RhdHVzVGV4dCB8fCAnJ30gJHtlcnJ9YDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlcnJNc2cgPSBlcnJvci5tZXNzYWdlID8gZXJyb3IubWVzc2FnZSA6IGVycm9yLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihlcnJNc2cpO1xyXG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGVyck1zZyk7XHJcbiAgICB9XHJcbn1cclxuIl19