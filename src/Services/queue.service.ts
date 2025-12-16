// src/modules/emails/services/queue.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ConsumeMessage } from 'amqplib';
import { RabbitMQService } from 'src/common/config/rabbitmq.config';
import { EmailPayload, EmailJob } from 'src/common/types/email.types';

/**
 * Serviço de gerenciamento de fila de emails
 */
@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  private readonly QUEUE_NAME: string;
  private readonly DLQ_NAME: string;

  constructor(
    private rabbitMQService: RabbitMQService,
    private configService: ConfigService,
  ) {
    this.QUEUE_NAME = this.configService.get('QUEUE_EMAILS') || 'emails';
    this.DLQ_NAME = this.configService.get('QUEUE_EMAILS_DLQ') || 'emails_failed';
  }

  /**
   * Criar filas ao iniciar módulo
   * 🔧 CORRIGIDO: Adicionado try/catch e logs
   */
  async onModuleInit() { 
    try {
      this.logger.log('🔄 Inicializando filas...');
      await this.rabbitMQService.createQueue(this.QUEUE_NAME, this.DLQ_NAME);
      this.logger.log('✅ Filas inicializadas com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao inicializar filas:', error);
      throw error;
    }
  }

  /**
   * Adicionar email na fila (PRODUTOR)
   * 🔧 CORRIGIDO: getChannel() agora é async
   */
  async addEmailToQueue(payload: EmailPayload): Promise<string> {
    const channel = await this.rabbitMQService.getChannel(); // 🔧 CORRIGIDO: Adicionado await

    // Criar job completo
    const job: EmailJob = {
      ...payload,
      id: uuidv4(),
      attempts: 0,
      createdAt: new Date(),
    };

    // Converter para Buffer
    const message = Buffer.from(JSON.stringify(job));

    // Enviar para fila
    channel.sendToQueue(this.QUEUE_NAME, message, {
      persistent: true, // Mensagem sobrevive a restart
      priority: payload.priority === 'high' ? 10 : payload.priority === 'low' ? 1 : 5,
    });

    this.logger.log(
      `📤 Email [${job.id}] adicionado na fila: ${payload.type} → ${payload.to}`,
    );

    return job.id;
  }

  /**
   * Consumir emails da fila (CONSUMIDOR)
   * 🔧 CORRIGIDO: getChannel() agora é async
   */
  async consumeEmailQueue(callback: (job: EmailJob) => Promise<void>): Promise<void> {
    const channel = await this.rabbitMQService.getChannel(); // 🔧 CORRIGIDO: Adicionado await

    this.logger.log(`🔄 Consumidor iniciado na fila "${this.QUEUE_NAME}"`);

    await channel.consume(this.QUEUE_NAME, async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      const deliveryTag = msg.fields.deliveryTag;
      const isRetry = msg.fields.redelivered;

      try {
        // Parsear mensagem
        const job: EmailJob = JSON.parse(msg.content.toString());
        job.attempts++;
        job.lastAttemptAt = new Date();

        // Log detalhado
        this.logger.log(
          `\n   [${job.id}] Processando email ${isRetry ? '(RETRY)' : ''}:` +
          `\n   Tipo: ${job.type}` +
          `\n   Para: ${job.to}` +
          `\n   Tentativas: ${job.attempts}`,
        );

        // Executar callback (enviar email)
        await callback(job);

        // Sucesso - ACK
        channel.ack(msg);
        this.logger.log(` [${job.id}] Email processado e confirmado`);

      } catch (error: any) {
        this.logger.error(`[${deliveryTag}] Erro ao processar:`, error.message);

        // Decidir: Retry ou DLQ?
        if (isRetry) {
          // 2ª tentativa falhou → Dead Letter Queue
          this.logger.warn(`[${deliveryTag}] Enviando para Dead Letter Queue`);
          channel.nack(msg, false, false);
        } else {
          // 1ª tentativa falhou → Retry
          this.logger.warn(`[${deliveryTag}] Reenfileirando para retry`);
          channel.nack(msg, false, true);
        }
      }
    });
  }

  /**
   * Obter estatísticas das filas
   */
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
}