// src/modules/emails/services/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailConfigService } from 'src/common/config/email.config';

import {
  EmailJob,
  EmailResult,
  EmailType,
  WelcomeEmailData,
  ResetPasswordData,
  NewsletterData,
} from 'src/common/types/email.types';
/**
 * Serviço de envio de emails
 * Gerencia templates e envio via SMTP
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private emailConfigService: EmailConfigService,
    private configService: ConfigService,
  ) {}

  /**
   * Template HTML para email de boas-vindas
   */
  private getWelcomeTemplate(data: WelcomeEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 10px 20px; background: #4CAF50; 
                    color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo!</h1>
          </div>
          <div class="content">
            <h2>Olá, ${data.userName}!</h2>
            <p>ahhhh sei la crlh.</p>
            ${
              data.activationLink
                ? `
              <p>PNo link nao tem nada mas toca so ja pra experimentar:</p>
              <p><a href="${data.activationLink}" class="button">Ativar Conta</a></p>
            `
                : ''
            }
            <p>Qualquer dúvida, vai a merda!</p>
            <p>Atenciosamente,<br>Joshuaaaaa</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML para reset de senha
   */
  private getResetPasswordTemplate(data: ResetPasswordData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF5722; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 10px 20px; background: #FF5722; 
                    color: white; text-decoration: none; border-radius: 5px; }
          .warning { color: #FF5722; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset de Senha</h1>
          </div>
          <div class="content">
            <h2>Olá, ${data.userName}</h2>
            <p>Você solicitou um reset de senha.</p>
            <p><a href="${data.resetLink}" class="button">Resetar Senha</a></p>
            <p class="warning">⚠️ Este link expira em ${data.expiresIn}.</p>
            <p>Se você não solicitou isso, ignore este email.</p>
            <p>Atenciosamente,<br>Equipe de Segurança</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML para newsletter
   */
  private getNewsletterTemplate(data: NewsletterData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.title}</h1>
          </div>
          <div class="content">
            ${data.content}
          </div>
          <div class="footer">
            <p><a href="${data.unsubscribeLink}">Cancelar inscrição</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Obter assunto do email baseado no tipo
   */
  private getSubject(type: EmailType, data: any): string {
    switch (type) {
      case EmailType.WELCOME:
        return '🎉 Bem-vindo!';
      case EmailType.RESET_PASSWORD:
        return '🔐 Reset de Senha';
      case EmailType.NEWSLETTER:
        return data.title || '📰 Newsletter';
      case EmailType.NOTIFICATION:
        return '🔔 Notificação';
      default:
        return 'Email';
    }
  }

  /**
   * Obter HTML do email baseado no tipo
   */
  private getHtmlContent(type: EmailType, data: any): string {
    switch (type) {
      case EmailType.WELCOME:
        return this.getWelcomeTemplate(data as WelcomeEmailData);
      case EmailType.RESET_PASSWORD:
        return this.getResetPasswordTemplate(data as ResetPasswordData);
      case EmailType.NEWSLETTER:
        return this.getNewsletterTemplate(data as NewsletterData);
      default:
        return `<p>${JSON.stringify(data)}</p>`;
    }
  }


  async sendEmail(job: EmailJob): Promise<EmailResult> {
    try {
      const { to, type, data } = job;

      const subject = this.getSubject(type, data);
      const html = this.getHtmlContent(type, data);

      this.logger.log(`📧 Enviando email: ${subject} → ${to}`);

      const transporter = this.emailConfigService.getTransporter();
      
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@test.com',
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
      });

      this.logger.log(`✅ Email enviado! MessageID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      this.logger.error(`❌ Erro ao enviar email:`, error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }
}
