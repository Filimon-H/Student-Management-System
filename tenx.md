# Scheduling & Background Jobs Research for Import Module (V2)

> **Our use case:** Intermittent bulk imports of modules/challenge docs into Strapi. The server is **not always on**. Imports can range from 3 modules to 100k+. We need scheduling (one-time + recurring), retries, progress tracking, and a Job Center UI.

---

## 1. How Scheduling Works (Core Concepts)

Every scheduling system has these building blocks:

- **Scheduler** -- decides *when* to run a task (cron expression, one-time date, interval).
- **Queue / Broker** -- holds tasks waiting to be executed (Redis, SQS, RabbitMQ).
- **Worker** -- a process that pulls tasks from the queue and executes them.
- **Job Store** -- records job status, progress, logs (database or content-type).
- **Trigger** -- what causes a task to run (time-based, event-based, manual).

### Flow (universal)

```
Scheduler (time-based trigger)
    |
    v
Creates a Job record (status=QUEUED) + pushes message to Queue
    |
    v
Worker pulls message from Queue
    |
    v
Worker executes task (e.g., import chunk into Strapi)
    |
    v
Worker updates Job Store (progress, success/failure)
```

---

## 2. Methods Compared

### A. Celery + Redis (+ Celery Beat for scheduling)

**What it is:**
Celery is the most popular Python distributed task queue. It uses a "broker" (Redis or RabbitMQ) to pass messages between your app and worker processes. **Celery Beat** is Celery's built-in scheduler for periodic/recurring tasks.

**How it works:**
1. FastAPI app calls `task.delay(args)` to enqueue a task.
2. Celery serializes the task and pushes it to Redis (the broker).
3. A Celery worker process (running separately) picks up the task and executes it.
4. Results/status are stored in the "result backend" (also Redis, or a DB).
5. **Celery Beat** runs as a separate process that checks a schedule and enqueues tasks at the right time.

**Pros:**
- Mature, battle-tested (used by Instagram, Mozilla, Stripe).
- Built-in scheduling via Celery Beat (cron expressions, intervals).
- Built-in retry with exponential backoff.
- Task routing, priority queues, rate limiting.
- Rich monitoring via **Flower** dashboard.
- Works with FastAPI (well-documented pattern).
- Supports multiple brokers: Redis, RabbitMQ, SQS.

**Cons:**
- **Requires always-on processes**: at least 1 worker + 1 beat process + Redis server. If the server is off, no tasks run and no schedules fire.
- More complex setup and configuration vs simpler alternatives.
- Redis is in-memory by default; if Redis crashes without persistence, queued tasks can be lost.
- Learning curve for advanced features (task chains, groups, chords).

**Best for:** Teams that need robust scheduling + retries + monitoring and can keep worker processes running.

