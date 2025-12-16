// src/common/config/email.config.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

/**
 * Serviço de configuração de email
 * Cria e gerencia o transporter do Nodemailer
 */
@Injectable()
export class EmailConfigService implements OnModuleInit {
  private readonly logger = new Logger(EmailConfigService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  /**
   * Verificar configuração ao iniciar módulo
   */
  async onModuleInit() {
    await this.verify();
  }

  /**
   * Criar transporter Nodemailer
   */
  private createTransporter(): void {
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST ,
      port: (process.env.EMAIL_PORT || 587) as number,
      secure: false, // false para TLS (587), true para SSL (465)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Em desenvolvimento, não envia emails reais
      ...(isDevelopment && {
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      }),
    });
  }

  /**
   * Obter transporter configurado
   */
  getTransporter(): Transporter {
    return this.transporter;
  }

  /**
   * Verificar se configuração está correta
   */
  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Servidor de email configurado corretamente');
      return true;
    } catch (error) {
      this.logger.error('Erro na configuração do email:', error);
      
      // Em produção, falhar se email não estiver configurado
      if (this.configService.get('NODE_ENV') === 'production') {
        throw error;
      }
      
      return false;
    }
  }
}