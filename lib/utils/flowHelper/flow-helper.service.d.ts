import { ConfigurationProvider } from '../../config/config.provider';
export declare class FlowHelper {
    private configurationProvider;
    constructor(configurationProvider: ConfigurationProvider);
    isCurrentFlowCodeFlow(): boolean;
    isCurrentFlowAnyImplicitFlow(): boolean;
    isCurrentFlowCodeFlowWithRefeshTokens(): boolean;
    isCurrentFlowImplicitFlowWithAccessToken(): boolean;
    isCurrentFlowImplicitFlowWithoutAccessToken(): boolean;
    currentFlowIs(flowTypes: string[] | string): boolean;
}
