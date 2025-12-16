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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const email_config_1 = require("../common/config/email.config");
const email_types_1 = require("../common/types/email.types");
let EmailService = EmailService_1 = class EmailService {
    emailConfigService;
    configService;
    logger = new common_1.Logger(EmailService_1.name);
    constructor(emailConfigService, configService) {
        this.emailConfigService = emailConfigService;
        this.configService = configService;
    }
    getWelcomeTemplate(data) {
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
            ${data.activationLink
            ? `
              <p>PNo link nao tem nada mas toca so ja pra experimentar:</p>
              <p><a href="${data.activationLink}" class="button">Ativar Conta</a></p>
            `
            : ''}
            <p>Qualquer dúvida, vai a merda!</p>
            <p>Atenciosamente,<br>Joshuaaaaa</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    getResetPasswordTemplate(data) {
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
    getNewsletterTemplate(data) {
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
    getSubject(type, data) {
        switch (type) {
            case email_types_1.EmailType.WELCOME:
                return '🎉 Bem-vindo!';
            case email_types_1.EmailType.RESET_PASSWORD:
                return '🔐 Reset de Senha';
            case email_types_1.EmailType.NEWSLETTER:
                return data.title || '📰 Newsletter';
            case email_types_1.EmailType.NOTIFICATION:
                return '🔔 Notificação';
            default:
                return 'Email';
        }
    }
    getHtmlContent(type, data) {
        switch (type) {
            case email_types_1.EmailType.WELCOME:
                return this.getWelcomeTemplate(data);
            case email_types_1.EmailType.RESET_PASSWORD:
                return this.getResetPasswordTemplate(data);
            case email_types_1.EmailType.NEWSLETTER:
                return this.getNewsletterTemplate(data);
            default:
                return `<p>${JSON.stringify(data)}</p>`;
        }
    }
    async sendEmail(job) {
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
        }
        catch (error) {
            this.logger.error(`❌ Erro ao enviar email:`, error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_config_1.EmailConfigService,
        config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map