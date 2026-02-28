# Endeavour Loyalty Platform — Complete Beginner's Guide

---

## 1) Project Summary (Big Picture)

### What is this?

- **Endeavour** is a **loyalty program platform** — think airline miles, coffee shop reward cards, or hotel points programs. It lets businesses create and manage loyalty programs for their customers.
- It was built by a company called **Aimia** (later rebranded/associated with "GA" in the code — `com.ga.endeavour`).
- The system manages **members** (people in the loyalty program), **partners** (businesses like airlines or shops), **interactions** (when a member earns or spends points), **rewards** (things members can redeem points for), and **rules** (business logic like "spend $1 = earn 5 points").
- It exposes **REST APIs** — which means other software (web apps, mobile apps, call centres) talks to it over HTTP, sending and receiving JSON data.
- It uses **Java 8**, **Spring Framework** (not Spring Boot), **Hibernate** (for database access), **RESTEasy** (for REST APIs), **MySQL** (main database), **MongoDB** (document storage), **ActiveMQ** (message queue), and **Solr** (search).
- It runs inside an embedded **Jetty** web server during development.
- The entire system is a collection of ~10 separate Git repositories, each containing one or more Maven modules. All together there are **50+ Maven modules**.

### Is this Spring Boot?

No.

- **Simple words:** This app is an "old-school" Spring web app. Instead of one magic "start" class, it uses a **big XML checklist** to tell Spring what to load.
- **Real technical terms:** **Spring Framework (XML-based), Servlet web application packaged as a WAR, RESTEasy (JAX-RS)**.

#### What those words mean (with a kid-level analogy)

##### Spring Framework (XML-based)

> **Simple:** Spring is the "helper" that builds your objects and plugs them together.
> **Real term:** Spring does **dependency injection** (it creates your objects—"beans"—and wires dependencies).

In this repo, a lot of that wiring is configured in **XML** files (instead of annotations only).

- **Where it lives:** Spring is bootstrapped from
  - `/Users/macbookpro/aimia/infrastructure/endeavour-application/endeavour-application-web/src/main/webapp/WEB-INF/web.xml`
  - plus many `*-applicationContext.xml` files, e.g.
    - `/Users/macbookpro/aimia/infrastructure/endeavour-application/endeavour-administration/src/main/resources/administration-applicationContext.xml`
    - `/Users/macbookpro/aimia/infrastructure/endeavour-application/endeavour-member-repository/src/main/resources/member-applicationContext.xml`

##### Servlet container deployment (WAR)

> **Simple:** A WAR is a "packed lunch box" containing the web app.
> **Real term:** A **WAR** is a deployable archive for a **Servlet container** (like Jetty/Tomcat).

This module builds a WAR:
- **Where it lives:** `/Users/macbookpro/aimia/infrastructure/endeavour-application/endeavour-application-web/pom.xml` (`<packaging>war</packaging>`)

##### RESTEasy (JAX-RS)

> **Simple:** This is the thing that turns an HTTP URL into a Java method call.
> **Real term:** **JAX-RS** is a Java standard for REST APIs, and **RESTEasy** is the library implementing it.

You can see JAX-RS annotations like `@Path`, `@GET`, `@POST` in resources:
- **Where it lives:** `/Users/macbookpro/aimia/infrastructure/endeavour-application/endeavour-application-resource/src/main/java/com/ga/endeavour/app/resource/administration/CountryResource.java`

#### Analogy: “Manual kitchen vs automatic kitchen”

- **This repo today (Spring + XML + WAR):** Like a kitchen where you have to write a long checklist:
  - "Turn on oven"
  - "Bring plates"
  - "Assign cooks"
  - "Wire the order printer"
  That checklist is your `web.xml` + many Spring XML context files.

- **If it were Spring Boot:** Like a modern kitchen kit where most things auto-start when you plug it in.

#### If this repo used Spring Boot, what could be easier / reduced?

- **Less manual configuration**
  - Today you have many XML config files and `web.xml`.
  - In Spring Boot, most defaults are provided by **auto-configuration**.

- **No `web.xml` (usually)**
  - Boot typically starts from a single `main()` class annotated with `@SpringBootApplication`.
  - Boot uses embedded server configuration instead of servlet descriptor wiring.

- **Simpler dependency management**
  - Boot uses **"starters"** (e.g., `spring-boot-starter-web`, `spring-boot-starter-data-jpa`) so you don’t manually list many low-level dependencies.

- **One main config file instead of scattered properties**
  - Boot usually centralizes configuration in `application.properties` or `application.yml` with profiles like `application-dev.yml`.
  - This repo uses many `.properties` + profile logic + `/etc/endeavour/` overrides.

- **Easier local running**
  - Boot apps usually run as a single command like `mvn spring-boot:run` or `java -jar app.jar`.
  - This repo runs as a WAR on Jetty via `mvn jetty:run`.

- **More standard REST stack (usually Spring MVC)**
  - Boot commonly uses Spring MVC annotations (`@RestController`, `@RequestMapping`).
  - This repo uses RESTEasy + JAX-RS annotations.

### The "Restaurant" Story

Imagine Endeavour is a **chain of restaurants with a loyalty card program**:

1. A **customer walks in** (a Member enrolls via the Gateway).
2. The **front desk checks their ID** (the Identity service authenticates them with OAuth2).
3. They **order food** (an Interaction is submitted — e.g., "bought a $50 meal at Partner X").
4. The **kitchen** processes the order (the Application service receives the interaction, the Rules Engine calculates points).
5. The **cashier** updates their loyalty card balance (the Points Bank credits/debits points).
6. If they want to **redeem points for a free dessert**, the Reward Provider service handles that.
7. The **manager's office** (Configuration service) decides the rules: how many points per dollar, what rewards are available, etc.
8. The **marketing department** (Marketing service) runs campaigns and sends emails.
9. All the **receipts and records** are stored in MySQL (the database).

---

## 2) Repo Tour (Folder Map)

> **What is a "repository" (repo)?** A repo is a folder of code tracked by Git (a version control tool). This project has multiple repos, all living under one parent folder.

```
/Users/macbookpro/aimia/
├── infrastructure/                         # <-- All the Git repos live here
│   ├── dev-env-setup/                      # Scripts & Docker config for local dev
│   │   ├── docker-compose.yml              # Defines MySQL, Mongo, ActiveMQ, Solr containers
│   │   ├── buildAllTheThings.sh            # Master setup script (clones repos, starts Docker)
│   │   ├── scripts/                        # DB population scripts
│   │   │   └── populate_mysql.sh           # Runs all DB migrations
│   │   └── maven/setting.xml              # Maven settings pointing to internal Artifactory
│   │
│   ├── endeavour-root/                     # Top-level parent POM (version: 21.2.17-SNAPSHOT)
│   ├── endeavour-parent/                   # Shared parent POM with all dependency versions
│   ├── endeavour-platform/                 # Shared libraries used by ALL other services
│   │   ├── endeavour-commons-types/        # Common Java types & enums
│   │   ├── endeavour-commons-rest/         # REST utilities (interceptors, filters)
│   │   ├── endeavour-commons-security/     # Security (OAuth2, permissions)
│   │   ├── endeavour-platform-service/     # Base service layer helpers
│   │   ├── endeavour-platform-validation/  # Validation framework
│   │   ├── endeavour-platform-event/       # Event publishing (JMS/ActiveMQ)
│   │   ├── endeavour-platform-hibernate/   # Hibernate (DB) utilities
│   │   └── ... (30+ more modules)
│   │
│   ├── endeavour-application/              # ★ THE MAIN SERVICE (loyalty program core)
│   │   ├── endeavour-administration/       # Admin domain: countries, partners, programs
│   │   ├── endeavour-member-repository/    # Member domain: member profiles, addresses
│   │   ├── endeavour-application-resource/ # REST API endpoints (controllers)
│   │   ├── endeavour-application-mediator/ # Business logic layer (services)
│   │   ├── endeavour-application-repository/ # DB migrations (SQL scripts)
│   │   ├── endeavour-application-web/      # WAR packaging + Jetty config (entry point)
│   │   ├── endeavour-earningcode-service/  # Earning code management
│   │   ├── endeavour-pointsbank-service/   # Points balance tracking
│   │   ├── endeavour-recognition-service/  # Member recognition features
│   │   ├── endeavour-batch-slave/          # Batch job worker
│   │   ├── rewards/                        # Reward catalog management
│   │   └── endeavour-commons/              # Shared config (DB URL, credentials)
│   │
│   ├── endeavour-identity/                 # OAuth2 authentication & authorization service
│   │   ├── endeavour-identity-core/        # Core domain: clients, roles, scopes
│   │   ├── endeavour-identity-authentication-project/  # Auth endpoints
│   │   └── endeavour-identity-configuration-project/   # Identity config
│   │
│   ├── endeavour-gateway/                  # Data ingestion gateway (receives external events)
│   │   ├── endeavour-gateway-core/         # Core gateway logic
│   │   ├── endeavour-gateway-payload/      # Payload DTOs for gateway
│   │   ├── endeavour-gateway-data-mart/    # Reporting data warehouse
│   │   ├── endeavour-gateway-email-project/# Email sending
│   │   └── ... (15+ adaptor modules)
│   │
│   ├── endeavour-batch/                    # Batch processing (bulk data jobs)
│   │   ├── endeavour-batch-core/           # Core batch framework
│   │   └── endeavour-batch-master/         # Batch job orchestrator
│   │
│   ├── endeavour-configuration/            # Program configuration UI + API
│   │   └── endeavour-configuration-web/    # Config web app (port 8908)
│   │
│   ├── endeavour-marketing/                # Marketing campaigns & communications
│   │   └── endeavour-marketing-web/        # Marketing web app (port 8955)
│   │
│   ├── endeavour-buildutils/               # Internal Maven build plugins
│   ├── endeavour-shared/                   # Shared resources across modules
│   └── infrastructure/                     # AWS deployment scripts (not for local dev)
│
├── data/                                   # Docker volume data (MySQL files)
├── dev.md                                  # Developer notes (how to run each service)
├── fix.md                                  # Known fixes and workarounds
└── build-all.sh                            # Script to build all modules in order
```

### What each top folder is for

- **`dev-env-setup/`** — Everything you need to spin up the local development environment: Docker containers, database population scripts, Maven settings. **Start here when setting up.**
- **`endeavour-root/`** + **`endeavour-parent/`** — These don't contain any "real" code. They're Maven POM files that define shared settings (Java version, library versions, plugin configurations) inherited by every other module. Think of them as a "recipe book" that all modules follow.
- **`endeavour-platform/`** — The **foundation library**. Every other service depends on this. It contains things like "how to talk to the database", "how to validate data", "how to secure an API", "how to publish events". **You must build this first.**
- **`endeavour-application/`** — The **heart of the system**. This is the main loyalty application that manages members, partners, points, rewards, and interactions. **This is the service you run with `mvn jetty:run`.**
- **`endeavour-identity/`** — Handles **login, authentication, and authorization** using OAuth2. Every API call to the other services must be authenticated through this.
- **`endeavour-gateway/`** — The **front door** for external data. When a partner (e.g., a retail store) sends transaction data ("Customer X bought $100 of products"), it comes in through the gateway.
- **`endeavour-batch/`** — Handles **bulk operations** like importing millions of member records from a CSV file, or running nightly point calculations.
- **`endeavour-configuration/`** — A **web UI** for administrators to configure loyalty programs (set up partners, define earning rules, create reward catalogs).
- **`endeavour-marketing/`** — A **web UI** for marketing teams to manage campaigns, segments, and communications.

---

## 3) Build System Basics (Maven)

### What is Maven?

**Maven** is a build tool for Java. Think of it like a chef's assistant that:
1. **Downloads ingredients** (library dependencies) from the internet.
2. **Follows a recipe** (the `pom.xml` file) to compile your Java code.
3. **Packages the result** into a JAR (a zip of compiled code) or WAR (a web application archive).
4. **Runs tests** to make sure nothing is broken.

### What is a `pom.xml`?

A **POM** (Project Object Model) is an XML file that tells Maven:
- **Who am I?** (`groupId`, `artifactId`, `version`) — e.g., `com.ga.endeavour.application:endeavour-application-web:21.2.17-SNAPSHOT`
- **What do I need?** (`dependencies`) — other libraries this project uses
- **How do I build?** (`plugins`) — special tools to use during compilation
- **Who is my parent?** (`parent`) — inherit settings from another POM

