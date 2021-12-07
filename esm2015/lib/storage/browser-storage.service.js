import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from '../logging/logger.service';
let BrowserStorageService = class BrowserStorageService {
    constructor(configProvider, loggerService) {
        this.configProvider = configProvider;
        this.loggerService = loggerService;
    }
    read(key) {
        var _a;
        if (!this.hasStorage()) {
            this.loggerService.logDebug(`Wanted to read '${key}' but Storage was undefined`);
            return false;
        }
        const item = (_a = this.getStorage()) === null || _a === void 0 ? void 0 : _a.getItem(key);
        if (!item) {
            this.loggerService.logDebug(`Wanted to read '${key}' but nothing was found`);
            return false;
        }
        return JSON.parse(item);
    }
    write(key, value) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug(`Wanted to write '${key}/${value}' but Storage was falsy`);
            return false;
        }
        const storage = this.getStorage();
        if (!storage) {
            this.loggerService.logDebug(`Wanted to write '${key}/${value}' but Storage was falsy`);
            return false;
        }
        value = value || null;
        storage.setItem(`${key}`, JSON.stringify(value));
        return true;
    }
    getStorage() {
        var _a;
        return (_a = this.configProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.storage;
    }
    hasStorage() {
        return typeof Storage !== 'undefined';
    }
};
BrowserStorageService.ctorParameters = () => [
    { type: ConfigurationProvider },
    { type: LoggerService }
];
BrowserStorageService = __decorate([
    Injectable()
], BrowserStorageService);
export { BrowserStorageService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1zdG9yYWdlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvc3RvcmFnZS9icm93c2VyLXN0b3JhZ2Uuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFJMUQsSUFBYSxxQkFBcUIsR0FBbEMsTUFBYSxxQkFBcUI7SUFDOUIsWUFBb0IsY0FBcUMsRUFBVSxhQUE0QjtRQUEzRSxtQkFBYyxHQUFkLGNBQWMsQ0FBdUI7UUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUFHLENBQUM7SUFFbkcsSUFBSSxDQUFDLEdBQVc7O1FBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsR0FBRyw2QkFBNkIsQ0FBQyxDQUFDO1lBQ2pGLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsTUFBTSxJQUFJLFNBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSwwQ0FBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFN0MsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLG1CQUFtQixHQUFHLHlCQUF5QixDQUFDLENBQUM7WUFDN0UsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELEtBQUssQ0FBQyxHQUFXLEVBQUUsS0FBVTtRQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLG9CQUFvQixHQUFHLElBQUksS0FBSyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3ZGLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDVixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLEtBQUsseUJBQXlCLENBQUMsQ0FBQztZQUN2RixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELEtBQUssR0FBRyxLQUFLLElBQUksSUFBSSxDQUFDO1FBRXRCLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDakQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVPLFVBQVU7O1FBQ2QsYUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLG1CQUFtQiwwQ0FBRSxPQUFPLENBQUM7SUFDNUQsQ0FBQztJQUVPLFVBQVU7UUFDZCxPQUFPLE9BQU8sT0FBTyxLQUFLLFdBQVcsQ0FBQztJQUMxQyxDQUFDO0NBQ0osQ0FBQTs7WUEzQ3VDLHFCQUFxQjtZQUF5QixhQUFhOztBQUR0RixxQkFBcUI7SUFEakMsVUFBVSxFQUFFO0dBQ0EscUJBQXFCLENBNENqQztTQTVDWSxxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IEFic3RyYWN0U2VjdXJpdHlTdG9yYWdlIH0gZnJvbSAnLi9hYnN0cmFjdC1zZWN1cml0eS1zdG9yYWdlJztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIEJyb3dzZXJTdG9yYWdlU2VydmljZSBpbXBsZW1lbnRzIEFic3RyYWN0U2VjdXJpdHlTdG9yYWdlIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY29uZmlnUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlciwgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlKSB7fVxyXG5cclxuICAgIHJlYWQoa2V5OiBzdHJpbmcpOiBhbnkge1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNTdG9yYWdlKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBXYW50ZWQgdG8gcmVhZCAnJHtrZXl9JyBidXQgU3RvcmFnZSB3YXMgdW5kZWZpbmVkYCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLmdldFN0b3JhZ2UoKT8uZ2V0SXRlbShrZXkpO1xyXG5cclxuICAgICAgICBpZiAoIWl0ZW0pIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBXYW50ZWQgdG8gcmVhZCAnJHtrZXl9JyBidXQgbm90aGluZyB3YXMgZm91bmRgKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoaXRlbSk7XHJcbiAgICB9XHJcblxyXG4gICAgd3JpdGUoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzU3RvcmFnZSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgV2FudGVkIHRvIHdyaXRlICcke2tleX0vJHt2YWx1ZX0nIGJ1dCBTdG9yYWdlIHdhcyBmYWxzeWApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzdG9yYWdlID0gdGhpcy5nZXRTdG9yYWdlKCk7XHJcbiAgICAgICAgaWYgKCFzdG9yYWdlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgV2FudGVkIHRvIHdyaXRlICcke2tleX0vJHt2YWx1ZX0nIGJ1dCBTdG9yYWdlIHdhcyBmYWxzeWApO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlIHx8IG51bGw7XHJcblxyXG4gICAgICAgIHN0b3JhZ2Uuc2V0SXRlbShgJHtrZXl9YCwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFN0b3JhZ2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8uc3RvcmFnZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhc1N0b3JhZ2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBTdG9yYWdlICE9PSAndW5kZWZpbmVkJztcclxuICAgIH1cclxufVxyXG4iXX0=