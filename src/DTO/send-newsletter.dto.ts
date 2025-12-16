import { IsArray, IsString, IsNotEmpty, IsEmail, IsUrl, IsOptional } from 'class-validator';

/**
 * DTO para newsletter
 */
export class SendNewsletterDto {
  @IsArray({ message: 'Recipients deve ser um array' })
  @IsEmail({}, { each: true, message: 'Todos os emails devem ser válidos' })
  @IsNotEmpty({ message: 'Lista de recipients é obrigatória' })
  recipients: string[];

  @IsString()
  @IsNotEmpty({ message: 'Título é obrigatório' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Conteúdo é obrigatório' })
  content: string;

  @IsUrl({}, { message: 'Link de unsubscribe inválido' })
  @IsOptional()
  unsubscribeLink?: string;
}