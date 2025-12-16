"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailWorker = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("../Services/email.service");
const queue_service_1 = require("../Services/queue.service");
let EmailWorker = EmailWorker_1 = class EmailWorker {
    queueService;
    emailService;
    logger = new common_1.Logger(EmailWorker_1.name);
    constructor(queueService, emailService) {
        this.queueService = queueService;
        this.emailService = emailService;
    }
    async onApplicationBootstrap() {
        await this.start();
    }
    async start() {
        this.logger.log('🚀 Email Worker iniciado');
        await this.queueService.consumeEmailQueue(async (job) => {
            const result = await this.emailService.sendEmail(job);
            if (!result.success) {
                throw new Error(result.error);
            }
        });
        this.logger.log('✅ Worker rodando e aguardando mensagens...\n');
    }
};
exports.EmailWorker = EmailWorker;
exports.EmailWorker = EmailWorker = EmailWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [queue_service_1.QueueService,
        email_service_1.EmailService])
], EmailWorker);
//# sourceMappingURL=email.worker.js.map