# Asynchronous Email Service (NestJS + RabbitMQ)

An email service that takes email sending out of the request path: the API validates the request, puts a job on a **RabbitMQ** queue and answers `202 Accepted` immediately, while a background **worker** renders the template and sends it over SMTP, with **retry**, a **dead-letter queue** and **Prometheus metrics**.

## Why

Sending an email inside an HTTP request makes the user wait for the SMTP server and loses the email if that server fails. With a queue:

- the API responds in milliseconds, whatever the SMTP latency;
- jobs survive restarts (durable queue + persistent messages);
- failures are retried, and emails that keep failing are parked in a DLQ instead of disappearing;
- the worker can be scaled separately from the API.

## Architecture

```
 client ──POST /api/emails/*──▶ EmailsController ──▶ QueueService (producer)
                │                                        │ persistent message, priority 1–10
                ◀── 202 { jobId }                        ▼
                                              ┌──────────────────────────┐   2nd failure   ┌────────────────────┐
                                              │ queue: emails (durable)  │ ──────────────▶ │ DLQ: emails_failed │
                                              │ x-max-priority = 10      │   dead-letter   └────────────────────┘
                                              └────────────┬─────────────┘
                                                           ▼
                                              EmailWorker (consumer) ──▶ EmailService ──▶ SMTP (Nodemailer)
                                                           │
                                                           ▼
                                              MetricsService (prom-client) ──▶ GET /api/metrics ──▶ Prometheus ──▶ Grafana
```

**Delivery rules**

1. A job is **acked** only after the email was sent.
2. On the first failure the message is **requeued** (retry).
3. If the redelivery fails too, it is **nacked without requeue** and RabbitMQ routes it to the **dead-letter queue**.

**Priorities**: password resets are sent with priority 10, welcome emails 5 and newsletters 1, so a newsletter blast never delays a password reset.

## API

Prefix: `/api`

| Method | Path | Description |
|---|---|---|
| `POST` | `/emails/welcome` | Welcome email (`to`, `userName`, `activationLink`) |
| `POST` | `/emails/reset-password` | Password reset email, high priority |
| `POST` | `/emails/newsletter` | One job per recipient, low priority |
| `POST` | `/emails/send` | Generic email by type |
| `GET` | `/emails/stats` | Messages and consumers on the main queue and on the DLQ |
| `GET` | `/metrics` | Prometheus metrics |

All bodies are validated with `class-validator` (emails, URLs, arrays); unknown fields are rejected.

## Observability

Custom metrics exposed at `/api/metrics`, plus the default Node.js process metrics:

| Metric | Type | Labels |
|---|---|---|
| `email_processed_total` | counter | `type` |
| `email_success_total` | counter | `type` |
| `email_failure_total` | counter | `type`, `reason` |
| `email_retry_total` | counter | `type` |
| `email_processing_duration_seconds` | histogram | `type` |

Unhandled exceptions go through a global filter that reports them to **Sentry** (optional, enabled when `SENTRY_DSN` is set).

## Running locally

Requirements: Node.js 20+, Docker, and SMTP credentials (for Gmail, an [App Password](https://support.google.com/accounts/answer/185833)).

```bash
cp .env.example .env     # SMTP credentials go here, never in the code
docker compose up -d     # RabbitMQ, Prometheus, Grafana
npm install
npm run start:dev        # API on http://localhost:3000/api
```

| Service | URL |
|---|---|
| API | http://localhost:3000/api |
| RabbitMQ management | http://localhost:15672 (guest / guest) |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 (admin / `GRAFANA_ADMIN_PASSWORD`, default `admin`) |

Example:

```bash
curl -X POST http://localhost:3000/api/emails/welcome \
  -H "Content-Type: application/json" \
  -d '{"to":"someone@example.com","userName":"Ana","activationLink":"https://example.com/activate"}'
# → 202 { "success": true, "jobId": "..." }
```

## Tech stack

TypeScript · NestJS 11 · RabbitMQ (amqplib) · Nodemailer · class-validator · prom-client · Prometheus · Grafana · Sentry · Docker Compose
