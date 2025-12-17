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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsController = void 0;
const common_1 = require("@nestjs/common");
const email_types_1 = require("../../common/types/email.types");
const queue_service_1 = require("../../Services/queue.service");
const send_newsletter_dto_1 = require("../../DTO/send-newsletter.dto");
const send_reset_password_dto_1 = require("../../DTO/send-reset-password.dto");
const send_welcome_dto_1 = require("../../DTO/send-welcome.dto");
const send_email_dto_1 = require("../../DTO/send-email-dto");
let EmailsController = class EmailsController {
    queueService;
    constructor(queueService) {
        this.queueService = queueService;
    }
    async getStats() {
        return this.queueService.getStats();
    }
    async sendWelcome(dto) {
        const jobId = await this.queueService.addEmailToQueue({
            to: dto.to,
            type: email_types_1.EmailType.WELCOME,
            data: {
                userName: dto.userName,
                activationLink: dto.activationLink,
            },
            priority: 'normal',
        });
        return {
            success: true,
            message: 'Email de boas-vindas adicionado na fila',
            jobId,
        };
    }
    async sendResetPassword(dto) {
        const jobId = await this.queueService.addEmailToQueue({
            to: dto.to,
            type: email_types_1.EmailType.RESET_PASSWORD,
            data: {
                userName: dto.userName,
                resetLink: dto.resetLink,
                expiresIn: dto.expiresIn || '24 horas',
            },
            priority: 'high',
        });
        return {
            success: true,
            message: 'Email de reset de senha adicionado na fila',
            jobId,
        };
    }
    async sendNewsletter(dto) {
        const jobIds = [];
        for (const email of dto.recipients) {
            const jobId = await this.queueService.addEmailToQueue({
                to: email,
                type: email_types_1.EmailType.NEWSLETTER,
                data: {
                    title: dto.title,
                    content: dto.content,
                    unsubscribeLink: dto.unsubscribeLink || 'https://example.com/unsubscribe',
                },
                priority: 'low',
            });
            jobIds.push(jobId);
        }
        return {
            success: true,
            message: `${dto.recipients.length} emails adicionados na fila`,
            jobIds,
        };
    }
    async sendEmail(dto) {
        const jobId = await this.queueService.addEmailToQueue({
            to: dto.to,
            type: dto.type,
            data: dto.data,
            priority: dto.priority || 'normal',
        });
        return {
            success: true,
            message: 'Email adicionado na fila',
            jobId,
        };
    }
};
exports.EmailsController = EmailsController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)('welcome'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_welcome_dto_1.SendWelcomeDto]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "sendWelcome", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_reset_password_dto_1.SendResetPasswordDto]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "sendResetPassword", null);
__decorate([
    (0, common_1.Post)('newsletter'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_newsletter_dto_1.SendNewsletterDto]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "sendNewsletter", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_email_dto_1.SendEmailDto]),
    __metadata("design:returntype", Promise)
], EmailsController.prototype, "sendEmail", null);
exports.EmailsController = EmailsController = __decorate([
    (0, common_1.Controller)('emails'),
    __metadata("design:paramtypes", [queue_service_1.QueueService])
], EmailsController);
//# sourceMappingURL=emails.controller.js.map