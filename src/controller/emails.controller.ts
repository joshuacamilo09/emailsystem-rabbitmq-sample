// src/modules/emails/controllers/emails.controller.ts
import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EmailType } from 'src/common/types/email.types';
import { QueueService } from 'src/Services/queue.service';
import { SendNewsletterDto } from 'src/DTO/send-newsletter.dto';
import { SendResetPasswordDto } from 'src/DTO/send-reset-password.dto';
import { SendWelcomeDto } from 'src/DTO/send-welcome.dto';

import {
  SendEmailDto,
} from '../DTO/send-email-dto';
/**
 * Controller de emails
 * Define endpoints da API REST
 */
@Controller('emails')
export class EmailsController {
  constructor(private readonly queueService: QueueService) {}

   /*
     GET /emails/stats
     Obter estatísticas das filas
   */
  @Get('stats')
  async getStats() {
    return this.queueService.getStats();
  }

  /*
   * POST /emails/welcome
   * Enviar email de boas-vindas
   */
  @Post('welcome')
  @HttpCode(HttpStatus.ACCEPTED) // 202
  async sendWelcome(@Body() dto: SendWelcomeDto) {
    const jobId = await this.queueService.addEmailToQueue({
      to: dto.to,
      type: EmailType.WELCOME,
      data: {
        userName: dto.userName,
        activationLink: dto.activationLink,
      },
      priority: 'normal',
    });

    return {
      success: true,
      message: 'Email de boas-vindas adicionado na fila',
      jobId,
    };
  }

    /*
     POST /emails/reset-password
     Enviar email de reset de senha
    */
  @Post('reset-password')
  @HttpCode(HttpStatus.ACCEPTED) // 202
  async sendResetPassword(@Body() dto: SendResetPasswordDto) {
    const jobId = await this.queueService.addEmailToQueue({
      to: dto.to,
      type: EmailType.RESET_PASSWORD,
      data: {
        userName: dto.userName,
        resetLink: dto.resetLink,
        expiresIn: dto.expiresIn || '24 horas',
      },
      priority: 'high', // Alta prioridade
    });

    return {
      success: true,
      message: 'Email de reset de senha adicionado na fila',
      jobId,
    };
  }

  /**
   * POST /emails/newsletter
   * Enviar newsletter para múltiplos destinatários
   */
  @Post('newsletter')
  @HttpCode(HttpStatus.ACCEPTED) // 202
  async sendNewsletter(@Body() dto: SendNewsletterDto) {
    const jobIds: string[] = [];

    // Criar um job para cada destinatário
    for (const email of dto.recipients) {
      const jobId = await this.queueService.addEmailToQueue({
        to: email,
        type: EmailType.NEWSLETTER,
        data: {
          title: dto.title,
          content: dto.content,
          unsubscribeLink: dto.unsubscribeLink || 'https://example.com/unsubscribe',
        },
        priority: 'low', // Baixa prioridade
      });
      jobIds.push(jobId);
    }

    return {
      success: true,
      message: `${dto.recipients.length} emails adicionados na fila`,
      jobIds,
    };
  }

  /**
   * POST /emails/send
   * Enviar email genérico
   */
  @Post('send')
  @HttpCode(HttpStatus.ACCEPTED) // 202
  async sendEmail(@Body() dto: SendEmailDto) {
    const jobId = await this.queueService.addEmailToQueue({
      to: dto.to,
      type: dto.type,
      data: dto.data,
      priority: dto.priority || 'normal',
    });

    return {
      success: true,
      message: 'Email adicionado na fila',
      jobId,
    };
  }
}