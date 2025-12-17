import { Counter, Histogram } from 'prom-client';
export declare class MetricsService {
    private registry;
    emailProcessed: Counter<string>;
    emailSuccess: Counter<string>;
    emailFailure: Counter<string>;
    emailRetry: Counter<string>;
    emailDuration: Histogram<string>;
    sentryErrors: Counter<string>;
    constructor();
    getMetrics(): Promise<string>;
}
