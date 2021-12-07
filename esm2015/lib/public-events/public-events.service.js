import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
let PublicEventsService = class PublicEventsService {
    constructor() {
        this.notify = new ReplaySubject(1);
    }
    fireEvent(type, value) {
        this.notify.next({ type, value });
    }
    registerForEvents() {
        return this.notify.asObservable();
    }
};
PublicEventsService = __decorate([
    Injectable()
], PublicEventsService);
export { PublicEventsService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljLWV2ZW50cy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL3B1YmxpYy1ldmVudHMvcHVibGljLWV2ZW50cy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFLckMsSUFBYSxtQkFBbUIsR0FBaEMsTUFBYSxtQkFBbUI7SUFBaEM7UUFDWSxXQUFNLEdBQUcsSUFBSSxhQUFhLENBQThCLENBQUMsQ0FBQyxDQUFDO0lBU3ZFLENBQUM7SUFQRyxTQUFTLENBQUksSUFBZ0IsRUFBRSxLQUFTO1FBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELGlCQUFpQjtRQUNiLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0NBQ0osQ0FBQTtBQVZZLG1CQUFtQjtJQUQvQixVQUFVLEVBQUU7R0FDQSxtQkFBbUIsQ0FVL0I7U0FWWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFJlcGxheVN1YmplY3QgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgRXZlbnRUeXBlcyB9IGZyb20gJy4vZXZlbnQtdHlwZXMnO1xyXG5pbXBvcnQgeyBPaWRjQ2xpZW50Tm90aWZpY2F0aW9uIH0gZnJvbSAnLi9ub3RpZmljYXRpb24nO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgUHVibGljRXZlbnRzU2VydmljZSB7XHJcbiAgICBwcml2YXRlIG5vdGlmeSA9IG5ldyBSZXBsYXlTdWJqZWN0PE9pZGNDbGllbnROb3RpZmljYXRpb248YW55Pj4oMSk7XHJcblxyXG4gICAgZmlyZUV2ZW50PFQ+KHR5cGU6IEV2ZW50VHlwZXMsIHZhbHVlPzogVCkge1xyXG4gICAgICAgIHRoaXMubm90aWZ5Lm5leHQoeyB0eXBlLCB2YWx1ZSB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZWdpc3RlckZvckV2ZW50cygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ub3RpZnkuYXNPYnNlcnZhYmxlKCk7XHJcbiAgICB9XHJcbn1cclxuIl19