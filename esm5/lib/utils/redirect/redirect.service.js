import { __decorate, __param } from "tslib";
import { Inject, Injectable } from '@angular/core';
import { WINDOW } from '../window/window.reference';
import * as i0 from "@angular/core";
import * as i1 from "../window/window.reference";
var RedirectService = /** @class */ (function () {
    function RedirectService(window) {
        this.window = window;
    }
    RedirectService.prototype.redirectTo = function (url) {
        this.window.location.href = url;
    };
    RedirectService.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [WINDOW,] }] }
    ]; };
    RedirectService.ɵprov = i0.ɵɵdefineInjectable({ factory: function RedirectService_Factory() { return new RedirectService(i0.ɵɵinject(i1.WINDOW)); }, token: RedirectService, providedIn: "root" });
    RedirectService = __decorate([
        Injectable({ providedIn: 'root' }),
        __param(0, Inject(WINDOW))
    ], RedirectService);
    return RedirectService;
}());
export { RedirectService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXJlY3Quc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC8iLCJzb3VyY2VzIjpbImxpYi91dGlscy9yZWRpcmVjdC9yZWRpcmVjdC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7OztBQUdwRDtJQUNJLHlCQUFvQyxNQUFXO1FBQVgsV0FBTSxHQUFOLE1BQU0sQ0FBSztJQUFHLENBQUM7SUFFbkQsb0NBQVUsR0FBVixVQUFXLEdBQUc7UUFDVixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0lBQ3BDLENBQUM7O2dEQUpZLE1BQU0sU0FBQyxNQUFNOzs7SUFEakIsZUFBZTtRQUQzQixVQUFVLENBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFFbEIsV0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7T0FEbEIsZUFBZSxDQU0zQjswQkFWRDtDQVVDLEFBTkQsSUFNQztTQU5ZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgV0lORE9XIH0gZnJvbSAnLi4vd2luZG93L3dpbmRvdy5yZWZlcmVuY2UnO1xyXG5cclxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcclxuZXhwb3J0IGNsYXNzIFJlZGlyZWN0U2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihASW5qZWN0KFdJTkRPVykgcHJpdmF0ZSB3aW5kb3c6IGFueSkge31cclxuXHJcbiAgICByZWRpcmVjdFRvKHVybCkge1xyXG4gICAgICAgIHRoaXMud2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmw7XHJcbiAgICB9XHJcbn1cclxuIl19