export declare enum EmailType {
    WELCOME = "welcome",
    RESET_PASSWORD = "reset_password",
    NEWSLETTER = "newsletter",
    NOTIFICATION = "notification"
}
export interface EmailPayload {
    to: string | string[];
    type: EmailType;
    data: Record<string, any>;
    priority?: 'high' | 'normal' | 'low';
}
export interface EmailJob extends EmailPayload {
    id: string;
    attempts: number;
    createdAt: Date;
    lastAttemptAt?: Date;
}
export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export interface WelcomeEmailData {
    userName: string;
    activationLink?: string;
}
export interface ResetPasswordData {
    userName: string;
    resetLink: string;
    expiresIn: string;
}
export interface NewsletterData {
    title: string;
    content: string;
    unsubscribeLink: string;
}
export interface QueueStats {
    queueName: string;
    messageCount: number;
    consumerCount: number;
}
