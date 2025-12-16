import { Module } from "@nestjs/common";
import { EmailConfigService } from "src/common/config/email.config";
import { RabbitMQService } from "src/common/config/rabbitmq.config";
import { EmailsController } from "src/controller/emails.controller";
import { EmailService } from "src/Services/email.service";
import { QueueService } from "src/Services/queue.service";
import { EmailWorker } from "src/workers/email.worker";
export { SendWelcomeDto } from 'src/DTO/send-welcome.dto';
export { SendResetPasswordDto } from 'src/DTO/send-reset-password.dto';
export { SendNewsletterDto } from 'src/DTO/send-newsletter.dto';
export { SendEmailDto } from 'src/DTO/send-email-dto';

@Module({
    controllers: [ 
        EmailsController
    ],
    providers: [
        //configs
        RabbitMQService,
        EmailConfigService,
        
        //services que dependem das configs
        EmailService,
        QueueService,
        
        //depende detudo
        EmailWorker
    ],
    exports: [
       QueueService //exportar para outros modulos usarem
    ]
})
export class EmailModule {}
