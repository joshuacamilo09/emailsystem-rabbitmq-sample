import { Controller, Get, Res } from "@nestjs/common";
import { MetricsService } from "../metrics.service";
import type { Response } from "express";

@Controller('metrics')
export class MetricsController {
    constructor(private readonly metrics: MetricsService) {}

    @Get()
    async getMetrics(@Res() res: Response) {
        res.set('Content-Type', 'text/plain'); 
        res.send(await this.metrics.getMetrics());
    }

    @Get('sentry')
    async getmetrics() {
        return this.metrics.getMetrics();
    }
}
//esse é o endpoint que o Prometheus vai "raspar".