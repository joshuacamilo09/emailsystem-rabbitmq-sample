import { Module } from "@nestjs/common";
import { EmailConfigService } from "src/common/config/email.config";
import { RabbitMQService } from "src/common/config/rabbitmq.config";
import { MetricsController } from "src/common/metrics/controller/metrics.controller";
import { MetricsService } from "src/common/metrics/metrics.service";
import { EmailsController } from "src/email/controller/emails.controller";
import { EmailService } from "src/Services/email.service";
import { QueueService } from "src/Services/queue.service";
import { EmailWorker } from "src/workers/email.worker";
export { SendWelcomeDto } from 'src/DTO/send-welcome.dto';
export { SendResetPasswordDto } from 'src/DTO/send-reset-password.dto';
export { SendNewsletterDto } from 'src/DTO/send-newsletter.dto';
export { SendEmailDto } from 'src/DTO/send-email-dto';

@Module({
    controllers: [ 
        EmailsController,
        MetricsController
    ],
    providers: [
        //configs
        RabbitMQService,
        EmailConfigService,
        
        //services que dependem das configs
        EmailService,
        QueueService,
        
        //depende detudo
        EmailWorker,

        MetricsService,
    ],
    exports: [
       QueueService, //exportar para outros modulos usarem
       MetricsService,
    ]
})
export class EmailModule {}
