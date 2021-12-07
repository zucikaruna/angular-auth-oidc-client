import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
var BrowserStorageService = /** @class */ (function () {
    function BrowserStorageService(configProvider, loggerService) {
        this.configProvider = configProvider;
        this.loggerService = loggerService;
    }
    BrowserStorageService.prototype.read = function (key) {
        var _a;
        if (!this.hasStorage()) {
            this.loggerService.logDebug("Wanted to read '" + key + "' but Storage was undefined");
            return false;
        }
        var item = (_a = this.getStorage()) === null || _a === void 0 ? void 0 : _a.getItem(key);
        if (!item) {
            this.loggerService.logDebug("Wanted to read '" + key + "' but nothing was found");
            return false;
        }
        return JSON.parse(item);
    };
    BrowserStorageService.prototype.write = function (key, value) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug("Wanted to write '" + key + "/" + value + "' but Storage was falsy");
            return false;
        }
        var storage = this.getStorage();
        if (!storage) {
            this.loggerService.logDebug("Wanted to write '" + key + "/" + value + "' but Storage was falsy");
            return false;
        }
        value = value || null;
        storage.setItem("" + key, JSON.stringify(value));
        return true;
    };
    BrowserStorageService.prototype.getStorage = function () {
        var _a;
        return (_a = this.configProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.storage;
    };
    BrowserStorageService.prototype.hasStorage = function () {
        return typeof Storage !== 'undefined';
    };
    BrowserStorageService.ctorParameters = function () { return [
        { type: ConfigurationProvider },
        { type: LoggerService }
    ]; };
    BrowserStorageService = __decorate([
        Injectable()
    ], BrowserStorageService);
    return BrowserStorageService;
}());
export { BrowserStorageService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1zdG9yYWdlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvc3RvcmFnZS9icm93c2VyLXN0b3JhZ2Uuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFJMUQ7SUFDSSwrQkFBb0IsY0FBcUMsRUFBVSxhQUE0QjtRQUEzRSxtQkFBYyxHQUFkLGNBQWMsQ0FBdUI7UUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUFHLENBQUM7SUFFbkcsb0NBQUksR0FBSixVQUFLLEdBQVc7O1FBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxxQkFBbUIsR0FBRyxnQ0FBNkIsQ0FBQyxDQUFDO1lBQ2pGLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsSUFBTSxJQUFJLFNBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSwwQ0FBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFN0MsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLHFCQUFtQixHQUFHLDRCQUF5QixDQUFDLENBQUM7WUFDN0UsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELHFDQUFLLEdBQUwsVUFBTSxHQUFXLEVBQUUsS0FBVTtRQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLHNCQUFvQixHQUFHLFNBQUksS0FBSyw0QkFBeUIsQ0FBQyxDQUFDO1lBQ3ZGLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDVixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxzQkFBb0IsR0FBRyxTQUFJLEtBQUssNEJBQXlCLENBQUMsQ0FBQztZQUN2RixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELEtBQUssR0FBRyxLQUFLLElBQUksSUFBSSxDQUFDO1FBRXRCLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBRyxHQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTywwQ0FBVSxHQUFsQjs7UUFDSSxhQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLDBDQUFFLE9BQU8sQ0FBQztJQUM1RCxDQUFDO0lBRU8sMENBQVUsR0FBbEI7UUFDSSxPQUFPLE9BQU8sT0FBTyxLQUFLLFdBQVcsQ0FBQztJQUMxQyxDQUFDOztnQkExQ21DLHFCQUFxQjtnQkFBeUIsYUFBYTs7SUFEdEYscUJBQXFCO1FBRGpDLFVBQVUsRUFBRTtPQUNBLHFCQUFxQixDQTRDakM7SUFBRCw0QkFBQztDQUFBLEFBNUNELElBNENDO1NBNUNZLHFCQUFxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQWJzdHJhY3RTZWN1cml0eVN0b3JhZ2UgfSBmcm9tICcuL2Fic3RyYWN0LXNlY3VyaXR5LXN0b3JhZ2UnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgQnJvd3NlclN0b3JhZ2VTZXJ2aWNlIGltcGxlbWVudHMgQWJzdHJhY3RTZWN1cml0eVN0b3JhZ2Uge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBjb25maWdQcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLCBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UpIHt9XHJcblxyXG4gICAgcmVhZChrZXk6IHN0cmluZyk6IGFueSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc1N0b3JhZ2UoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYFdhbnRlZCB0byByZWFkICcke2tleX0nIGJ1dCBTdG9yYWdlIHdhcyB1bmRlZmluZWRgKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuZ2V0U3RvcmFnZSgpPy5nZXRJdGVtKGtleSk7XHJcblxyXG4gICAgICAgIGlmICghaXRlbSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYFdhbnRlZCB0byByZWFkICcke2tleX0nIGJ1dCBub3RoaW5nIHdhcyBmb3VuZGApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShpdGVtKTtcclxuICAgIH1cclxuXHJcbiAgICB3cml0ZShrZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNTdG9yYWdlKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBXYW50ZWQgdG8gd3JpdGUgJyR7a2V5fS8ke3ZhbHVlfScgYnV0IFN0b3JhZ2Ugd2FzIGZhbHN5YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHN0b3JhZ2UgPSB0aGlzLmdldFN0b3JhZ2UoKTtcclxuICAgICAgICBpZiAoIXN0b3JhZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBXYW50ZWQgdG8gd3JpdGUgJyR7a2V5fS8ke3ZhbHVlfScgYnV0IFN0b3JhZ2Ugd2FzIGZhbHN5YCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUgfHwgbnVsbDtcclxuXHJcbiAgICAgICAgc3RvcmFnZS5zZXRJdGVtKGAke2tleX1gLCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0U3RvcmFnZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb25maWdQcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uPy5zdG9yYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaGFzU3RvcmFnZSgpIHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIFN0b3JhZ2UgIT09ICd1bmRlZmluZWQnO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==