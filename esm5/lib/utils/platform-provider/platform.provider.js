import { __decorate, __param } from "tslib";
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
var PlatformProvider = /** @class */ (function () {
    function PlatformProvider(platformId) {
        this.platformId = platformId;
    }
    Object.defineProperty(PlatformProvider.prototype, "isBrowser", {
        get: function () {
            return isPlatformBrowser(this.platformId);
        },
        enumerable: true,
        configurable: true
    });
    PlatformProvider.ctorParameters = function () { return [
        { type: String, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] }
    ]; };
    PlatformProvider = __decorate([
        Injectable(),
        __param(0, Inject(PLATFORM_ID))
    ], PlatformProvider);
    return PlatformProvider;
}());
export { PlatformProvider };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm0ucHJvdmlkZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvdXRpbHMvcGxhdGZvcm0tcHJvdmlkZXIvcGxhdGZvcm0ucHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUdoRTtJQUlJLDBCQUF5QyxVQUFrQjtRQUFsQixlQUFVLEdBQVYsVUFBVSxDQUFRO0lBQUcsQ0FBQztJQUgvRCxzQkFBSSx1Q0FBUzthQUFiO1lBQ0ksT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDOUMsQ0FBQzs7O09BQUE7OzZDQUNZLE1BQU0sU0FBQyxXQUFXOztJQUp0QixnQkFBZ0I7UUFENUIsVUFBVSxFQUFFO1FBS0ksV0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7T0FKdkIsZ0JBQWdCLENBSzVCO0lBQUQsdUJBQUM7Q0FBQSxBQUxELElBS0M7U0FMWSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBpc1BsYXRmb3JtQnJvd3NlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUsIFBMQVRGT1JNX0lEIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQbGF0Zm9ybVByb3ZpZGVyIHtcbiAgICBnZXQgaXNCcm93c2VyKCkge1xuICAgICAgICByZXR1cm4gaXNQbGF0Zm9ybUJyb3dzZXIodGhpcy5wbGF0Zm9ybUlkKTtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoQEluamVjdChQTEFURk9STV9JRCkgcHJpdmF0ZSBwbGF0Zm9ybUlkOiBzdHJpbmcpIHt9XG59XG4iXX0=