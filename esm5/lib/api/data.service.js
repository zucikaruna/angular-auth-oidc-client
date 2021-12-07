import { __decorate } from "tslib";
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpBaseService } from './http-base.service';
var DataService = /** @class */ (function () {
    function DataService(httpClient) {
        this.httpClient = httpClient;
    }
    DataService.prototype.get = function (url, token) {
        var headers = this.prepareHeaders(token);
        return this.httpClient.get(url, {
            headers: headers,
        });
    };
    DataService.prototype.post = function (url, body, headersParams) {
        var headers = headersParams || this.prepareHeaders();
        return this.httpClient.post(url, body, { headers: headers });
    };
    DataService.prototype.prepareHeaders = function (token) {
        var headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/json');
        if (!!token) {
            headers = headers.set('Authorization', 'Bearer ' + decodeURIComponent(token));
        }
        return headers;
    };
    DataService.ctorParameters = function () { return [
        { type: HttpBaseService }
    ]; };
    DataService = __decorate([
        Injectable()
    ], DataService);
    return DataService;
}());
export { DataService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50LyIsInNvdXJjZXMiOlsibGliL2FwaS9kYXRhLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUd0RDtJQUNJLHFCQUFvQixVQUEyQjtRQUEzQixlQUFVLEdBQVYsVUFBVSxDQUFpQjtJQUFHLENBQUM7SUFFbkQseUJBQUcsR0FBSCxVQUFPLEdBQVcsRUFBRSxLQUFjO1FBQzlCLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0MsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBSSxHQUFHLEVBQUU7WUFDL0IsT0FBTyxTQUFBO1NBQ1YsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELDBCQUFJLEdBQUosVUFBUSxHQUFXLEVBQUUsSUFBUyxFQUFFLGFBQTJCO1FBQ3ZELElBQU0sT0FBTyxHQUFHLGFBQWEsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFdkQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsT0FBTyxTQUFBLEVBQUUsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFTyxvQ0FBYyxHQUF0QixVQUF1QixLQUFjO1FBQ2pDLElBQUksT0FBTyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFDaEMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFFcEQsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ1QsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQzs7Z0JBekIrQixlQUFlOztJQUR0QyxXQUFXO1FBRHZCLFVBQVUsRUFBRTtPQUNBLFdBQVcsQ0EyQnZCO0lBQUQsa0JBQUM7Q0FBQSxBQTNCRCxJQTJCQztTQTNCWSxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cEhlYWRlcnMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XG5pbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBIdHRwQmFzZVNlcnZpY2UgfSBmcm9tICcuL2h0dHAtYmFzZS5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERhdGFTZXJ2aWNlIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGh0dHBDbGllbnQ6IEh0dHBCYXNlU2VydmljZSkge31cblxuICAgIGdldDxUPih1cmw6IHN0cmluZywgdG9rZW4/OiBzdHJpbmcpOiBPYnNlcnZhYmxlPFQ+IHtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IHRoaXMucHJlcGFyZUhlYWRlcnModG9rZW4pO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmh0dHBDbGllbnQuZ2V0PFQ+KHVybCwge1xuICAgICAgICAgICAgaGVhZGVycyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcG9zdDxUPih1cmw6IHN0cmluZywgYm9keTogYW55LCBoZWFkZXJzUGFyYW1zPzogSHR0cEhlYWRlcnMpIHtcbiAgICAgICAgY29uc3QgaGVhZGVycyA9IGhlYWRlcnNQYXJhbXMgfHwgdGhpcy5wcmVwYXJlSGVhZGVycygpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmh0dHBDbGllbnQucG9zdDxUPih1cmwsIGJvZHksIHsgaGVhZGVycyB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHByZXBhcmVIZWFkZXJzKHRva2VuPzogc3RyaW5nKSB7XG4gICAgICAgIGxldCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKCk7XG4gICAgICAgIGhlYWRlcnMgPSBoZWFkZXJzLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblxuICAgICAgICBpZiAoISF0b2tlbikge1xuICAgICAgICAgICAgaGVhZGVycyA9IGhlYWRlcnMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgZGVjb2RlVVJJQ29tcG9uZW50KHRva2VuKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaGVhZGVycztcbiAgICB9XG59XG4iXX0=