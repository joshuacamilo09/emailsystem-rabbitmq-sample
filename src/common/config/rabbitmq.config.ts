// src/common/config/rabbitmq.config.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { Channel, ChannelModel, Connection } from 'amqplib';
import * as dotenv from 'dotenv';

dotenv.config(); 

/*
    Serviço de conexão com RabbitMQ
    Gerencia conexão, canal e criação de filas
 */
@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);

  private connection: ChannelModel ; // 🔧 CORRIGIDO: era ChannelModel, agora Connection
  private channel: Channel;

  //variaveis globais usadas para armazenar a conexao e o canal de comunicacao com o rabbitMQ.

  constructor(private configService: ConfigService) {}

  /*
    Conectar automaticamente quando o módulo iniciar
   */
  async onModuleInit() {
    await this.connect();
    this.logger.log('✅ RabbitMQ pronto para uso'); // 🔧 ADICIONADO: Log de confirmação
  }

  //Desconectar automaticamente quando o módulo for destruído
  async onModuleDestroy() {
    await this.disconnect();
  }

  //Estabelecer conexão com RabbitMQ
  private async connect(): Promise<void> {
    try {
      //estabelece conexcao nova atraves da url fornecida pela env
      const url = process.env.RABBITMQ_URL || 'amqp://localhost';
      
      this.logger.log('🔌 Conectando ao RabbitMQ...');
      
      // Criar conexão TCP
      this.connection = await amqp.connect(url);
      
      // Criar canal de comunicação
      this.channel = await this.connection.createChannel();
      
      // Configurar prefetch (processar 1 mensagem por vez)
      this.channel.prefetch(1);
      
      this.logger.log('✅ Conectado ao RabbitMQ com sucesso'); // 🔧 CORRIGIDO: Adicionado emoji
    
      //manipuladores de eventos para lidar com errors de conexao e fechamento do canal
      // Listeners para reconexão
      this.connection.on('error', (err) => {
        this.logger.error('❌ Erro na conexão RabbitMQ:', err);
      });

      this.connection.on('close', () => {
        this.logger.warn('⚠️ Conexão RabbitMQ fechada');
      });
    } catch (error) {
      this.logger.error('❌ Falha ao conectar RabbitMQ:', error);
      throw error;
    }
  }

  /*
    Obter o canal de comunicacao
    🔧 CORRIGIDO: Agora é async e aguarda se o canal não estiver pronto
   */
  async getChannel(): Promise<Channel> {
    // Se canal não existe, aguardar conexão
    if (!this.channel) {
      this.logger.warn('⏳ Canal ainda não está pronto, aguardando conexão...');
      await this.waitForConnection();
    }
    return this.channel;
  }

  /*
    🔧 NOVO: Aguardar até que a conexão esteja pronta
    Evita erro de "canal não conectado"
   */
  private async waitForConnection(maxAttempts = 10): Promise<void> {
    let attempts = 0;
    while (!this.channel && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    if (!this.channel) {
      throw new Error('⏱️ Timeout: Canal RabbitMQ não foi estabelecido');
    }
  }
   
  /*
    Criar ou verificar fila
    🔧 CORRIGIDO: getChannel() agora é async
   */
  async createQueue(queueName: string, dlqName?: string): Promise<Channel> {
    const channel = await this.getChannel(); // 🔧 CORRIGIDO: Adicionado await
    
    // Criar Dead Letter Queue primeiro (se fornecida)
    //criar dead letter queue (fila de mensagens falhas)
    //verifica se uma fila d mensagens falhas foi fornecida, e se sim, cria a fila de mensagens usando channel assert
    if (dlqName) {
      await channel.assertQueue(dlqName, {
        durable: true,
        arguments: {},
      });
    }

    //apos criar a fila de mensagens falhas, criar fila principal
    await channel.assertQueue(queueName, {
      durable: true,
      arguments: dlqName
        ? {
            'x-dead-letter-exchange': '',
            'x-dead-letter-routing-key': dlqName,
          }
        : {},
    });

    //retorna o canal de comunicação
    this.logger.log(
      `✅ Fila "${queueName}" criada${dlqName ? ` com DLQ "${dlqName}"` : ''}`,
    );
    return this.channel;
  }

  /*
    Obter estatísticas da fila
    🔧 CORRIGIDO: getChannel() agora é async
   */
  async getQueueStats(queueName: string) {
    const channel = await this.getChannel(); // 🔧 CORRIGIDO: Adicionado await
    const info = await channel.checkQueue(queueName);

    return {
      queueName,
      messageCount: info.messageCount,
      consumerCount: info.consumerCount,
    };
  }

  // Desconectar do RabbitMQ
  private async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('🔌 Conexão RabbitMQ fechada');
    } catch (error) {
      this.logger.error('❌ Erro ao fechar conexão:', error);
    }
  }
}