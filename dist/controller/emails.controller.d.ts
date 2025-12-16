import { QueueService } from 'src/Services/queue.service';
import { SendNewsletterDto } from 'src/DTO/send-newsletter.dto';
import { SendResetPasswordDto } from 'src/DTO/send-reset-password.dto';
import { SendWelcomeDto } from 'src/DTO/send-welcome.dto';
import { SendEmailDto } from '../DTO/send-email-dto';
export declare class EmailsController {
    private readonly queueService;
    constructor(queueService: QueueService);
    getStats(): Promise<{
        mainQueue: {
            name: string;
            messages: number;
            consumers: number;
        };
        deadLetterQueue: {
            name: string;
            messages: number;
            consumers: number;
        };
    }>;
    sendWelcome(dto: SendWelcomeDto): Promise<{
        success: boolean;
        message: string;
        jobId: string;
    }>;
    sendResetPassword(dto: SendResetPasswordDto): Promise<{
        success: boolean;
        message: string;
        jobId: string;
    }>;
    sendNewsletter(dto: SendNewsletterDto): Promise<{
        success: boolean;
        message: string;
        jobIds: string[];
    }>;
    sendEmail(dto: SendEmailDto): Promise<{
        success: boolean;
        message: string;
        jobId: string;
    }>;
}
