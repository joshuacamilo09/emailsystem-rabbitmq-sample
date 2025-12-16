import { EmailType } from 'src/common/types/email.types';
export declare class SendEmailDto {
    to: string | string[];
    type: EmailType;
    data: Record<string, any>;
    priority?: 'high' | 'normal' | 'low';
}
