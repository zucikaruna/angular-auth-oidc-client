import { ConfigurationProvider } from '../config/config.provider';
import { IFrameService } from './existing-iframe.service';
export declare class SilentRenewService {
    private configurationProvider;
    private iFrameService;
    constructor(configurationProvider: ConfigurationProvider, iFrameService: IFrameService);
    getOrCreateIframe(): HTMLIFrameElement;
    isSilentRenewConfigured(): boolean;
    private getExistingIframe;
}
