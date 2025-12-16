"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailModule = exports.SendEmailDto = exports.SendNewsletterDto = exports.SendResetPasswordDto = exports.SendWelcomeDto = void 0;
const common_1 = require("@nestjs/common");
const email_config_1 = require("../common/config/email.config");
const rabbitmq_config_1 = require("../common/config/rabbitmq.config");
const emails_controller_1 = require("../controller/emails.controller");
const email_service_1 = require("../Services/email.service");
const queue_service_1 = require("../Services/queue.service");
const email_worker_1 = require("../workers/email.worker");
var send_welcome_dto_1 = require("../DTO/send-welcome.dto");
Object.defineProperty(exports, "SendWelcomeDto", { enumerable: true, get: function () { return send_welcome_dto_1.SendWelcomeDto; } });
var send_reset_password_dto_1 = require("../DTO/send-reset-password.dto");
Object.defineProperty(exports, "SendResetPasswordDto", { enumerable: true, get: function () { return send_reset_password_dto_1.SendResetPasswordDto; } });
var send_newsletter_dto_1 = require("../DTO/send-newsletter.dto");
Object.defineProperty(exports, "SendNewsletterDto", { enumerable: true, get: function () { return send_newsletter_dto_1.SendNewsletterDto; } });
var send_email_dto_1 = require("../DTO/send-email-dto");
Object.defineProperty(exports, "SendEmailDto", { enumerable: true, get: function () { return send_email_dto_1.SendEmailDto; } });
let EmailModule = class EmailModule {
};
exports.EmailModule = EmailModule;
exports.EmailModule = EmailModule = __decorate([
    (0, common_1.Module)({
        controllers: [
            emails_controller_1.EmailsController
        ],
        providers: [
            rabbitmq_config_1.RabbitMQService,
            email_config_1.EmailConfigService,
            email_service_1.EmailService,
            queue_service_1.QueueService,
            email_worker_1.EmailWorker
        ],
        exports: [
            queue_service_1.QueueService
        ]
    })
], EmailModule);
//# sourceMappingURL=email.module.js.map