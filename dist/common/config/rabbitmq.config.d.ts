import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel } from 'amqplib';
export declare class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private connection;
    private channel;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connect;
    getChannel(): Promise<Channel>;
    private waitForConnection;
    createQueue(queueName: string, dlqName?: string): Promise<Channel>;
    getQueueStats(queueName: string): Promise<{
        queueName: string;
        messageCount: number;
        consumerCount: number;
    }>;
    private disconnect;
}
