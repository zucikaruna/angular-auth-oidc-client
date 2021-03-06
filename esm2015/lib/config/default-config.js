import { LogLevel } from '../logging/log-level';
export const DEFAULT_CONFIG = {
    stsServer: 'https://please_set',
    authWellknownEndpoint: '',
    redirectUrl: 'https://please_set',
    clientId: 'please_set',
    responseType: 'code',
    scope: 'openid email profile',
    hdParam: '',
    postLogoutRedirectUri: 'https://please_set',
    startCheckSession: false,
    silentRenew: false,
    silentRenewUrl: 'https://please_set',
    renewTimeBeforeTokenExpiresInSeconds: 0,
    useRefreshToken: false,
    ignoreNonceAfterRefresh: false,
    postLoginRoute: '/',
    forbiddenRoute: '/forbidden',
    unauthorizedRoute: '/unauthorized',
    autoUserinfo: true,
    autoCleanStateAfterAuthentication: true,
    triggerAuthorizationResultEvent: false,
    logLevel: LogLevel.Warn,
    issValidationOff: false,
    historyCleanupOff: false,
    maxIdTokenIatOffsetAllowedInSeconds: 120,
    disableIatOffsetValidation: false,
    storage: typeof Storage !== 'undefined' ? sessionStorage : null,
    customParams: {},
    disableRefreshIdTokenAuthTimeValidation: false,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1jb25maWcuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvY29uZmlnL2RlZmF1bHQtY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUdoRCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQXdCO0lBQy9DLFNBQVMsRUFBRSxvQkFBb0I7SUFDL0IscUJBQXFCLEVBQUUsRUFBRTtJQUN6QixXQUFXLEVBQUUsb0JBQW9CO0lBQ2pDLFFBQVEsRUFBRSxZQUFZO0lBQ3RCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLEtBQUssRUFBRSxzQkFBc0I7SUFDN0IsT0FBTyxFQUFFLEVBQUU7SUFDWCxxQkFBcUIsRUFBRSxvQkFBb0I7SUFDM0MsaUJBQWlCLEVBQUUsS0FBSztJQUN4QixXQUFXLEVBQUUsS0FBSztJQUNsQixjQUFjLEVBQUUsb0JBQW9CO0lBQ3BDLG9DQUFvQyxFQUFFLENBQUM7SUFDdkMsZUFBZSxFQUFFLEtBQUs7SUFDdEIsdUJBQXVCLEVBQUUsS0FBSztJQUM5QixjQUFjLEVBQUUsR0FBRztJQUNuQixjQUFjLEVBQUUsWUFBWTtJQUM1QixpQkFBaUIsRUFBRSxlQUFlO0lBQ2xDLFlBQVksRUFBRSxJQUFJO0lBQ2xCLGlDQUFpQyxFQUFFLElBQUk7SUFDdkMsK0JBQStCLEVBQUUsS0FBSztJQUN0QyxRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUk7SUFDdkIsZ0JBQWdCLEVBQUUsS0FBSztJQUN2QixpQkFBaUIsRUFBRSxLQUFLO0lBQ3hCLG1DQUFtQyxFQUFFLEdBQUc7SUFDeEMsMEJBQTBCLEVBQUUsS0FBSztJQUNqQyxPQUFPLEVBQUUsT0FBTyxPQUFPLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUk7SUFDL0QsWUFBWSxFQUFFLEVBQUU7SUFDaEIsdUNBQXVDLEVBQUUsS0FBSztDQUNqRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9nTGV2ZWwgfSBmcm9tICcuLi9sb2dnaW5nL2xvZy1sZXZlbCc7XHJcbmltcG9ydCB7IE9wZW5JZENvbmZpZ3VyYXRpb24gfSBmcm9tICcuL29wZW5pZC1jb25maWd1cmF0aW9uJztcclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX0NPTkZJRzogT3BlbklkQ29uZmlndXJhdGlvbiA9IHtcclxuICAgIHN0c1NlcnZlcjogJ2h0dHBzOi8vcGxlYXNlX3NldCcsXHJcbiAgICBhdXRoV2VsbGtub3duRW5kcG9pbnQ6ICcnLFxyXG4gICAgcmVkaXJlY3RVcmw6ICdodHRwczovL3BsZWFzZV9zZXQnLFxyXG4gICAgY2xpZW50SWQ6ICdwbGVhc2Vfc2V0JyxcclxuICAgIHJlc3BvbnNlVHlwZTogJ2NvZGUnLFxyXG4gICAgc2NvcGU6ICdvcGVuaWQgZW1haWwgcHJvZmlsZScsXHJcbiAgICBoZFBhcmFtOiAnJyxcclxuICAgIHBvc3RMb2dvdXRSZWRpcmVjdFVyaTogJ2h0dHBzOi8vcGxlYXNlX3NldCcsXHJcbiAgICBzdGFydENoZWNrU2Vzc2lvbjogZmFsc2UsXHJcbiAgICBzaWxlbnRSZW5ldzogZmFsc2UsXHJcbiAgICBzaWxlbnRSZW5ld1VybDogJ2h0dHBzOi8vcGxlYXNlX3NldCcsXHJcbiAgICByZW5ld1RpbWVCZWZvcmVUb2tlbkV4cGlyZXNJblNlY29uZHM6IDAsXHJcbiAgICB1c2VSZWZyZXNoVG9rZW46IGZhbHNlLFxyXG4gICAgaWdub3JlTm9uY2VBZnRlclJlZnJlc2g6IGZhbHNlLFxyXG4gICAgcG9zdExvZ2luUm91dGU6ICcvJyxcclxuICAgIGZvcmJpZGRlblJvdXRlOiAnL2ZvcmJpZGRlbicsXHJcbiAgICB1bmF1dGhvcml6ZWRSb3V0ZTogJy91bmF1dGhvcml6ZWQnLFxyXG4gICAgYXV0b1VzZXJpbmZvOiB0cnVlLFxyXG4gICAgYXV0b0NsZWFuU3RhdGVBZnRlckF1dGhlbnRpY2F0aW9uOiB0cnVlLFxyXG4gICAgdHJpZ2dlckF1dGhvcml6YXRpb25SZXN1bHRFdmVudDogZmFsc2UsXHJcbiAgICBsb2dMZXZlbDogTG9nTGV2ZWwuV2FybixcclxuICAgIGlzc1ZhbGlkYXRpb25PZmY6IGZhbHNlLFxyXG4gICAgaGlzdG9yeUNsZWFudXBPZmY6IGZhbHNlLFxyXG4gICAgbWF4SWRUb2tlbklhdE9mZnNldEFsbG93ZWRJblNlY29uZHM6IDEyMCxcclxuICAgIGRpc2FibGVJYXRPZmZzZXRWYWxpZGF0aW9uOiBmYWxzZSxcclxuICAgIHN0b3JhZ2U6IHR5cGVvZiBTdG9yYWdlICE9PSAndW5kZWZpbmVkJyA/IHNlc3Npb25TdG9yYWdlIDogbnVsbCxcclxuICAgIGN1c3RvbVBhcmFtczoge30sXHJcbiAgICBkaXNhYmxlUmVmcmVzaElkVG9rZW5BdXRoVGltZVZhbGlkYXRpb246IGZhbHNlLFxyXG59O1xyXG4iXX0=