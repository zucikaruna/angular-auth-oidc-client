import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
let EqualityService = class EqualityService {
    areEqual(value1, value2) {
        if (!value1 || !value2) {
            return false;
        }
        if (this.bothValuesAreArrays(value1, value2)) {
            return this.arraysEqual(value1, value2);
        }
        if (this.bothValuesAreStrings(value1, value2)) {
            return value1 === value2;
        }
        if (this.bothValuesAreObjects(value1, value2)) {
            return JSON.stringify(value1).toLowerCase() === JSON.stringify(value2).toLowerCase();
        }
        if (this.oneValueIsStringAndTheOtherIsArray(value1, value2)) {
            if (Array.isArray(value1) && this.valueIsString(value2)) {
                return value1[0] === value2;
            }
            if (Array.isArray(value2) && this.valueIsString(value1)) {
                return value2[0] === value1;
            }
        }
    }
    oneValueIsStringAndTheOtherIsArray(value1, value2) {
        return (Array.isArray(value1) && this.valueIsString(value2)) || (Array.isArray(value2) && this.valueIsString(value1));
    }
    bothValuesAreObjects(value1, value2) {
        return this.valueIsObject(value1) && this.valueIsObject(value2);
    }
    bothValuesAreStrings(value1, value2) {
        return this.valueIsString(value1) && this.valueIsString(value2);
    }
    bothValuesAreArrays(value1, value2) {
        return Array.isArray(value1) && Array.isArray(value2);
    }
    valueIsString(value) {
        return typeof value === 'string' || value instanceof String;
    }
    valueIsObject(value) {
        return typeof value === 'object';
    }
    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }
};
EqualityService = __decorate([
    Injectable()
], EqualityService);
export { EqualityService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXF1YWxpdHkuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC8iLCJzb3VyY2VzIjpbImxpYi91dGlscy9lcXVhbGl0eS9lcXVhbGl0eS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzNDLElBQWEsZUFBZSxHQUE1QixNQUFhLGVBQWU7SUFDeEIsUUFBUSxDQUFDLE1BQWtELEVBQUUsTUFBa0Q7UUFDM0csSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNwQixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRTtZQUMxQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBZSxFQUFFLE1BQWUsQ0FBQyxDQUFDO1NBQzdEO1FBRUQsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQzNDLE9BQU8sTUFBTSxLQUFLLE1BQU0sQ0FBQztTQUM1QjtRQUVELElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRTtZQUMzQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUN4RjtRQUVELElBQUksSUFBSSxDQUFDLGtDQUFrQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRTtZQUN6RCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDckQsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxDQUFDO2FBQy9CO1lBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3JELE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQzthQUMvQjtTQUNKO0lBQ0wsQ0FBQztJQUVPLGtDQUFrQyxDQUFDLE1BQStCLEVBQUUsTUFBK0I7UUFDdkcsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDMUgsQ0FBQztJQUVPLG9CQUFvQixDQUFDLE1BQStCLEVBQUUsTUFBK0I7UUFDekYsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVPLG9CQUFvQixDQUFDLE1BQStCLEVBQUUsTUFBK0I7UUFDekYsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVPLG1CQUFtQixDQUFDLE1BQStCLEVBQUUsTUFBK0I7UUFDeEYsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVPLGFBQWEsQ0FBQyxLQUFVO1FBQzVCLE9BQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLEtBQUssWUFBWSxNQUFNLENBQUM7SUFDaEUsQ0FBQztJQUVPLGFBQWEsQ0FBQyxLQUFVO1FBQzVCLE9BQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDO0lBQ3JDLENBQUM7SUFFTyxXQUFXLENBQUMsSUFBbUIsRUFBRSxJQUFtQjtRQUN4RCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUM3QixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBSTtZQUM3QixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JCLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1NBQ0o7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0osQ0FBQTtBQWpFWSxlQUFlO0lBRDNCLFVBQVUsRUFBRTtHQUNBLGVBQWUsQ0FpRTNCO1NBakVZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBFcXVhbGl0eVNlcnZpY2Uge1xuICAgIGFyZUVxdWFsKHZhbHVlMTogc3RyaW5nIHwgYW55W10gfCBvYmplY3QgfCBudWxsIHwgdW5kZWZpbmVkLCB2YWx1ZTI6IHN0cmluZyB8IGFueVtdIHwgb2JqZWN0IHwgbnVsbCB8IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoIXZhbHVlMSB8fCAhdmFsdWUyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ib3RoVmFsdWVzQXJlQXJyYXlzKHZhbHVlMSwgdmFsdWUyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXJyYXlzRXF1YWwodmFsdWUxIGFzIGFueVtdLCB2YWx1ZTIgYXMgYW55W10pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuYm90aFZhbHVlc0FyZVN0cmluZ3ModmFsdWUxLCB2YWx1ZTIpKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUxID09PSB2YWx1ZTI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ib3RoVmFsdWVzQXJlT2JqZWN0cyh2YWx1ZTEsIHZhbHVlMikpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZTEpLnRvTG93ZXJDYXNlKCkgPT09IEpTT04uc3RyaW5naWZ5KHZhbHVlMikudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9uZVZhbHVlSXNTdHJpbmdBbmRUaGVPdGhlcklzQXJyYXkodmFsdWUxLCB2YWx1ZTIpKSB7XG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZTEpICYmIHRoaXMudmFsdWVJc1N0cmluZyh2YWx1ZTIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlMVswXSA9PT0gdmFsdWUyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUyKSAmJiB0aGlzLnZhbHVlSXNTdHJpbmcodmFsdWUxKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTJbMF0gPT09IHZhbHVlMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25lVmFsdWVJc1N0cmluZ0FuZFRoZU90aGVySXNBcnJheSh2YWx1ZTE6IHN0cmluZyB8IG9iamVjdCB8IGFueVtdLCB2YWx1ZTI6IHN0cmluZyB8IG9iamVjdCB8IGFueVtdKSB7XG4gICAgICAgIHJldHVybiAoQXJyYXkuaXNBcnJheSh2YWx1ZTEpICYmIHRoaXMudmFsdWVJc1N0cmluZyh2YWx1ZTIpKSB8fCAoQXJyYXkuaXNBcnJheSh2YWx1ZTIpICYmIHRoaXMudmFsdWVJc1N0cmluZyh2YWx1ZTEpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJvdGhWYWx1ZXNBcmVPYmplY3RzKHZhbHVlMTogc3RyaW5nIHwgb2JqZWN0IHwgYW55W10sIHZhbHVlMjogc3RyaW5nIHwgb2JqZWN0IHwgYW55W10pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVJc09iamVjdCh2YWx1ZTEpICYmIHRoaXMudmFsdWVJc09iamVjdCh2YWx1ZTIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYm90aFZhbHVlc0FyZVN0cmluZ3ModmFsdWUxOiBzdHJpbmcgfCBvYmplY3QgfCBhbnlbXSwgdmFsdWUyOiBzdHJpbmcgfCBvYmplY3QgfCBhbnlbXSkge1xuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZUlzU3RyaW5nKHZhbHVlMSkgJiYgdGhpcy52YWx1ZUlzU3RyaW5nKHZhbHVlMik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBib3RoVmFsdWVzQXJlQXJyYXlzKHZhbHVlMTogc3RyaW5nIHwgb2JqZWN0IHwgYW55W10sIHZhbHVlMjogc3RyaW5nIHwgb2JqZWN0IHwgYW55W10pIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUxKSAmJiBBcnJheS5pc0FycmF5KHZhbHVlMik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2YWx1ZUlzU3RyaW5nKHZhbHVlOiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdmFsdWUgaW5zdGFuY2VvZiBTdHJpbmc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2YWx1ZUlzT2JqZWN0KHZhbHVlOiBhbnkpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhcnJheXNFcXVhbChhcnIxOiBBcnJheTxzdHJpbmc+LCBhcnIyOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgICAgIGlmIChhcnIxLmxlbmd0aCAhPT0gYXJyMi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSBhcnIxLmxlbmd0aDsgaS0tOyApIHtcbiAgICAgICAgICAgIGlmIChhcnIxW2ldICE9PSBhcnIyW2ldKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuIl19