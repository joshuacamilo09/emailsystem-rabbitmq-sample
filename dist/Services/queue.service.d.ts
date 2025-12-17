import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from 'src/common/config/rabbitmq.config';
import { EmailPayload, EmailJob } from 'src/common/types/email.types';
import { MetricsService } from 'src/common/metrics/metrics.service';
export declare class QueueService implements OnModuleInit {
    private rabbitMQService;
    private configService;
    private metrics;
    private readonly logger;
    private readonly QUEUE_NAME;
    private readonly DLQ_NAME;
    constructor(rabbitMQService: RabbitMQService, configService: ConfigService, metrics: MetricsService);
    onModuleInit(): Promise<void>;
    addEmailToQueue(payload: EmailPayload): Promise<string>;
    consumeEmailQueue(callback: (job: EmailJob) => Promise<void>): Promise<void>;
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
}
