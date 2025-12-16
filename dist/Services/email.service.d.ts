import { ConfigService } from '@nestjs/config';
import { EmailConfigService } from 'src/common/config/email.config';
import { EmailJob, EmailResult } from 'src/common/types/email.types';
export declare class EmailService {
    private emailConfigService;
    private configService;
    private readonly logger;
    constructor(emailConfigService: EmailConfigService, configService: ConfigService);
    private getWelcomeTemplate;
    private getResetPasswordTemplate;
    private getNewsletterTemplate;
    private getSubject;
    private getHtmlContent;
    sendEmail(job: EmailJob): Promise<EmailResult>;
}
