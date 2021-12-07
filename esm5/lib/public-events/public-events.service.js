import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
var PublicEventsService = /** @class */ (function () {
    function PublicEventsService() {
        this.notify = new ReplaySubject(1);
    }
    PublicEventsService.prototype.fireEvent = function (type, value) {
        this.notify.next({ type: type, value: value });
    };
    PublicEventsService.prototype.registerForEvents = function () {
        return this.notify.asObservable();
    };
    PublicEventsService = __decorate([
        Injectable()
    ], PublicEventsService);
    return PublicEventsService;
}());
export { PublicEventsService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljLWV2ZW50cy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL3B1YmxpYy1ldmVudHMvcHVibGljLWV2ZW50cy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFLckM7SUFBQTtRQUNZLFdBQU0sR0FBRyxJQUFJLGFBQWEsQ0FBOEIsQ0FBQyxDQUFDLENBQUM7SUFTdkUsQ0FBQztJQVBHLHVDQUFTLEdBQVQsVUFBYSxJQUFnQixFQUFFLEtBQVM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLE1BQUEsRUFBRSxLQUFLLE9BQUEsRUFBRSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELCtDQUFpQixHQUFqQjtRQUNJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBVFEsbUJBQW1CO1FBRC9CLFVBQVUsRUFBRTtPQUNBLG1CQUFtQixDQVUvQjtJQUFELDBCQUFDO0NBQUEsQUFWRCxJQVVDO1NBVlksbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBSZXBsYXlTdWJqZWN0IH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IEV2ZW50VHlwZXMgfSBmcm9tICcuL2V2ZW50LXR5cGVzJztcclxuaW1wb3J0IHsgT2lkY0NsaWVudE5vdGlmaWNhdGlvbiB9IGZyb20gJy4vbm90aWZpY2F0aW9uJztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIFB1YmxpY0V2ZW50c1NlcnZpY2Uge1xyXG4gICAgcHJpdmF0ZSBub3RpZnkgPSBuZXcgUmVwbGF5U3ViamVjdDxPaWRjQ2xpZW50Tm90aWZpY2F0aW9uPGFueT4+KDEpO1xyXG5cclxuICAgIGZpcmVFdmVudDxUPih0eXBlOiBFdmVudFR5cGVzLCB2YWx1ZT86IFQpIHtcclxuICAgICAgICB0aGlzLm5vdGlmeS5uZXh0KHsgdHlwZSwgdmFsdWUgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVnaXN0ZXJGb3JFdmVudHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubm90aWZ5LmFzT2JzZXJ2YWJsZSgpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==