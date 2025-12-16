// src/modules/emails/workers/email.worker.ts
import { Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { EmailService } from 'src/Services/email.service';
import { QueueService } from 'src/Services/queue.service';



/**
 * Worker que processa emails em background
 * Inicia automaticamente quando o módulo é carregado
 */
@Injectable()
export class EmailWorker implements OnApplicationBootstrap {
  private readonly logger = new Logger(EmailWorker.name);

  constructor(
    private queueService: QueueService,
    private emailService: EmailService,
  ) {}

  /**
   * Iniciar worker automaticamente ao carregar módulo
   */
  async onApplicationBootstrap() {
    await this.start();
  }

  /**
   * Iniciar consumo da fila
   */
  private async start(): Promise<void> {
    this.logger.log('🚀 Email Worker iniciado');

    await this.queueService.consumeEmailQueue(async (job) => {
      // Enviar email
      const result = await this.emailService.sendEmail(job);

      // Se falhou, lançar erro para NACK
      if (!result.success) {
        throw new Error(result.error);
      }
    });

    this.logger.log('✅ Worker rodando e aguardando mensagens...\n');
  }
}