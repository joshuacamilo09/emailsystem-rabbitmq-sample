import { IsEmail, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { EmailType } from 'src/common/types/email.types';


/**
 * DTO genérico para envio de email
 */
export class SendEmailDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  to: string | string[];

  @IsEnum(EmailType, { message: 'Tipo de email inválido' })
  @IsNotEmpty({ message: 'Tipo de email é obrigatório' })
  type: EmailType;

  @IsObject({ message: 'Data deve ser um objeto' })
  @IsNotEmpty({ message: 'Data é obrigatório' })
  data: Record<string, any>;

  @IsOptional()
  @IsEnum(['high', 'normal', 'low'], { message: 'Prioridade inválida' })
  priority?: 'high' | 'normal' | 'low';
}