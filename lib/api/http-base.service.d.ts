import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export declare class HttpBaseService {
    private http;
    constructor(http: HttpClient);
    get<T>(url: string, params?: {
        [key: string]: any;
    }): Observable<T>;
    post<T>(url: string, body: any, params?: {
        [key: string]: any;
    }): Observable<T>;
}
