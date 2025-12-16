// src/common/types/email.types.ts

/**
 * Enum com tipos de email suportados
 */
export enum EmailType {
  WELCOME = 'welcome',
  RESET_PASSWORD = 'reset_password',
  NEWSLETTER = 'newsletter',
  NOTIFICATION = 'notification',
}

/**
 * Payload base para criar um email
 */
export interface EmailPayload {
  to: string | string[];
  type: EmailType;
  data: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
}

/**
 * Job completo que vai para a fila
 */
export interface EmailJob extends EmailPayload {
  id: string;
  attempts: number;
  createdAt: Date;
  lastAttemptAt?: Date;
}

/**
 * Resultado do envio de email
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Dados específicos para cada tipo de email
 */
export interface WelcomeEmailData {
  userName: string;
  activationLink?: string;
}

export interface ResetPasswordData {
  userName: string;
  resetLink: string;
  expiresIn: string;
}

export interface NewsletterData {
  title: string;
  content: string;
  unsubscribeLink: string;
}

/**
 * Estatísticas de fila
 */
export interface QueueStats {
  queueName: string;
  messageCount: number;
  consumerCount: number;
}