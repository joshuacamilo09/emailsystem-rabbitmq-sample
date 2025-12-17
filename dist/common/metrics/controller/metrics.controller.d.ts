import { MetricsService } from "../metrics.service";
import type { Response } from "express";
export declare class MetricsController {
    private readonly metrics;
    constructor(metrics: MetricsService);
    getMetrics(res: Response): Promise<void>;
    getmetrics(): Promise<string>;
}
