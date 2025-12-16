"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RabbitMQService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const amqp = __importStar(require("amqplib"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let RabbitMQService = RabbitMQService_1 = class RabbitMQService {
    configService;
    logger = new common_1.Logger(RabbitMQService_1.name);
    connection;
    channel;
    constructor(configService) {
        this.configService = configService;
    }
    async onModuleInit() {
        await this.connect();
        this.logger.log('✅ RabbitMQ pronto para uso');
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        try {
            const url = process.env.RABBITMQ_URL || 'amqp://localhost';
            this.logger.log('🔌 Conectando ao RabbitMQ...');
            this.connection = await amqp.connect(url);
            this.channel = await this.connection.createChannel();
            this.channel.prefetch(1);
            this.logger.log('✅ Conectado ao RabbitMQ com sucesso');
            this.connection.on('error', (err) => {
                this.logger.error('❌ Erro na conexão RabbitMQ:', err);
            });
            this.connection.on('close', () => {
                this.logger.warn('⚠️ Conexão RabbitMQ fechada');
            });
        }
        catch (error) {
            this.logger.error('❌ Falha ao conectar RabbitMQ:', error);
            throw error;
        }
    }
    async getChannel() {
        if (!this.channel) {
            this.logger.warn('⏳ Canal ainda não está pronto, aguardando conexão...');
            await this.waitForConnection();
        }
        return this.channel;
    }
    async waitForConnection(maxAttempts = 10) {
        let attempts = 0;
        while (!this.channel && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        if (!this.channel) {
            throw new Error('⏱️ Timeout: Canal RabbitMQ não foi estabelecido');
        }
    }
    async createQueue(queueName, dlqName) {
        const channel = await this.getChannel();
        if (dlqName) {
            await channel.assertQueue(dlqName, {
                durable: true,
                arguments: {},
            });
        }
        await channel.assertQueue(queueName, {
            durable: true,
            arguments: dlqName
                ? {
                    'x-dead-letter-exchange': '',
                    'x-dead-letter-routing-key': dlqName,
                }
                : {},
        });
        this.logger.log(`✅ Fila "${queueName}" criada${dlqName ? ` com DLQ "${dlqName}"` : ''}`);
        return this.channel;
    }
    async getQueueStats(queueName) {
        const channel = await this.getChannel();
        const info = await channel.checkQueue(queueName);
        return {
            queueName,
            messageCount: info.messageCount,
            consumerCount: info.consumerCount,
        };
    }
    async disconnect() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            this.logger.log('🔌 Conexão RabbitMQ fechada');
        }
        catch (error) {
            this.logger.error('❌ Erro ao fechar conexão:', error);
        }
    }
};
exports.RabbitMQService = RabbitMQService;
exports.RabbitMQService = RabbitMQService = RabbitMQService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RabbitMQService);
//# sourceMappingURL=rabbitmq.config.js.map