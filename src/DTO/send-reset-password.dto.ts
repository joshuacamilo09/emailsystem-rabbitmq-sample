import { IsEmail, IsString, IsOptional, IsNotEmpty, IsUrl } from 'class-validator';

/**
 * DTO para email de reset de senha
 */
export class SendResetPasswordDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  to: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome do usuário é obrigatório' })
  userName: string;

  @IsUrl({}, { message: 'Link de reset inválido' })
  @IsNotEmpty({ message: 'Link de reset é obrigatório' })
  resetLink: string;

  @IsString()
  @IsOptional()
  expiresIn?: string;
}