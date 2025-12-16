"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
const rabbitmq_config_1 = require("../common/config/rabbitmq.config");
let QueueService = QueueService_1 = class QueueService {
    rabbitMQService;
    configService;
    logger = new common_1.Logger(QueueService_1.name);
    QUEUE_NAME;
    DLQ_NAME;
    constructor(rabbitMQService, configService) {
        this.rabbitMQService = rabbitMQService;
        this.configService = configService;
        this.QUEUE_NAME = this.configService.get('QUEUE_EMAILS') || 'emails';
        this.DLQ_NAME = this.configService.get('QUEUE_EMAILS_DLQ') || 'emails_failed';
    }
    async onModuleInit() {
        try {
            this.logger.log('🔄 Inicializando filas...');
            await this.rabbitMQService.createQueue(this.QUEUE_NAME, this.DLQ_NAME);
            this.logger.log('✅ Filas inicializadas com sucesso');
        }
        catch (error) {
            this.logger.error('❌ Erro ao inicializar filas:', error);
            throw error;
        }
    }
    async addEmailToQueue(payload) {
        const channel = await this.rabbitMQService.getChannel();
        const job = {
            ...payload,
            id: (0, uuid_1.v4)(),
            attempts: 0,
            createdAt: new Date(),
        };
        const message = Buffer.from(JSON.stringify(job));
        channel.sendToQueue(this.QUEUE_NAME, message, {
            persistent: true,
            priority: payload.priority === 'high' ? 10 : payload.priority === 'low' ? 1 : 5,
        });
        this.logger.log(`📤 Email [${job.id}] adicionado na fila: ${payload.type} → ${payload.to}`);
        return job.id;
    }
    async consumeEmailQueue(callback) {
        const channel = await this.rabbitMQService.getChannel();
        this.logger.log(`🔄 Consumidor iniciado na fila "${this.QUEUE_NAME}"`);
        await channel.consume(this.QUEUE_NAME, async (msg) => {
            if (!msg)
                return;
            const deliveryTag = msg.fields.deliveryTag;
            const isRetry = msg.fields.redelivered;
            try {
                const job = JSON.parse(msg.content.toString());
                job.attempts++;
                job.lastAttemptAt = new Date();
                this.logger.log(`\n   [${job.id}] Processando email ${isRetry ? '(RETRY)' : ''}:` +
                    `\n   Tipo: ${job.type}` +
                    `\n   Para: ${job.to}` +
                    `\n   Tentativas: ${job.attempts}`);
                await callback(job);
                channel.ack(msg);
                this.logger.log(` [${job.id}] Email processado e confirmado`);
            }
            catch (error) {
                this.logger.error(`[${deliveryTag}] Erro ao processar:`, error.message);
                if (isRetry) {
                    this.logger.warn(`[${deliveryTag}] Enviando para Dead Letter Queue`);
                    channel.nack(msg, false, false);
                }
                else {
                    this.logger.warn(`[${deliveryTag}] Reenfileirando para retry`);
                    channel.nack(msg, false, true);
                }
            }
        });
    }
    async getStats() {
        const mainQueue = await this.rabbitMQService.getQueueStats(this.QUEUE_NAME);
        const dlq = await this.rabbitMQService.getQueueStats(this.DLQ_NAME);
        return {
            mainQueue: {
                name: this.QUEUE_NAME,
                messages: mainQueue.messageCount,
                consumers: mainQueue.consumerCount,
            },
            deadLetterQueue: {
                name: this.DLQ_NAME,
                messages: dlq.messageCount,
                consumers: dlq.consumerCount,
            },
        };
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_config_1.RabbitMQService,
        config_1.ConfigService])
], QueueService);
//# sourceMappingURL=queue.service.js.map