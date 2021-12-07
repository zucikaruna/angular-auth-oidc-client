import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DataService } from '../api/data.service';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
let SigninKeyDataService = class SigninKeyDataService {
    constructor(configurationProvider, loggerService, dataService) {
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
        this.dataService = dataService;
    }
    getSigningKeys() {
        var _a, _b;
        if (!((_a = this.configurationProvider.wellKnownEndpoints) === null || _a === void 0 ? void 0 : _a.jwksUri)) {
            const error = `getSigningKeys: authWellKnownEndpoints.jwksUri is: '${(_b = this.configurationProvider.wellKnownEndpoints) === null || _b === void 0 ? void 0 : _b.jwksUri}'`;
            this.loggerService.logWarning(error);
            return throwError(error);
        }
        this.loggerService.logDebug('Getting signinkeys from ', this.configurationProvider.wellKnownEndpoints.jwksUri);
        return this.dataService
            .get(this.configurationProvider.wellKnownEndpoints.jwksUri)
            .pipe(catchError(this.handleErrorGetSigningKeys));
    }
    handleErrorGetSigningKeys(error) {
        let errMsg;
        if (error instanceof Response) {
            const body = error.json() || {};
            const err = JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        }
        else {
            errMsg = error.message ? error.message : error.toString();
        }
        this.loggerService.logError(errMsg);
        return throwError(errMsg);
    }
};
SigninKeyDataService.ctorParameters = () => [
    { type: ConfigurationProvider },
    { type: LoggerService },
    { type: DataService }
];
SigninKeyDataService = __decorate([
    Injectable()
], SigninKeyDataService);
export { SigninKeyDataService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmluLWtleS1kYXRhLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvZmxvd3Mvc2lnbmluLWtleS1kYXRhLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNsQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUkxRCxJQUFhLG9CQUFvQixHQUFqQyxNQUFhLG9CQUFvQjtJQUM3QixZQUNZLHFCQUE0QyxFQUM1QyxhQUE0QixFQUM1QixXQUF3QjtRQUZ4QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1FBQzVDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGdCQUFXLEdBQVgsV0FBVyxDQUFhO0lBQ2pDLENBQUM7SUFFSixjQUFjOztRQUNWLElBQUksUUFBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsa0JBQWtCLDBDQUFFLE9BQU8sQ0FBQSxFQUFFO1lBQ3pELE1BQU0sS0FBSyxHQUFHLHVEQUF1RCxNQUFBLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxrQkFBa0IsMENBQUUsT0FBTyxHQUFHLENBQUM7WUFDL0gsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckMsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDNUI7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFL0csT0FBTyxJQUFJLENBQUMsV0FBVzthQUNsQixHQUFHLENBQVUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQzthQUNuRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVPLHlCQUF5QixDQUFDLEtBQXFCO1FBQ25ELElBQUksTUFBYyxDQUFDO1FBQ25CLElBQUksS0FBSyxZQUFZLFFBQVEsRUFBRTtZQUMzQixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO1lBQ2hDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakMsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sTUFBTSxLQUFLLENBQUMsVUFBVSxJQUFJLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztTQUNqRTthQUFNO1lBQ0gsTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUM3RDtRQUNELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLENBQUM7Q0FDSixDQUFBOztZQS9Cc0MscUJBQXFCO1lBQzdCLGFBQWE7WUFDZixXQUFXOztBQUozQixvQkFBb0I7SUFEaEMsVUFBVSxFQUFFO0dBQ0Esb0JBQW9CLENBaUNoQztTQWpDWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgY2F0Y2hFcnJvciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgRGF0YVNlcnZpY2UgfSBmcm9tICcuLi9hcGkvZGF0YS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgSnd0S2V5cyB9IGZyb20gJy4uL3ZhbGlkYXRpb24vand0a2V5cyc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBTaWduaW5LZXlEYXRhU2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcclxuICAgICAgICBwcml2YXRlIGRhdGFTZXJ2aWNlOiBEYXRhU2VydmljZVxyXG4gICAgKSB7fVxyXG5cclxuICAgIGdldFNpZ25pbmdLZXlzKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIud2VsbEtub3duRW5kcG9pbnRzPy5qd2tzVXJpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gYGdldFNpZ25pbmdLZXlzOiBhdXRoV2VsbEtub3duRW5kcG9pbnRzLmp3a3NVcmkgaXM6ICcke3RoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cz8uandrc1VyaX0nYDtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoZXJyb3IpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ0dldHRpbmcgc2lnbmlua2V5cyBmcm9tICcsIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cy5qd2tzVXJpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVNlcnZpY2VcclxuICAgICAgICAgICAgLmdldDxKd3RLZXlzPih0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci53ZWxsS25vd25FbmRwb2ludHMuandrc1VyaSlcclxuICAgICAgICAgICAgLnBpcGUoY2F0Y2hFcnJvcih0aGlzLmhhbmRsZUVycm9yR2V0U2lnbmluZ0tleXMpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhbmRsZUVycm9yR2V0U2lnbmluZ0tleXMoZXJyb3I6IFJlc3BvbnNlIHwgYW55KSB7XHJcbiAgICAgICAgbGV0IGVyck1zZzogc3RyaW5nO1xyXG4gICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJvZHkgPSBlcnJvci5qc29uKCkgfHwge307XHJcbiAgICAgICAgICAgIGNvbnN0IGVyciA9IEpTT04uc3RyaW5naWZ5KGJvZHkpO1xyXG4gICAgICAgICAgICBlcnJNc2cgPSBgJHtlcnJvci5zdGF0dXN9IC0gJHtlcnJvci5zdGF0dXNUZXh0IHx8ICcnfSAke2Vycn1gO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVyck1zZyA9IGVycm9yLm1lc3NhZ2UgPyBlcnJvci5tZXNzYWdlIDogZXJyb3IudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGVyck1zZyk7XHJcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZXJyTXNnKTtcclxuICAgIH1cclxufVxyXG4iXX0=