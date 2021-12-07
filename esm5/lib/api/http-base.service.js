import { __decorate } from "tslib";
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
var HttpBaseService = /** @class */ (function () {
    function HttpBaseService(http) {
        this.http = http;
    }
    HttpBaseService.prototype.get = function (url, params) {
        return this.http.get(url, params);
    };
    HttpBaseService.prototype.post = function (url, body, params) {
        return this.http.post(url, body, params);
    };
    HttpBaseService.ctorParameters = function () { return [
        { type: HttpClient }
    ]; };
    HttpBaseService = __decorate([
        Injectable()
    ], HttpBaseService);
    return HttpBaseService;
}());
export { HttpBaseService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1iYXNlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvYXBpL2h0dHAtYmFzZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUkzQztJQUNJLHlCQUFvQixJQUFnQjtRQUFoQixTQUFJLEdBQUosSUFBSSxDQUFZO0lBQUcsQ0FBQztJQUV4Qyw2QkFBRyxHQUFILFVBQU8sR0FBVyxFQUFFLE1BQStCO1FBQy9DLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUksR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCw4QkFBSSxHQUFKLFVBQVEsR0FBVyxFQUFFLElBQVMsRUFBRSxNQUErQjtRQUMzRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDaEQsQ0FBQzs7Z0JBUnlCLFVBQVU7O0lBRDNCLGVBQWU7UUFEM0IsVUFBVSxFQUFFO09BQ0EsZUFBZSxDQVUzQjtJQUFELHNCQUFDO0NBQUEsQUFWRCxJQVVDO1NBVlksZUFBZSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XHJcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgSHR0cEJhc2VTZXJ2aWNlIHtcclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cDogSHR0cENsaWVudCkge31cclxuXHJcbiAgICBnZXQ8VD4odXJsOiBzdHJpbmcsIHBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pOiBPYnNlcnZhYmxlPFQ+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5odHRwLmdldDxUPih1cmwsIHBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcG9zdDxUPih1cmw6IHN0cmluZywgYm9keTogYW55LCBwYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogT2JzZXJ2YWJsZTxUPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaHR0cC5wb3N0PFQ+KHVybCwgYm9keSwgcGFyYW1zKTtcclxuICAgIH1cclxufVxyXG4iXX0=