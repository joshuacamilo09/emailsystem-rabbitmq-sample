import { OnApplicationBootstrap } from '@nestjs/common';
import { MetricsService } from 'src/common/metrics/metrics.service';
import { EmailService } from 'src/Services/email.service';
import { QueueService } from 'src/Services/queue.service';
export declare class EmailWorker implements OnApplicationBootstrap {
    private queueService;
    private emailService;
    private metrics;
    private readonly logger;
    constructor(queueService: QueueService, emailService: EmailService, metrics: MetricsService);
    onApplicationBootstrap(): Promise<void>;
    private start;
}