### What are Dependencies?

A **dependency** is a library (someone else's code) that your project uses. Instead of writing everything from scratch, you import pre-built libraries. For example:
- **Spring Framework** — handles wiring objects together (dependency injection) and web features
- **Hibernate** — talks to the database so you don't write raw SQL
- **RESTEasy** — turns Java methods into REST API endpoints
- **Jackson** — converts Java objects to/from JSON

### The Root POM

**File:** `/Users/macbookpro/aimia/infrastructure/endeavour-root/pom.xml`

This is the very top of the POM hierarchy. It defines:
- **Group:** `com.ga.endeavour`
- **Version:** `21.2.17-SNAPSHOT` (SNAPSHOT means "still in development, not yet released")
- **Artifactory URLs** for deploying/downloading internal artifacts

### The Parent POM

**File:** `/Users/macbookpro/aimia/infrastructure/endeavour-parent/pom.xml`

This is the most important POM. It defines **ALL** library versions used across the entire project:

| Dependency | Version | What it does |
|---|---|---|
| Spring Framework | 4.x | Dependency injection, web framework, security |
| Hibernate | 4.1.10 | Object-Relational Mapping (talks to MySQL) |
| RESTEasy | (managed) | JAX-RS REST API framework |
| Jackson | 2.2.3 | JSON serialization/deserialization |
| Joda-Time | (managed) | Date/time utilities (before Java 8's java.time) |
| Guava | 14.0.1 | Google's utility library (collections, caching) |
| JUnit | (managed) | Unit testing framework |
| Mockito | (managed) | Mocking framework for tests |
| MySQL Connector | 8.0.30 | JDBC driver for MySQL |
| EhCache | 2.5.2 | In-memory caching |
| Apache Camel | 2.12.1 | Integration/routing framework |
| SLF4J + Logback | (managed) | Logging |
| Java version | **1.8** | Java 8 is required |

### What is a Multi-Module Maven Project?

> A **multi-module project** is when one "parent" POM lists several sub-projects (modules) that are built together.

This entire repo is a **massive multi-module project**. For example, `endeavour-application/pom.xml` lists 14 modules:

```xml
<modules>
    <module>endeavour-administration</module>
    <module>endeavour-member-repository</module>
    <module>endeavour-earningcode-service</module>
    <module>rewards</module>
    <module>endeavour-pointsbank-service</module>
    <module>endeavour-recognition-service</module>
    <module>endeavour-application-mediator</module>
    <module>endeavour-application-resource</module>
    <module>endeavour-application-repository</module>
    <module>endeavour-batch-slave</module>
    <module>endeavour-application-distribution</module>
    <module>endeavour-application-web</module>
    <module>endeavour-commons</module>
    <module>endeavour-batch-aop</module>
    <module>endeavour-productstore-service</module>
</modules>
```

Maven builds them **in the correct order** based on their dependencies.

### How to Build & Run

```bash
# Set Java 8
export JAVA_HOME=$(/usr/libexec/java_home -v 1.8)

# 1. Build the platform (shared libraries) — must be first
cd $AIMIA/infrastructure/endeavour-platform
mvn install -DskipTests -DskipRpm

# 2. Build the main application
cd $AIMIA/infrastructure/endeavour-application
mvn install -DskipTests -DskipRpm

# 3. Run the application locally
cd $AIMIA/infrastructure/endeavour-application/endeavour-application-web
mvn jetty:run
# App starts on http://localhost:8090
```

> **Note:** `-DskipTests` skips running tests (faster), `-DskipRpm` skips creating Linux RPM packages.

---

## 4) Modules

### 4.1 `endeavour-platform` — The Foundation Library

**Path:** `/Users/macbookpro/aimia/infrastructure/endeavour-platform/`
**Group:** `com.ga.endeavour.platform`

**What it does:** Provides shared utilities that ALL other services depend on. It's like the "toolbox" every service reaches into.

**Key sub-modules:**

| Module | Path | Purpose |
|---|---|---|
| `endeavour-commons-types` | `endeavour-platform/endeavour-commons-types/` | Shared enums and types (MemberStatus, AddressChannelType, etc.) |
| `endeavour-commons-rest` | `endeavour-platform/endeavour-commons-rest/` | REST interceptors (`@NullTo404`), filters, hypermedia assemblers |
| `endeavour-commons-security` | `endeavour-platform/endeavour-commons-security/` | OAuth2 security, permission checking (`@PreAuthorize`) |
| `endeavour-platform-service` | `endeavour-platform/endeavour-platform-service/` | Base service layer with transaction support |
| `endeavour-platform-validation` | `endeavour-platform/endeavour-platform-validation/` | Validation framework (`ValidationResult`, `ValidationErrorException`) |
| `endeavour-platform-event` | `endeavour-platform/endeavour-platform-event/` | Event publishing to ActiveMQ (JMS) |
| `endeavour-platform-hibernate` | `endeavour-platform/endeavour-platform-hibernate/` | Hibernate helpers (custom types, HiLo ID generation) |
| `endeavour-platform-audit` | `endeavour-platform/endeavour-platform-audit/` | Audit logging (`@Auditable` annotation) |
| `endeavour-platform-payload` | `endeavour-platform/endeavour-platform-payload/` | Base payload (DTO) classes for REST responses |
| `endeavour-platform-caching` | `endeavour-platform/endeavour-platform-caching/` | EhCache integration |
| `endeavour-commons-jms` | `endeavour-platform/endeavour-commons-jms/` | JMS (ActiveMQ) messaging utilities |
| `endeavour-commons-mongo` | `endeavour-platform/endeavour-commons-mongo/` | MongoDB integration utilities |
| `endeavour-platform-testutils` | `endeavour-platform/endeavour-platform-testutils/` | Test helpers and base test classes |
| `endeavour-platform-config` | `endeavour-platform/endeavour-platform-config/` | Property file loading and profile configuration |

**Depends on:** Nothing internal (only third-party libraries).
**Depended on by:** Everything else.

---

### 4.2 `endeavour-application` — The Core Loyalty Service

**Path:** `/Users/macbookpro/aimia/infrastructure/endeavour-application/`
**Group:** `com.ga.endeavour.application`
**Runs on:** `http://localhost:8090`

**What it does:** The main service that manages the loyalty program. Handles member management, partner administration, earning/spending points, rewards, and interactions.

**Sub-modules (in dependency order):**

#### `endeavour-commons`
**Path:** `endeavour-application/endeavour-commons/`

Shared configuration for the application module. Contains `endeavour-application-config.properties` with the database connection URL:
```properties
config.jdbc.url=jdbc:mysql://mysql:3306/ods
config.jdbc.username=dev
config.jdbc.password=bobbins
```

#### `endeavour-administration`
**Path:** `endeavour-application/endeavour-administration/`
**Package:** `com.ga.endeavour.administration`

> **What is a "domain"?** In software, a "domain" is a specific area of business knowledge. The administration domain deals with setting up the loyalty program itself.

Contains domain entities (Java classes that map to database tables) for:
- **Country** — countries where the program operates
- **Partner** — businesses that participate (airlines, shops, etc.)
- **Operator** — call centre operators
- **InteractionType** — types of transactions (purchase, return, etc.)
- **Program** — loyalty programs
- **Dashboard** — admin dashboard metrics

Also contains persistence (database access) classes and validation logic.

#### `endeavour-member-repository`
**Path:** `endeavour-application/endeavour-member-repository/`
**Package:** `com.ga.endeavour.member`

The **member domain** — everything about loyalty program members:
- **Member** — a person enrolled in the loyalty program (has name, addresses, preferences)
- **Address** / **AddressChannel** — member contact information (email, postal, SMS)
- **GeneratedToken** — unique member identifiers (loyalty card numbers)
- **MemberPermissions** — what the member has opted into/out of

Uses **Hibernate JPA** entities (`@Entity`, `@Table`, `@Column`) mapped to MySQL tables.

#### `endeavour-application-mediator`
**Path:** `endeavour-application/endeavour-application-mediator/`
**Package:** `com.ga.endeavour.app.mediator`

> **What is a "mediator"?** In this codebase, a mediator is the **business logic layer** (what most projects call a "service" layer). It sits between the REST API and the database, coordinating operations.

Contains:
- **CountryOperations** — business logic for CRUD operations on countries
- **PartnerOperations** — business logic for partner management
- **MemberMediator** — member enrollment, update, search
- **InteractionMediator** — processing loyalty interactions (earning/spending points)
- **DashboardAspect** — dashboard data aggregation

**Pattern:** `Resource (controller) → Mediator (service) → Repository/Domain (database)`

#### `endeavour-application-resource`
**Path:** `endeavour-application/endeavour-application-resource/`
**Package:** `com.ga.endeavour.app.resource`

> **What is a "resource"?** In this codebase, a resource is a **REST API endpoint** (what most projects call a "controller"). It receives HTTP requests and returns HTTP responses.

Contains all the REST endpoints, organized into sub-packages:
- `resource/administration/` — CountryResource, PartnerResource, OperatorResource, ProgramResource, etc.
- `resource/member/` — MemberResource (member CRUD and search)
- `resource/interaction/` — InteractionResource (posting transactions)

**Technology:** Uses **JAX-RS** annotations (`@GET`, `@POST`, `@Path`, `@Produces`) via **RESTEasy** (not Spring MVC).

#### `endeavour-application-repository`
**Path:** `endeavour-application/endeavour-application-repository/`

Contains **database migration scripts** (SQL files numbered sequentially):
- `0001_admin_schema_.sql` — Creates admin tables
- `0002_admin_data_.sql` — Seeds admin reference data
- `0005_me_schema_.sql` — Creates member tables
- `0009_rd_schema_.sql` — Creates rewards tables
- `0011_recs_schema_.sql` — Creates recognition tables

Uses **dbdeploy** (a database migration tool) to apply these scripts in order.

#### `endeavour-earningcode-service`
**Path:** `endeavour-application/endeavour-earningcode-service/`

Manages **earning codes** — the rules for how members earn points (e.g., "code PURCHASE gives 5 points per dollar").

#### `rewards`
**Path:** `endeavour-application/rewards/`

Manages the **reward catalog** — what members can redeem points for (gift cards, flights, merchandise, etc.).

#### `endeavour-pointsbank-service`
**Path:** `endeavour-application/endeavour-pointsbank-service/`

The **points bank** — tracks each member's point balance, credits, debits, expirations.

#### `endeavour-recognition-service`
**Path:** `endeavour-application/endeavour-recognition-service/`

Manages **member recognition** — tier status (Gold, Silver, Platinum), achievements, and badges.

#### `endeavour-batch-slave`
**Path:** `endeavour-application/endeavour-batch-slave/`

A **batch job worker** that processes batch tasks delegated by the batch master service.

#### `endeavour-application-web`
**Path:** `endeavour-application/endeavour-application-web/`

> **What is a WAR?** A WAR (Web Application Archive) is a packaged web application. It bundles all the compiled code, config files, and web.xml into one deployable file.

This is the **entry point** — it packages everything into a WAR file and configures the Jetty web server. It contains:
- `web.xml` — defines the servlet, Spring context files, security filters, and error pages
- Jetty plugin configuration (port 8090)

**This is the module you run with `mvn jetty:run`.**

---

### 4.3 `endeavour-identity` — Authentication Service

**Path:** `/Users/macbookpro/aimia/infrastructure/endeavour-identity/`
**Group:** `com.ga.endeavour.identity`
**Runs on:** `http://localhost:8911`

**What it does:** OAuth2 authentication and authorization. Every API call to any Endeavour service must first get a token from Identity.

**Key concepts:**
- **Client** — an application that talks to the APIs (e.g., the marketing web UI, a mobile app)
- **SystemRole** — roles like ADMIN, MEMBER, OPERATOR
- **Scope** — OAuth2 scopes that limit what a client can do
- **AuthorisedGrant** — OAuth2 grant types (client_credentials, password, etc.)

**Sub-modules:**
- `endeavour-identity-core/` — domain entities, persistence, migrations
- `endeavour-identity-authentication-project/` — the actual OAuth2 endpoints
- `endeavour-identity-configuration-project/` — role/permission management

---

### 4.4 `endeavour-gateway` — Data Ingestion Gateway

**Path:** `/Users/macbookpro/aimia/infrastructure/endeavour-gateway/`
**Group:** `com.ga.endeavour.gateway`
**Runs on:** `http://localhost:8914`

**What it does:** Receives external data from partners (transactions, events) and routes it into the Endeavour system. Think of it as the "mailroom" — data comes in from various sources in different formats, and the gateway normalizes it and passes it on.

**Key sub-modules:**
- `endeavour-gateway-core/` — core domain (Interaction, Payload)
- `endeavour-gateway-spi/` — Service Provider Interface (plugin system for adapters)
- `endeavour-gateway-email-project/` — email sending integration
- `endeavour-gateway-data-mart/` — reporting data warehouse (ETL)
- `endeavour-gateway-payment/` — payment processing
- Various adaptor modules (`akmAdaptor`, `posadaptor`, `testadaptor`, `facebook`, `foursquare`)

---

### 4.5 `endeavour-batch` — Batch Processing

**Path:** `/Users/macbookpro/aimia/infrastructure/endeavour-batch/`
**Group:** `com.ga.endeavour.batch`
**Runs on:** `http://localhost:8915`

**What it does:** Handles bulk operations like importing member files, running nightly point calculations, generating reports.

**Sub-modules:**
- `endeavour-batch-core/` — core batch framework, DB migrations
- `endeavour-batch-master/` — orchestrates batch jobs (scheduling, monitoring)

---

### 4.6 `endeavour-configuration` — Config Web UI

**Path:** `/Users/macbookpro/aimia/infrastructure/endeavour-configuration/`
**Runs on:** `http://localhost:8908`

**What it does:** Web application for administrators to configure loyalty programs — set up partners, define earning rules, manage reward catalogs, configure MUs (Marketing Units).

---

### 4.7 `endeavour-marketing` — Marketing Web UI

**Path:** `/Users/macbookpro/aimia/infrastructure/endeavour-marketing/`
**Runs on:** `http://localhost:8955`

**What it does:** Web application for marketing teams to manage campaigns, member segments, and communications. Has a frontend built with Grunt/Less CSS.

---

## 5) Runtime Architecture (How a Request Works)

### The Layered Pattern

This project follows a strict **layered architecture**:

```
HTTP Request
    ↓
[Resource]     — receives the HTTP request, extracts parameters
    ↓
[Assembler]    — converts between Payloads (DTOs) and Domain objects
    ↓
[Mediator]     — business logic, orchestration, validation
    ↓
[Domain/Entity]— JPA entities mapped to database tables
    ↓
[Hibernate/JPA]— translates to SQL and talks to MySQL
    ↓
MySQL Database
```

> **What is a DTO (Data Transfer Object)?** A simple Java object used to send/receive data over the network. In this codebase, they're called **Payloads** (e.g., `CountryPayload`).

> **What is an Entity?** A Java class that represents a row in a database table. It's annotated with `@Entity` and `@Table`.

> **What is an Assembler?** A class that converts between Payloads and Domain objects. For example, `CountryDomainAssembler` turns a `CountryPayload` into a `Country` entity.

### Example 1: GET /countries (List all countries)

**Step 1 — HTTP request arrives at the Resource (controller)**

File: `/Users/macbookpro/aimia/infrastructure/endeavour-application/endeavour-application-resource/src/main/java/com/ga/endeavour/app/resource/administration/CountryResource.java`

```java
@Component
@Path("/countries")
public class CountryResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @PreAuthorize(CLIENT_AUTHORITY)   // ← Security check: must have ACCESS_ADMIN_SVC permission
    public List<CountryPayload> list(@Context UriInfo uriInfo) {
        // Step 2: Call the mediator (business logic)
        final List<Country> countryList = this.mediator.listAll();
        // Step 3: Convert domain objects to payloads (DTOs) for the response
        return this.hypermediaAssembler.assembleListResponse(uriInfo, countryList, uriInfo);
    }
}
```

- `@Path("/countries")` — this endpoint is at `http://localhost:8090/countries`
- `@GET` — responds to HTTP GET requests
- `@Produces(MediaType.APPLICATION_JSON)` — returns JSON
- `@PreAuthorize` — checks OAuth2 permissions before executing
- `@Component` — tells Spring to manage this class

**Step 2 — Mediator handles business logic**

The `CountryOperations` interface (implemented by a mediator class) calls the Hibernate repository to fetch all countries from the database.

**Step 3 — Assembler converts to Payload**

`CountryHypermediaAssembler` takes each `Country` entity and creates a `CountryPayload` DTO, adding hypermedia links (URLs to related resources).

**Step 4 — Response goes back as JSON**

RESTEasy + Jackson automatically serialize the `List<CountryPayload>` into a JSON array and send it back to the client.

### Example 2: POST /partners (Create a partner)

File: `/Users/macbookpro/aimia/infrastructure/endeavour-application/endeavour-application-resource/src/main/java/com/ga/endeavour/app/resource/administration/PartnerResource.java`

```java
@POST
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@PreAuthorize(MANAGE_PARTNER_AND_CLIENT_AUTHORITY)
public Response create(PartnerPayload request, @Context UriInfo uriInfo) {
    // 1. Convert payload (JSON input) to domain entity
    Partner partner = domainAssembler.assemblePartner(request);
    // 2. Business logic: save to database
    String partnerCode = mediator.createPartner(partner);
    // 3. Return HTTP 201 Created with location header
    return Response.status(HttpStatus.SC_CREATED)
            .location(uriInfo.getAbsolutePathBuilder().path(partnerCode).build())
            .build();
}
```

**Flow:** JSON body → `PartnerPayload` (Jackson deserializes) → `PartnerDomainAssembler` converts to `Partner` entity → `PartnerOperations.createPartner()` saves to DB → HTTP 201 response with `Location: /partners/NEWCODE` header.

---

## 6) Data Layer (Database, Entities, Migrations)

### Database: MySQL 8

- **Driver:** `com.mysql.cj.jdbc.Driver`
- **Default URL:** `jdbc:mysql://mysql:3306/ods` (the hostname `mysql` maps to `127.0.0.1` via `/etc/hosts`)
- **Default credentials:** `dev` / `bobbins`
- **Main schema:** `ods` (Operational Data Store)

Configuration is in:
- `/Users/macbookpro/aimia/infrastructure/endeavour-parent/pom.xml` (lines 59-68) — JDBC properties
- `/Users/macbookpro/aimia/infrastructure/endeavour-application/endeavour-commons/src/main/resources/endeavour-application-config.properties` — runtime config

### Other Databases

- **MongoDB 4.4** — used for document storage (e.g., interaction payloads, event data). Connection: `localhost:27017`, credentials: `endeavour_app` / `bobbins`.
- **Solr 8.11** — search engine for member/product search. Port: `8983`.

### Entities (Domain Objects)

> **What is an Entity?** A Java class where each instance represents a row in a database table. The `@Entity` and `@Table` annotations tell Hibernate which table it maps to. Each field with `@Column` maps to a column.

**Example — Country entity:**

File: `/Users/macbookpro/aimia/infrastructure/endeavour-application/endeavour-administration/src/main/java/com/ga/endeavour/administration/domain/Country.java`

```java
@Entity
@Table(name = "admin_countries", schema = PersistenceConstants.ODS_SCHEMA)
public class Country extends BaseEntity implements Identifiable<Long> {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ID")
    private Long id;

    @Column(name = "CODE", length = 10)
    private String naturalKey;

    @Column(name = "NAME", length = 50)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ADDRESS_TEMPLATE_ID")
    private AddressTemplate addressTemplate;
}
```

This means: there's a MySQL table called `admin_countries` with columns `ID`, `CODE`, `NAME`, and `ADDRESS_TEMPLATE_ID`.

**Example — Member entity:**

File: `/Users/macbookpro/aimia/infrastructure/endeavour-application/endeavour-member-repository/src/main/java/com/ga/endeavour/member/domain/Member.java`

This is a 976-line class — the biggest entity in the system. It represents a loyalty program member with dozens of fields: name, date of birth, addresses, preferences, loyalty card numbers, tier status, etc.

### Where entities live

| Domain | Package | Path |
|---|---|---|
| Administration (Country, Partner, Program, etc.) | `com.ga.endeavour.administration.domain` | `endeavour-application/endeavour-administration/src/main/java/` |
| Member | `com.ga.endeavour.member.domain` | `endeavour-application/endeavour-member-repository/src/main/java/` |
| Identity (Client, Role, Scope) | `com.ga.endeavour.identity.domain` | `endeavour-identity/endeavour-identity-core/src/main/java/` |
| Gateway (Interaction, Payload) | `com.ga.endeavour.gateway.domain` | `endeavour-gateway/endeavour-gateway-core/src/main/java/` |

### Database Migrations (dbdeploy)

> **What is a migration?** A numbered SQL script that changes the database structure. They run in order (0001, 0002, 0003...) so the database evolves alongside the code.

This project uses **dbdeploy** (not Flyway/Liquibase).

**Migration locations:**

| Module | Path | Database |
|---|---|---|
| Application (ODS) | `endeavour-application/endeavour-application-repository/src/main/migrations/` | `ods` |
| Identity | `endeavour-identity/endeavour-identity-core/src/main/migrations/` | `identity` |
| Gateway Data Mart | `endeavour-gateway/endeavour-gateway-data-mart/endeavour-gateway-data-mart-core/src/main/migrations/` | `gateway_data_mart` |
| Batch | `endeavour-batch/endeavour-batch-core/src/main/migrations/` | `batch` |

**How to run migrations:**

```bash
# Run the populate script which triggers all dbdeploy tasks
cd $AIMIA/infrastructure/dev-env-setup
./scripts/populate_mysql.sh
```

---

## 7) Configuration & Environments

### Spring XML Configuration (Not Spring Boot!)

> **Important:** This project uses **classic Spring Framework** with **XML configuration**, NOT Spring Boot. There is no `@SpringBootApplication` or `application.yml`. Instead, Spring beans are configured in XML files.

The main web.xml loads these Spring contexts:

File: `/Users/macbookpro/aimia/infrastructure/endeavour-application/endeavour-application-web/src/main/webapp/WEB-INF/web.xml`

```xml
<context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>
        classpath:platform-profile-config-context.xml
        classpath:endeavour-config-context.xml
        classpath:application-mediator-ctx.xml
        classpath:application-resource-ctx.xml
        classpath:security-auditing-jpa-context.xml
        classpath:client-security.xml
        classpath:rest-security-only.xml
        ...
    </param-value>
</context-param>
```

Each module contributes its own Spring XML context (e.g., `administration-applicationContext.xml`, `member-applicationContext.xml`).

### Properties Files

Configuration is done via `.properties` files (not YAML):

| File | Purpose |
|---|---|
| `endeavour-application/endeavour-commons/src/main/resources/endeavour-application-config.properties` | DB connection (url, username, password) |
| `endeavour-application/endeavour-application-distribution/src/main/etc/endeavour.properties` | Production/deployment properties |
| `endeavour-application/endeavour-administration/src/main/resources/permissions/admin-permissions.properties` | Permission definitions |
| `endeavour-configuration/endeavour-configuration-web/src/main/resources/configuration.properties` | Config web app settings |

### Environment-Specific Properties

The system uses a **profile-based** property loading mechanism:
- Properties are loaded from `classpath` first
- Then optionally overridden from `/etc/endeavour/` on the local filesystem
- The `ProfilePropertySourceInitializer` class handles this

### Logging

- Uses **Logback** (via SLF4J)
- Config: `endeavour-application-web/src/main/resources/logback.xml`
- Logs write to: `/var/log/endeavour/endeavour-application/end-app-web.log`
- You need to create the directory:
  ```bash
  sudo mkdir -p /var/log/endeavour/endeavour-application
  sudo chown -R $USER /var/log/endeavour
  ```

### Docker Compose

File: `/Users/macbookpro/aimia/infrastructure/dev-env-setup/docker-compose.yml`

Defines local infrastructure services:

| Service | Image | Port | Purpose |
|---|---|---|---|
| `mysql` | `mysql:8.0.29` | 3306 | Main relational database |
| `mongo` | `mongo:4.4` | 27017 | Document database |
| `activemq` | `apache/activemq-classic:latest` | 61616, 8161 | Message queue (JMS) |
| `solr` | `solr:8.11` | 8983 | Search engine |

```bash
# Start all infrastructure
cd $AIMIA/infrastructure/dev-env-setup
docker-compose up -d

# Populate databases
./scripts/populate_mysql.sh
```

### Secrets

- Database passwords are in plain text in properties files (`bobbins` is the default dev password)
- OAuth2 client secrets are stored in the `identity` database
- No `.env` file or secret manager is used locally — this is a development-only setup

### Maven Settings for Artifactory

File: `/Users/macbookpro/aimia/infrastructure/dev-env-setup/maven/setting.xml`

This points to the internal Artifactory server for downloading internal dependencies. Copy it to `~/.m2/settings.xml`.

> **Current status:** The Artifactory server (`artifact-internal.endeavourdemo.com`) is unreachable, which blocks downloading some internal dependencies.

---

## 8) Testing

### Where Tests Live

Tests follow the standard Maven convention: `src/test/java/` mirrors `src/main/java/`.

Examples:
- `/Users/macbookpro/aimia/infrastructure/endeavour-application/endeavour-administration/src/test/java/com/ga/endeavour/administration/domain/CountryTest.java`
- `/Users/macbookpro/aimia/infrastructure/endeavour-application/endeavour-administration/src/test/java/com/ga/endeavour/administration/domain/PartnerContactAddressBuilderTest.java`
- `/Users/macbookpro/aimia/infrastructure/endeavour-identity/endeavour-identity/src/test/java/com/ga/endeavour/identity/IdentityStatusIT.java`

### Test Types

- **Unit tests** (`*Test.java`) — test individual classes in isolation, using Mockito for mocking dependencies
- **Integration tests** (`*IT.java`) — test with real database/Spring context, run by the `maven-failsafe-plugin`

### Test Frameworks Used

- **JUnit 4** — the main test runner (`@Test`, `@Before`, `@After`)
- **Mockito** — mocking framework (`@Mock`, `when().thenReturn()`)
- **Hamcrest** — assertion matchers (`assertThat(result, is(expected))`)
- **EqualsVerifier** — verifies `equals()` and `hashCode()` contracts
- **DBUnit** — database testing (loads test data from XML/CSV files)
- **Embedded MongoDB** (`de.flapdoodle.embed.mongo`) — in-memory MongoDB for tests
- **Spring Test** — Spring context loading for integration tests

### How to Run Tests

```bash
# Run all tests for one module
cd $AIMIA/infrastructure/endeavour-application/endeavour-administration
mvn test

# Run all tests including integration tests
mvn verify

# Run a specific test class
mvn test -Dtest=CountryTest

# Skip tests during build
mvn install -DskipTests
```

---

## 9) Messaging / Integrations

### ActiveMQ (JMS)

> **What is JMS (Java Message Service)?** A way for Java applications to send messages to each other asynchronously. Instead of calling another service directly, you put a message on a "queue" and the other service picks it up when it's ready.

> **What is ActiveMQ?** An open-source message broker that implements JMS. It's the "post office" for messages between services.

- **Port:** 61616 (JMS protocol), 8161 (admin web UI)
- **Used for:** Event publishing (when a member enrolls, earns points, etc., an event is published)
- **Code:** `endeavour-platform/endeavour-commons-jms/` and `endeavour-platform/endeavour-platform-event/`
- **Docker:** Defined in `dev-env-setup/docker-compose.yml`

### MongoDB

- **Port:** 27017
- **Used for:** Storing interaction payloads, event data, and other document-oriented data
- **Code:** `endeavour-platform/endeavour-commons-mongo/`
- **Init script:** `dev-env-setup/scripts/mongo/` (creates users and databases)

### Solr (Search)

- **Port:** 8983
- **Used for:** Full-text search for members and products
- **Missing locally:** The `endeavour-search` module's source is not cloned (only referenced as a dependency)

### Apache Camel

- **Version:** 2.12.1
- **Used for:** Integration routing — processing incoming data from partners through various adapters in the gateway module

### HTTP Clients (Inter-Service Communication)

The services communicate with each other over HTTP (REST):
- **Application → Identity:** for token validation
- **Configuration → Application:** for program/partner data
- **Marketing → Application:** for member data
- **Gateway → Application:** for posting interactions

Key URLs (from `dev.md`):
```
endeavour.application.server.uri=http://localhost:8090/programs/
endeavour.application.server.country.uri=http://localhost:8090/countries/
endeavour.application.server.partners.uri=http://localhost:8090/partners/
```

---

## 10) "How to Work on This Repo" Beginner Checklist

### Prerequisites

1. **Java 8** (JDK, not JRE) — `export JAVA_HOME=$(/usr/libexec/java_home -v 1.8)`
2. **Maven 3.x** — `mvn -v` should show Java 8
3. **Docker** — for MySQL, Mongo, ActiveMQ, Solr
4. **`$AIMIA` environment variable** — `export AIMIA=~/aimia` (or wherever your repos live)
5. **`/etc/hosts`** entry — `127.0.0.1 mysql` (so the JDBC URL `mysql:3306` works)

### Step-by-Step: Run Locally

```bash
# 1. Set environment
export AIMIA=~/aimia
export JAVA_HOME=$(/usr/libexec/java_home -v 1.8)

# 2. Start Docker containers
cd $AIMIA/infrastructure/dev-env-setup
docker-compose up -d

# 3. Wait ~30 seconds for MySQL to initialize, then populate databases
./scripts/populate_mysql.sh

# 4. Create log directories
sudo mkdir -p /var/log/endeavour/endeavour-application
sudo chown -R $USER /var/log/endeavour

# 5. Build platform (shared libraries)
cd $AIMIA/infrastructure/endeavour-platform
mvn install -DskipTests -DskipRpm

# 6. Build the main application
cd $AIMIA/infrastructure/endeavour-application
mvn install -DskipTests -DskipRpm

# 7. Run it!
cd $AIMIA/infrastructure/endeavour-application/endeavour-application-web
mvn jetty:run
# → http://localhost:8090

# 8. (Optional) Start Identity for authentication
cd $AIMIA/infrastructure/endeavour-identity/endeavour-identity
mvn jetty:run
# → http://localhost:8911
```

### How to Add a New REST Endpoint

1. **Create a Payload (DTO)** in `endeavour-application-resource/src/main/java/.../dto/YourPayload.java`
2. **Create a Domain Assembler** in `endeavour-application-resource/src/main/java/.../assembler/YourDomainAssembler.java`
3. **Create a Resource (controller)** in `endeavour-application-resource/src/main/java/.../YourResource.java` — annotate with `@Path`, `@GET`/`@POST`, `@PreAuthorize`
4. **Create an Operations interface + Mediator** in `endeavour-application-mediator/` for the business logic
5. **Wire it up in Spring XML** — add a bean definition in the appropriate `*-applicationContext.xml`
6. **Add tests** in `src/test/java/`

### Common Beginner Mistakes

1. **Wrong Java version** — this MUST be Java 8. Java 11+ will fail with many errors.
2. **Forgetting to build platform first** — `endeavour-platform` must be built before anything else.
3. **MySQL hostname** — add `127.0.0.1 mysql` to `/etc/hosts` or the JDBC URL won't connect.
4. **Not running `populate_mysql.sh`** — the app will crash on startup without database tables.
5. **Editing code outside `endeavour-application-web`** — requires a full `mvn install` of the changed module before Jetty picks it up (hot reload only works within the web module).
6. **Missing `/var/log/endeavour/`** — create it or the app throws FileNotFoundException on startup.
7. **Missing `kmodule.xml`** — create `/var/apps/endeavour/mu-plugin-libs/noncore-mu-registry/META-INF/kmodule.xml` or you'll see a rules engine error.
8. **Using `mvn clean install` when `mvn install` suffices** — `clean` forces a full recompile every time.

---

## 11) Glossary (Repo-Specific)

| Term | Meaning |
|---|---|
| **ELP** | Endeavour Loyalty Platform — the full product name |
| **ODS** | Operational Data Store — the main MySQL database schema where all application data lives |
| **MU** | Marketing Unit — a configurable marketing campaign/communication (e.g., "send birthday email to Gold members") |
| **Interaction** | A transaction event — e.g., "Member X purchased $50 at Partner Y on Jan 1" |
| **Interaction Type** | The category of an interaction (Purchase, Return, Refund, Enrollment, etc.) |
| **Payload** | A DTO (Data Transfer Object) — a simple Java object for sending/receiving data over REST APIs |
| **Resource** | A REST API endpoint/controller (uses JAX-RS annotations) |
| **Mediator** | The business logic/service layer that sits between Resources and the database |
| **Assembler** | A class that converts between Payloads (DTOs) and Domain entities |
| **Partner** | A business that participates in the loyalty program (airline, hotel, shop) |
| **Program** | A loyalty program configuration (e.g., "Acme Rewards Program") |
| **Member** | A person enrolled in a loyalty program |
| **Points Bank** | The ledger that tracks each member's point balance |
| **Recognition** | Tier/status tracking — Gold, Silver, Platinum levels |
| **Earning Code** | A rule defining how points are earned (e.g., "$1 spent = 5 points") |
| **Reward Provider** | A plugin module that fulfills reward redemptions (PayPal payouts, e-vouchers, physical merchandise) |
| **RE** / **Rules Engine** | Business rules engine (KIE/Drools) — evaluates complex conditions on interactions |
| **kmodule.xml** | KIE (Drools) module configuration file — defines which rule packages to load |
| **Gateway** | The data ingestion service — receives external transaction data from partners |
| **SPI** | Service Provider Interface — a plugin architecture for gateway adapters |
| **Data Mart** | A reporting/analytics database (separate from ODS) for dashboards and reports |
| **dbdeploy** | Database migration tool — runs numbered SQL scripts in order |
| **Identity** | The OAuth2 authentication/authorization service |
| **Client** (Identity context) | An OAuth2 client application (not a human user) |
| **Scope** (Identity context) | An OAuth2 permission scope (e.g., `ACCESS_ADMIN_SVC`) |
| **SystemRole** | A role in the Identity service (ADMIN, OPERATOR, MEMBER, etc.) |
| **Tenant** | Unknown from code — likely refers to multi-tenant program isolation but not explicitly used in the local repos |
| **Hierarchy** | Unknown from code — likely refers to organizational hierarchy (partner > program > sub-program) |
| **PAW** | Unknown from code — not found in the local repositories |
| **ALP** | Aimia Loyalty Platform — the company/product name (seen in Bitbucket repo names: `aimia-alp`) |
| **NP** / `_NP_START` / `_NP_END` | "Non-Production" — code blocks wrapped in these markers are included only in certain build profiles |
| **Artifactory** | JFrog Artifactory — the internal Maven repository server for hosting internal JARs |
| **SNAPSHOT** | A Maven version suffix meaning "this is a development build, not a final release" |
| **RPM** | Red Hat Package Manager — used for Linux server deployments (skipped locally with `-DskipRpm`) |
| **Enunciate** | A REST API documentation generator (like Swagger but older) |
| **RESTEasy** | The JAX-RS implementation used for REST APIs (alternative to Spring MVC) |
| **Hypermedia** | REST responses include links to related resources (HATEOAS pattern) |
| **JavaMelody** | A monitoring tool embedded in the app — accessible at `http://localhost:8090/monitoring` (admin/0pen5ecret) |

---

## Quick Reference: Service Ports

| Service | Port | Module |
|---|---|---|
| Application | 8090 | `endeavour-application-web` |
| Identity | 8911 | `endeavour-identity` |
| Gateway | 8914 | `endeavour-gateway-server` |
| Configuration | 8908 | `endeavour-configuration-web` |
| Marketing | 8955 | `endeavour-marketing-web` |
| Batch | 8915 | `endeavour-batch-web` |
| Call Centre | 8910 | `endeavour-callcentre-web` |
| MySQL | 3306 | Docker |
| MongoDB | 27017 | Docker |
| ActiveMQ | 61616 / 8161 | Docker |
| Solr | 8983 | Docker |

---

## 12) PAW — The Convergent Graph Extension (Proposed Spring Boot Sidecar)

### What is PAW?

> **Simple:** PAW is a **new add-on service** that gives Endeavour the ability to understand **who reports to whom** inside a company — like an org chart — and do it really, really fast.

> **Real term:** **PAW (Person & Association Workbench)** is a proposed **Spring Boot microservice** that manages organizational hierarchy as a **Directed Acyclic Graph (DAG)** with an **O(1) Closure Table** for instant traversal, running alongside the existing ELP as an independent "sidecar."

### Why does Endeavour need this?

The existing ELP (Endeavour Loyalty Platform) was built to manage **flat member lists** — one person, one loyalty card, one program. It was never designed to answer questions like:

- "Who are all the people under Alice in the org chart?"
- "Dave reports to two managers — who gets his commission?"
- "If Bob's team moves under a new VP overnight, can we do it with zero downtime?"

ELP's "Member List Model" cannot natively represent these **tree/graph relationships**. Trying to force it in would mean modifying deeply established code, risking the stable commission engine.

**PAW solves this by being a separate service** that owns the hierarchy data and talks to ELP only when it's time to award points.

### The Restaurant Analogy (Extended)

Remember our restaurant analogy from Section 1?

- **ELP today:** The restaurant knows each customer and their loyalty card balance. It's like a simple guest book.
- **PAW adds:** Now imagine the restaurant also needs to know the **corporate org chart** of a catering client. "Alice is the VP, Bob manages the sales team, Charlie and Dave are on Bob's team, Dave also helps on Special Projects." PAW is the **org chart filing cabinet** next to the guest book. When it's time to give commission points, PAW looks up the org chart (instantly, in O(1) time) and tells the cashier (ELP) "give 500 points to Bob's account."

### Can we build PAW with Spring Boot on top of our existing code?

**Yes.** Here is exactly how it would work:

#### The "Sidecar" Pattern

> **Simple:** PAW sits *next to* ELP, not *inside* it. They talk over HTTP.
> **Real term:** PAW is a **standalone Spring Boot microservice** that communicates with ELP via REST API calls and asynchronous event payloads.

```
┌──────────────────────────────────────────────────┐
│                   PAW Service                     │
│              (NEW — Spring Boot 3.x)              │
│                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ PAW REST API│  │ Graph Engine │  │ Closure  │ │
│  │ /api/v1/    │  │ (DAG logic)  │  │ Table    │ │
│  │ hierarchy/* │  │              │  │ (O(1))   │ │
│  └──────┬──────┘  └──────┬───────┘  └────┬─────┘ │
│         │                │               │        │
│         └────────────────┴───────────────┘        │
│                      │                            │
│              ┌───────┴────────┐                   │
│              │  PAW Database  │                   │
│              │  (PostgreSQL / │                   │
│              │   MySQL — own  │                   │
│              │   schema)      │                   │
│              └────────────────┘                   │
└──────────────────────┬───────────────────────────┘
                       │
            HTTP / Event Payload
            (Terminal Event JSON)
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│             ELP (Existing Endeavour)              │
│         (OLD — Spring Framework + WAR)            │
│                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ REST API    │  │ Drools Rules │  │ Points   │ │
│  │ /programs/* │  │ Engine       │  │ Bank     │ │
│  └─────────────┘  └──────────────┘  └──────────┘ │
│                                                   │
│              ┌────────────────┐                   │
│              │  ODS Database  │                   │
│              │  (MySQL)       │                   │
│              └────────────────┘                   │
└──────────────────────────────────────────────────┘
```

**Key idea:** We do NOT modify the old ELP Java code. PAW is a brand new repo, brand new database, brand new Spring Boot app. It only talks to ELP through well-defined API calls and event payloads.

### How PAW Maps to Spring Boot (Technical Design)

#### What Spring Boot gives us that old ELP doesn't have

| Feature | Old ELP | PAW (Spring Boot) |
|---|---|---|
| Startup | `web.xml` + many XML contexts + Jetty plugin | Single `@SpringBootApplication` main class |
| REST API | RESTEasy + JAX-RS (`@Path`, `@GET`) | Spring MVC (`@RestController`, `@GetMapping`) |
| Config | Scattered `.properties` + `/etc/endeavour/` overrides | Single `application.yml` with profiles (`dev`, `prod`) |
| Database | Hibernate 4 + XML-configured DataSource | Spring Data JPA + auto-configured `HikariCP` |
| Migrations | `dbdeploy` (custom tool) | **Flyway** (industry standard, auto-runs on startup) |
| Dependency mgmt | 3100-line parent POM listing every version | Spring Boot Starters (e.g., `spring-boot-starter-data-jpa`) |
| Running locally | `mvn jetty:run` (needs WAR + plugin) | `mvn spring-boot:run` or `java -jar paw.jar` |
| Testing | JUnit 4 + manual Spring context XML loading | `@SpringBootTest` + auto-sliced tests (`@DataJpaTest`, `@WebMvcTest`) |
| Monitoring | JavaMelody (manual setup) | Spring Boot Actuator (`/actuator/health`, `/actuator/metrics`) |

#### Proposed PAW Spring Boot Project Structure

```
paw-service/
├── pom.xml                              # Spring Boot parent, starters
├── src/main/java/com/ga/paw/
│   ├── PawApplication.java              # @SpringBootApplication (the ONE entry point)
│   ├── config/
│   │   └── SecurityConfig.java          # OAuth2 resource server config
│   ├── controller/                      # REST endpoints (Spring MVC)
│   │   ├── HierarchyController.java     # GET /api/v1/hierarchy/tree
│   │   ├── IdentityController.java      # POST /api/v1/identities (Eve creation)
│   │   ├── MembershipController.java    # POST /api/v1/memberships (Dave matrix)
│   │   └── ReportingLineController.java # Manager relationships
│   ├── service/                         # Business logic
│   │   ├── GraphTraversalService.java   # O(1) closure table lookups
│   │   ├── HierarchyService.java        # Tree assembly, guardrails
│   │   ├── HoldingTankService.java      # "Unassigned" default logic (Eve)
│   │   └── TableSwapService.java        # Faith's re-org staging
│   ├── domain/                          # JPA Entities
│   │   ├── PawTenant.java               # Level 0 root container
│   │   ├── PawIdentity.java             # Representative (decoupled from ELP)
│   │   ├── PawOrgUnit.java              # Org structure nodes
│   │   ├── PawMembership.java           # Person↔Team links (PRIMARY/SECONDARY)
│   │   ├── PawReportingLine.java        # Person↔Person manager links
│   │   └── PawClosure.java              # Pre-computed ancestor-descendant pairs
│   ├── repository/                      # Spring Data JPA interfaces
│   │   ├── TenantRepository.java
│   │   ├── IdentityRepository.java
│   │   ├── OrgUnitRepository.java
│   │   ├── MembershipRepository.java
│   │   ├── ReportingLineRepository.java
│   │   └── ClosureRepository.java       # Key: findDescendants(), findAncestors()
│   ├── event/                           # ELP integration
│   │   └── TerminalEventPublisher.java  # Sends "Hybrid Hand-off" JSON to ELP
│   └── exception/
│       └── HierarchyViolationException.java  # "400: Multiple Primary Managers"
├── src/main/resources/
│   ├── application.yml                  # All config in ONE file
│   ├── application-dev.yml              # Dev profile overrides
│   └── db/migration/                    # Flyway scripts
│       ├── V1__create_paw_tenant.sql
│       ├── V2__create_paw_identity.sql
│       ├── V3__create_paw_org_unit.sql
│       ├── V4__create_paw_membership.sql
│       ├── V5__create_paw_reporting_line.sql
│       └── V6__create_paw_closure.sql
└── src/test/java/com/ga/paw/
    ├── controller/
    │   └── HierarchyControllerTest.java   # @WebMvcTest
    ├── service/
    │   └── GraphTraversalServiceTest.java # Unit + @DataJpaTest
    └── integration/
        └── Sprint2DemoIT.java            # Full integration test (all ACs)
```

#### Example: What the main class looks like

```java
// PawApplication.java — THE ENTIRE ENTRY POINT
// Compare this to ELP's 181-line web.xml + dozens of XML context files

package com.ga.paw;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication   // ← This ONE annotation replaces web.xml + all XML contexts
public class PawApplication {
    public static void main(String[] args) {
        SpringApplication.run(PawApplication.class, args);
    }
}
```

#### Example: What a REST endpoint looks like (vs ELP style)

```java
// PAW style (Spring Boot + Spring MVC)
@RestController
@RequestMapping("/api/v1/hierarchy")
public class HierarchyController {

    private final HierarchyService hierarchyService;

    public HierarchyController(HierarchyService hierarchyService) {
        this.hierarchyService = hierarchyService;
    }

    @GetMapping("/tree")
    public ResponseEntity<TreeResponse> getTree(@RequestParam String tenantId) {
        return ResponseEntity.ok(hierarchyService.buildTree(tenantId));
    }
}
```

Compare to ELP style (from `CountryResource.java`):
```java
// ELP style (Spring Framework + RESTEasy/JAX-RS)
@Component
@Path("/countries")
public class CountryResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @PreAuthorize(CLIENT_AUTHORITY)
    public List<CountryPayload> list(@Context UriInfo uriInfo) {
        // ...
    }
}
```

Both work. Boot's version has less boilerplate and doesn't need XML wiring.

#### Example: What config looks like

```yaml
# PAW application.yml — ALL config in ONE file
# Compare to ELP's many .properties files + /etc/endeavour/ overrides

server:
  port: 8095

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/paw
    username: dev
    password: bobbins
  jpa:
    hibernate:
      ddl-auto: validate    # Flyway manages schema, Hibernate just validates
  flyway:
    enabled: true

paw:
  elp:
    base-url: http://localhost:8090    # Points to existing ELP for Terminal Events
  identity:
    base-url: http://localhost:8911    # Points to existing Identity for auth
```

#### Example: The Closure Table Entity

```java
@Entity
@Table(name = "paw_closure")
public class PawClosure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ancestor_id", nullable = false)
    private String ancestorId;

    @Column(name = "descendant_id", nullable = false)
    private String descendantId;

    @Column(name = "depth", nullable = false)
    private Integer depth;
}
```

```java
// Spring Data JPA — the ENTIRE "repository" layer
// No XML, no Hibernate config files, no DAO classes
public interface ClosureRepository extends JpaRepository<PawClosure, Long> {

    // O(1) query: find all descendants of an ancestor
    List<PawClosure> findByAncestorId(String ancestorId);

    // O(1) query: find all ancestors of a descendant
    List<PawClosure> findByDescendantId(String descendantId);

    // O(1) query: find direct children (depth = 1)
    List<PawClosure> findByAncestorIdAndDepth(String ancestorId, int depth);
}
```

#### Example: The "Strict Tree" Guardrail (Dave's Matrix Safety)

```java
@Service
public class HierarchyService {

    private final MembershipRepository membershipRepo;

    // Dave's Matrix Test — AC 2: Strict-Tree Safety
    public void assignMembership(String identityId, String orgUnitId, MembershipType type) {

        if (type == MembershipType.PRIMARY) {
            // Check: does this person already have a PRIMARY link?
            Optional<PawMembership> existing = membershipRepo
                    .findByIdentityIdAndType(identityId, MembershipType.PRIMARY);

            if (existing.isPresent()) {
                throw new HierarchyViolationException(
                    "Multiple Primary Managers detected for User: " + identityId
                );
                // → Returns HTTP 400 Bad Request
            }
        }

        // SECONDARY links are always allowed (DAG capability)
        membershipRepo.save(new PawMembership(identityId, orgUnitId, type));
    }
}
```

#### Example: The "Holding Tank" Logic (Eve's Auto-Assignment)

```java
@Service
public class HoldingTankService {

    private final IdentityRepository identityRepo;
    private final MembershipRepository membershipRepo;
    private final OrgUnitRepository orgUnitRepo;

    // AC 4: New identities default to "Unassigned"
    public PawIdentity createIdentity(CreateIdentityRequest request) {
        PawIdentity identity = new PawIdentity(request.getName(), request.getElpId());
        identity = identityRepo.save(identity);

        // Auto-assign to the Holding Tank
        PawOrgUnit unassigned = orgUnitRepo.findByTypeAndTenantId(
                OrgUnitType.UNASSIGNED, request.getTenantId()
        );

        membershipRepo.save(new PawMembership(
                identity.getId(), unassigned.getId(), MembershipType.PRIMARY
        ));

        return identity;
    }
}
```

#### Example: The Terminal Event (Hybrid Hand-off to ELP)

```java
@Service
public class TerminalEventPublisher {

    private final RestTemplate restTemplate;   // or WebClient

    // AC 5: Send resolved hierarchy to ELP's Drools engine
    public void publishAwardEvent(String representativeId, int points, String reason) {

        // PAW already resolved the hierarchy in O(1) using the closure table
        List<PawClosure> rollUpPath = closureRepo.findByDescendantId(representativeId);
        PawMembership primary = membershipRepo
                .findByIdentityIdAndType(representativeId, MembershipType.PRIMARY).get();

        // Build the Terminal Event JSON (see Conceptual Artifact)
        TerminalEvent event = TerminalEvent.builder()
                .source("PAW-Hierarchy-Service")
                .representativeId(representativeId)
                .primaryManagerId(primary.getOrgUnit().getManagerId())
                .rollUpPath(rollUpPath.stream().map(PawClosure::getAncestorId).toList())
                .points(points)
                .reason(reason)
                .calculationStrategy("STRICT_TREE_ENFORCED")
                .build();

        // Fire to ELP — ELP only has to update the Points Bank ledger
        restTemplate.postForEntity(
                elpBaseUrl + "/interactions", event, Void.class
        );
    }
}
```

### The PAW Schema (Convergent Graph)

> **Simple:** These are the new database tables PAW owns. ELP doesn't touch them.

| Table | Purpose | Analogy |
|---|---|---|
| `paw_tenant` | The company container (Level 0). Isolates data between clients. | The building that owns the entire org chart |
| `paw_identity` | A person/representative. Decoupled from ELP's member ID. | A name badge |
| `paw_org_unit` | A team/department/division. Has `parent_org_unit_id` for tree structure. Includes ROOT and UNASSIGNED types. | A room in the building |
| `paw_membership` | Links a person to a team. Has `type` = PRIMARY or SECONDARY. | The desk assignment sheet |
| `paw_reporting_line` | Person-to-person manager link. PRIMARY + SECONDARY. | The "who do I report to" arrow on the org chart |
| `paw_closure` | Pre-computed ancestor↔descendant pairs for O(1) lookups. | The cheat-sheet index at the back of the org chart binder |

### The Sprint 2 Demo Personas (Quick Reference)

| Persona | Level | Role in the Test |
|---|---|---|
| **Acme Corp** | L0 (Tenant) | System anchor. Not a person. Proves data isolation. |
| **Unassigned** | L1 (System Node) | The "bench." Holds people with no manager (Eve, departed users). |
| **Alice** | L1 (Org Lead) | First human. Proves Person→Organization link. |
| **Bob** | L2 (Team Lead) | Reports to Alice. Proves the "bridge" (both subordinate and manager). |
| **Charlie** | L3 (Leaf) | Reports to Bob. Proves the graph can end gracefully. |
| **Dave** | L3 (Matrix) | Reports to Bob (PRIMARY) + Special Projects (SECONDARY). Proves DAG. Blocked from two PRIMARY managers (guardrail). |
| **Eve** | New Hire | Created without a parent. Auto-defaults to "Unassigned" holding tank. |
| **Faith** | Admin | Performs re-orgs. Validates the "Table Swap" zero-downtime strategy. |
| **Greg** | Future | Terminated user. Tests that departed people stay in Holding Tank. |
| **Holly** | Future | Dotted-line reporting. Tests SECONDARY edges for project visibility. |
| **Ian** | Future | Manager succession. Tests "Table Swap" during leadership changes. |

### Acceptance Criteria (Sprint 2 — Pass/Fail)

| AC | Name | What it proves |
|---|---|---|
| **AC 1** | Structural Integrity | Charlie → Bob → Alice → Acme Corp (4-level traversal works) |
| **AC 2** | Strict-Tree Safety | Assigning Dave a 2nd PRIMARY manager → `400 Bad Request` |
| **AC 3** | Performance Benchmark | Path resolution for Dave → Acme Corp in **< 5ms** (O(1) closure table) |
| **AC 4** | Data Integrity | Eve auto-assigned to "Unassigned" node on creation |
| **AC 5** | Terminal Event Contract | JSON payload correctly identifies Bob as PRIMARY, Holly as SECONDARY for Dave |

### The Hybrid Engine: How PAW Talks to ELP

```
1. Transaction arrives (e.g., "Dave closed a deal")
        │
        ▼
2. PAW resolves the hierarchy in O(1):
   - Who is Dave's primary manager? → Bob
   - Who are Dave's secondary managers? → Holly
   - What is the full roll-up path? → EMEA Sales → HQ → Acme Corp
        │
        ▼
3. PAW builds a "Terminal Event" JSON (the Hybrid Hand-off):
   {
     "subject": { "representative_id": "dave" },
     "resolved_hierarchy": {
       "primary_manager_id": "bob",
       "secondary_managers": ["holly"],
       "roll_up_path": ["emea_sales", "hq", "acme_corp"]
     },
     "instruction": { "action": "TRIGGER_LEDGER_CREDIT", "points": 500 }
   }
        │
        ▼
4. PAW sends this to ELP via HTTP POST /interactions
        │
        ▼
5. ELP's Drools engine ONLY does the ledger update:
   - Credit 500 points to Dave's account
   - No hierarchy math needed — PAW already did it
```

**Why this split matters:**
- **PAW** handles the **"Who" and "What"** — graph traversal, matrix logic, org structure
- **ELP** handles the **"Ledger"** — points bank, audit trail, commission rules
- ELP's Drools engine is **relieved of hierarchy math** and stays focused on what it does well

### The "Table Swap" Strategy (Faith's Re-Org Play)

> **Simple:** When Faith needs to reorganize 10,000 people overnight, we don't edit the live data. We build a copy, check it's perfect, then "swap the sign" so the app points to the new copy.

```
[graph_staging]  ←  Faith builds the new hierarchy here (validated before going live)
       │
       │  ── "Swap" (a pointer change, like switching a DNS record) ──
       ▼
[graph_prod]     ←  The app now reads from the new data
       │
       │  ── Previous data moves to backup ──
       ▼
[graph_LKG]      ←  "Last Known Good" — 3-day safety net for instant rollback
```

### Performance Comparison Summary

| Operation | ELP (Relational) | PAW (Closure Table) | Why it matters |
|---|---|---|---|
| Org roll-up reporting | O(depth) — slower as org grows | **O(1)** — constant time | Instant whole-org reports at any scale |
| Matrix point allocation | O(depth) recursive traversal | **O(1)** constant lookup | Native multi-manager support (Dave) |
| Re-org execution | High risk (live edits) | **Low risk** (Table Swap) | Zero-downtime restructuring (Faith) |
| Point awards | Drools does everything | **Hybrid** — PAW resolves, ELP credits | Separation of concerns = scalability |

### How to Actually Build This (Step-by-Step)

```bash
# 1. Create the new Spring Boot project (separate from ELP)
#    Use Spring Initializr (https://start.spring.io) with:
#    - Spring Boot 3.2+
#    - Java 17+  (PAW is modern; ELP stays on Java 8)
#    - Dependencies: Spring Web, Spring Data JPA, Flyway, MySQL Driver,
#                    Spring Security (OAuth2 Resource Server), Actuator

# 2. Place it alongside the other repos
mkdir $AIMIA/infrastructure/paw-service
cd $AIMIA/infrastructure/paw-service

# 3. Run it independently
mvn spring-boot:run
# → http://localhost:8095

# 4. It talks to ELP (already running on :8090) and Identity (:8911) via HTTP
# No shared JARs, no shared database, no shared classpath
```

### Why Spring Boot for PAW (and NOT modifying ELP)?

1. **ELP is stable but rigid** — it handles flat member lists perfectly. Modifying its database or domain model risks breaking the commission engine for all existing clients.
2. **PAW needs modern features** — Java 17+, Spring Boot auto-config, Flyway, Spring Data JPA, actuator health checks. Retrofitting these into ELP's Java 8 + XML stack would be a massive rewrite.
3. **Independent deployment** — PAW can be deployed, scaled, and updated without restarting ELP. If PAW has a bug, ELP keeps running.
4. **Clean API boundary** — the "Terminal Event" JSON contract means PAW and ELP can evolve independently. Replace PAW's database engine tomorrow without touching ELP.
5. **Testability** — Spring Boot's `@SpringBootTest`, `@WebMvcTest`, `@DataJpaTest` make it trivial to test each layer in isolation. ELP's XML-heavy context loading makes tests slower and more brittle.

---

## 13) Official ALP-E Documentation — What Each Document Says and How It Connects

> **Context:** The folder `Files/ELP-Docs/` contains **29 official documents** (Release 18) written by the Aimia engineering and product teams. Below is a summary of every document, what it teaches you, and how it maps to the code you see in this repo.

### Document Map (Quick Reference)

| # | Document | Pages | Who it's for | What it explains |
|---|---|---|---|---|
| 1 | Architecture Manual | ~50 | Architects, Developers | The master blueprint — all sub-systems, tiers, data stores, deployment |
| 2 | Technical Features Overview | ~6 | Sales, Onboarding | One-page tech summary (OS, middleware, security, DevOps tools) |
| 3 | Product Features Document | ~35 | Marketing, IT Directors | Every business feature — members, promotions, rewards, reporting |
| 4 | Integration API User Guide | ~100 | Developers, Partners | Every REST API endpoint with request/response examples |
| 5 | Event Framework | ~70 | Developers | Every event family, payload structure, and the 7-stage event pipeline |
| 6 | Batch Framework | ~100 | Developers, Ops | Spring Batch architecture, job definitions, MongoDB staging, schemas |
| 7 | Platform Level Config Guide | ~35 | Config Engineers | How to set up languages, countries, partners, rewards, tokens in Config Web |
| 8 | Programme Level Config Guide | ~60 | Config Engineers | Programme-specific setup: currencies, statuses, segments, promotions |
| 9 | Loyalty Toolkit User Guide | ~100 | Marketers | Creating/publishing promotions (MUs), segments, dashboard analytics |
| 10 | Call Centre User Guide | ~50 | Call Centre Agents | Member search, enrolment, adjustments, redemptions, call notes |
| 11 | Member Web User Guide | ~25 | Members, Developers | Self-service: enrolment, profile, balance, rewards, orders |
| 12 | User Roles & Permissions Guide | ~40 | System Admins | OAuth2 TPAs, system roles, permission groups, password policies |
| 13 | Communication & Adaptors | ~50 | Config Engineers | Email (Elastic, SMTP, Unica), Facebook, Foursquare, PayPal adaptors |
| 14 | Custom MU Development Guide | ~20 | Developers | How to write custom promotion types (Marketing Units) using Drools |
| 15 | Configuring Marketing Units | ~80 | Config Engineers, Marketers | MU templates: Value, Basket, Location, Generic Action, Tier, etc. |
| 16 | Batch File Layouts Guide | ~50 | Developers, Partners | CSV/XML schemas for inbound/outbound batch files |
| 17 | Reporting User Guide | ~20 | Marketers, Finance | Pentaho dashboards, standard reports, Data Mart ETL |
| 18 | DevOps Guide | ~70 | DevOps, Ops | Jenkins CI/CD, Puppet, CloudFormation, release versioning, AWS setup |
| 19 | Technical Handbook (AWS) | ~50 | Ops, DevOps | Server setup, Puppet modules, ActiveMQ, MySQL, MongoDB, Nagios |
| 20 | Backup Strategy (AWS) | ~10 | Ops | EBS snapshots, MySQL/Mongo replication, S3 archiving |
| 21 | Operations Manual | ~70 | Ops, Support | Incident management (P1–P4), change management, DR, monitoring |
| 22 | Release Notes (R18) | ~10 | Everyone | New features, bug fixes, known issues for Release 18 |
| 23 | FAQ | ~2 | Sales, New Hires | Quick intro + links to all other documents |
| 24 | Performance Test Report | ~10 | QA, Architects | Load test results, throughput, response times |
| 25 | Functional Test Report | ~15 | QA | Test coverage, pass/fail rates |
| 26 | OAT Closure Report | ~10 | Ops, QA | Operational acceptance testing results |
| 27 | Operating Level Agreement | Excel | Ops | SLA targets (uptime, response times, escalation) |
| 28 | Communication Data Sets | Excel | Config Engineers | Data fields available for email/SMS merge templates |
| 29 | Cost Template | Excel | Sales, Finance | Infrastructure cost breakdown for ALP-E stack |

---

### 13.1) The Architecture (from "Architecture Manual")

This is the **most important document** for understanding the codebase. Here's what it tells us:

#### The 3-Tier Architecture

> **Simple:** The system has three layers — the websites you see, the engines that do the work, and the databases that store everything.

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE TIER                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Member   │ │ Call     │ │ Loyalty  │ │ Config   │           │
│  │ Web      │ │ Centre   │ │ Toolkit  │ │ Web      │           │
│  │ (member  │ │ (agents  │ │ (market- │ │ (admin   │           │
│  │  self-   │ │  handle  │ │  ers set │ │  sets up │           │
│  │  service)│ │  calls)  │ │  promos) │ │  system) │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │             │            │             │                 │
│       └─────────────┴────────────┴─────────────┘                │
│                          │ REST APIs                            │
└──────────────────────────┼──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CORE BUSINESS TIER                            │
│  ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐      │
│  │ Endeavour    │ │ Rules    │ │ Identity │ │ Gateway   │      │
│  │ Application  │ │ Engine   │ │ Service  │ │ Service   │      │
│  │ (members,    │ │ (Drools  │ │ (OAuth2, │ │ (adaptors,│      │
│  │  points,     │ │  MUs,    │ │  auth,   │ │  3rd party│      │
│  │  rewards,    │ │  promos) │ │  users)  │ │  integr.) │      │
│  │  admin)      │ │          │ │          │ │           │      │
│  └──────┬───────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘      │
│         │              │            │              │             │
│  ┌──────┴───────┐ ┌────┴─────┐                                  │
│  │ Batch        │ │ Search   │                                  │
│  │ Service      │ │ Service  │                                  │
│  │ (Spring Batch│ │ (Solr)   │                                  │
│  │  file import)│ │          │                                  │
│  └──────────────┘ └──────────┘                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA TIER                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ MySQL    │  │ MongoDB  │  │ ActiveMQ │  │ Solr     │        │
│  │ (6 DBs:  │  │ (events, │  │ (message │  │ (member  │        │
│  │  ods,    │  │  batch   │  │  queues, │  │  search  │        │
│  │  identity│  │  staging,│  │  event   │  │  index)  │        │
│  │  batch,  │  │  event   │  │  bus)    │  │          │        │
│  │  gateway,│  │  store)  │  │          │  │          │        │
│  │  data_   │  │          │  │          │  │          │        │
│  │  mart,   │  │          │  │          │  │          │        │
│  │  reward) │  │          │  │          │  │          │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

#### Architecture Style: "Hybrid SOA + ROA + EDA"

The official docs say ALP-E follows three architecture styles at once:

- **SOA (Service-Oriented):** Each service (Identity, Batch, Gateway, etc.) is autonomous — it can be deployed, scaled, and maintained independently.
- **ROA (Resource-Oriented):** All services expose **RESTful endpoints**. External systems talk to ALP-E via HTTPS REST calls.
- **EDA (Event-Driven):** Internal communication uses **events on ActiveMQ**. When something happens (member enrols, points awarded), an event is published and consumed by listeners.

> **Simple analogy:** SOA = each department in a company can work alone. ROA = they all have a public reception desk (REST API). EDA = they also have an internal post office (ActiveMQ) for memos.

#### Why MySQL? Why MongoDB? Why ActiveMQ? Why Solr?

| Technology | Why ALP-E uses it | Simple analogy |
|---|---|---|
| **MySQL** | The **main ledger**. Stores members, points balances, partners, rewards, configurations, identity/auth data. Relational = strong consistency, transactions, foreign keys. ALP-E has **6 separate MySQL schemas** (ods, identity, batch, gateway, data_mart, reward_provider). | The company's **accounting books** — every dollar/point must balance perfectly |
| **MongoDB** | **Event storage and batch staging**. Events are JSON documents with variable structure. Mongo's schemaless nature is perfect for storing diverse event payloads (member events, transaction events, coupon events, etc.). Batch files are staged in Mongo before being processed. One database per partner/programme combination. | The company's **filing cabinet** — flexible folders that can hold any shape of document |
| **ActiveMQ** | The **internal post office**. Events are published to a Virtual Topic (like a broadcast channel). Multiple consumers (Event Hub, Gateway, Search) each get their own queue. This decouples services — the Endeavour App doesn't wait for Gateway to process an event. Also used for Batch: the controller puts "job reference" messages on a queue, worker nodes pick them up. | The company's **internal mail system** — drop a letter in the outbox, the right department picks it up when ready |
| **Solr** | **Member search**. The Call Centre needs to search members by name, postcode, token, etc. across millions of records. Solr indexes member data for fast full-text search. The Search Service reads from MySQL, indexes into Solr, and the Call Centre queries it. | The company's **phone book index** — instead of reading every page, flip to the index tab |

#### The 6 MySQL Schemas

| Schema | What it stores | Which service owns it |
|---|---|---|
| `ods` | Members, points, interactions, rewards, admin config, promotions, coupons | Endeavour Application |
| `identity` | OAuth2 clients, tokens, users, roles, permissions | Identity Service |
| `batch` | Batch job config, job statuses, scheduling | Batch Service |
| `gateway` | Gateway provider config, adaptor config | Gateway Service |
| `data_mart` | Star-schema for Pentaho reporting (aggregated event data) | Data Mart ETL / Gateway |
| `reward_provider` | (Migrated into `ods` in R7 — historical) | Endeavour Application |

> **Connection to code:** Each schema maps to a migration folder in the repo:
> - `ods` → `endeavour-application/endeavour-application-repository/src/main/migrations/`
> - `identity` → `endeavour-identity/endeavour-identity-core/src/main/migrations/`
> - `batch` → `endeavour-batch/endeavour-batch-core/src/main/migrations/`
> - `gateway` → `endeavour-gateway/endeavour-gateway-data-mart/.../src/main/migrations/`

---

### 13.2) The Four Web Applications (from "Product Features" + individual User Guides)

ALP-E has **four user-facing web applications**. None of them talk to the database directly — they all call the Endeavour Application's REST APIs.

| Web App | Port | Who uses it | What they do | Technology |
|---|---|---|---|---|
| **Configuration Web** | 8908 | Aimia engineers | Set up programmes, partners, currencies, rewards, MU templates, batch jobs, security roles | Spring MVC + FreeMarker |
| **Loyalty Toolkit (LTK)** | (within Config Web) | Client marketers | Create/publish promotions (MUs), manage segments, view dashboards | Backbone.js + Spring MVC |
| **Call Centre** | 8910 | Call centre agents | Search members, enrol, adjust points, redeem, view history, add call notes, manage coupons | Backbone.js + jQuery + FreeMarker |
| **Member Web** | (kick-start app) | End members | Self-service: enrol, view balance, browse rewards, redeem points, update profile | Backbone.js + Spring MVC |

> **Connection to code:**
> - Config Web → `endeavour-configuration/endeavour-configuration-web/`
> - Call Centre → `endeavour-callcentre/endeavour-callcentre-web/`
> - The web apps use **Spring MVC** (not RESTEasy) for their server-side rendering + **Backbone.js** for rich UI.

---

### 13.3) The Rules Engine — Marketing Units (from "Architecture Manual" + "Custom MU Guide" + "Configuring MUs")

> **Simple:** A Marketing Unit (MU) is a **promotion rule**. "If a member spends $50, give them 100 points." The Rules Engine evaluates every incoming interaction against all active MUs.

#### How it works

1. An **interaction** arrives (e.g., "member X bought $50 of groceries at Partner Y").
2. The Endeavour App sends it to the **Rules Engine** via Apache Camel (in-memory queue).
3. The Rules Engine loads all active MU instances, ordered by **priority** and **group**.
4. Each MU uses **Drools rules** to evaluate the interaction against its **tailoring** (what type of transaction?) and **targeting** (which members? which dates?).
5. If criteria are met, the MU **fires** and produces **outcomes** (award points, place in segment, send communication, award coupon, etc.).
6. The Rules Engine returns a list of **follow-on actions** to the Endeavour App.

#### Types of MUs (Promotion Types)

| MU Type | What it does | Example |
|---|---|---|
| **Value** | Award points as a multiplier of spend | "2 points per £1 spent" |
| **Basket** | Award based on specific products in a basket | "Buy 3 Coca-Colas, get 50 points" |
| **Location** | Award based on where the interaction happened | "Check in at Airport Lounge = 200 points" |
| **Generic Action** | Award for any defined action | "Log into website = 10 points" |
| **Early Engagement** | Award after N repetitions in a period | "Shop 5 times in your first month = 1000 points" |
| **Annual Accumulator** | Award when cumulative spend reaches a threshold | "Spend £1000 this year = 5000 bonus points" |
| **Earning Code** | Award for scanning/entering a code | "Enter newspaper code SAVE20 = 20 points" |
| **Tier Bonus** | Award based on tier level | "Gold members get 3x points" |
| **Balance Threshold** | Award when balance reaches a level | "Reach 10,000 points = free gift" |
| **Time Period Capping** | Limit awards per time period | "Max 500 points per week from this promotion" |
| **Custom** | Developer-built Drools rules for anything else | Client-specific business logic |

> **Connection to code:**
> - MU configuration is stored in `ods` MySQL schema.
> - Drools rules live in `endeavour-application/endeavour-re-rules/` (the RE = Rules Engine module).
> - Apache Camel routing is configured in `endeavour-application/endeavour-application-mediator/`.
> - Custom MUs are built as separate JARs and deployed alongside the core — the "Custom MU Development Guide" explains the SPI (Service Provider Interface) pattern for this.

---

### 13.4) The Event Framework — The 7-Stage Pipeline (from "Event Framework")

> **Simple:** Every time something important happens in ALP-E, an **event** is created, sent through a pipeline, stored, and optionally forwarded to external systems.

```
Stage 1: Core Application (Mediator raises event)
    ↓
Stage 2: Event Bus (synchronous multicast to 4 listeners)
    ├── 1. Post to ActiveMQ Virtual Topic (JMS)
    ├── 2. Create Interaction (if configured) → may trigger MUs
    ├── 3. Create Follow-On Action (if from interaction)
    └── 4. Send to Solr re-index queue (if member data changed)
    ↓
Stage 3: Event Transport (ActiveMQ Virtual Topic → consumers)
    ├── Event Hub (within Endeavour App)
    └── Gateway Service
    ↓
Stage 4: Storage (Event Hub stores event JSON in MongoDB)
    ↓
Stage 5: Gateway Adaptors (push/pull events to external systems)
    ↓
Stage 6: Reporting (Data Mart adaptor → star schema → Pentaho)
    ↓
Stage 7: Notification (real-time Call Centre notifications)
```

#### Event Families (the 20+ types of events)

| Event Family | When it fires | Example payload fields |
|---|---|---|
| **MEMBER** | Member enrols, updates profile, merges | memberId, programCode, status, tokens |
| **TRANSACTION** | Points earned, redeemed, adjusted, forfeited | transactionType, currencyCode, amount, expiryMonth |
| **INTERACTION** | Any interaction is raised (from any source) | interactionType (value, basket, genericAction, etc.), capabilities |
| **ACCUMULATION** | Challenge progress changes | achievementInfo, valueToUpgrade, total |
| **REDEEM** | Member redeems points for a reward | memberOrderId, orderNumber, channel |
| **TIER** | Member moves up or down a tier | previousTier, newTier |
| **MEMBER_STATUS** | Member status changes (e.g., Active → Suspended) | previousStatus, newStatus |
| **MEMBER_SEGMENT** | Member added to / removed from a segment | segmentCode, action (ADD/REMOVE) |
| **MEMBER_STATE** | Member state flagged (e.g., FRAUD_RISK) | stateCode |
| **ADDRESS** | Address added/updated/verified | addressChannelType, value (street, city, etc.) |
| **COMMUNICATIONS** | Communication sent to member | communicationTypeCode, providerName |
| **EARN** | Points earned from a transaction | currencyCode, amount, issuingPartner |
| **COUPON** | Coupon redeemed | memberOrderId, programCode |
| **GATEWAY** | Gateway provider added/updated | (internal platform event) |
| **FOLLOW_ON_ACTION** | Action triggered by a previous event | followOnActionType |
| **PASSWORD** | Password created/updated | memberId |
| **RETURN** | Reward returned | orderNumber |

> **Connection to code:**
> - Event payloads are defined in `endeavour-platform/endeavour-platform-event/` (e.g., `com.ga.endeavour.platform.event.payload.details.MemberEventDetails`).
> - Events are stored in **MongoDB** in collections named by family (e.g., `events.MEMBER_EVENT`).
> - The Event Bus is wired in the Mediator layer of `endeavour-application/endeavour-application-mediator/`.
> - Gateway adaptors live in `endeavour-gateway/`.

---

### 13.5) The Batch Framework (from "Batch Framework" + "Batch File Layouts")

> **Simple:** Batch = processing big files of data (thousands of member enrolments, transactions, etc.) in bulk, instead of one-by-one API calls.

#### How Batch Processing Works

```
1. Partner sends a CSV/XML file via sFTP
    ↓
2. File lands in S3 bucket
    ↓
3. Batch Controller Node (on Utility server):
   - Validates file against XML schema definition
   - Stages records into MongoDB (one DB per partner/programme)
   - Posts "Job Reference" messages to ActiveMQ queue
    ↓
4. Batch Worker Nodes (on separate servers):
   - Pick up messages from queue
   - Read staged data from MongoDB
   - Call Endeavour App REST APIs (e.g., enrol member, process transaction)
   - Store results back in MySQL
    ↓
5. Reject files generated for failed records
```

#### Why MongoDB for Batch?

- Each batch file is staged as documents in Mongo. Mongo's **schemaless** nature handles the variety of file formats (CSV, fixed-width, XML).
- Each partner/programme gets its **own database** in Mongo (e.g., `BUYMORE_HONEY`).
- Each job execution creates a **new collection** (e.g., `MEMBER_ENROLMENT_67`).
- This isolation prevents lock conflicts between parallel batch jobs.

#### Standard Batch Interfaces

**Inbound (files received from partners):**
- Member Enrolment (CSV / Fixed Width)
- Currency Accrual
- Earning Codes
- Member Segments (full / delta)
- Product-Store Hierarchies
- Load Coupons / Coupon Offers
- Purchase Order Status
- Role Mapping

**Outbound (files generated by ALP-E):**
- Earn File, Forfeit File, Redemption File, Return File
- Generated Tokens
- Reward Supplier Purchase Orders
- Member Extract
- Statements

**Internal Jobs:**
- Points Expiry
- Anniversary (tier re-evaluation)
- Data Mart Aggregation
- Member Inactivity

> **Connection to code:**
> - Batch Service → `endeavour-batch/`
> - Job XML definitions → `endeavour-batch/endeavour-batch-core/src/main/resources/`
> - Schema definitions → same location (XML files defining file formats)
> - Batch worker logic → uses REST API calls to `endeavour-application`

---

### 13.6) The Integration Layer — APIs and Adaptors (from "Integration API Guide" + "Communication & Adaptors")

#### REST APIs

ALP-E exposes **100+ REST endpoints** organized into:

**Member Resource Endpoints:**
- `POST /members` — Enrol a new member
- `GET /members/{id}` — Get member details
- `PUT /members/{id}` — Update member profile
- `GET /members/{id}/balance` — Get point balances
- `POST /members/{id}/interactions` — Submit an interaction (triggers MUs)
- `GET /members/{id}/transactions` — Transaction history
- `POST /members/{id}/redemptions` — Redeem points for rewards
- `GET /members/{id}/challenges` — View active challenges
- `GET /members/{id}/offers` — View available offers
- `POST /members/{id}/household` — Household (pool) accounts

**Reference Data Endpoints:**
- `GET /programmes/{code}/countries`
- `GET /programmes/{code}/currencies`
- `GET /programmes/{code}/statuses`
- `GET /programmes/{code}/segments`
- `GET /programmes/{code}/interactions/types`

**Technical details:**
- All endpoints require **OAuth2 bearer tokens** (obtained from Identity Service).
- Response format is **JSON** with **HATEOAS links** (each response includes links to related resources).
- A **WADL** (Web Application Description Language) file and **Java client library** are auto-generated.
- **Enunciate** generates the REST API documentation site from code annotations.

> **Connection to code:**
> - API endpoints → `endeavour-application/endeavour-application-resource/src/main/java/com/ga/endeavour/app/resource/`
> - e.g., `CountryResource.java`, `PartnerResource.java`, `MemberResource.java`
> - OAuth2 → `endeavour-identity/`
> - Enunciate docs → generated by Jenkins build job

#### Gateway Adaptors

Adaptors are **plugins** in the Gateway Service that integrate ALP-E with external systems. They use the **Service Provider Interface (SPI)** pattern — each adaptor registers itself with a Provider Registry.

**Out-of-the-box adaptors:**

| Adaptor | Type | What it does |
|---|---|---|
| **Elastic Email** | Communication | Sends emails to members via Elastic Email API |
| **SMTP** | Communication | Sends emails via standard SMTP server |
| **Unica E-Message** | Communication | Sends templated emails via IBM Unica |
| **Facebook** | Identity | Facebook Connect login + notification posts |
| **Foursquare** | Identity | Location check-in interactions |
| **PayPal** | Payment | Currency tipping rewards via PayPal |
| **Postcode Anywhere** | Data | Address lookup/verification |
| **Data Mart** | Reporting | Populates star schema for Pentaho reports |
| **Event Pull** | Data Extraction | External systems pull events from Mongo |
| **Event Push** | Data Extraction | Push events to external systems in real-time |

> **Connection to code:**
> - Gateway service → `endeavour-gateway/`
> - Facebook adaptor → `endeavour-gateway/endeavour-gateway-facebook/`
> - Data Mart → `endeavour-gateway/endeavour-gateway-data-mart/`

---

### 13.7) Identity & Security (from "Architecture Manual" + "User Roles & Permissions Guide")

#### OAuth2 Authentication

> **Simple:** Before any service can talk to another, it must prove who it is by getting a "ticket" (token) from the Identity Service.

**4 authentication flows:**
1. **3-step flow** — Login form hosted by Identity Service (for web apps)
2. **2-step flow** — Direct HTTP REST call to get token (for API clients)
3. **Client-only flow** — Machine-to-machine (for service-to-service calls)
4. **Refresh flow** — Renew an expiring token without re-authenticating

**At startup:** Every ALP-E service (Endeavour App, Batch, Gateway, etc.) calls Identity to get a **client token** before it can make any API calls to other services.

#### Roles & Permissions

- **System Roles** are created in Configuration Web → Maintain System Security.
- Each role has a set of **permissions** (e.g., `ACCESS_ADMIN_SVC`, `MANAGE_MEMBER`, `EDIT_ACCUMULATOR_BALANCE`).
- **Third-Party Applications (TPAs)** get their own OAuth2 client credentials with specific **scopes** limiting what APIs they can access.
- Password policies are configurable: length, complexity, lockout after N failed attempts.

> **Connection to code:**
> - `@PreAuthorize(CLIENT_AUTHORITY)` annotations on REST resources (e.g., `CountryResource.java`)
> - Identity Service → `endeavour-identity/`
> - Identity migrations → `endeavour-identity/endeavour-identity-core/src/main/migrations/`
> - LDAP integration supported for external identity providers

---

### 13.8) DevOps & Deployment (from "DevOps Guide" + "Technical Handbook")

#### CI/CD Pipeline

| Tool | Purpose |
|---|---|
| **Jenkins** | Continuous Integration — builds code, runs tests, deploys, provisions environments |
| **Bitbucket** | Git hosting (source control) |
| **Artifactory** | Maven repository (stores built JARs/WARs) — *this is the one we can't reach!* |
| **Puppet** | Configuration management — deploys and configures software on servers |
| **CloudFormation** | AWS infrastructure provisioning (templates create entire stacks) |
| **Sonar** | Code quality and test coverage analysis |
| **Crucible** | Code review tool |
| **Enunciate** | Auto-generates REST API documentation |

#### Production Deployment (AWS)

Each ALP-E installation runs in an **AWS VPC** with:

- **Web Subnet:** 2 NGINX servers → public ALB → web apps (Config Web, LTK, Call Centre, Member Web)
- **App Subnet:** 2+ app servers → private ALB → backend services (Endeavour App, Identity, Gateway, Search)
- **Batch Worker Subnet:** 4 worker nodes + Batch ActiveMQ
- **Utility Subnet:** Batch controller, Pentaho reporting, Zookeeper for Solr HA
- **Database Subnet:** MySQL primary + replica, MongoDB primary + secondary
- **Management Subnet:** Nagios monitoring, syslog, AWStats
- **DR Zone (AZ2):** Read-only replicated databases for disaster recovery

Each service runs in its own **Jetty instance** on a unique port within a **separate JVM** — exactly like our local development setup, but on EC2 instances.

> **Connection to our local setup:**
> - Locally we use `docker-compose.yml` instead of AWS CloudFormation
> - We run each service via `mvn jetty:run` instead of Puppet-deployed WARs
> - We use a single MySQL instance instead of a replication cluster
> - The architecture is identical — just scaled down

---

### 13.9) Monitoring & Operations (from "Operations Manual" + "Technical Handbook")

- **Nagios** monitors **380+ checks**: CPU, disk, network, JMX, MySQL, MongoDB, CloudWatch, application error thresholds
- **OSSEC** provides host-based intrusion detection
- **ClamAV** for virus scanning
- **ELK stack** (ElasticSearch, Logstash, Kibana) for centralized log analysis
- **AWStats** for web server analytics
- **JavaMelody** for in-app performance monitoring (configured in `web.xml`)
- **Tungsten Replicator** for CDC (Change Data Capture) — extracts MySQL binary log changes to feed analytics platforms

#### Incident Priority Levels

| Priority | Description | Response Time |
|---|---|---|
| **P1** | Critical — service down, major data loss | Immediate |
| **P2** | High — significant feature impaired | 4 hours |
| **P3** | Medium — minor feature issue, workaround exists | 8 hours |
| **P4** | Low — cosmetic, documentation, enhancement | Next sprint |

---

### 13.10) How This All Connects — The Big Picture for PAW

Now that you understand the official ALP-E architecture, here's how PAW fits in:

| ALP-E Concept | PAW Equivalent | Connection Point |
|---|---|---|
| **Endeavour Application** (core loyalty engine) | **PAW Service** (hierarchy engine) | PAW sends Terminal Events to Endeavour's interaction API |
| **MySQL ods schema** (member data) | **PAW's own MySQL/PostgreSQL schema** (`paw_*` tables) | PAW references ELP member IDs but stores hierarchy separately |
| **ActiveMQ event bus** | PAW could publish events to the same bus, or use its own | PAW's "Terminal Event" could be posted to an ActiveMQ topic |
| **Identity Service** (OAuth2) | PAW authenticates via the **same Identity Service** | PAW gets a client token just like any other ALP-E service |
| **Gateway adaptors** (SPI pattern) | PAW could be built **as a Gateway adaptor** or as a standalone sidecar | Standalone sidecar is recommended for independence |
| **Drools Rules Engine** (MU evaluation) | PAW does hierarchy math in O(1), then fires simplified events to Drools | Drools is relieved of hierarchy traversal |
| **Batch Framework** (Spring Batch) | PAW could have its own batch for bulk org-chart imports | Same pattern: file → staging → processing |
| **Configuration Web** | PAW would need its own admin UI or extend Config Web | Spring Boot + React recommended for PAW admin |

> **Key insight from the docs:** ALP-E was **designed** for extension via the Gateway SPI and event-driven architecture. PAW as a sidecar fits naturally into this design — it's essentially a new "Provider" that handles hierarchy, just like the Facebook or PayPal adaptors handle social login and payments.
