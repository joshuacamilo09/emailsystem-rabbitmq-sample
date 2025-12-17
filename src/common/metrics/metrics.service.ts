import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics
} from 'prom-client';
import * as Sentry from '@sentry/node';

//infra de observalidade
export class MetricsService {
  private registry: Registry;

  emailProcessed: Counter<string>;
  emailSuccess: Counter<string>;
  emailFailure: Counter<string>;
  emailRetry: Counter<string>;
  emailDuration: Histogram<string>;
  sentryErrors: Counter<string>;

  constructor() {
    this.registry = new Registry();

    collectDefaultMetrics({ register: this.registry });

    this.emailProcessed = new Counter({
      name: 'email_processed_total',
      help: 'Total de emails processados',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.emailSuccess = new Counter({
      name: 'email_success_total',
      help: 'Emails enviados com sucesso',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.emailFailure = new Counter({
      name: 'email_failure_total',
      help: 'Falhas no envio de emails',
      labelNames: ['type', 'reason'],
      registers: [this.registry],
    });

    this.emailRetry = new Counter({
      name: 'email_retry_total',
      help: 'Retries de emails',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.emailDuration = new Histogram({
      name: 'email_processing_duration_seconds',
      help: 'Tempo de processamento do email',
      labelNames: ['type'],
      buckets: [0.2, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    this.sentryErrors = new Counter({
        name: 'sentry_errors_total',
        help: 'Total de erros no Sentry',
        labelNames: ['reason'],
        registers: [this.registry],
    })

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