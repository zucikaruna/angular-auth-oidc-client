import { __decorate } from "tslib";
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { EventTypes } from '../public-events/event-types';
import { PublicEventsService } from '../public-events/public-events.service';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { IFrameService } from './existing-iframe.service';
var IFRAME_FOR_CHECK_SESSION_IDENTIFIER = 'myiFrameForCheckSession';
// http://openid.net/specs/openid-connect-session-1_0-ID4.html
var CheckSessionService = /** @class */ (function () {
    function CheckSessionService(storagePersistanceService, loggerService, iFrameService, zone, eventService, configurationProvider) {
        this.storagePersistanceService = storagePersistanceService;
        this.loggerService = loggerService;
        this.iFrameService = iFrameService;
        this.zone = zone;
        this.eventService = eventService;
        this.configurationProvider = configurationProvider;
        this.checkSessionReceived = false;
        this.lastIFrameRefresh = 0;
        this.outstandingMessages = 0;
        this.heartBeatInterval = 3000;
        this.iframeRefreshInterval = 60000;
        this.checkSessionChangedInternal$ = new BehaviorSubject(false);
    }
    Object.defineProperty(CheckSessionService.prototype, "checkSessionChanged$", {
        get: function () {
            return this.checkSessionChangedInternal$.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    CheckSessionService.prototype.isCheckSessionConfigured = function () {
        return this.configurationProvider.openIDConfiguration.startCheckSession;
    };
    CheckSessionService.prototype.start = function () {
        if (!!this.scheduledHeartBeatRunning) {
            return;
        }
        this.init();
        var clientId = this.configurationProvider.openIDConfiguration.clientId;
        this.pollServerSession(clientId);
    };
    CheckSessionService.prototype.stop = function () {
        if (!this.scheduledHeartBeatRunning) {
            return;
        }
        this.clearScheduledHeartBeat();
        this.checkSessionReceived = false;
    };
    CheckSessionService.prototype.serverStateChanged = function () {
        return this.configurationProvider.openIDConfiguration.startCheckSession && this.checkSessionReceived;
    };
    CheckSessionService.prototype.init = function () {
        var _this = this;
        if (this.lastIFrameRefresh + this.iframeRefreshInterval > Date.now()) {
            return;
        }
        if (!this.configurationProvider.wellKnownEndpoints) {
            this.loggerService.logWarning('init check session: authWellKnownEndpoints is undefined. Returning.');
            return;
        }
        var existingIframe = this.getOrCreateIframe();
        if (this.configurationProvider.wellKnownEndpoints.checkSessionIframe) {
            existingIframe.contentWindow.location.replace(this.configurationProvider.wellKnownEndpoints.checkSessionIframe);
        }
        else {
            this.loggerService.logWarning('init check session: checkSessionIframe is not configured to run');
        }
        this.bindMessageEventToIframe();
        existingIframe.onload = function () {
            _this.lastIFrameRefresh = Date.now();
        };
    };
    CheckSessionService.prototype.pollServerSession = function (clientId) {
        var _this = this;
        this.outstandingMessages = 0;
        var pollServerSessionRecur = function () {
            var existingIframe = _this.getExistingIframe();
            if (existingIframe && clientId) {
                _this.loggerService.logDebug(existingIframe);
                var sessionState = _this.storagePersistanceService.sessionState;
                if (sessionState) {
                    _this.outstandingMessages++;
                    existingIframe.contentWindow.postMessage(clientId + ' ' + sessionState, _this.configurationProvider.openIDConfiguration.stsServer);
                }
                else {
                    _this.loggerService.logDebug('OidcSecurityCheckSession pollServerSession session_state is blank');
                }
            }
            else {
                _this.loggerService.logWarning('OidcSecurityCheckSession pollServerSession checkSession IFrame does not exist');
                _this.loggerService.logDebug(clientId);
                _this.loggerService.logDebug(existingIframe);
            }
            // after sending three messages with no response, fail.
            if (_this.outstandingMessages > 3) {
                _this.loggerService.logError("OidcSecurityCheckSession not receiving check session response messages. Outstanding messages: " + _this.outstandingMessages + ". Server unreachable?");
            }
        };
        this.zone.runOutsideAngular(function () {
            _this.scheduledHeartBeatRunning = setInterval(pollServerSessionRecur, _this.heartBeatInterval);
        });
    };
    CheckSessionService.prototype.clearScheduledHeartBeat = function () {
        clearTimeout(this.scheduledHeartBeatRunning);
        this.scheduledHeartBeatRunning = null;
    };
    CheckSessionService.prototype.messageHandler = function (e) {
        var existingIFrame = this.getExistingIframe();
        this.outstandingMessages = 0;
        if (existingIFrame &&
            this.configurationProvider.openIDConfiguration.stsServer.startsWith(e.origin) &&
            e.source === existingIFrame.contentWindow) {
            if (e.data === 'error') {
                this.loggerService.logWarning('error from checksession messageHandler');
            }
            else if (e.data === 'changed') {
                this.loggerService.logDebug(e);
                this.checkSessionReceived = true;
                this.eventService.fireEvent(EventTypes.CheckSessionReceived, e.data);
                this.checkSessionChangedInternal$.next(true);
            }
            else {
                this.eventService.fireEvent(EventTypes.CheckSessionReceived, e.data);
                this.loggerService.logDebug(e.data + ' from checksession messageHandler');
            }
        }
    };
    CheckSessionService.prototype.getExistingIframe = function () {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
    };
    CheckSessionService.prototype.bindMessageEventToIframe = function () {
        var iframeMessageEvent = this.messageHandler.bind(this);
        window.addEventListener('message', iframeMessageEvent, false);
    };
    CheckSessionService.prototype.getOrCreateIframe = function () {
        var existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            return this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
        }
        return existingIframe;
    };
    CheckSessionService.ctorParameters = function () { return [
        { type: StoragePersistanceService },
        { type: LoggerService },
        { type: IFrameService },
        { type: NgZone },
        { type: PublicEventsService },
        { type: ConfigurationProvider }
    ]; };
    CheckSessionService = __decorate([
        Injectable()
    ], CheckSessionService);
    return CheckSessionService;
}());
export { CheckSessionService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stc2Vzc2lvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL2lmcmFtZS9jaGVjay1zZXNzaW9uLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdkMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUM3RSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNuRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFMUQsSUFBTSxtQ0FBbUMsR0FBRyx5QkFBeUIsQ0FBQztBQUV0RSw4REFBOEQ7QUFHOUQ7SUFhSSw2QkFDWSx5QkFBb0QsRUFDcEQsYUFBNEIsRUFDNUIsYUFBNEIsRUFDNUIsSUFBWSxFQUNaLFlBQWlDLEVBQ3hCLHFCQUE0QztRQUxyRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFDeEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQWxCekQseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1FBRTdCLHNCQUFpQixHQUFHLENBQUMsQ0FBQztRQUN0Qix3QkFBbUIsR0FBRyxD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Q2xFLENBQUM7SUFFTywrQ0FBaUIsR0FBekI7UUFDSSxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUVoRCxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1NBQ3hGO1FBRUQsT0FBTyxjQUFjLENBQUM7SUFDMUIsQ0FBQzs7Z0JBN0lzQyx5QkFBeUI7Z0JBQ3JDLGFBQWE7Z0JBQ2IsYUFBYTtnQkFDdEIsTUFBTTtnQkFDRSxtQkFBbUI7Z0JBQ0QscUJBQXFCOztJQW5CeEQsbUJBQW1CO1FBRC9CLFVBQVUsRUFBRTtPQUNBLG1CQUFtQixDQTRKL0I7SUFBRCwwQkFBQztDQUFBLEFBNUpELElBNEpDO1NBNUpZLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIE5nWm9uZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcbmltcG9ydCB7IEV2ZW50VHlwZXMgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL2V2ZW50LXR5cGVzJztcbmltcG9ydCB7IFB1YmxpY0V2ZW50c1NlcnZpY2UgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL3B1YmxpYy1ldmVudHMuc2VydmljZSc7XG5pbXBvcnQgeyBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlIH0gZnJvbSAnLi4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RhbmNlLnNlcnZpY2UnO1xuaW1wb3J0IHsgSUZyYW1lU2VydmljZSB9IGZyb20gJy4vZXhpc3RpbmctaWZyYW1lLnNlcnZpY2UnO1xuXG5jb25zdCBJRlJBTUVfRk9SX0NIRUNLX1NFU1NJT05fSURFTlRJRklFUiA9ICdteWlGcmFtZUZvckNoZWNrU2Vzc2lvbic7XG5cbi8vIGh0dHA6Ly9vcGVuaWQubmV0L3NwZWNzL29wZW5pZC1jb25uZWN0LXNlc3Npb24tMV8wLUlENC5odG1sXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDaGVja1Nlc3Npb25TZXJ2aWNlIHtcbiAgICBwcml2YXRlIGNoZWNrU2Vzc2lvblJlY2VpdmVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBzY2hlZHVsZWRIZWFydEJlYXRSdW5uaW5nOiBhbnk7XG4gICAgcHJpdmF0ZSBsYXN0SUZyYW1lUmVmcmVzaCA9IDA7XG4gICAgcHJpdmF0ZSBvdXRzdGFuZGluZ01lc3NhZ2VzID0gMDtcbiAgICBwcml2YXRlIGhlYXJ0QmVhdEludGVydmFsID0gMzAwMDtcbiAgICBwcml2YXRlIGlmcmFtZVJlZnJlc2hJbnRlcnZhbCA9IDYwMDAwO1xuXG4gICAgcHJpdmF0ZSBjaGVja1Nlc3Npb25DaGFuZ2VkSW50ZXJuYWwkID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPihmYWxzZSk7XG5cbiAgICBnZXQgY2hlY2tTZXNzaW9uQ2hhbmdlZCQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNoZWNrU2Vzc2lvbkNoYW5nZWRJbnRlcm5hbCQuYXNPYnNlcnZhYmxlKCk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBpRnJhbWVTZXJ2aWNlOiBJRnJhbWVTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHpvbmU6IE5nWm9uZSxcbiAgICAgICAgcHJpdmF0ZSBldmVudFNlcnZpY2U6IFB1YmxpY0V2ZW50c1NlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXJcbiAgICApIHt9XG5cbiAgICBpc0NoZWNrU2Vzc2lvbkNvbmZpZ3VyZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnN0YXJ0Q2hlY2tTZXNzaW9uO1xuICAgIH1cblxuICAgIHN0YXJ0KCk6IHZvaWQge1xuICAgICAgICBpZiAoISF0aGlzLnNjaGVkdWxlZEhlYXJ0QmVhdFJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5jbGllbnRJZDtcbiAgICAgICAgdGhpcy5wb2xsU2VydmVyU2Vzc2lvbihjbGllbnRJZCk7XG4gICAgfVxuXG4gICAgc3RvcCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLnNjaGVkdWxlZEhlYXJ0QmVhdFJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2xlYXJTY2hlZHVsZWRIZWFydEJlYXQoKTtcbiAgICAgICAgdGhpcy5jaGVja1Nlc3Npb25SZWNlaXZlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHNlcnZlclN0YXRlQ2hhbmdlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc3RhcnRDaGVja1Nlc3Npb24gJiYgdGhpcy5jaGVja1Nlc3Npb25SZWNlaXZlZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGluaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmxhc3RJRnJhbWVSZWZyZXNoICsgdGhpcy5pZnJhbWVSZWZyZXNoSW50ZXJ2YWwgPiBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cykge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2luaXQgY2hlY2sgc2Vzc2lvbjogYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQuIFJldHVybmluZy4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nSWZyYW1lID0gdGhpcy5nZXRPckNyZWF0ZUlmcmFtZSgpO1xuXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci53ZWxsS25vd25FbmRwb2ludHMuY2hlY2tTZXNzaW9uSWZyYW1lKSB7XG4gICAgICAgICAgICBleGlzdGluZ0lmcmFtZS5jb250ZW50V2luZG93LmxvY2F0aW9uLnJlcGxhY2UodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIud2VsbEtub3duRW5kcG9pbnRzLmNoZWNrU2Vzc2lvbklmcmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnaW5pdCBjaGVjayBzZXNzaW9uOiBjaGVja1Nlc3Npb25JZnJhbWUgaXMgbm90IGNvbmZpZ3VyZWQgdG8gcnVuJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJpbmRNZXNzYWdlRXZlbnRUb0lmcmFtZSgpO1xuXG4gICAgICAgIGV4aXN0aW5nSWZyYW1lLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFzdElGcmFtZVJlZnJlc2ggPSBEYXRlLm5vdygpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgcG9sbFNlcnZlclNlc3Npb24oY2xpZW50SWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLm91dHN0YW5kaW5nTWVzc2FnZXMgPSAwO1xuXG4gICAgICAgIGNvbnN0IHBvbGxTZXJ2ZXJTZXNzaW9uUmVjdXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBleGlzdGluZ0lmcmFtZSA9IHRoaXMuZ2V0RXhpc3RpbmdJZnJhbWUoKTtcbiAgICAgICAgICAgIGlmIChleGlzdGluZ0lmcmFtZSAmJiBjbGllbnRJZCkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhleGlzdGluZ0lmcmFtZSk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2Vzc2lvblN0YXRlID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnNlc3Npb25TdGF0ZTtcbiAgICAgICAgICAgICAgICBpZiAoc2Vzc2lvblN0YXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3V0c3RhbmRpbmdNZXNzYWdlcysrO1xuICAgICAgICAgICAgICAgICAgICBleGlzdGluZ0lmcmFtZS5jb250ZW50V2luZG93LnBvc3RNZXNzYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpZW50SWQgKyAnICcgKyBzZXNzaW9uU3RhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnN0c1NlcnZlclxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnT2lkY1NlY3VyaXR5Q2hlY2tTZXNzaW9uIHBvbGxTZXJ2ZXJTZXNzaW9uIHNlc3Npb25fc3RhdGUgaXMgYmxhbmsnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdPaWRjU2VjdXJpdHlDaGVja1Nlc3Npb24gcG9sbFNlcnZlclNlc3Npb24gY2hlY2tTZXNzaW9uIElGcmFtZSBkb2VzIG5vdCBleGlzdCcpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhjbGllbnRJZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGV4aXN0aW5nSWZyYW1lKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gYWZ0ZXIgc2VuZGluZyB0aHJlZSBtZXNzYWdlcyB3aXRoIG5vIHJlc3BvbnNlLCBmYWlsLlxuICAgICAgICAgICAgaWYgKHRoaXMub3V0c3RhbmRpbmdNZXNzYWdlcyA+IDMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGBPaWRjU2VjdXJpdHlDaGVja1Nlc3Npb24gbm90IHJlY2VpdmluZyBjaGVjayBzZXNzaW9uIHJlc3BvbnNlIG1lc3NhZ2VzLiBPdXRzdGFuZGluZyBtZXNzYWdlczogJHt0aGlzLm91dHN0YW5kaW5nTWVzc2FnZXN9LiBTZXJ2ZXIgdW5yZWFjaGFibGU/YFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVkSGVhcnRCZWF0UnVubmluZyA9IHNldEludGVydmFsKHBvbGxTZXJ2ZXJTZXNzaW9uUmVjdXIsIHRoaXMuaGVhcnRCZWF0SW50ZXJ2YWwpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNsZWFyU2NoZWR1bGVkSGVhcnRCZWF0KCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5zY2hlZHVsZWRIZWFydEJlYXRSdW5uaW5nKTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZWRIZWFydEJlYXRSdW5uaW5nID0gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIG1lc3NhZ2VIYW5kbGVyKGU6IGFueSkge1xuICAgICAgICBjb25zdCBleGlzdGluZ0lGcmFtZSA9IHRoaXMuZ2V0RXhpc3RpbmdJZnJhbWUoKTtcbiAgICAgICAgdGhpcy5vdXRzdGFuZGluZ01lc3NhZ2VzID0gMDtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgZXhpc3RpbmdJRnJhbWUgJiZcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc3RzU2VydmVyLnN0YXJ0c1dpdGgoZS5vcmlnaW4pICYmXG4gICAgICAgICAgICBlLnNvdXJjZSA9PT0gZXhpc3RpbmdJRnJhbWUuY29udGVudFdpbmRvd1xuICAgICAgICApIHtcbiAgICAgICAgICAgIGlmIChlLmRhdGEgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnZXJyb3IgZnJvbSBjaGVja3Nlc3Npb24gbWVzc2FnZUhhbmRsZXInKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS5kYXRhID09PSAnY2hhbmdlZCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja1Nlc3Npb25SZWNlaXZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5ldmVudFNlcnZpY2UuZmlyZUV2ZW50KEV2ZW50VHlwZXMuQ2hlY2tTZXNzaW9uUmVjZWl2ZWQsIGUuZGF0YSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja1Nlc3Npb25DaGFuZ2VkSW50ZXJuYWwkLm5leHQodHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLmZpcmVFdmVudChFdmVudFR5cGVzLkNoZWNrU2Vzc2lvblJlY2VpdmVkLCBlLmRhdGEpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhlLmRhdGEgKyAnIGZyb20gY2hlY2tzZXNzaW9uIG1lc3NhZ2VIYW5kbGVyJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRFeGlzdGluZ0lmcmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaUZyYW1lU2VydmljZS5nZXRFeGlzdGluZ0lGcmFtZShJRlJBTUVfRk9SX0NIRUNLX1NFU1NJT05fSURFTlRJRklFUik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBiaW5kTWVzc2FnZUV2ZW50VG9JZnJhbWUoKSB7XG4gICAgICAgIGNvbnN0IGlmcmFtZU1lc3NhZ2VFdmVudCA9IHRoaXMubWVzc2FnZUhhbmRsZXIuYmluZCh0aGlzKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBpZnJhbWVNZXNzYWdlRXZlbnQsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE9yQ3JlYXRlSWZyYW1lKCkge1xuICAgICAgICBjb25zdCBleGlzdGluZ0lmcmFtZSA9IHRoaXMuZ2V0RXhpc3RpbmdJZnJhbWUoKTtcblxuICAgICAgICBpZiAoIWV4aXN0aW5nSWZyYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pRnJhbWVTZXJ2aWNlLmFkZElGcmFtZVRvV2luZG93Qm9keShJRlJBTUVfRk9SX0NIRUNLX1NFU1NJT05fSURFTlRJRklFUik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZXhpc3RpbmdJZnJhbWU7XG4gICAgfVxufVxuIl19