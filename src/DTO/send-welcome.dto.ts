import { IsEmail, IsString, IsOptional, IsNotEmpty } from 'class-validator';

/**
 * DTO para email de boas-vindas
 */
export class SendWelcomeDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  to: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome do usuário é obrigatório' })
  userName: string;

  @IsString()
  @IsOptional()
  activationLink?: string;
}