import { ValidationResult } from './validation-result';
export class StateValidationResult {
    constructor(accessToken = '', idToken = '', authResponseIsValid = false, decodedIdToken = {}, state = ValidationResult.NotSet) {
        this.accessToken = accessToken;
        this.idToken = idToken;
        this.authResponseIsValid = authResponseIsValid;
        this.decodedIdToken = decodedIdToken;
        this.state = state;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUtdmFsaWRhdGlvbi1yZXN1bHQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvdmFsaWRhdGlvbi9zdGF0ZS12YWxpZGF0aW9uLXJlc3VsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUV2RCxNQUFNLE9BQU8scUJBQXFCO0lBQzlCLFlBQ1csY0FBYyxFQUFFLEVBQ2hCLFVBQVUsRUFBRSxFQUNaLHNCQUFzQixLQUFLLEVBQzNCLGlCQUFzQixFQUFFLEVBQ3hCLFFBQTBCLGdCQUFnQixDQUFDLE1BQU07UUFKakQsZ0JBQVcsR0FBWCxXQUFXLENBQUs7UUFDaEIsWUFBTyxHQUFQLE9BQU8sQ0FBSztRQUNaLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBUTtRQUMzQixtQkFBYyxHQUFkLGNBQWMsQ0FBVTtRQUN4QixVQUFLLEdBQUwsS0FBSyxDQUE0QztJQUN6RCxDQUFDO0NBQ1AiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWYWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnLi92YWxpZGF0aW9uLXJlc3VsdCc7XG5cbmV4cG9ydCBjbGFzcyBTdGF0ZVZhbGlkYXRpb25SZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwdWJsaWMgYWNjZXNzVG9rZW4gPSAnJyxcbiAgICAgICAgcHVibGljIGlkVG9rZW4gPSAnJyxcbiAgICAgICAgcHVibGljIGF1dGhSZXNwb25zZUlzVmFsaWQgPSBmYWxzZSxcbiAgICAgICAgcHVibGljIGRlY29kZWRJZFRva2VuOiBhbnkgPSB7fSxcbiAgICAgICAgcHVibGljIHN0YXRlOiBWYWxpZGF0aW9uUmVzdWx0ID0gVmFsaWRhdGlvblJlc3VsdC5Ob3RTZXRcbiAgICApIHt9XG59XG4iXX0=