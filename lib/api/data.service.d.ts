import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpBaseService } from './http-base.service';
export declare class DataService {
    private httpClient;
    constructor(httpClient: HttpBaseService);
    get<T>(url: string, token?: string): Observable<T>;
    post<T>(url: string, body: any, headersParams?: HttpHeaders): Observable<T>;
    private prepareHeaders;
}