> **Source:** [Judoscale - Choosing The Right Python Task Queue](https://judoscale.com/blog/choose-python-task-queue), [TestDriven.io - FastAPI and Celery](https://testdriven.io/blog/fastapi-and-celery/)

---

### B. Redis + RQ (Redis Queue)

**What it is:**
RQ is a lightweight Python task queue that uses Redis as both queue and result store. It's the simpler alternative to Celery.

**How it works:**
1. FastAPI app calls `queue.enqueue(func, args)`.
2. RQ serializes and pushes to Redis.
3. An RQ worker process picks up and runs the task.
4. For scheduling, you need an additional package (`rq-scheduler`) since RQ doesn't have built-in periodic task support.

**Pros:**
- Very simple API and setup.
- Easy to learn (minimal configuration).
- If you already run Redis, no new infrastructure needed.
- Good for small-to-medium workloads.

**Cons:**
- **No built-in scheduler** -- requires `rq-scheduler` (extra dependency).
- **Requires always-on processes**: worker + Redis + scheduler process.
- Slower than Celery at high volume (benchmark: 51s vs 12s for 20k tasks with 10 workers).
- Less reliable: if an RQ worker crashes mid-task, the task can be lost (Redis doesn't guarantee delivery like RabbitMQ).
- Python-only (not cross-language).
- Fewer monitoring tools than Celery.

**Best for:** Small teams wanting the simplest possible background job setup, already using Redis.

> **Source:** [Judoscale - Choosing The Right Python Task Queue](https://judoscale.com/blog/choose-python-task-queue)

---

### C. AWS SQS + Lambda (Serverless)

**What it is:**
AWS SQS (Simple Queue Service) is a fully managed message queue. AWS Lambda is serverless compute that runs your code only when triggered. **EventBridge Scheduler** handles time-based scheduling.

**How it works:**
1. FastAPI app sends a message to an SQS queue (via `boto3`).
2. AWS Lambda is configured with an **SQS trigger** -- it automatically runs when messages arrive.
3. Lambda executes the import logic (e.g., import a chunk into Strapi).
4. For scheduling: **Amazon EventBridge Scheduler** triggers a Lambda (or puts a message in SQS) at scheduled times using cron expressions.
5. Failed messages go to a **Dead Letter Queue (DLQ)** after N retries.

**Pros:**
- **No always-on server required.** Lambda only runs when triggered. If there's no work, you pay nothing.
- **Fully managed.** No Redis/worker/beat processes to maintain.
- **Auto-scales.** Lambda scales to thousands of concurrent executions automatically.
- **Built-in DLQ** for failed messages (visibility into failures).
- **EventBridge Scheduler** is fully managed cron -- runs even if your FastAPI server is off.
- **SQS persists messages** for up to 14 days (messages survive server restarts).
- **Pay-per-use** -- ideal for intermittent workloads.
- Our repo already uses AWS (boto3, SNS, SQS utilities in `leap_base.py`).

**Cons:**
- **Lambda has a 15-minute execution limit** -- long-running import chunks must be split small enough.
- **More AWS setup** (IAM roles, queue policies, DLQ configuration).
- **Harder to test locally** (need LocalStack or deploy to staging).
- **Cold starts** (first invocation after idle can be slow, ~1-5 seconds).
- **256KB message size limit** -- must use pointers (`{job_id, chunk_id}`) not full payloads.
- **Celery monitoring tools (Flower) don't work with SQS** -- you must build your own Job Center.
- Vendor lock-in to AWS.

**Best for:** Intermittent workloads where the server may be off, teams already on AWS, pay-per-use cost model.

> **Source:** [AWS Architecture Blog - Serverless Scheduling](https://aws.amazon.com/blogs/architecture/serverless-scheduling-with-amazon-eventbridge-aws-lambda-and-amazon-dynamodb/), [Jesse Duffield - Notes on Lambda](https://jesseduffield.com/Notes-On-Lambda/)

---

### D. APScheduler (In-Process Scheduler)

**What it is:**
APScheduler (Advanced Python Scheduler) is a lightweight Python library that runs scheduled tasks inside your application process. No external broker needed.

**How it works:**
1. You define jobs with triggers (cron, interval, date) in your FastAPI app.
2. APScheduler runs them in the same process (or in a thread pool).
3. Job definitions can be stored in memory, a database, or Redis.

**Pros:**
- Simplest setup -- just `pip install apscheduler`, no Redis/RabbitMQ needed.
- Good for simple periodic tasks (e.g., cleanup, sync).
- Supports cron, interval, and one-time triggers.
- Can persist jobs to a database (survives restart).

**Cons:**
- **Runs inside your app process** -- if the server is off, nothing runs.
- **Not distributed** -- doesn't scale across multiple workers/machines.
- **Not a task queue** -- no retry logic, no DLQ, no progress tracking built-in.
- Not suitable for heavy or long-running tasks (blocks your app).

**Best for:** Simple in-app periodic tasks (e.g., "clean up temp files every hour"). NOT for distributed import jobs.

> **Source:** [Leapcell - APScheduler vs Celery Beat](https://leapcell.io/blog/scheduling-tasks-in-python-apscheduler-vs-celery-beat)

---

### E. FastAPI BackgroundTasks (Built-in)

**What it is:**
FastAPI's built-in `BackgroundTasks` runs a function after returning the HTTP response, in the same process.

**Pros:**
- Zero setup. Built into FastAPI.
- Good for lightweight fire-and-forget tasks (send email, log event).

**Cons:**
- **No queue, no retries, no scheduling.**
- **Runs in the same process** -- heavy tasks block other requests.
- **No persistence** -- if the server crashes, the task is lost.
- **No progress tracking.**

**Best for:** Tiny post-response tasks only. NOT for imports.

> **Source:** [FastAPI docs - Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)

---

## 3. Comparison Table

| Feature | Celery+Redis | RQ+Redis | AWS SQS+Lambda | APScheduler | FastAPI BG |
|---|---|---|---|---|---|
| **Works when server is OFF** | No | No | **Yes** | No | No |
| **Built-in scheduling** | Yes (Beat) | No (needs plugin) | Yes (EventBridge) | Yes | No |
| **Auto-scales** | Manual (add workers) | Manual | **Automatic** | No | No |
| **Retries + DLQ** | Yes | Basic | **Yes (built-in DLQ)** | No | No |
| **Message durability** | Redis (volatile) | Redis (volatile) | **SQS (14 days)** | DB (if configured) | None |
| **Monitoring** | Flower dashboard | Basic | CloudWatch + custom | None | None |
| **Setup complexity** | Medium-High | Low | Medium | Very Low | Zero |
| **Cost when idle** | Server cost | Server cost | **$0** | Server cost | Server cost |
| **Max task duration** | Unlimited | Unlimited | 15 min (Lambda) | Unlimited | Unlimited |
| **Performance at scale** | High | Medium | High | Low | Low |
| **Python ecosystem** | Excellent | Good | Good (boto3) | Good | Built-in |
| **Already in our repo** | No | No | **Partial (boto3, SNS/SQS utils)** | No | Yes |

---

## 4. Our Specific Constraints

1. **Server is not always on** -- this is the most critical constraint. Celery Beat, RQ scheduler, and APScheduler all **require** an always-on process to fire scheduled tasks. If the server is off, they do nothing.

2. **Imports are intermittent** -- we don't import every day. Could be once a week, or 3 times in one day. Pay-per-use is ideal.

3. **Scale requirement** -- must handle 100k+ modules eventually (chunked).

4. **Existing AWS usage** -- the repo already uses `boto3`, `aws_utils`, SNS, and SQS patterns in `leap_base.py`.

5. **No existing Redis or Celery setup** in the repo currently.

6. **FastAPI backend** -- any solution must integrate with FastAPI.

---

## 5. Recommendation for Our Case

### Primary: AWS SQS + Lambda + EventBridge Scheduler

**Why this is the best fit:**

1. **Server can be off.** EventBridge Scheduler fires on time regardless of whether your FastAPI server is running. Lambda wakes up only when triggered. No always-on worker needed.

2. **Pay nothing when idle.** Since imports are intermittent, you only pay when work is actually happening. With Celery/RQ, you'd pay for Redis + worker processes 24/7 even when no imports are running.

3. **Already partially in the repo.** `leap_base.py` already has `boto3`, `sns`, `sqs`, `publish_to_sqs` utilities. Adding SQS queues and Lambda functions extends what's already there.

4. **Built-in failure handling.** SQS has native DLQ (Dead Letter Queue). After N failed attempts, messages go to the DLQ for inspection. No custom retry logic needed at the queue level.

5. **Auto-scales.** Lambda automatically scales to handle thousands of concurrent chunk imports if needed.

6. **EventBridge Scheduler** supports one-time schedules, recurring cron, and rate-based schedules -- all fully managed.

### How it would work for us:

```
User creates a scheduled import (UI)
    |
    v
API stores schedule in job store (Strapi content-type or DynamoDB)
    |
    v
EventBridge Scheduler fires at scheduled time
    |
    v
Triggers a "Dispatcher" Lambda
    |
    v
Dispatcher creates ImportJob record + splits into chunks
    |
    v
Puts chunk messages into SQS queue: {job_id, chunk_id}
    |
    v
"Worker" Lambda(s) auto-triggered by SQS
    |
    v
Each Lambda imports one chunk into Strapi
    |
    v
Updates ImportJob progress in job store
    |
    v
Failed chunks go to DLQ for retry
```

### Limitations to plan for:
- **15-min Lambda limit:** keep chunks small enough (200-500 modules/chunk).
- **Job Store still needed:** SQS doesn't track progress. Use Strapi content-types or DynamoDB for `import_jobs`, `import_job_chunks`, `import_job_events`.
- **Local dev:** use LocalStack or a staging AWS environment for testing.

---

### Fallback / Alternative: Celery + Redis

Use this if:
- You want to avoid AWS vendor lock-in.
- You can guarantee the server (or at least a worker container) is always running.
- You prefer Flower dashboard over building a custom Job Center.

**Setup required:**
- Redis server (Docker service or managed like AWS ElastiCache)
- Celery worker process (Docker container)
- Celery Beat process (for scheduling)
- All 3 must be running for the system to work.

---

## 6. Hybrid Approach (Best of Both Worlds)

You can also combine:
- **EventBridge Scheduler** for firing schedules (works when server is off).
- **SQS** for the queue (durable, managed).
- **Your FastAPI server as the worker** (polls SQS when it's running) -- OR -- **Lambda as the worker** (serverless, auto-scales).

This gives you flexibility:
- Schedules always fire (EventBridge).
- If the server is on, it can process jobs directly.
- If the server is off, Lambda handles it.

---

## 7. Summary (Decision Matrix for Our Case)

| Criteria | Winner |
|---|---|
| Server can be off | **SQS + Lambda + EventBridge** |
| Cheapest when idle | **SQS + Lambda** (pay $0 when idle) |
| Easiest to set up | RQ + Redis |
| Best monitoring out-of-box | Celery (Flower) |
| Best for massive scale | **SQS + Lambda** (auto-scales) |
| Already partially in our repo | **SQS + Lambda** (boto3/aws_utils exist) |
| Most reliable message delivery | **SQS** (14-day persistence + DLQ) |

### Final recommendation: AWS SQS + Lambda + EventBridge Scheduler

This is the best match for our specific constraints: intermittent imports, server not always on, existing AWS usage, and future scale to 100k+ modules.

---

## 8. References

- [Judoscale - Choosing The Right Python Task Queue](https://judoscale.com/blog/choose-python-task-queue)
- [TestDriven.io - Asynchronous Tasks with FastAPI and Celery](https://testdriven.io/blog/fastapi-and-celery/)
- [AWS Architecture Blog - Serverless Scheduling with EventBridge, Lambda, DynamoDB](https://aws.amazon.com/blogs/architecture/serverless-scheduling-with-amazon-eventbridge-aws-lambda-and-amazon-dynamodb/)
- [Jesse Duffield - My Notes from Deciding Against AWS Lambda](https://jesseduffield.com/Notes-On-Lambda/)
- [Leapcell - APScheduler vs Celery Beat](https://leapcell.io/blog/scheduling-tasks-in-python-apscheduler-vs-celery-beat)
- [FastAPI Docs - Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [Reddit r/django - SQS over Redis/RabbitMQ with Celery](https://www.reddit.com/r/django/comments/15j4fbp/)
- [Reddit r/Python - Modern Async Task Processing for FastAPI](https://www.reddit.com/r/Python/comments/1nkfhmy/)