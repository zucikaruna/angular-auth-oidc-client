import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { LoggerService } from '../logging/logger.service';
let IFrameService = class IFrameService {
    constructor(loggerService) {
        this.loggerService = loggerService;
    }
    getExistingIFrame(identifier) {
        const iFrameOnParent = this.getIFrameFromParentWindow(identifier);
        if (this.isIFrameElement(iFrameOnParent)) {
            return iFrameOnParent;
        }
        const iFrameOnSelf = this.getIFrameFromWindow(identifier);
        if (this.isIFrameElement(iFrameOnSelf)) {
            return iFrameOnSelf;
        }
        return null;
    }
    addIFrameToWindowBody(identifier) {
        const sessionIframe = window.document.createElement('iframe');
        sessionIframe.id = identifier;
        this.loggerService.logDebug(sessionIframe);
        sessionIframe.style.display = 'none';
        window.document.body.appendChild(sessionIframe);
        return sessionIframe;
    }
    getIFrameFromParentWindow(identifier) {
        try {
            const iFrameElement = window.parent.document.getElementById(identifier);
            if (this.isIFrameElement(iFrameElement)) {
                return iFrameElement;
            }
            return null;
        }
        catch (e) {
            return null;
        }
    }
    getIFrameFromWindow(identifier) {
        const iFrameElement = window.document.getElementById(identifier);
        if (this.isIFrameElement(iFrameElement)) {
            return iFrameElement;
        }
        return null;
    }
    isIFrameElement(element) {
        return !!element && element instanceof HTMLIFrameElement;
    }
};
IFrameService.ctorParameters = () => [
    { type: LoggerService }
];
IFrameService = __decorate([
    Injectable()
], IFrameService);
export { IFrameService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhpc3RpbmctaWZyYW1lLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvaWZyYW1lL2V4aXN0aW5nLWlmcmFtZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUcxRCxJQUFhLGFBQWEsR0FBMUIsTUFBYSxhQUFhO0lBQ3RCLFlBQW9CLGFBQTRCO1FBQTVCLGtCQUFhLEdBQWIsYUFBYSxDQUFlO0lBQUcsQ0FBQztJQUVwRCxpQkFBaUIsQ0FBQyxVQUFrQjtRQUNoQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbEUsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3RDLE9BQU8sY0FBYyxDQUFDO1NBQ3pCO1FBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFELElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNwQyxPQUFPLFlBQVksQ0FBQztTQUN2QjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxVQUFrQjtRQUNwQyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5RCxhQUFhLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQztRQUM5QixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMzQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDckMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hELE9BQU8sYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFTyx5QkFBeUIsQ0FBQyxVQUFrQjtRQUNoRCxJQUFJO1lBQ0EsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hFLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDckMsT0FBTyxhQUFhLENBQUM7YUFDeEI7WUFDRCxPQUFPLElBQUksQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVPLG1CQUFtQixDQUFDLFVBQWtCO1FBQzFDLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pFLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUNyQyxPQUFPLGFBQWEsQ0FBQztTQUN4QjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTyxlQUFlLENBQUMsT0FBMkI7UUFDL0MsT0FBTyxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sWUFBWSxpQkFBaUIsQ0FBQztJQUM3RCxDQUFDO0NBQ0osQ0FBQTs7WUEvQ3NDLGFBQWE7O0FBRHZDLGFBQWE7SUFEekIsVUFBVSxFQUFFO0dBQ0EsYUFBYSxDQWdEekI7U0FoRFksYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIElGcmFtZVNlcnZpY2Uge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSkge31cblxuICAgIGdldEV4aXN0aW5nSUZyYW1lKGlkZW50aWZpZXI6IHN0cmluZyk6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IGlGcmFtZU9uUGFyZW50ID0gdGhpcy5nZXRJRnJhbWVGcm9tUGFyZW50V2luZG93KGlkZW50aWZpZXIpO1xuICAgICAgICBpZiAodGhpcy5pc0lGcmFtZUVsZW1lbnQoaUZyYW1lT25QYXJlbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gaUZyYW1lT25QYXJlbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpRnJhbWVPblNlbGYgPSB0aGlzLmdldElGcmFtZUZyb21XaW5kb3coaWRlbnRpZmllcik7XG4gICAgICAgIGlmICh0aGlzLmlzSUZyYW1lRWxlbWVudChpRnJhbWVPblNlbGYpKSB7XG4gICAgICAgICAgICByZXR1cm4gaUZyYW1lT25TZWxmO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGFkZElGcmFtZVRvV2luZG93Qm9keShpZGVudGlmaWVyOiBzdHJpbmcpOiBIVE1MSUZyYW1lRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IHNlc3Npb25JZnJhbWUgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gICAgICAgIHNlc3Npb25JZnJhbWUuaWQgPSBpZGVudGlmaWVyO1xuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoc2Vzc2lvbklmcmFtZSk7XG4gICAgICAgIHNlc3Npb25JZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgd2luZG93LmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2Vzc2lvbklmcmFtZSk7XG4gICAgICAgIHJldHVybiBzZXNzaW9uSWZyYW1lO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0SUZyYW1lRnJvbVBhcmVudFdpbmRvdyhpZGVudGlmaWVyOiBzdHJpbmcpOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgaUZyYW1lRWxlbWVudCA9IHdpbmRvdy5wYXJlbnQuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWRlbnRpZmllcik7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0lGcmFtZUVsZW1lbnQoaUZyYW1lRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaUZyYW1lRWxlbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0SUZyYW1lRnJvbVdpbmRvdyhpZGVudGlmaWVyOiBzdHJpbmcpOiBIVE1MSUZyYW1lRWxlbWVudCB8IG51bGwge1xuICAgICAgICBjb25zdCBpRnJhbWVFbGVtZW50ID0gd2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkZW50aWZpZXIpO1xuICAgICAgICBpZiAodGhpcy5pc0lGcmFtZUVsZW1lbnQoaUZyYW1lRWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiBpRnJhbWVFbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNJRnJhbWVFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCk6IGVsZW1lbnQgaXMgSFRNTElGcmFtZUVsZW1lbnQge1xuICAgICAgICByZXR1cm4gISFlbGVtZW50ICYmIGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSUZyYW1lRWxlbWVudDtcbiAgICB9XG59XG4iXX0=