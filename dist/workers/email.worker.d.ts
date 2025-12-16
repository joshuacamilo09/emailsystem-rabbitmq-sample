import { OnApplicationBootstrap } from '@nestjs/common';
import { EmailService } from 'src/Services/email.service';
import { QueueService } from 'src/Services/queue.service';
export declare class EmailWorker implements OnApplicationBootstrap {
    private queueService;
    private emailService;
    private readonly logger;
    constructor(queueService: QueueService, emailService: EmailService);
    onApplicationBootstrap(): Promise<void>;
    private start;
}
