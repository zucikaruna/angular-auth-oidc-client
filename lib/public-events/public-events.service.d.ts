import { EventTypes } from './event-types';
import { OidcClientNotification } from './notification';
export declare class PublicEventsService {
    private notify;
    fireEvent<T>(type: EventTypes, value?: T): void;
    registerForEvents(): import("rxjs").Observable<OidcClientNotification<any>>;
}
