import { __decorate } from "tslib";
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
import { EventTypes } from '../public-events/event-types';
import { PublicEventsService } from '../public-events/public-events.service';
import { StoragePersistanceService } from '../storage/storage-persistance.service';
import { IFrameService } from './existing-iframe.service';
const IFRAME_FOR_CHECK_SESSION_IDENTIFIER = 'myiFrameForCheckSession';
// http://openid.net/specs/openid-connect-session-1_0-ID4.html
let CheckSessionService = class CheckSessionService {
    constructor(storagePersistanceService, loggerService, iFrameService, zone, eventService, configurationProvider) {
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
    get checkSessionChanged$() {
        return this.checkSessionChangedInternal$.asObservable();
    }
    isCheckSessionConfigured() {
        return this.configurationProvider.openIDConfiguration.startCheckSession;
    }
    start() {
        if (!!this.scheduledHeartBeatRunning) {
            return;
        }
        this.init();
        const clientId = this.configurationProvider.openIDConfiguration.clientId;
        this.pollServerSession(clientId);
    }
    stop() {
        if (!this.scheduledHeartBeatRunning) {
            return;
        }
        this.clearScheduledHeartBeat();
        this.checkSessionReceived = false;
    }
    serverStateChanged() {
        return this.configurationProvider.openIDConfiguration.startCheckSession && this.checkSessionReceived;
    }
    init() {
        if (this.lastIFrameRefresh + this.iframeRefreshInterval > Date.now()) {
            return;
        }
        if (!this.configurationProvider.wellKnownEndpoints) {
            this.loggerService.logWarning('init check session: authWellKnownEndpoints is undefined. Returning.');
            return;
        }
        const existingIframe = this.getOrCreateIframe();
        if (this.configurationProvider.wellKnownEndpoints.checkSessionIframe) {
            existingIframe.contentWindow.location.replace(this.configurationProvider.wellKnownEndpoints.checkSessionIframe);
        }
        else {
            this.loggerService.logWarning('init check session: checkSessionIframe is not configured to run');
        }
        this.bindMessageEventToIframe();
        existingIframe.onload = () => {
            this.lastIFrameRefresh = Date.now();
        };
    }
    pollServerSession(clientId) {
        this.outstandingMessages = 0;
        const pollServerSessionRecur = () => {
            const existingIframe = this.getExistingIframe();
            if (existingIframe && clientId) {
                this.loggerService.logDebug(existingIframe);
                const sessionState = this.storagePersistanceService.sessionState;
                if (sessionState) {
                    this.outstandingMessages++;
                    existingIframe.contentWindow.postMessage(clientId + ' ' + sessionState, this.configurationProvider.openIDConfiguration.stsServer);
                }
                else {
                    this.loggerService.logDebug('OidcSecurityCheckSession pollServerSession session_state is blank');
                }
            }
            else {
                this.loggerService.logWarning('OidcSecurityCheckSession pollServerSession checkSession IFrame does not exist');
                this.loggerService.logDebug(clientId);
                this.loggerService.logDebug(existingIframe);
            }
            // after sending three messages with no response, fail.
            if (this.outstandingMessages > 3) {
                this.loggerService.logError(`OidcSecurityCheckSession not receiving check session response messages. Outstanding messages: ${this.outstandingMessages}. Server unreachable?`);
            }
        };
        this.zone.runOutsideAngular(() => {
            this.scheduledHeartBeatRunning = setInterval(pollServerSessionRecur, this.heartBeatInterval);
        });
    }
    clearScheduledHeartBeat() {
        clearTimeout(this.scheduledHeartBeatRunning);
        this.scheduledHeartBeatRunning = null;
    }
    messageHandler(e) {
        const existingIFrame = this.getExistingIframe();
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
    }
    getExistingIframe() {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
    }
    bindMessageEventToIframe() {
        const iframeMessageEvent = this.messageHandler.bind(this);
        window.addEventListener('message', iframeMessageEvent, false);
    }
    getOrCreateIframe() {
        const existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            return this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
        }
        return existingIframe;
    }
};
CheckSessionService.ctorParameters = () => [
    { type: StoragePersistanceService },
    { type: LoggerService },
    { type: IFrameService },
    { type: NgZone },
    { type: PublicEventsService },
    { type: ConfigurationProvider }
];
CheckSessionService = __decorate([
    Injectable()
], CheckSessionService);
export { CheckSessionService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stc2Vzc2lvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL2lmcmFtZS9jaGVjay1zZXNzaW9uLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdkMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUM3RSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNuRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFMUQsTUFBTSxtQ0FBbUMsR0FBRyx5QkFBeUIsQ0FBQztBQUV0RSw4REFBOEQ7QUFHOUQsSUFBYSxtQkFBbUIsR0FBaEMsTUFBYSxtQkFBbUI7SUFhNUIsWUFDWSx5QkFBb0QsRUFDcEQsYUFBNEIsRUFDNUIsYUFBNEIsRUFDNUIsSUFBWSxFQUNaLFlBQWlDLEVBQ3hCLHFCQUE0QztRQUxyRCw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFDeEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQWxCekQseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1FBRTdCLHNCQUFpQixHQUFH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QUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFaEQsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNqQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsbUNBQW1DLENBQUMsQ0FBQztTQUN4RjtRQUVELE9BQU8sY0FBYyxDQUFDO0lBQzFCLENBQUM7Q0FDSixDQUFBOztZQTlJMEMseUJBQXlCO1lBQ3JDLGFBQWE7WUFDYixhQUFhO1lBQ3RCLE1BQU07WUFDRSxtQkFBbUI7WUFDRCxxQkFBcUI7O0FBbkJ4RCxtQkFBbUI7SUFEL0IsVUFBVSxFQUFFO0dBQ0EsbUJBQW1CLENBNEovQjtTQTVKWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlLCBOZ1pvbmUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5pbXBvcnQgeyBFdmVudFR5cGVzIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9ldmVudC10eXBlcyc7XG5pbXBvcnQgeyBQdWJsaWNFdmVudHNTZXJ2aWNlIH0gZnJvbSAnLi4vcHVibGljLWV2ZW50cy9wdWJsaWMtZXZlbnRzLnNlcnZpY2UnO1xuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcbmltcG9ydCB7IElGcmFtZVNlcnZpY2UgfSBmcm9tICcuL2V4aXN0aW5nLWlmcmFtZS5zZXJ2aWNlJztcblxuY29uc3QgSUZSQU1FX0ZPUl9DSEVDS19TRVNTSU9OX0lERU5USUZJRVIgPSAnbXlpRnJhbWVGb3JDaGVja1Nlc3Npb24nO1xuXG4vLyBodHRwOi8vb3BlbmlkLm5ldC9zcGVjcy9vcGVuaWQtY29ubmVjdC1zZXNzaW9uLTFfMC1JRDQuaHRtbFxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ2hlY2tTZXNzaW9uU2VydmljZSB7XG4gICAgcHJpdmF0ZSBjaGVja1Nlc3Npb25SZWNlaXZlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgc2NoZWR1bGVkSGVhcnRCZWF0UnVubmluZzogYW55O1xuICAgIHByaXZhdGUgbGFzdElGcmFtZVJlZnJlc2ggPSAwO1xuICAgIHByaXZhdGUgb3V0c3RhbmRpbmdNZXNzYWdlcyA9IDA7XG4gICAgcHJpdmF0ZSBoZWFydEJlYXRJbnRlcnZhbCA9IDMwMDA7XG4gICAgcHJpdmF0ZSBpZnJhbWVSZWZyZXNoSW50ZXJ2YWwgPSA2MDAwMDtcblxuICAgIHByaXZhdGUgY2hlY2tTZXNzaW9uQ2hhbmdlZEludGVybmFsJCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4oZmFsc2UpO1xuXG4gICAgZ2V0IGNoZWNrU2Vzc2lvbkNoYW5nZWQkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGVja1Nlc3Npb25DaGFuZ2VkSW50ZXJuYWwkLmFzT2JzZXJ2YWJsZSgpO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgaUZyYW1lU2VydmljZTogSUZyYW1lU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSB6b25lOiBOZ1pvbmUsXG4gICAgICAgIHByaXZhdGUgZXZlbnRTZXJ2aWNlOiBQdWJsaWNFdmVudHNTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyXG4gICAgKSB7fVxuXG4gICAgaXNDaGVja1Nlc3Npb25Db25maWd1cmVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zdGFydENoZWNrU2Vzc2lvbjtcbiAgICB9XG5cbiAgICBzdGFydCgpOiB2b2lkIHtcbiAgICAgICAgaWYgKCEhdGhpcy5zY2hlZHVsZWRIZWFydEJlYXRSdW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluaXQoKTtcblxuICAgICAgICBjb25zdCBjbGllbnRJZCA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uY2xpZW50SWQ7XG4gICAgICAgIHRoaXMucG9sbFNlcnZlclNlc3Npb24oY2xpZW50SWQpO1xuICAgIH1cblxuICAgIHN0b3AoKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5zY2hlZHVsZWRIZWFydEJlYXRSdW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsZWFyU2NoZWR1bGVkSGVhcnRCZWF0KCk7XG4gICAgICAgIHRoaXMuY2hlY2tTZXNzaW9uUmVjZWl2ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBzZXJ2ZXJTdGF0ZUNoYW5nZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnN0YXJ0Q2hlY2tTZXNzaW9uICYmIHRoaXMuY2hlY2tTZXNzaW9uUmVjZWl2ZWQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0KCkge1xuICAgICAgICBpZiAodGhpcy5sYXN0SUZyYW1lUmVmcmVzaCArIHRoaXMuaWZyYW1lUmVmcmVzaEludGVydmFsID4gRGF0ZS5ub3coKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci53ZWxsS25vd25FbmRwb2ludHMpIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdpbml0IGNoZWNrIHNlc3Npb246IGF1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkLiBSZXR1cm5pbmcuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBleGlzdGluZ0lmcmFtZSA9IHRoaXMuZ2V0T3JDcmVhdGVJZnJhbWUoKTtcblxuICAgICAgICBpZiAodGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIud2VsbEtub3duRW5kcG9pbnRzLmNoZWNrU2Vzc2lvbklmcmFtZSkge1xuICAgICAgICAgICAgZXhpc3RpbmdJZnJhbWUuY29udGVudFdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLndlbGxLbm93bkVuZHBvaW50cy5jaGVja1Nlc3Npb25JZnJhbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2luaXQgY2hlY2sgc2Vzc2lvbjogY2hlY2tTZXNzaW9uSWZyYW1lIGlzIG5vdCBjb25maWd1cmVkIHRvIHJ1bicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5iaW5kTWVzc2FnZUV2ZW50VG9JZnJhbWUoKTtcblxuICAgICAgICBleGlzdGluZ0lmcmFtZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhc3RJRnJhbWVSZWZyZXNoID0gRGF0ZS5ub3coKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHBvbGxTZXJ2ZXJTZXNzaW9uKGNsaWVudElkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5vdXRzdGFuZGluZ01lc3NhZ2VzID0gMDtcblxuICAgICAgICBjb25zdCBwb2xsU2VydmVyU2Vzc2lvblJlY3VyID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdJZnJhbWUgPSB0aGlzLmdldEV4aXN0aW5nSWZyYW1lKCk7XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmdJZnJhbWUgJiYgY2xpZW50SWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoZXhpc3RpbmdJZnJhbWUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlc3Npb25TdGF0ZSA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5zZXNzaW9uU3RhdGU7XG4gICAgICAgICAgICAgICAgaWYgKHNlc3Npb25TdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm91dHN0YW5kaW5nTWVzc2FnZXMrKztcbiAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmdJZnJhbWUuY29udGVudFdpbmRvdy5wb3N0TWVzc2FnZShcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWVudElkICsgJyAnICsgc2Vzc2lvblN0YXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zdHNTZXJ2ZXJcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ09pZGNTZWN1cml0eUNoZWNrU2Vzc2lvbiBwb2xsU2VydmVyU2Vzc2lvbiBzZXNzaW9uX3N0YXRlIGlzIGJsYW5rJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnT2lkY1NlY3VyaXR5Q2hlY2tTZXNzaW9uIHBvbGxTZXJ2ZXJTZXNzaW9uIGNoZWNrU2Vzc2lvbiBJRnJhbWUgZG9lcyBub3QgZXhpc3QnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoY2xpZW50SWQpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhleGlzdGluZ0lmcmFtZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGFmdGVyIHNlbmRpbmcgdGhyZWUgbWVzc2FnZXMgd2l0aCBubyByZXNwb25zZSwgZmFpbC5cbiAgICAgICAgICAgIGlmICh0aGlzLm91dHN0YW5kaW5nTWVzc2FnZXMgPiAzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKFxuICAgICAgICAgICAgICAgICAgICBgT2lkY1NlY3VyaXR5Q2hlY2tTZXNzaW9uIG5vdCByZWNlaXZpbmcgY2hlY2sgc2Vzc2lvbiByZXNwb25zZSBtZXNzYWdlcy4gT3V0c3RhbmRpbmcgbWVzc2FnZXM6ICR7dGhpcy5vdXRzdGFuZGluZ01lc3NhZ2VzfS4gU2VydmVyIHVucmVhY2hhYmxlP2BcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlZEhlYXJ0QmVhdFJ1bm5pbmcgPSBzZXRJbnRlcnZhbChwb2xsU2VydmVyU2Vzc2lvblJlY3VyLCB0aGlzLmhlYXJ0QmVhdEludGVydmFsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjbGVhclNjaGVkdWxlZEhlYXJ0QmVhdCgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc2NoZWR1bGVkSGVhcnRCZWF0UnVubmluZyk7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVkSGVhcnRCZWF0UnVubmluZyA9IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtZXNzYWdlSGFuZGxlcihlOiBhbnkpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdJRnJhbWUgPSB0aGlzLmdldEV4aXN0aW5nSWZyYW1lKCk7XG4gICAgICAgIHRoaXMub3V0c3RhbmRpbmdNZXNzYWdlcyA9IDA7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGV4aXN0aW5nSUZyYW1lICYmXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnN0c1NlcnZlci5zdGFydHNXaXRoKGUub3JpZ2luKSAmJlxuICAgICAgICAgICAgZS5zb3VyY2UgPT09IGV4aXN0aW5nSUZyYW1lLmNvbnRlbnRXaW5kb3dcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBpZiAoZS5kYXRhID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2Vycm9yIGZyb20gY2hlY2tzZXNzaW9uIG1lc3NhZ2VIYW5kbGVyJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUuZGF0YSA9PT0gJ2NoYW5nZWQnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tTZXNzaW9uUmVjZWl2ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuZXZlbnRTZXJ2aWNlLmZpcmVFdmVudChFdmVudFR5cGVzLkNoZWNrU2Vzc2lvblJlY2VpdmVkLCBlLmRhdGEpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tTZXNzaW9uQ2hhbmdlZEludGVybmFsJC5uZXh0KHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50U2VydmljZS5maXJlRXZlbnQoRXZlbnRUeXBlcy5DaGVja1Nlc3Npb25SZWNlaXZlZCwgZS5kYXRhKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoZS5kYXRhICsgJyBmcm9tIGNoZWNrc2Vzc2lvbiBtZXNzYWdlSGFuZGxlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0RXhpc3RpbmdJZnJhbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlGcmFtZVNlcnZpY2UuZ2V0RXhpc3RpbmdJRnJhbWUoSUZSQU1FX0ZPUl9DSEVDS19TRVNTSU9OX0lERU5USUZJRVIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYmluZE1lc3NhZ2VFdmVudFRvSWZyYW1lKCkge1xuICAgICAgICBjb25zdCBpZnJhbWVNZXNzYWdlRXZlbnQgPSB0aGlzLm1lc3NhZ2VIYW5kbGVyLmJpbmQodGhpcyk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgaWZyYW1lTWVzc2FnZUV2ZW50LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRPckNyZWF0ZUlmcmFtZSgpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdJZnJhbWUgPSB0aGlzLmdldEV4aXN0aW5nSWZyYW1lKCk7XG5cbiAgICAgICAgaWYgKCFleGlzdGluZ0lmcmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaUZyYW1lU2VydmljZS5hZGRJRnJhbWVUb1dpbmRvd0JvZHkoSUZSQU1FX0ZPUl9DSEVDS19TRVNTSU9OX0lERU5USUZJRVIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGV4aXN0aW5nSWZyYW1lO1xuICAgIH1cbn1cbiJdfQ==