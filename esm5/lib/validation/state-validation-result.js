import { ValidationResult } from './validation-result';
var StateValidationResult = /** @class */ (function () {
    function StateValidationResult(accessToken, idToken, authResponseIsValid, decodedIdToken, state) {
        if (accessToken === void 0) { accessToken = ''; }
        if (idToken === void 0) { idToken = ''; }
        if (authResponseIsValid === void 0) { authResponseIsValid = false; }
        if (decodedIdToken === void 0) { decodedIdToken = {}; }
        if (state === void 0) { state = ValidationResult.NotSet; }
        this.accessToken = accessToken;
        this.idToken = idToken;
        this.authResponseIsValid = authResponseIsValid;
        this.decodedIdToken = decodedIdToken;
        this.state = state;
    }
    return StateValidationResult;
}());
export { StateValidationResult };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGUtdmFsaWRhdGlvbi1yZXN1bHQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvIiwic291cmNlcyI6WyJsaWIvdmFsaWRhdGlvbi9zdGF0ZS12YWxpZGF0aW9uLXJlc3VsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUV2RDtJQUNJLCtCQUNXLFdBQWdCLEVBQ2hCLE9BQVksRUFDWixtQkFBMkIsRUFDM0IsY0FBd0IsRUFDeEIsS0FBaUQ7UUFKakQsNEJBQUEsRUFBQSxnQkFBZ0I7UUFDaEIsd0JBQUEsRUFBQSxZQUFZO1FBQ1osb0NBQUEsRUFBQSwyQkFBMkI7UUFDM0IsK0JBQUEsRUFBQSxtQkFBd0I7UUFDeEIsc0JBQUEsRUFBQSxRQUEwQixnQkFBZ0IsQ0FBQyxNQUFNO1FBSmpELGdCQUFXLEdBQVgsV0FBVyxDQUFLO1FBQ2hCLFlBQU8sR0FBUCxPQUFPLENBQUs7UUFDWix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQVE7UUFDM0IsbUJBQWMsR0FBZCxjQUFjLENBQVU7UUFDeEIsVUFBSyxHQUFMLEtBQUssQ0FBNEM7SUFDekQsQ0FBQztJQUNSLDRCQUFDO0FBQUQsQ0FBQyxBQVJELElBUUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBWYWxpZGF0aW9uUmVzdWx0IH0gZnJvbSAnLi92YWxpZGF0aW9uLXJlc3VsdCc7XG5cbmV4cG9ydCBjbGFzcyBTdGF0ZVZhbGlkYXRpb25SZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwdWJsaWMgYWNjZXNzVG9rZW4gPSAnJyxcbiAgICAgICAgcHVibGljIGlkVG9rZW4gPSAnJyxcbiAgICAgICAgcHVibGljIGF1dGhSZXNwb25zZUlzVmFsaWQgPSBmYWxzZSxcbiAgICAgICAgcHVibGljIGRlY29kZWRJZFRva2VuOiBhbnkgPSB7fSxcbiAgICAgICAgcHVibGljIHN0YXRlOiBWYWxpZGF0aW9uUmVzdWx0ID0gVmFsaWRhdGlvblJlc3VsdC5Ob3RTZXRcbiAgICApIHt9XG59XG4iXX0=