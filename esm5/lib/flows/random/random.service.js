import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { LoggerService } from '../../logging/logger.service';
var RandomService = /** @class */ (function () {
    function RandomService(loggerService) {
        this.loggerService = loggerService;
    }
    RandomService.prototype.createRandom = function (requiredLength) {
        if (requiredLength <= 0) {
            return '';
        }
        if (requiredLength > 0 && requiredLength < 7) {
            this.loggerService.logWarning("RandomService called with " + requiredLength + " but 7 chars is the minimum, returning 10 chars");
            requiredLength = 10;
        }
        var length = requiredLength - 6;
        var arr = new Uint8Array((length || length) / 2);
        this.getCrypto().getRandomValues(arr);
        return Array.from(arr, this.toHex).join('') + this.randomString(7);
    };
    RandomService.prototype.toHex = function (dec) {
        return ('0' + dec.toString(16)).substr(-2);
    };
    RandomService.prototype.randomString = function (length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var values = new Uint32Array(length);
        this.getCrypto().getRandomValues(values);
        for (var i = 0; i < length; i++) {
            result += characters[values[i] % characters.length];
        }
        return result;
    };
    RandomService.prototype.getCrypto = function () {
        // support for IE,  (window.crypto || window.msCrypto)
        return window.crypto || window.msCrypto;
    };
    RandomService.ctorParameters = function () { return [
        { type: LoggerService }
    ]; };
    RandomService = __decorate([
        Injectable()
    ], RandomService);
    return RandomService;
}());
export { RandomService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZG9tLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvZmxvd3MvcmFuZG9tL3JhbmRvbS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUc3RDtJQUNJLHVCQUFvQixhQUE0QjtRQUE1QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUFHLENBQUM7SUFFcEQsb0NBQVksR0FBWixVQUFhLGNBQXNCO1FBQy9CLElBQUksY0FBYyxJQUFJLENBQUMsRUFBRTtZQUNyQixPQUFPLEVBQUUsQ0FBQztTQUNiO1FBRUQsSUFBSSxjQUFjLEdBQUcsQ0FBQyxJQUFJLGNBQWMsR0FBRyxDQUFDLEVBQUU7WUFDMUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsK0JBQTZCLGNBQWMsb0RBQWlELENBQUMsQ0FBQztZQUM1SCxjQUFjLEdBQUcsRUFBRSxDQUFDO1NBQ3ZCO1FBRUQsSUFBTSxNQUFNLEdBQUcsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUNsQyxJQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFTyw2QkFBSyxHQUFiLFVBQWMsR0FBRztRQUNiLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFTyxvQ0FBWSxHQUFwQixVQUFxQixNQUFNO1FBQ3ZCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFNLFVBQVUsR0FBRyxnRUFBZ0UsQ0FBQztRQUVwRixJQUFNLE1BQU0sR0FBRyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0IsTUFBTSxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3ZEO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUNPLGlDQUFTLEdBQWpCO1FBQ0ksc0RBQXNEO1FBQ3RELE9BQU8sTUFBTSxDQUFDLE1BQU0sSUFBSyxNQUFjLENBQUMsUUFBUSxDQUFDO0lBQ3JELENBQUM7O2dCQXJDa0MsYUFBYTs7SUFEdkMsYUFBYTtRQUR6QixVQUFVLEVBQUU7T0FDQSxhQUFhLENBdUN6QjtJQUFELG9CQUFDO0NBQUEsQUF2Q0QsSUF1Q0M7U0F2Q1ksYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi8uLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJhbmRvbVNlcnZpY2Uge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSkge31cblxuICAgIGNyZWF0ZVJhbmRvbShyZXF1aXJlZExlbmd0aDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHJlcXVpcmVkTGVuZ3RoIDw9IDApIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXF1aXJlZExlbmd0aCA+IDAgJiYgcmVxdWlyZWRMZW5ndGggPCA3KSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhgUmFuZG9tU2VydmljZSBjYWxsZWQgd2l0aCAke3JlcXVpcmVkTGVuZ3RofSBidXQgNyBjaGFycyBpcyB0aGUgbWluaW11bSwgcmV0dXJuaW5nIDEwIGNoYXJzYCk7XG4gICAgICAgICAgICByZXF1aXJlZExlbmd0aCA9IDEwO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGVuZ3RoID0gcmVxdWlyZWRMZW5ndGggLSA2O1xuICAgICAgICBjb25zdCBhcnIgPSBuZXcgVWludDhBcnJheSgobGVuZ3RoIHx8IGxlbmd0aCkgLyAyKTtcbiAgICAgICAgdGhpcy5nZXRDcnlwdG8oKS5nZXRSYW5kb21WYWx1ZXMoYXJyKTtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oYXJyLCB0aGlzLnRvSGV4KS5qb2luKCcnKSArIHRoaXMucmFuZG9tU3RyaW5nKDcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdG9IZXgoZGVjKSB7XG4gICAgICAgIHJldHVybiAoJzAnICsgZGVjLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC0yKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJhbmRvbVN0cmluZyhsZW5ndGgpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9ICcnO1xuICAgICAgICBjb25zdCBjaGFyYWN0ZXJzID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5JztcblxuICAgICAgICBjb25zdCB2YWx1ZXMgPSBuZXcgVWludDMyQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgdGhpcy5nZXRDcnlwdG8oKS5nZXRSYW5kb21WYWx1ZXModmFsdWVzKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmVzdWx0ICs9IGNoYXJhY3RlcnNbdmFsdWVzW2ldICUgY2hhcmFjdGVycy5sZW5ndGhdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgcHJpdmF0ZSBnZXRDcnlwdG8oKSB7XG4gICAgICAgIC8vIHN1cHBvcnQgZm9yIElFLCAgKHdpbmRvdy5jcnlwdG8gfHwgd2luZG93Lm1zQ3J5cHRvKVxuICAgICAgICByZXR1cm4gd2luZG93LmNyeXB0byB8fCAod2luZG93IGFzIGFueSkubXNDcnlwdG87XG4gICAgfVxufVxuIl19