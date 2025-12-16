import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter } from 'nodemailer';
export declare class EmailConfigService implements OnModuleInit {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private createTransporter;
    getTransporter(): Transporter;
    verify(): Promise<boolean>;
}
