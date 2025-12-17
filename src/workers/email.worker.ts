
// src/modules/emails/workers/email.worker.ts
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { MetricsService } from 'src/common/metrics/metrics.service';
import { EmailService } from 'src/Services/email.service';
import { QueueService } from 'src/Services/queue.service'; 

//temos de aplicar as métricas no email.worker.ts

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
    private metrics: MetricsService
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
      const type = job.type; //tipos de email

      //empezar a medir a duração
      const stopTimer = this.metrics.emailDuration.startTimer({ type });

      this.metrics.emailProcessed.inc({ type }); //email foi pego da fila e processado

      try {
        // Enviar email
      const result = await this.emailService.sendEmail(job);

        if (!result.success){
            //falha lógica 
            this.metrics.emailFailure.inc({
            type,
            reason: result.error || 'unknown', 
          }); 
          throw new Error(result.error);
        }

        //sucesso
        this.metrics.emailSuccess.inc({ type }); 

        this.logger.log(`Email enviado: ${type}`);

      } catch (error) {
        // falha inesperada (exception real)
        this.metrics.emailFailure.inc({
          type,
          reason: error.name || 'exception',
        });

        this.logger.error(`Falha ao enviar email: ${type}`, error.stack);

        throw error;

      } finally {
        stopTimer(); //sempre para o timer (sucesso ou falha)
      }
    });
    this.logger.log('Worker rodando e aguardando mensagens...\n');
  }
}
