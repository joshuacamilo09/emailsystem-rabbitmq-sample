// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import sentry from '@sentry/node';
import { AllExceptionsFilter } from './exceptionFilter';

/**
 * Função bootstrap
 * Inicializa e configura a aplicação Nest.js
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Criar aplicação Nest.js
  const app = await NestFactory.create(AppModule);

  sentry.init({
    dsn: process.env.SENTRY_DSN,
  })
  // Configurar validação automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove campos não definidos nos DTOs
      forbidNonWhitelisted: true, // Retorna erro se enviar campos extras
      transform: true, // Transforma tipos automaticamente (string → number)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Prefixo global para todas as rotas
  app.setGlobalPrefix('test');

  // Habilitar CORS (se necessário)
  app.enableCors();

  // Configurar filtro de exceções
  app.useGlobalFilters(new AllExceptionsFilter()); 

  // Porta do servidor
  const port = process.env.PORT || 3000;

  // Iniciar servidor
  await app.listen(port);
}

// Iniciar aplicação
bootstrap();