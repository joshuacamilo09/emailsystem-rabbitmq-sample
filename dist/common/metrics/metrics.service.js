"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const prom_client_1 = require("prom-client");
const Sentry = __importStar(require("@sentry/node"));
class MetricsService {
    registry;
    emailProcessed;
    emailSuccess;
    emailFailure;
    emailRetry;
    emailDuration;
    sentryErrors;
    constructor() {
        this.registry = new prom_client_1.Registry();
        (0, prom_client_1.collectDefaultMetrics)({ register: this.registry });
        this.emailProcessed = new prom_client_1.Counter({
            name: 'email_processed_total',
            help: 'Total de emails processados',
            labelNames: ['type'],
            registers: [this.registry],
        });
        this.emailSuccess = new prom_client_1.Counter({
            name: 'email_success_total',
            help: 'Emails enviados com sucesso',
            labelNames: ['type'],
            registers: [this.registry],
        });
        this.emailFailure = new prom_client_1.Counter({
            name: 'email_failure_total',
            help: 'Falhas no envio de emails',
            labelNames: ['type', 'reason'],
            registers: [this.registry],
        });
        this.emailRetry = new prom_client_1.Counter({
            name: 'email_retry_total',
            help: 'Retries de emails',
            labelNames: ['type'],
            registers: [this.registry],
        });
        this.emailDuration = new prom_client_1.Histogram({
            name: 'email_processing_duration_seconds',
            help: 'Tempo de processamento do email',
            labelNames: ['type'],
            buckets: [0.2, 0.5, 1, 2, 5],
            registers: [this.registry],
        });
        this.sentryErrors = new prom_client_1.Counter({
            name: 'sentry_errors_total',
            help: 'Total de erros no Sentry',
            labelNames: ['reason'],
            registers: [this.registry],
        });
        Sentry.addEventProcessor((event) => {
            if (event.exception && event.exception.values && event.exception.values.length > 0) {
                const exceptionMessage = event.exception.values[0].value || 'unknown';
                this.sentryErrors.inc({ reason: exceptionMessage });
            }
            return event;
        });
    }
    getMetrics() {
        return this.registry.metrics();
    }
}
exports.MetricsService = MetricsService;
//# sourceMappingURL=metrics.service.js.map