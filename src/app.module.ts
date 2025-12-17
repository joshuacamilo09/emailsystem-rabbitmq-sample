// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailsController } from './email/controller/emails.controller';
import { EmailModule } from './email/email.module';
import { MetricsController } from './common/metrics/controller/metrics.controller';

/**
 * Módulo raiz da aplicação
 * Importa todos os outros módulos
 */
@Module({
  imports: [
    // ConfigModule para gerenciar variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true, // .env disponível em todos os módulos
      envFilePath: '.env',
    }),
    // Módulo de emails
    EmailModule,
  ],
  controllers: [
    EmailsController,
    MetricsController,
  ],
  providers: [],
})
export class AppModule {}