import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { LoggerService } from '../logging/logger.service';
var IFrameService = /** @class */ (function () {
    function IFrameService(loggerService) {
        this.loggerService = loggerService;
    }
    IFrameService.prototype.getExistingIFrame = function (identifier) {
        var iFrameOnParent = this.getIFrameFromParentWindow(identifier);
        if (this.isIFrameElement(iFrameOnParent)) {
            return iFrameOnParent;
        }
        var iFrameOnSelf = this.getIFrameFromWindow(identifier);
        if (this.isIFrameElement(iFrameOnSelf)) {
            return iFrameOnSelf;
        }
        return null;
    };
    IFrameService.prototype.addIFrameToWindowBody = function (identifier) {
        var sessionIframe = window.document.createElement('iframe');
        sessionIframe.id = identifier;
        this.loggerService.logDebug(sessionIframe);
        sessionIframe.style.display = 'none';
        window.document.body.appendChild(sessionIframe);
        return sessionIframe;
    };
    IFrameService.prototype.getIFrameFromParentWindow = function (identifier) {
        try {
            var iFrameElement = window.parent.document.getElementById(identifier);
            if (this.isIFrameElement(iFrameElement)) {
                return iFrameElement;
            }
            return null;
        }
        catch (e) {
            return null;
        }
    };
    IFrameService.prototype.getIFrameFromWindow = function (identifier) {
        var iFrameElement = window.document.getElementById(identifier);
        if (this.isIFrameElement(iFrameElement)) {
            return iFrameElement;
        }
        return null;
    };
    IFrameService.prototype.isIFrameElement = function (element) {
        return !!element && element instanceof HTMLIFrameElement;
    };
    IFrameService.ctorParameters = function () { return [
        { type: LoggerService }
    ]; };
    IFrameService = __decorate([
        Injectable()
    ], IFrameService);
    return IFrameService;
}());
export { IFrameService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhpc3RpbmctaWZyYW1lLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvaWZyYW1lL2V4aXN0aW5nLWlmcmFtZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUcxRDtJQUNJLHVCQUFvQixhQUE0QjtRQUE1QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUFHLENBQUM7SUFFcEQseUNBQWlCLEdBQWpCLFVBQWtCLFVBQWtCO1FBQ2hDLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNsRSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDdEMsT0FBTyxjQUFjLENBQUM7U0FDekI7UUFFRCxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDMUQsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ3BDLE9BQU8sWUFBWSxDQUFDO1NBQ3ZCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELDZDQUFxQixHQUFyQixVQUFzQixVQUFrQjtRQUNwQyxJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM5RCxhQUFhLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQztRQUM5QixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMzQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDckMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2hELE9BQU8sYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFTyxpREFBeUIsR0FBakMsVUFBa0MsVUFBa0I7UUFDaEQsSUFBSTtZQUNBLElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4RSxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ3JDLE9BQU8sYUFBYSxDQUFDO2FBQ3hCO1lBQ0QsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFTywyQ0FBbUIsR0FBM0IsVUFBNEIsVUFBa0I7UUFDMUMsSUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakUsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3JDLE9BQU8sYUFBYSxDQUFDO1NBQ3hCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVPLHVDQUFlLEdBQXZCLFVBQXdCLE9BQTJCO1FBQy9DLE9BQU8sQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLFlBQVksaUJBQWlCLENBQUM7SUFDN0QsQ0FBQzs7Z0JBOUNrQyxhQUFhOztJQUR2QyxhQUFhO1FBRHpCLFVBQVUsRUFBRTtPQUNBLGFBQWEsQ0FnRHpCO0lBQUQsb0JBQUM7Q0FBQSxBQWhERCxJQWdEQztTQWhEWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSUZyYW1lU2VydmljZSB7XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlKSB7fVxuXG4gICAgZ2V0RXhpc3RpbmdJRnJhbWUoaWRlbnRpZmllcjogc3RyaW5nKTogSFRNTElGcmFtZUVsZW1lbnQgfCBudWxsIHtcbiAgICAgICAgY29uc3QgaUZyYW1lT25QYXJlbnQgPSB0aGlzLmdldElGcmFtZUZyb21QYXJlbnRXaW5kb3coaWRlbnRpZmllcik7XG4gICAgICAgIGlmICh0aGlzLmlzSUZyYW1lRWxlbWVudChpRnJhbWVPblBhcmVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiBpRnJhbWVPblBhcmVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlGcmFtZU9uU2VsZiA9IHRoaXMuZ2V0SUZyYW1lRnJvbVdpbmRvdyhpZGVudGlmaWVyKTtcbiAgICAgICAgaWYgKHRoaXMuaXNJRnJhbWVFbGVtZW50KGlGcmFtZU9uU2VsZikpIHtcbiAgICAgICAgICAgIHJldHVybiBpRnJhbWVPblNlbGY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgYWRkSUZyYW1lVG9XaW5kb3dCb2R5KGlkZW50aWZpZXI6IHN0cmluZyk6IEhUTUxJRnJhbWVFbGVtZW50IHtcbiAgICAgICAgY29uc3Qgc2Vzc2lvbklmcmFtZSA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICAgICAgc2Vzc2lvbklmcmFtZS5pZCA9IGlkZW50aWZpZXI7XG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhzZXNzaW9uSWZyYW1lKTtcbiAgICAgICAgc2Vzc2lvbklmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB3aW5kb3cuZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzZXNzaW9uSWZyYW1lKTtcbiAgICAgICAgcmV0dXJuIHNlc3Npb25JZnJhbWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJRnJhbWVGcm9tUGFyZW50V2luZG93KGlkZW50aWZpZXI6IHN0cmluZyk6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBpRnJhbWVFbGVtZW50ID0gd2luZG93LnBhcmVudC5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZGVudGlmaWVyKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzSUZyYW1lRWxlbWVudChpRnJhbWVFbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpRnJhbWVFbGVtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJRnJhbWVGcm9tV2luZG93KGlkZW50aWZpZXI6IHN0cmluZyk6IEhUTUxJRnJhbWVFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IGlGcmFtZUVsZW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWRlbnRpZmllcik7XG4gICAgICAgIGlmICh0aGlzLmlzSUZyYW1lRWxlbWVudChpRnJhbWVFbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIGlGcmFtZUVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0lGcmFtZUVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsKTogZWxlbWVudCBpcyBIVE1MSUZyYW1lRWxlbWVudCB7XG4gICAgICAgIHJldHVybiAhIWVsZW1lbnQgJiYgZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJRnJhbWVFbGVtZW50O1xuICAgIH1cbn1cbiJdfQ==