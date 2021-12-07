import { LoggerService } from '../logging/logger.service';
export declare class IFrameService {
    private loggerService;
    constructor(loggerService: LoggerService);
    getExistingIFrame(identifier: string): HTMLIFrameElement | null;
    addIFrameToWindowBody(identifier: string): HTMLIFrameElement;
    private getIFrameFromParentWindow;
    private getIFrameFromWindow;
    private isIFrameElement;
}
