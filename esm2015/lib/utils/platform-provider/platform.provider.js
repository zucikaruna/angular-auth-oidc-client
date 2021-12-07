import { __decorate, __param } from "tslib";
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
let PlatformProvider = class PlatformProvider {
    constructor(platformId) {
        this.platformId = platformId;
    }
    get isBrowser() {
        return isPlatformBrowser(this.platformId);
    }
};
PlatformProvider.ctorParameters = () => [
    { type: String, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] }
];
PlatformProvider = __decorate([
    Injectable(),
    __param(0, Inject(PLATFORM_ID))
], PlatformProvider);
export { PlatformProvider };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm0ucHJvdmlkZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvdXRpbHMvcGxhdGZvcm0tcHJvdmlkZXIvcGxhdGZvcm0ucHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUdoRSxJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFnQjtJQUl6QixZQUF5QyxVQUFrQjtRQUFsQixlQUFVLEdBQVYsVUFBVSxDQUFRO0lBQUcsQ0FBQztJQUgvRCxJQUFJLFNBQVM7UUFDVCxPQUFPLGlCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM5QyxDQUFDO0NBRUosQ0FBQTs7eUNBRGdCLE1BQU0sU0FBQyxXQUFXOztBQUp0QixnQkFBZ0I7SUFENUIsVUFBVSxFQUFFO0lBS0ksV0FBQSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7R0FKdkIsZ0JBQWdCLENBSzVCO1NBTFksZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNQbGF0Zm9ybUJyb3dzZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgSW5qZWN0LCBJbmplY3RhYmxlLCBQTEFURk9STV9JRCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGxhdGZvcm1Qcm92aWRlciB7XG4gICAgZ2V0IGlzQnJvd3NlcigpIHtcbiAgICAgICAgcmV0dXJuIGlzUGxhdGZvcm1Ccm93c2VyKHRoaXMucGxhdGZvcm1JZCk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKEBJbmplY3QoUExBVEZPUk1fSUQpIHByaXZhdGUgcGxhdGZvcm1JZDogc3RyaW5nKSB7fVxufVxuIl19