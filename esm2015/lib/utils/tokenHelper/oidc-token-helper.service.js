import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { LoggerService } from '../../logging/logger.service';
let TokenHelperService = class TokenHelperService {
    constructor(loggerService) {
        this.loggerService = loggerService;
        this.PARTS_OF_TOKEN = 3;
    }
    getTokenExpirationDate(dataIdToken) {
        if (!dataIdToken.hasOwnProperty('exp')) {
            return new Date();
        }
        const date = new Date(0); // The 0 here is the key, which sets the date to the epoch
        date.setUTCSeconds(dataIdToken.exp);
        return date;
    }
    getHeaderFromToken(token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 0, encoded);
    }
    getPayloadFromToken(token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 1, encoded);
    }
    getSignatureFromToken(token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 2, encoded);
    }
    getPartOfToken(token, index, encoded) {
        const partOfToken = this.extractPartOfToken(token, index);
        if (encoded) {
            return partOfToken;
        }
        const result = this.urlBase64Decode(partOfToken);
        return JSON.parse(result);
    }
    urlBase64Decode(str) {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
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
        const decoded = typeof window !== 'undefined' ? window.atob(output) : Buffer.from(output, 'base64').toString('binary');
        try {
            // Going backwards: from bytestream, to percent-encoding, to original string.
            return decodeURIComponent(decoded
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''));
        }
        catch (err) {
            return decoded;
        }
    }
    tokenIsValid(token) {
        if (!token) {
            this.loggerService.logError(`token '${token}' is not valid --> token falsy`);
            return false;
        }
        if (!token.includes('.')) {
            this.loggerService.logError(`token '${token}' is not valid --> no dots included`);
            return false;
        }
        const parts = token.split('.');
        if (parts.length !== this.PARTS_OF_TOKEN) {
            this.loggerService.logError(`token '${token}' is not valid --> token has to have exactly ${this.PARTS_OF_TOKEN} dots`);
            return false;
        }
        return true;
    }
    extractPartOfToken(token, index) {
        return token.split('.')[index];
    }
};
TokenHelperService.ctorParameters = () => [
    { type: LoggerService }
];
TokenHelperService = __decorate([
    Injectable()
], TokenHelperService);
export { TokenHelperService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2lkYy10b2tlbi1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC8iLCJzb3VyY2VzIjpbImxpYi91dGlscy90b2tlbkhlbHBlci9vaWRjLXRva2VuLWhlbHBlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUc3RCxJQUFhLGtCQUFrQixHQUEvQixNQUFhLGtCQUFrQjtJQUUzQixZQUE2QixhQUE0QjtRQUE1QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQURqRCxtQkFBYyxHQUFHLENBQUMsQ0FBQztJQUNpQyxDQUFDO0lBRTdELHNCQUFzQixDQUFDLFdBQWdCO1FBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3BDLE9BQU8sSUFBSSxJQUFJLEVBQUUsQ0FBQztTQUNyQjtRQUVELE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsMERBQTBEO1FBQ3BGLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXBDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxLQUFVLEVBQUUsT0FBZ0I7UUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDM0IsT0FBTyxFQUFFLENBQUM7U0FDYjtRQUVELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxLQUFVLEVBQUUsT0FBZ0I7UUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMs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QUU7WUFDdEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsVUFBVSxLQUFLLGdEQUFnRCxJQUFJLENBQUMsY0FBYyxPQUFPLENBQUMsQ0FBQztZQUN2SCxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTyxrQkFBa0IsQ0FBQyxLQUFhLEVBQUUsS0FBYTtRQUNuRCxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQztDQUNKLENBQUE7O1lBdkcrQyxhQUFhOztBQUZoRCxrQkFBa0I7SUFEOUIsVUFBVSxFQUFFO0dBQ0Esa0JBQWtCLENBeUc5QjtTQXpHWSxrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUb2tlbkhlbHBlclNlcnZpY2Uge1xuICAgIHByaXZhdGUgUEFSVFNfT0ZfVE9LRU4gPSAzO1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSkge31cblxuICAgIGdldFRva2VuRXhwaXJhdGlvbkRhdGUoZGF0YUlkVG9rZW46IGFueSk6IERhdGUge1xuICAgICAgICBpZiAoIWRhdGFJZFRva2VuLmhhc093blByb3BlcnR5KCdleHAnKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoMCk7IC8vIFRoZSAwIGhlcmUgaXMgdGhlIGtleSwgd2hpY2ggc2V0cyB0aGUgZGF0ZSB0byB0aGUgZXBvY2hcbiAgICAgICAgZGF0ZS5zZXRVVENTZWNvbmRzKGRhdGFJZFRva2VuLmV4cCk7XG5cbiAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfVxuXG4gICAgZ2V0SGVhZGVyRnJvbVRva2VuKHRva2VuOiBhbnksIGVuY29kZWQ6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKCF0aGlzLnRva2VuSXNWYWxpZCh0b2tlbikpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmdldFBhcnRPZlRva2VuKHRva2VuLCAwLCBlbmNvZGVkKTtcbiAgICB9XG5cbiAgICBnZXRQYXlsb2FkRnJvbVRva2VuKHRva2VuOiBhbnksIGVuY29kZWQ6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKCF0aGlzLnRva2VuSXNWYWxpZCh0b2tlbikpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmdldFBhcnRPZlRva2VuKHRva2VuLCAxLCBlbmNvZGVkKTtcbiAgICB9XG5cbiAgICBnZXRTaWduYXR1cmVGcm9tVG9rZW4odG9rZW46IGFueSwgZW5jb2RlZDogYm9vbGVhbikge1xuICAgICAgICBpZiAoIXRoaXMudG9rZW5Jc1ZhbGlkKHRva2VuKSkge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGFydE9mVG9rZW4odG9rZW4sIDIsIGVuY29kZWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UGFydE9mVG9rZW4odG9rZW46IHN0cmluZywgaW5kZXg6IG51bWJlciwgZW5jb2RlZDogYm9vbGVhbikge1xuICAgICAgICBjb25zdCBwYXJ0T2ZUb2tlbiA9IHRoaXMuZXh0cmFjdFBhcnRPZlRva2VuKHRva2VuLCBpbmRleCk7XG5cbiAgICAgICAgaWYgKGVuY29kZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJ0T2ZUb2tlbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMudXJsQmFzZTY0RGVjb2RlKHBhcnRPZlRva2VuKTtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UocmVzdWx0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVybEJhc2U2NERlY29kZShzdHI6IHN0cmluZykge1xuICAgICAgICBsZXQgb3V0cHV0ID0gc3RyLnJlcGxhY2UoLy0vZywgJysnKS5yZXBsYWNlKC9fL2csICcvJyk7XG5cbiAgICAgICAgc3dpdGNoIChvdXRwdXQubGVuZ3RoICUgNCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIG91dHB1dCArPSAnPT0nO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIG91dHB1dCArPSAnPSc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKCdJbGxlZ2FsIGJhc2U2NHVybCBzdHJpbmchJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkZWNvZGVkID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuYXRvYihvdXRwdXQpIDogQnVmZmVyLmZyb20ob3V0cHV0LCAnYmFzZTY0JykudG9TdHJpbmcoJ2JpbmFyeScpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBHb2luZyBiYWNrd2FyZHM6IGZyb20gYnl0ZXN0cmVhbSwgdG8gcGVyY2VudC1lbmNvZGluZywgdG8gb3JpZ2luYWwgc3RyaW5nLlxuICAgICAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChcbiAgICAgICAgICAgICAgICBkZWNvZGVkXG4gICAgICAgICAgICAgICAgICAgIC5zcGxpdCgnJylcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoYzogc3RyaW5nKSA9PiAnJScgKyAoJzAwJyArIGMuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikpLnNsaWNlKC0yKSlcbiAgICAgICAgICAgICAgICAgICAgLmpvaW4oJycpXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWNvZGVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0b2tlbklzVmFsaWQodG9rZW46IHN0cmluZykge1xuICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYHRva2VuICcke3Rva2VufScgaXMgbm90IHZhbGlkIC0tPiB0b2tlbiBmYWxzeWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEodG9rZW4gYXMgc3RyaW5nKS5pbmNsdWRlcygnLicpKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYHRva2VuICcke3Rva2VufScgaXMgbm90IHZhbGlkIC0tPiBubyBkb3RzIGluY2x1ZGVkYCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJ0cyA9IHRva2VuLnNwbGl0KCcuJyk7XG5cbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCAhPT0gdGhpcy5QQVJUU19PRl9UT0tFTikge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGB0b2tlbiAnJHt0b2tlbn0nIGlzIG5vdCB2YWxpZCAtLT4gdG9rZW4gaGFzIHRvIGhhdmUgZXhhY3RseSAke3RoaXMuUEFSVFNfT0ZfVE9LRU59IGRvdHNgKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXh0cmFjdFBhcnRPZlRva2VuKHRva2VuOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRva2VuLnNwbGl0KCcuJylbaW5kZXhdO1xuICAgIH1cbn1cbiJdfQ==