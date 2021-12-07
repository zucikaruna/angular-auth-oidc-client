import { __decorate, __param } from "tslib";
import { Inject, Injectable } from '@angular/core';
import { WINDOW } from '../window/window.reference';
import * as i0 from "@angular/core";
import * as i1 from "../window/window.reference";
let RedirectService = class RedirectService {
    constructor(window) {
        this.window = window;
    }
    redirectTo(url) {
        this.window.location.href = url;
    }
};
RedirectService.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [WINDOW,] }] }
];
RedirectService.ɵprov = i0.ɵɵdefineInjectable({ factory: function RedirectService_Factory() { return new RedirectService(i0.ɵɵinject(i1.WINDOW)); }, token: RedirectService, providedIn: "root" });
RedirectService = __decorate([
    Injectable({ providedIn: 'root' }),
    __param(0, Inject(WINDOW))
], RedirectService);
export { RedirectService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXJlY3Quc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC8iLCJzb3VyY2VzIjpbImxpYi91dGlscy9yZWRpcmVjdC9yZWRpcmVjdC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7OztBQUdwRCxJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO0lBQ3hCLFlBQW9DLE1BQVc7UUFBWCxXQUFNLEdBQU4sTUFBTSxDQUFLO0lBQUcsQ0FBQztJQUVuRCxVQUFVLENBQUMsR0FBRztRQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7SUFDcEMsQ0FBQztDQUNKLENBQUE7OzRDQUxnQixNQUFNLFNBQUMsTUFBTTs7O0FBRGpCLGVBQWU7SUFEM0IsVUFBVSxDQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxDQUFDO0lBRWxCLFdBQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0dBRGxCLGVBQWUsQ0FNM0I7U0FOWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFdJTkRPVyB9IGZyb20gJy4uL3dpbmRvdy93aW5kb3cucmVmZXJlbmNlJztcclxuXHJcbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXHJcbmV4cG9ydCBjbGFzcyBSZWRpcmVjdFNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoQEluamVjdChXSU5ET1cpIHByaXZhdGUgd2luZG93OiBhbnkpIHt9XHJcblxyXG4gICAgcmVkaXJlY3RUbyh1cmwpIHtcclxuICAgICAgICB0aGlzLndpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==