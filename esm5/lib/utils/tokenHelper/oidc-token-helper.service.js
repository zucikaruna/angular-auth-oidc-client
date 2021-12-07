import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { LoggerService } from '../../logging/logger.service';
var TokenHelperService = /** @class */ (function () {
    function TokenHelperService(loggerService) {
        this.loggerService = loggerService;
        this.PARTS_OF_TOKEN = 3;
    }
    TokenHelperService.prototype.getTokenExpirationDate = function (dataIdToken) {
        if (!dataIdToken.hasOwnProperty('exp')) {
            return new Date();
        }
        var date = new Date(0); // The 0 here is the key, which sets the date to the epoch
        date.setUTCSeconds(dataIdToken.exp);
        return date;
    };
    TokenHelperService.prototype.getHeaderFromToken = function (token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 0, encoded);
    };
    TokenHelperService.prototype.getPayloadFromToken = function (token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 1, encoded);
    };
    TokenHelperService.prototype.getSignatureFromToken = function (token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 2, encoded);
    };
    TokenHelperService.prototype.getPartOfToken = function (token, index, encoded) {
        var partOfToken = this.extractPartOfToken(token, index);
        if (encoded) {
            return partOfToken;
        }
        var result = this.urlBase64Decode(partOfToken);
        return JSON.parse(result);
    };
    TokenHelperService.prototype.urlBase64Decode = function (str) {
        var output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw Error('Illegal base64url string!');
        }
        var decoded = typeof window !== 'undefined' ? window.atob(output) : Buffer.from(output, 'base64').toString('binary');
        try {
            // Going backwards: from bytestream, to percent-encoding, to original string.
            return decodeURIComponent(decoded
                .split('')
                .map(function (c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); })
                .join(''));
        }
        catch (err) {
            return decoded;
        }
    };
    TokenHelperService.prototype.tokenIsValid = function (token) {
        if (!token) {
            this.loggerService.logError("token '" + token + "' is not valid --> token falsy");
            return false;
        }
        if (!token.includes('.')) {
            this.loggerService.logError("token '" + token + "' is not valid --> no dots included");
            return false;
        }
        var parts = token.split('.');
        if (parts.length !== this.PARTS_OF_TOKEN) {
            this.loggerService.logError("token '" + token + "' is not valid --> token has to have exactly " + this.PARTS_OF_TOKEN + " dots");
            return false;
        }
        return true;
    };
    TokenHelperService.prototype.extractPartOfToken = function (token, index) {
        return token.split('.')[index];
    };
    TokenHelperService.ctorParameters = function () { return [
        { type: LoggerService }
    ]; };
    TokenHelperService = __decorate([
        Injectable()
    ], TokenHelperService);
    return TokenHelperService;
}());
export { TokenHelperService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2lkYy10b2tlbi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC8iLCJzb3VyY2VzIjpbImxpYi91dGlscy90b2tlbkhlbHBlci9vaWRjLXRva2VuLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUc3RDtJQUVJLDRCQUE2QixhQUE0QjtRQUE1QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQURqRCxtQkFBYyxHQUFHLENBQUMsQ0FBQztJQUNpQyxDQUFDO0lBRTdELG1EQUFzQixHQUF0QixVQUF1QixXQUFnQjtRQUNuQyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNwQyxPQUFPLElBQUksSUFBSSxFQUFFLENBQUM7U0FDckI7UUFFRCxJQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLDBEQUEwRDtRQUNwRixJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVwQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsK0NBQWtCLEdBQWxCLFVBQW1CLEtBQVUsRUFBRSxPQUFnQjtRQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMzQixPQUFPLEVBQUUsQ0FBQztTQUNiO1FBRUQsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELGdEQUFtQixHQUFuQixVQUFvQixLQUFVLEVBQUUsT0FBZ0I7UUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFD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QyxNQUFNLEtBQUssSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUN0QyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxZQUFVLEtBQUsscURBQWdELElBQUksQ0FBQyxjQUFjLFVBQU8sQ0FBQyxDQUFDO1lBQ3ZILE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVPLCtDQUFrQixHQUExQixVQUEyQixLQUFhLEVBQUUsS0FBYTtRQUNuRCxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQzs7Z0JBdEcyQyxhQUFhOztJQUZoRCxrQkFBa0I7UUFEOUIsVUFBVSxFQUFFO09BQ0Esa0JBQWtCLENBeUc5QjtJQUFELHlCQUFDO0NBQUEsQUF6R0QsSUF5R0M7U0F6R1ksa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uLy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVG9rZW5IZWxwZXJTZXJ2aWNlIHtcbiAgICBwcml2YXRlIFBBUlRTX09GX1RPS0VOID0gMztcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UpIHt9XG5cbiAgICBnZXRUb2tlbkV4cGlyYXRpb25EYXRlKGRhdGFJZFRva2VuOiBhbnkpOiBEYXRlIHtcbiAgICAgICAgaWYgKCFkYXRhSWRUb2tlbi5oYXNPd25Qcm9wZXJ0eSgnZXhwJykpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKDApOyAvLyBUaGUgMCBoZXJlIGlzIHRoZSBrZXksIHdoaWNoIHNldHMgdGhlIGRhdGUgdG8gdGhlIGVwb2NoXG4gICAgICAgIGRhdGUuc2V0VVRDU2Vjb25kcyhkYXRhSWRUb2tlbi5leHApO1xuXG4gICAgICAgIHJldHVybiBkYXRlO1xuICAgIH1cblxuICAgIGdldEhlYWRlckZyb21Ub2tlbih0b2tlbjogYW55LCBlbmNvZGVkOiBib29sZWFuKSB7XG4gICAgICAgIGlmICghdGhpcy50b2tlbklzVmFsaWQodG9rZW4pKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRQYXJ0T2ZUb2tlbih0b2tlbiwgMCwgZW5jb2RlZCk7XG4gICAgfVxuXG4gICAgZ2V0UGF5bG9hZEZyb21Ub2tlbih0b2tlbjogYW55LCBlbmNvZGVkOiBib29sZWFuKSB7XG4gICAgICAgIGlmICghdGhpcy50b2tlbklzVmFsaWQodG9rZW4pKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRQYXJ0T2ZUb2tlbih0b2tlbiwgMSwgZW5jb2RlZCk7XG4gICAgfVxuXG4gICAgZ2V0U2lnbmF0dXJlRnJvbVRva2VuKHRva2VuOiBhbnksIGVuY29kZWQ6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKCF0aGlzLnRva2VuSXNWYWxpZCh0b2tlbikpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmdldFBhcnRPZlRva2VuKHRva2VuLCAyLCBlbmNvZGVkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFBhcnRPZlRva2VuKHRva2VuOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIGVuY29kZWQ6IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgcGFydE9mVG9rZW4gPSB0aGlzLmV4dHJhY3RQYXJ0T2ZUb2tlbih0b2tlbiwgaW5kZXgpO1xuXG4gICAgICAgIGlmIChlbmNvZGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFydE9mVG9rZW47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLnVybEJhc2U2NERlY29kZShwYXJ0T2ZUb2tlbik7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKHJlc3VsdCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cmxCYXNlNjREZWNvZGUoc3RyOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IG91dHB1dCA9IHN0ci5yZXBsYWNlKC8tL2csICcrJykucmVwbGFjZSgvXy9nLCAnLycpO1xuXG4gICAgICAgIHN3aXRjaCAob3V0cHV0Lmxlbmd0aCAlIDQpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gJz09JztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gJz0nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcignSWxsZWdhbCBiYXNlNjR1cmwgc3RyaW5nIScpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVjb2RlZCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93LmF0b2Iob3V0cHV0KSA6IEJ1ZmZlci5mcm9tKG91dHB1dCwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCdiaW5hcnknKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gR29pbmcgYmFja3dhcmRzOiBmcm9tIGJ5dGVzdHJlYW0sIHRvIHBlcmNlbnQtZW5jb2RpbmcsIHRvIG9yaWdpbmFsIHN0cmluZy5cbiAgICAgICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgICAgICAgZGVjb2RlZFxuICAgICAgICAgICAgICAgICAgICAuc3BsaXQoJycpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGM6IHN0cmluZykgPT4gJyUnICsgKCcwMCcgKyBjLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtMikpXG4gICAgICAgICAgICAgICAgICAgIC5qb2luKCcnKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVjb2RlZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdG9rZW5Jc1ZhbGlkKHRva2VuOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCF0b2tlbikge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGB0b2tlbiAnJHt0b2tlbn0nIGlzIG5vdCB2YWxpZCAtLT4gdG9rZW4gZmFsc3lgKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKHRva2VuIGFzIHN0cmluZykuaW5jbHVkZXMoJy4nKSkge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGB0b2tlbiAnJHt0b2tlbn0nIGlzIG5vdCB2YWxpZCAtLT4gbm8gZG90cyBpbmNsdWRlZGApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFydHMgPSB0b2tlbi5zcGxpdCgnLicpO1xuXG4gICAgICAgIGlmIChwYXJ0cy5sZW5ndGggIT09IHRoaXMuUEFSVFNfT0ZfVE9LRU4pIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgdG9rZW4gJyR7dG9rZW59JyBpcyBub3QgdmFsaWQgLS0+IHRva2VuIGhhcyB0byBoYXZlIGV4YWN0bHkgJHt0aGlzLlBBUlRTX09GX1RPS0VOfSBkb3RzYCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGV4dHJhY3RQYXJ0T2ZUb2tlbih0b2tlbjogc3RyaW5nLCBpbmRleDogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0b2tlbi5zcGxpdCgnLicpW2luZGV4XTtcbiAgICB9XG59XG4iXX0=