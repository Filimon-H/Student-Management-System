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

---

## 14) Trace Cookbook — Following Real Requests Through the Code

> **Why this matters:** Reading architecture diagrams is one thing. Actually knowing "which Java file handles this HTTP request, what gets called next, and where does the data end up" is what lets you debug, modify, and extend the system.

### 14.1) DEEP WALKTHROUGH: Member Enrolment (Create a New Loyalty Member)

This is the **most common operation** in any loyalty programme — a new customer signs up. We'll follow the request from the moment it hits the server until the member exists in the database and events are flying through the system.

#### The Business Story

> **Scenario:** A customer named "Sarah Jones" visits the ACME loyalty programme website and fills out an enrolment form with her name, email, and a loyalty card number. The website sends this data to ALP-E. ALP-E must:
> 1. Validate the data (is the programme active? is the card number unique? is the email format valid?)
> 2. Create a new member record in MySQL
> 3. Generate a member account (for tracking point balances)
> 4. Fire events (so the Event Hub stores it in MongoDB, the Search Service re-indexes for Call Centre search, and the Gateway can notify external systems)
> 5. Return a `201 Created` with the new member's URL

#### Step-by-Step Code Trace

```
HTTP Request:
POST /programs/ACME/members
Authorization: Bearer <OAuth2 token>
Content-Type: application/json

{
  "salutation": "Ms",
  "firstName": "Sarah",
  "lastName": "Jones",
  "gender": "FEMALE",
  "dateOfBirth": "1990-05-15",
  "language": "en_GB",
  "tokens": [
    {
      "type": "LOYALTY_CARD",
      "primaryTokenValue": "4000000000001234"
    }
  ],
  "addresses": [
    {
      "addressChannelName": "EMAIL",
      "value": "sarah.jones@example.com"
    }
  ]
}
```

---

#### STEP 1: HTTP Layer — `MemberResource.addNew()`

**File:** `endeavour-application/endeavour-application-resource/src/main/java/com/ga/endeavour/app/resource/member/MemberResource.java`

```java
@POST
@Consumes({APPLICATION_JSON, APPLICATION_ENDEAVOUR_VERSION1_JSON})
@Produces({APPLICATION_JSON, APPLICATION_ENDEAVOUR_VERSION1_JSON})
@PreAuthorize(PROGRAM_AND_VIEW_EDIT_MEMBER_AND_MAINTAIN_MEMBER_CLIENT_AUTHORITY
              + " or " + TPA_TO_MANAGE_BASIC_PROFILE)
public Response addNew(@PathParam(PROGRAM_CODE) ProgramCode programCode,
                       MemberRequest memberRequest,
                       @Context UriInfo uriInfo,
                       @QueryParam("sharingCode") String sharingCode) {
    memberRequest.setProgramCode(programCode.getValue());
    Member member = memberMediator.create(memberRequest, sharingCode);
    return Response.created(memberUriBuilder(uriInfo, member.getMemberId())).build();
}
```

**What happens here:**
1. **JAX-RS (RESTEasy)** deserializes the JSON body into a `MemberRequest` object.
2. **`@PreAuthorize`** checks: Does the caller's OAuth2 token have `MAINTAIN_MEMBER` + `VIEW_EDIT_BASIC_PROFILE_INFO` permissions? Or is it a trusted TPA with `RESOURCE_MEMBER_PROFILE_MANAGE` scope? If not → **403 Forbidden**.
3. Sets the programme code from the URL path onto the request object.
4. Delegates to `memberMediator.create()` — this is where the real work begins.
5. Returns **201 Created** with a `Location` header pointing to the new member's URL (e.g., `/programs/ACME/members/123456`).

**Key classes at this layer:**
- `MemberRequest` — DTO containing all the member fields (name, tokens, addresses, etc.)
- `ProgramCode` — Tiny type wrapper around a String (type safety)
- `MemberResource` is annotated `@Path("/programs/{programCode}/members")` — this is the URL pattern

---

#### STEP 2: Mediator Layer — `MemberMediator.create()`

**File:** `endeavour-application/endeavour-application-mediator/src/main/java/com/ga/endeavour/app/mediator/member/MemberMediator.java`

```java
@Override
@CacheSafeMethod
@Transactional(isolation = Isolation.READ_COMMITTED, propagation = Propagation.REQUIRED)
public Member create(MemberRequest memberRequest, String sharingCode) {
    // 1. Validate programme exists and is active
    programExistsAndActiveValidator.validateWithException(memberRequest.getProgramCode());

    // 2. Validate enrolment date + timezone
    memberRequestEnrolmentDateValidator.validateWithException(...);

    // 3. Validate location ID
    locationIdValidator.validateWithException(memberRequest.getLocationId());

    // 4. Check token uniqueness (is this loyalty card already used?)
    validateForUniqueTokenValue(memberRequest.getProgramCode(), memberRequest.getTokens());

    // 5. Load programme reference data (token types, statuses, countries, etc.)
    MemberContext memberContext = getMemberContext(memberRequest);

    // 6. Handle sharing/referral code if present
    if (StringUtils.isNotEmpty(sharingCode)) { ... validate and attach referrer ... }

    // 7. Load encryption config for sensitive tokens
    Map<String, ProviderConfigurationPayload> providerConfigurationMap =
        loadConfigurationForEncryptionTypes(memberRequest, ...);

    // 8. *** CORE: Create the member in the database ***
    MemberActionResult memberActionResult = memberService.create(memberContext, providerConfigurationMap);

    // 9. Create a point-balance account for the new member
    accountService.createAccount(memberRequest.getProgramCode(), memberId, false);

    // 10. Save profile answers (golden questions like "favourite colour")
    saveProfileAnswers(memberActionResults);

    // 11. Flush to DB (make sure member ID is generated)
    entityManager.flush();

    // 12. *** EVENTS: Fire member enrolment events ***
    memberEventRaiser.raiseEvents(memberActionResult);

    // 13. Fire status change event
    statusChangeEventRaiser.raiseEventFromMemberRequest(memberRequest);

    // 14. If referral, fire sharing events
    if (sharingCode != null) {
        eventBusNotifier.post(new EndeavourEvent(EventFamily.SHARING, ...));
    }

    return createdMember;
}
```

**What happens here (the business logic centre):**

| Step | What | Why |
|---|---|---|
| 1-4 | **Validation** | Fail fast — don't create garbage data. Programme must exist, card must be unique |
| 5 | **Load MemberContext** | MemberContext is a cached object containing ALL programme reference data (valid genders, token types, address channels, member statuses, countries). This avoids repeated DB queries |
| 6 | **Referral handling** | "Member Get Member" feature — Sarah was referred by an existing member |
| 7 | **Encryption config** | Some tokens (e.g., credit card numbers) need AES-256 encryption before storage |
| 8 | **Database persistence** | Calls `MemberServiceImpl.create()` which validates, assembles, and persists the `Member` entity |
| 9 | **Account creation** | Creates a row in the `me_member_account` table with zero balances for all currencies |
| 10 | **Profile answers** | Stores answers to "golden questions" configured for the programme |
| 11 | **Flush** | Forces Hibernate to execute the INSERT statements so the member ID is available |
| 12-14 | **Event raising** | Fires MEMBER ENROL event, ADDRESS NEW event, MEMBER_TOKEN ADD_TOKEN event, STATUS_CHANGE event, and optionally SHARING events |

---

#### STEP 3: Service Layer — `MemberServiceImpl.create()` → `createInternal()`

**File:** `endeavour-application/endeavour-member-repository/src/main/java/com/ga/endeavour/member/service/impl/MemberServiceImpl.java`

```java
@Override
@DashboardReportable
public MemberActionResult create(MemberContext memberContext, ...) {
    // Find pre-generated tokens (if batch-issued cards)
    List<GeneratedToken> generatedTokens = tokenGenerationService.findGeneratedTokens(...);
    // Delegate to createInternal
    MemberActionResult result = createInternal(memberContext, true, providerConfigurationMap);
    return result;
}

MemberActionResult createInternal(MemberContext memberContext, ...) {
    // 1. Create empty Member entity
    Member member = new Member();
    memberContext.member(member);

    // 2. Validate tokens against password rules
    validateRequestTokensWithPasswordRules(memberRequest, memberRequestTokenTypes);

    // 3. Encrypt sensitive token values (AES-256)
    maybeEncryptRequestTokens(memberRequest, ...);

    // 4. Run full creation validation strategy
    validationStrategy.validateCreate(memberContext).failIfErrors();

    // 5. Validate member states
    validationStrategy.validateMemberState(...).failIfErrors();

    // 6. *** ASSEMBLE: Map request DTO → domain entity ***
    member = assembleMemberAndSetProgramDefaults(memberContext);
    //   - Sets default status (e.g., "ACTIVE")
    //   - Sets default language (e.g., "en_GB")

    // 7. Generate loyalty tokens (auto-number if needed)
    memberTokenGenerationStrategy.generateAndUpdateMemberTokens(memberContext);

    // 8. Final token validation (uniqueness, format, mandatory checks)
    validateTokens(memberContext, member);

    // 9. *** PERSIST: Save to MySQL via Hibernate ***
    memberRepository.add(member);

    // 10. Record status history + state history
    updateStatusHistory(member, null);
    updateStateHistory(member, ...);

    // 11. Mark as new (for event raising logic)
    member.setNew(true);

    return new MemberActionResult(member, memberRequest, MemberActionType.Create, ...);
}
```

**What happens at the validation layer:**

The `MemberCreateValidationStrategy` (in `endeavour-member-repository/.../validation/strategy/`) runs:
- Bean validation annotations on `MemberRequest` (JSR-303: `@NotNull`, `@Size`, etc.)
- Gender validation against programme's configured genders
- Address validation (country exists? address template matches?)
- Status validation (must be an "initial" status like ACTIVE)

---

#### STEP 4: Repository Layer — `HibernateMemberRepository.add()`

**File:** `endeavour-application/endeavour-member-repository/src/main/java/com/ga/endeavour/member/repository/jpa/HibernateMemberRepository.java`

```java
@Override
public String add(Member member) {
    member.setCdcCreatedTimestamp(new LocalDateTime(this.clock.now()));
    currentSession().saveOrUpdate(member);
    this.auditRepository.log(member, MemberAuditType.CREATED, AuditRecord.SYSTEM_USER);
    return member.getMemberId();
}
```

**What happens:**
1. Sets a CDC (Change Data Capture) timestamp — used by Tungsten Replicator to detect changes.
2. **`currentSession().saveOrUpdate(member)`** — Hibernate writes the `Member` entity (and cascaded child entities like `MemberToken`, `Address`) to MySQL tables:
   - `me_member` — the member record
   - `me_member_tokens` — loyalty card numbers
   - `me_member_address` — email, physical address, etc.
3. **Audit log** — writes to `me_member_audit` table recording who created the member and when.

**MySQL tables affected:**

| Table | What gets inserted |
|---|---|
| `me_member` | memberId, programCode, firstName, lastName, gender, DOB, language, status, enrolmentDate |
| `me_member_tokens` | tokenType, primaryValue (card number), secondaryValue (hashed password), claimStatus |
| `me_member_address` | channelType (EMAIL), value (sarah.jones@example.com), country |
| `me_member_audit` | memberId, action (CREATED), user (SYSTEM), timestamp |
| `me_member_account` | memberId, programCode, accountId (from step 9 in Mediator) |
| `me_member_status_history` | memberId, statusCode (ACTIVE), fromDate |

---

#### STEP 5: Event Raising — `MemberEventRaiser.raiseEvents()`

**File:** `endeavour-application/endeavour-application-mediator/src/main/java/com/ga/endeavour/app/mediator/member/MemberEventRaiser.java`

```java
public void raiseEvents(@Nonnull MemberActionResult memberActionResult) {
    // 1. Map action type to event type: Create → ENROL
    EventType eventType = toEventType(memberActionResult.getMemberActionType(), ...);
    //    MemberActionType.Create → MemberEventTypes.ENROL

    // 2. Build MemberEventDetails (the event payload)
    MemberEventDetails details = toEventDetails(eventType, member);
    //    Contains: memberId, programCode, name, tokens, addresses, status, etc.

    // 3. Post MEMBER ENROL event to EventBus
    EndeavourEvent memberEvent = new EndeavourEvent(EventFamily.MEMBER, eventType, details);
    eventBus.post(memberEvent);

    // 4. Post ADDRESS NEW events (one per address)
    List<EndeavourEvent> addressEvents = buildAddressEvents(member);
    eventBus.post(addressEvents);

    // 5. Post MEMBER_TOKEN ADD_TOKEN events (one per token)
    List<EndeavourEvent> tokenEvents = buildEventForMemberRequestTokens(memberActionResult);
    eventBus.post(tokenEvents);
}
```

---

#### STEP 6: Event Transport — `EventBusNotifier` → ActiveMQ

**File:** `endeavour-platform/endeavour-platform-event/src/main/java/com/ga/endeavour/platform/event/service/EventBusNotifier.java`

```java
public void post(EndeavourEvent event) {
    if (deferringEvents(deferredEventHolder.get())) {
        // Async mode: collect events, send AFTER transaction commits
        postAsynchronous(event);
    } else {
        // Sync mode: send immediately to the event bus
        eventBus.post(event);
    }
}
```

**What happens:**
1. The `EventBusNotifier` is a Spring `TransactionListener`. For member creation, events are deferred until the DB transaction commits (so events are never sent for rolled-back members).
2. After commit, a new thread (`AsyncEventProcessing`) opens a new transaction and calls `eventBus.post(events)`.
3. The `SimpleEventBus` is backed by **Spring's `ApplicationEventMulticaster`** which dispatches to registered listeners.
4. One of those listeners is a **JMS template** that publishes the event JSON to an **ActiveMQ Virtual Topic**.

**The Virtual Topic pattern:**
```
Topic:     VirtualTopic.endeavour.events
           ↓                    ↓                    ↓
Queue: Consumer.eventhub.*   Consumer.gateway.*   Consumer.search.*
       (Event Hub Service)   (Gateway Service)    (Search Service)
```

Each consumer gets its own queue, so they process at their own pace. If Gateway is slow, it doesn't block Event Hub.

---

#### STEP 7: What Happens After — The Downstream Effects

Once the events are on ActiveMQ, three things happen in parallel:

**A) Event Hub (MongoDB storage)**
- Receives the `MEMBER ENROL` event
- Stores the full JSON payload in MongoDB collection `events.MEMBER_EVENT`
- This becomes the permanent event history (for reporting, auditing, data extraction)

**B) Gateway Service (external notifications)**
- If a Communication adaptor is configured (e.g., Elastic Email), the Gateway fires a "Welcome Email" to Sarah
- If an Event Push adaptor is configured, the event JSON is forwarded to the client's external system
- The Data Mart adaptor may aggregate member count metrics

**C) Search Service (Solr re-indexing)**
- Receives the event
- Indexes Sarah's name, email, card number into Solr
- Now Call Centre agents can search "Sarah Jones" and find her instantly

---

#### The Complete Flow Diagram

```
                    Sarah fills out form on ACME website
                                    │
                                    ▼
              POST /programs/ACME/members (JSON body)
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────┐
│ MemberResource.addNew()                        [RESOURCE]   │
│   ├── @PreAuthorize → OAuth2 permission check               │
│   └── memberMediator.create(memberRequest)                  │
│                        │                                     │
│                        ▼                                     │
│ MemberMediator.create()                        [MEDIATOR]   │
│   ├── programExistsAndActiveValidator.validate()             │
│   ├── validateForUniqueTokenValue()                          │
│   ├── getMemberContext()  ← loads programme reference data   │
│   ├── memberService.create()                                 │
│   │       │                                                  │
│   │       ▼                                                  │
│   │   MemberServiceImpl.createInternal()       [SERVICE]    │
│   │       ├── validateCreate() → bean validation + rules     │
│   │       ├── assembleMemberAndSetProgramDefaults()          │
│   │       ├── generateAndUpdateMemberTokens()                │
│   │       ├── memberRepository.add(member)                   │
│   │       │       │                                          │
│   │       │       ▼                                          │
│   │       │   HibernateMemberRepository.add()  [REPOSITORY] │
│   │       │       ├── session.saveOrUpdate(member)           │
│   │       │       │       → INSERT INTO me_member            │
│   │       │       │       → INSERT INTO me_member_tokens     │
│   │       │       │       → INSERT INTO me_member_address    │
│   │       │       └── auditRepository.log(CREATED)           │
│   │       │               → INSERT INTO me_member_audit      │
│   │       └── updateStatusHistory()                          │
│   │               → INSERT INTO me_member_status_history     │
│   │                                                          │
│   ├── accountService.createAccount()                         │
│   │       → INSERT INTO me_member_account                    │
│   │                                                          │
│   ├── entityManager.flush()  ← all INSERTs execute now      │
│   │                                                          │
│   ├── memberEventRaiser.raiseEvents()          [EVENTS]     │
│   │       ├── EventBusNotifier.post(MEMBER ENROL event)      │
│   │       ├── EventBusNotifier.post(ADDRESS NEW events)      │
│   │       └── EventBusNotifier.post(MEMBER_TOKEN events)     │
│   │                                                          │
│   └── statusChangeEventRaiser.raiseEvent()                   │
│           └── EventBusNotifier.post(STATUS_CHANGE event)     │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │ (after TX commits)
                         ▼
              ActiveMQ Virtual Topic
              ┌──────────┼──────────┐
              ▼          ▼          ▼
         Event Hub    Gateway    Search
         (MongoDB)   (Email,    (Solr
          stores     external    re-index)
          event)     notify)
```

---

#### File Reference Table (Every File Touched)

| Layer | File | Purpose |
|---|---|---|
| **Resource** | `endeavour-application-resource/.../member/MemberResource.java` | HTTP endpoint, security, delegates to mediator |
| **Request DTO** | `endeavour-application-resource/.../member/request/MemberRequest.java` | JSON → Java object mapping |
| **Mediator** | `endeavour-application-mediator/.../member/MemberMediator.java` | Orchestration: validate → create → account → events |
| **Context** | `endeavour-member-repository/.../service/MemberContext.java` | Cached programme reference data container |
| **Service** | `endeavour-member-repository/.../service/impl/MemberServiceImpl.java` | Business rules: validation strategy, token generation, assembly |
| **Validation** | `endeavour-member-repository/.../validation/strategy/MemberCreateValidationStrategy.java` | Bean validation + address + status checks |
| **Assembler** | `endeavour-member-repository/.../service/impl/MemberAssembler.java` | Maps `MemberRequest` DTO → `Member` domain entity |
| **Domain** | `endeavour-member-repository/.../domain/Member.java` | Hibernate entity (maps to `me_member` table) |
| **Repository** | `endeavour-member-repository/.../repository/jpa/HibernateMemberRepository.java` | Hibernate `session.saveOrUpdate()` |
| **Event Raiser** | `endeavour-application-mediator/.../member/MemberEventRaiser.java` | Builds events, posts to EventBus |
| **Event Details** | `endeavour-application-mediator/.../event/EventDetailsFactory.java` | Creates `MemberEventDetails` payload from `Member` entity |
| **Event Bus** | `endeavour-platform-event/.../service/EventBusNotifier.java` | Transaction-aware event posting (sync or deferred async) |
| **Event Payload** | `endeavour-platform-event/.../payload/details/MemberEventDetails.java` | The JSON structure of the MEMBER event |
| **Result** | `endeavour-member-repository/.../domain/MemberActionResult.java` | Wraps Member + original request + action type (Create/Update) |

---

### 14.2) Quick Trace: Post Interaction → Rules Engine → Points Awarded

> **Scenario:** A POS system sends a transaction: "Sarah spent £50 at Partner GROCER". ALP-E must evaluate all active Marketing Units and award points.

| Step | Class | What happens |
|---|---|---|
| 1 | `GenericInteractionResource.createGenericInteraction()` | Receives `POST /programs/ACME/members/{id}/generic-interaction` |
| 2 | `GenericInteractionEventAssembler.toInteractionEvent()` | Converts `ActionRequest` → `InteractionEvent` |
| 3 | `GatewayInteractionMediator.process()` | Resolves member (by token or ID), loads segments, checks earn permissions |
| 4 | `InteractionMediator.saveAndPublishInteraction()` | Persists the interaction in MySQL, then publishes to the event bus |
| 5 | `InteractionEventMediator` (event listener) | Picks up INTERACTION event, dispatches to Rules Engine via Apache Camel |
| 6 | **Rules Engine** (Drools, in `endeavour-re-rules/`) | Evaluates all active MU instances against the interaction. MU "Value 2x" fires → outcome: award 100 points |
| 7 | Back in Mediator | Follow-on actions: create EARN transaction, fire TRANSACTION event, fire ACCUMULATION event |
| 8 | `EventBusNotifier` → ActiveMQ | TRANSACTION event → Event Hub (MongoDB), Gateway (Data Mart), Search (re-index balance) |

**Key files:**
- `endeavour-application-resource/.../recognition/GenericInteractionResource.java` — entry point
- `endeavour-application-mediator/.../interaction/GatewayInteractionMediator.java` — orchestration
- `endeavour-application-mediator/.../interaction/InteractionMediator.java` — save + publish
- `endeavour-application-mediator/.../interaction/InteractionEventMediator.java` — event-driven follow-on
- `endeavour-re-rules/` — Drools rule files (the actual MU logic)

---

### 14.3) Quick Trace: Batch Member Enrolment (File Import)

> **Scenario:** A partner sends a CSV file with 10,000 new members. ALP-E processes it in bulk.

| Step | Where | What happens |
|---|---|---|
| 1 | sFTP / S3 | File `MEMBER_ENROLMENT_2024-01-15.csv` lands in S3 bucket |
| 2 | Batch Controller | `endeavour-batch/` validates CSV against schema XML, stages each row as a MongoDB document |
| 3 | Batch Controller | Posts 10,000 "job reference" messages to ActiveMQ batch queue |
| 4 | Batch Worker (x4) | Each worker picks messages, reads staged data from MongoDB |
| 5 | Batch Worker | For each record, calls `POST /programs/ACME/members/register` (same REST API as online!) |
| 6 | Endeavour App | Same flow as Section 14.1 — validate → create → events. But events are batched for performance |
| 7 | `MemberEventRaiser.raiseEvents(Iterable<MemberActionResult>)` | Collects ALL events into one composite list, posts once (ALP-21467 performance fix) |
| 8 | Reject file | Any failed records generate a reject file with error details |

**Key insight:** Batch doesn't bypass the core — it calls the same REST APIs. The only difference is:
- Events are batched (not one-by-one) for performance
- MongoDB is used for staging (isolation per job execution)
- Multiple worker nodes process in parallel

---

## 15) PAW Integration Contract (Proposed)

> **This section defines exactly how PAW would connect to the existing ALP-E system.** Based on the architecture analysis, **REST API integration** is recommended over direct ActiveMQ publishing, because:
> - PAW gets the benefit of all existing validation, security, and audit logic
> - No need to understand the internal event format
> - Easier to test (just HTTP calls)
> - Follows the same pattern as Batch Workers (external caller → REST → core logic → events)

### 15.1) Integration Choice: REST API (via OAuth2)

PAW authenticates to ALP-E exactly like any other Third-Party Application (TPA):

```
┌───────────┐         ┌──────────────┐         ┌──────────────────┐
│    PAW    │──(1)──▶│   Identity   │         │    Endeavour     │
│  Service  │◀──(2)──│   Service    │         │   Application    │
│           │         │  (OAuth2)    │         │                  │
│           │──(3)────────────────────────────▶│ POST /members    │
│           │◀──(4)────────────────────────────│ POST /interaction│
│           │──(5)────────────────────────────▶│ GET /balance     │
└───────────┘         └──────────────┘         └──────────────────┘

(1) POST /oauth/token {client_id, client_secret, grant_type=client_credentials}
(2) Response: {access_token: "abc123", expires_in: 3600}
(3-5) All subsequent calls include: Authorization: Bearer abc123
```

**PAW TPA Setup in Configuration Web:**
- Client ID: `paw-service`
- Client Secret: (generated)
- Scopes: `RESOURCE_MEMBER_PROFILE_MANAGE`, `RESOURCE_INTERACTIONS_RAISE`, `RESOURCE_EXTERNAL_CALL_CENTRE_MANAGE`
- User Role: `PAW_SERVICE_ROLE` with permissions: `MAINTAIN_MEMBER`, `VIEW_EDIT_BASIC_PROFILE_INFO`, `VIEW_INTR`

### 15.2) Terminal Event JSON Schema

When PAW computes a hierarchy result (e.g., "Sarah's manager Bob gets 5% of her points"), it sends a **Terminal Event** to ALP-E as an interaction:

```json
{
  "correlationId": "paw-evt-20240115-000001",
  "source": "PAW",
  "interactionType": "PAW_HIERARCHY_OUTCOME",
  "postedDate": "2024-01-15T14:30:00Z",
  "memberId": "123456",
  "programmeCode": "ACME",
  "tokenTypeCode": "LOYALTY_CARD",
  "primaryTokenValue": "4000000000001234",
  "timeZoneOffsetMinutes": 0,
  "capabilities": {
    "value": {
      "currencyCode": "POINTS",
      "amount": 500,
      "description": "Hierarchy bonus: 5% of downstream earn"
    }
  },
  "metadata": {
    "pawVersion": "1.0.0",
    "graphSnapshotId": "snap-20240115-001",
    "sourceNodeId": "node-sarah-123456",
    "targetNodeId": "node-bob-789012",
    "edgeType": "REPORTS_TO",
    "calculationType": "PERCENTAGE_DOWNSTREAM_EARN",
    "calculationValue": 0.05,
    "originalEarnInteractionId": "98765"
  }
}
```

**Field definitions:**

| Field | Required | Type | Purpose |
|---|---|---|---|
| `correlationId` | Yes | String | Unique ID for idempotency — if PAW retries, ALP-E can detect duplicates |
| `source` | Yes | String | Always "PAW" — for audit trail |
| `interactionType` | Yes | String | Must match a configured `ProgramInteractionType` in Config Web |
| `memberId` | Yes | String | The ALP-E member ID of the person receiving the outcome |
| `programmeCode` | Yes | String | The programme code |
| `capabilities.value` | Yes | Object | The points/currency to award |
| `metadata` | No | Object | PAW-specific data stored in the interaction payload for tracing |

### 15.3) Idempotency & Error Handling

| Concern | How PAW handles it |
|---|---|
| **Duplicate detection** | PAW includes `correlationId`. ALP-E's `InteractionMediator` detects duplicate interactions via `identityHash` and returns `409 Conflict` |
| **Retries** | PAW retries failed calls with exponential backoff (1s, 2s, 4s, max 30s). After 5 retries → dead-letter queue in PAW's own DB |
| **Partial failure** | If PAW computes outcomes for 100 members but call #47 fails, PAW marks #47 as "pending retry" and continues with #48-100 |
| **ALP-E down** | PAW queues events locally (in its own MySQL/PostgreSQL) and drains the queue when ALP-E recovers |
| **Stale graph** | PAW stamps every event with `graphSnapshotId`. If the graph was rebuilt since the event was computed, PAW can invalidate and recompute |

### 15.4) Observability

PAW should expose:
- **Spring Boot Actuator** endpoints: `/actuator/health`, `/actuator/metrics`, `/actuator/info`
- **Custom metrics**: `paw.events.sent`, `paw.events.failed`, `paw.graph.nodes.count`, `paw.graph.edges.count`
- **Structured logging** with `correlationId` in every log line (so you can trace a single event from PAW through ALP-E's logs)
- **Health check**: PAW's health endpoint should check:
  - Own database connectivity
  - ALP-E Identity Service reachability (can get OAuth token?)
  - ALP-E Endeavour App reachability (can call `/programs/{code}/countries`?)

### 15.5) Security Scopes Summary

| PAW Operation | ALP-E Endpoint | Required Scope/Permission |
|---|---|---|
| Get OAuth token | `POST /oauth/token` | Client credentials (TPA client_id + secret) |
| Send hierarchy outcome | `POST /programs/{code}/members/{id}/generic-interaction` | `RESOURCE_INTERACTIONS_RAISE` |
| Look up member | `GET /programs/{code}/members/{id}` | `RESOURCE_MEMBER_PROFILE_VIEW` |
| Look up member balance | `GET /programs/{code}/members/{id}/balance` | `RESOURCE_MEMBER_PROFILE_VIEW` |
| Batch import org hierarchy | (PAW's own endpoint, not ALP-E) | PAW internal auth |

---

> **Bottom line:** PAW integrates with ALP-E the same way any external system does — via OAuth2 + REST. It just happens to run as a sidecar on the same infrastructure. The ALP-E docs explicitly support this pattern through the TPA mechanism and the Gateway adaptor framework.

---

## 16) Local Development Environment — What Everything Is and Why You Need It

### 16.1) The Four Docker Services and Why Each One Exists

When you run `docker compose up` inside `infrastructure/dev-env-setup/`, four containers start. Each one is a real external system that the application depends on. **Without them the Java app cannot start at all** — it will fail trying to connect to things that don't exist.

---

#### MySQL 8 (`mysql8`)

**What it is:** A relational database — stores data in structured tables with rows and columns. The traditional kind of database you've heard of.

**Why ALP-E uses it:** It is the **primary source of truth** for almost everything:
- Member profiles (`me_member`, `me_member_tokens`, `me_member_address`)
- Programme configuration (`pr_program`, `pr_token_type`, `pr_member_status`)
- Interaction/transaction history (`re_interaction`)
- Account balances (`me_member_account`)
- Identity data — OAuth2 clients, users, scopes (`id_*` tables)

There are **6 separate MySQL schemas** (logical databases inside the same MySQL server), each owned by a different module:
| Schema | Owned by | What's in it |
|---|---|---|
| `endeavour_ods` | endeavour-application | Members, accounts, interactions |
| `endeavour_program` | endeavour-application | Programmes, tokens, statuses |
| `endeavour_identity` | endeavour-identity | OAuth2 clients, users, roles |
| `endeavour_recognition` | endeavour-application | Interactions, transactions |
| `endeavour_rules` | endeavour-re | Marketing Units, Drools rules |
| `endeavour_batch` | endeavour-batch | Batch job history |

**Why you need it locally:** Every single REST call reads from or writes to MySQL. No MySQL = the app throws `Connection refused` on startup and crashes.

---

#### MongoDB (`mongo`)

**What it is:** A "document database" — instead of rows/columns, it stores JSON-like documents. Think of it as a giant collection of JSON files you can query.

**Why ALP-E uses it for two completely separate purposes:**

**Purpose 1 — Event Hub storage (permanent event history):**
Every event (MEMBER ENROL, EARN TRANSACTION, STATUS CHANGE, etc.) is permanently stored as a JSON document in MongoDB. This is the "audit trail" and the source of data for reporting. When someone asks "show me all enrolments this month", the reporting service queries MongoDB — not MySQL. MySQL holds the current state; MongoDB holds the complete history of everything that ever happened.

**Purpose 2 — Batch job staging:**
When a 10,000-row CSV file comes in for batch processing, the Batch Controller reads the file and writes each row as a MongoDB document ("staging"). The Batch Workers then read from MongoDB rather than from the file. This isolates the batch job — if it crashes halfway through, the staged data is still there and the job can be retried.

**Why you need it locally:** Without MongoDB, the Event Hub service won't start, and any batch job will fail immediately when it tries to write staging data.

---

#### ActiveMQ (`activemq`)

**What it is:** A **message broker** — a middleman that lets one piece of software send a message to another piece of software without them needing to talk directly to each other. Like a post office: you drop a letter in, someone else picks it up later.

**Why ALP-E uses it:** It is the **nervous system** of the whole platform. Almost nothing is done synchronously after the core transaction commits. Instead:
1. The Endeavour Application posts events (MEMBER ENROL, EARN, STATUS CHANGE) to an ActiveMQ **Virtual Topic**.
2. Each downstream service (Event Hub, Gateway, Search) has its own **queue** that receives a copy of every message.
3. Each service processes at its own pace, independently.

**Concrete example:**
```
MemberMediator.create() commits to MySQL
         │
         └──▶ EventBusNotifier.post(MEMBER ENROL event)
                    │
                    ▼
              ActiveMQ Virtual Topic
              ┌────────┬────────┬────────┐
              ▼        ▼        ▼
         Event Hub  Gateway   Search
         (stores    (sends    (re-indexes
          to Mongo)  email)    Solr)
```

This design means:
- If Gateway is slow or down, members can still enrol (events queue up, Gateway catches up later)
- If you want to add a new service that reacts to enrolments, you just subscribe a new queue — no code change in the core

**Why you need it locally:** Without ActiveMQ, the `EventBusNotifier` fails to connect and throws JMS exceptions on startup. Any event-related functionality (which is almost everything) breaks.

---

#### Solr (`solr`)

**What it is:** A **search engine** — a specialised database optimised for full-text searching. When you type "Sarah Jones" in the Call Centre UI and it finds the right member instantly, Solr is doing that work. MySQL is terrible at this kind of search; Solr is built for exactly it.

**Why ALP-E uses it:** The Call Centre Search feature. When a member calls in, the agent searches by name, email, card number, or partial values. Solr has the member data indexed (pre-processed for fast searching). Every time a member is created or updated, a MEMBER event goes to the Search Service via ActiveMQ, and the Search Service tells Solr to re-index that member.

**Why you need it locally:** Without Solr, the Search Service (`endeavour-search`) won't start. If you're working on anything that touches member search, or you run integration tests, they'll fail with a Solr connection error. Even if you're not working on search directly, the Search Service's health check failure can cause problems with the overall application startup.

---

### 16.2) What `populate_mysql.sh` Did — Explained Simply

When you ran `populate_mysql.sh`, you **created all the database tables and loaded the minimum required reference data** so the application has something to work with. Without this, MySQL would be an empty server with no tables — the Java app would start, try to query a table that doesn't exist, and crash.

Specifically, the script did these things in order:

**Step 1 — Created the schemas (databases):**
```sql
CREATE DATABASE IF NOT EXISTS endeavour_ods;
CREATE DATABASE IF NOT EXISTS endeavour_program;
CREATE DATABASE IF NOT EXISTS endeavour_identity;
-- ... etc
```

**Step 2 — Ran Liquibase migrations:**
Each module has a set of SQL migration files (managed by Liquibase, a database versioning tool). The script ran all of them, which created every table in every schema:
- `me_member`, `me_member_tokens`, `me_member_address`, `me_member_account` (member module)
- `pr_program`, `pr_token_type`, `pr_member_status` (programme module)
- `id_oauth_client`, `id_user`, `id_role` (identity module)
- etc.

**Step 3 — Loaded seed/reference data:**
Inserted the minimum data rows the app needs to function:
- A default **Programme** (`DEMO` or `TEST`) so there's at least one active programme
- Default **OAuth2 clients** (the app itself, test clients) so authentication can work
- Default **roles and permissions** so users have something to log in as
- Default **token types** (e.g., `LOYALTY_CARD`) so member enrolment has a valid card type to reference
- Default **member statuses** (e.g., `ACTIVE`, `SUSPENDED`) so the status validation logic has valid values to check against

**In plain English:** Before `populate_mysql.sh`, MySQL was an empty box. After it, MySQL has the right shape (tables) and the minimum contents (seed data) for the Java application to start and do something useful.

---

### 16.3) Is the Local Environment Necessary to Build? What Can You Actually Do Locally?

**Short answer:** You can **compile and package** the code without Docker running. But you **cannot run and test** the application without Docker.

Here's the distinction:

| Action | Docker needed? | Command |
|---|---|---|
| Compile all Java code | ❌ No | `mvn compile` |
| Run unit tests | ❌ No | `mvn test` |
| Build JAR/WAR packages | ❌ No | `mvn package` |
| Run integration tests | ✅ Yes | `mvn verify` |
| Start the running application | ✅ Yes | `mvn jetty:run` |
| Test an API endpoint manually | ✅ Yes | `curl http://localhost:8080/...` |
| Debug live code | ✅ Yes | IDE debug → running Jetty |

**Why:** The Java code at compile time just becomes bytecode (`.class` files). It doesn't need a database to compile. But the moment you actually *run* the app, Spring tries to connect to MySQL, ActiveMQ, Solr, and MongoDB. If they're not there, it fails.

---

### 16.4) The Full Developer Workflow — How to Make a Change and Push It

Here is the exact workflow from "I want to change something" to "it's deployed":

#### Phase 1: Local Development (Your Mac)

```
1. Start Docker services:
   cd infrastructure/dev-env-setup
   docker compose up -d
   (starts mysql8, mongo, activemq, solr)

2. Build the module you're working on:
   cd infrastructure/endeavour-application
   mvn install -DskipTests
   (compiles, packages into WAR file)

3. Run the application locally:
   cd endeavour-application-app   (the deployable module)
   mvn jetty:run
   (starts embedded Jetty server on http://localhost:8080)

4. Make your code change in the IDE

5. Test it:
   curl -X POST http://localhost:8080/programs/DEMO/members \
        -H "Authorization: Bearer <token>" \
        -H "Content-Type: application/json" \
        -d '{"firstName":"Test", ...}'

6. Run unit tests:
   mvn test

7. When happy, commit and push to Git
```

#### Phase 2: CI/CD Pipeline (Jenkins, automatic)

```
Git push
    │
    ▼
Jenkins picks up the branch
    │
    ├── mvn verify (compile + unit tests + integration tests)
    ├── SonarQube (code quality check)
    └── If all pass → build Docker image → push to registry
```

#### Phase 3: Deployment (Puppet + AWS)

```
Docker image in registry
    │
    ▼
Puppet applies configuration to target environment (DEV/QA/PROD)
    │
    ▼
New container starts, old container stops (rolling deploy)
    │
    ▼
Smoke tests run (is /health returning 200?)
```

---

### 16.5) How Would You Build and Deploy PAW?

PAW is a **new, separate Spring Boot service** — not a module inside `endeavour-application`. Here's the workflow:

#### Development workflow for PAW:

```
1. Create new Git repo: paw-service (or a new module in the monorepo)

2. Start the local environment:
   docker compose up -d   ← mysql8, mongo, activemq, solr still needed
                            (PAW needs MySQL for its own tables,
                             and needs to talk to ALP-E which needs all four)

3. Add PAW's own tables to MySQL:
   CREATE DATABASE paw;
   CREATE TABLE paw_graph_nodes (...);
   CREATE TABLE paw_graph_edges (...);
   CREATE TABLE paw_pending_events (...);

4. Build PAW:
   cd paw-service
   mvn spring-boot:run
   (starts on a different port, e.g., http://localhost:8081)

5. PAW talks to local ALP-E:
   PAW → POST http://localhost:8080/oauth/token         ← gets token
   PAW → POST http://localhost:8080/programs/DEMO/...   ← posts interaction
   Both running locally, talking to same Docker containers

6. When happy, commit and push → CI/CD pipeline builds PAW's Docker image separately

7. In production: PAW container + ALP-E containers run side by side
   Both connect to the same MySQL server, same ActiveMQ, same MongoDB
   But PAW has its own schema (paw_*) that ALP-E doesn't touch
```

#### What you would actually change if building PAW from scratch:

| Task | Where | What you do |
|---|---|---|
| PAW's graph storage | New `paw-service` repo | Create Spring Boot project, Hibernate entities for nodes/edges |
| PAW's calculation engine | New `paw-service` repo | Write Java service that traverses graph, calculates percentages |
| PAW's ALP-E connector | New `paw-service` repo | `RestTemplate`/`WebClient` that calls ALP-E's REST APIs with OAuth2 token |
| Register PAW as a TPA in ALP-E | ALP-E Config Web | Add OAuth client `paw-service` with the right scopes |
| Add `PAW_HIERARCHY_OUTCOME` interaction type | ALP-E Config Web | Add new `ProgramInteractionType` record in MySQL |
| Configure Marketing Unit for PAW events | ALP-E Config Web | Create a new MU that fires when `interactionType = PAW_HIERARCHY_OUTCOME` |

**The key point:** You do NOT modify the ALP-E core code to add PAW. You configure ALP-E (through its Config Web UI, adding TPA credentials and interaction types), and you build PAW as a completely separate service. ALP-E never knows PAW exists — it just receives interactions from a registered client called "paw-service".

---

### 16.6) Summary: Why Each Piece Exists

| Component | Type | Lives where | Why it exists |
|---|---|---|---|
| **MySQL 8** | Relational DB | Docker container locally / AWS RDS in production | The main data store — member records, programmes, balances, identities |
| **MongoDB** | Document DB | Docker container locally / AWS DocumentDB in production | Event history (permanent audit log) + batch job staging |
| **ActiveMQ** | Message broker | Docker container locally / AWS MQ in production | Async event bus — decouples core app from downstream services |
| **Solr** | Search engine | Docker container locally / AWS EC2 in production | Full-text member search for Call Centre |
| **Jetty** | Web server | Embedded in Maven locally / Tomcat in production | Hosts the WAR file, handles HTTP requests |
| **Endeavour App** | Java WAR | `mvn jetty:run` locally / Tomcat container in production | The core loyalty engine — REST APIs, business logic, event raising |
| **PAW Service** | Java JAR (Spring Boot) | `mvn spring-boot:run` locally / Docker container in production | Hierarchy calculation sidecar — talks to ALP-E via REST |

---

## 17) Command Reference — Every Command You Will Use on This Project

> Every command listed here is something you will realistically type while working on this project. Each one is explained in plain English — what it does, when you use it, and what to expect.

---

### 17.1) Docker Commands

Docker runs the four infrastructure services (MySQL, MongoDB, ActiveMQ, Solr) as isolated containers on your Mac.

---

#### Starting and stopping the environment

```bash
# Start all four services in the background (-d = detached, runs without blocking your terminal)
docker compose up -d
```
> Run this from `infrastructure/dev-env-setup/`. After this command you have MySQL, MongoDB, ActiveMQ, and Solr running and ready. The Java app can now start.

```bash
# Stop all containers but keep their data (volumes preserved)
docker compose stop
```
> Use this when you're done for the day. All data you created (members, programmes, etc.) is still there when you start again.

```bash
# Stop AND delete all containers AND their data (full wipe)
docker compose down
docker compose down -v
```
> `down` removes containers but keeps volumes (data). `down -v` removes everything including all MySQL tables and MongoDB collections. Use `-v` when you want a clean slate — after this you need to re-run `populate_mysql.sh`.

```bash
# Start again after stopping
docker compose up -d
```

---

#### Checking what's running

```bash
# List all running containers and their status
docker ps
```
> Shows you each container's name, status (Up/Exited), and which ports it's listening on. You should see `mysql8`, `mongo`, `activemq`, `solr` all showing `Up`.

```bash
# List ALL containers including stopped ones
docker ps -a
```

```bash
# See live logs from a specific container
docker logs mysql8 -f
docker logs activemq -f
docker logs mongo -f
docker logs solr -f
```
> `-f` means "follow" — keeps streaming new log lines. Press `Ctrl+C` to stop. Use this to debug why a container isn't starting.

```bash
# See the last 50 lines of logs (without following)
docker logs mysql8 --tail 50
```

---

#### Getting inside a container

```bash
# Open a shell inside the MySQL container
docker exec -it mysql8 bash

# Then inside the container, open the MySQL client
mysql -u root -p
# Password: (whatever was set in docker-compose.yml, usually 'root' or 'endeavour')
```
> Use this to inspect the database directly — run SQL queries, check tables, verify data.

```bash
# Or connect to MySQL in one command without going inside the container
docker exec -it mysql8 mysql -u root -p
```

```bash
# Open a shell inside the MongoDB container
docker exec -it mongo bash
# Then start the mongo shell
mongosh
```

---

#### Rebuilding a container image

```bash
# Rebuild a specific service's image (if you changed its Dockerfile)
docker compose build mysql8

# Rebuild all services
docker compose build
```

---

### 17.2) Maven Commands

Maven is the build tool. It compiles Java code, runs tests, and packages the application into a deployable file (WAR or JAR). All Maven commands start with `mvn`.

---

#### Building

```bash
# Compile all Java source files — just checks for syntax errors, no tests
mvn compile
```
> Fastest check. If this fails, you have a compile error (wrong syntax, missing import, etc.).

```bash
# Compile + run all unit tests
mvn test
```
> Unit tests are fast (milliseconds each) and don't need Docker. If a test fails, Maven tells you which class and which assertion failed.

```bash
# Compile + test + package into a WAR/JAR file (skipping tests for speed)
mvn package -DskipTests
```
> Creates the deployable artifact in the `target/` folder. `-DskipTests` makes it faster by skipping test execution (compilation still happens).

```bash
# Compile + test + package + install into local Maven cache (~/.m2)
mvn install -DskipTests
```
> This is the one you run most often. `install` puts the built artifact in your local `~/.m2/repository` cache so other modules in the same project can depend on it. **Always run `install` before `jetty:run`.**

```bash
# Full build: compile + test + integration tests + package + install
mvn verify
```
> The "full" build that CI/CD runs. Slower because it includes integration tests (which need Docker running).

```bash
# Build only a specific module and everything it depends on
mvn install -pl endeavour-application-mediator -am -DskipTests
```
> `-pl` = project list (which module). `-am` = also make (build its dependencies first). Use this when you only changed one module and don't want to rebuild everything.

```bash
# Build everything from the parent, skipping all tests
mvn install -DskipTests
```
> Run from `infrastructure/endeavour-application/` to build all modules in the right order.

---

#### Running the application

```bash
# Start the application server (Jetty embedded web server) on port 8080
mvn jetty:run
```
> Run from the `endeavour-application-app/` directory (the deployable module). This starts the web server and keeps it running. You'll see `[INFO] Started Jetty Server` when it's ready. Press `Ctrl+C` to stop.

```bash
# Start with a specific port (if 8080 is taken)
mvn jetty:run -Djetty.port=9090
```

```bash
# Start Spring Boot application (for PAW or any Spring Boot module)
mvn spring-boot:run
```
> For Spring Boot projects. Starts the embedded Tomcat server. Uses `application.properties` or `application.yml` for configuration.

```bash
# Start Spring Boot with a specific profile (e.g., local vs production config)
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

---

#### Cleaning up

```bash
# Delete all compiled output (the target/ folder in every module)
mvn clean
```
> Run this when you get weird errors after switching branches — stale compiled `.class` files can cause confusing problems.

```bash
# Clean then build (most common combo when something is broken)
mvn clean install -DskipTests
```

---

#### Dependency inspection

```bash
# Show the full dependency tree for a module
mvn dependency:tree
```
> Useful when you get a "class not found" error — shows you which JAR provides which class, and whether there are conflicting versions.

```bash
# Show which dependencies are outdated
mvn versions:display-dependency-updates
```

```bash
# Download all dependencies without building (useful first step on a fresh clone)
mvn dependency:resolve
```

---

#### Running a specific test

```bash
# Run only one test class
mvn test -Dtest=MemberMediatorTest

# Run only one test method inside a class
mvn test -Dtest=MemberMediatorTest#shouldCreateMember
```

---

### 17.3) Git Commands

You'll use these to manage your code changes and collaborate with the team.

```bash
# See what files you've changed
git status

# See the actual diff of your changes
git diff

# Stage all changes for commit
git add .

# Stage a specific file
git add src/main/java/com/ga/endeavour/app/mediator/member/MemberMediator.java

# Commit your staged changes with a message
git commit -m "ALP-1234: Add PAW hierarchy outcome interaction type"

# Push your branch to the remote server
git push origin feature/paw-integration

# Pull the latest changes from the team
git pull

# Create a new branch for your feature
git checkout -b feature/paw-integration

# Switch back to main branch
git checkout main

# See all branches
git branch -a

# See recent commit history (last 10 commits, one line each)
git log --oneline -10

# See who last changed each line in a file
git blame src/main/java/.../MemberMediator.java
```

---

### 17.4) MySQL Commands (for inspecting the database)

Run these after connecting via `docker exec -it mysql8 mysql -u root -p`.

```sql
-- List all schemas (databases)
SHOW DATABASES;

-- Switch to the member schema
USE endeavour_ods;

-- List all tables in the current schema
SHOW TABLES;

-- See the structure of the member table
DESCRIBE me_member;

-- Find a specific member
SELECT member_id, first_name, last_name, status_code, enrolment_date
FROM me_member
WHERE program_code = 'DEMO'
LIMIT 10;

-- Check that a token exists
SELECT * FROM me_member_tokens WHERE primary_token_value = '4000000000001234';

-- Check member accounts (point balances)
SELECT * FROM me_member_account WHERE program_code = 'DEMO';

-- See all configured programmes
USE endeavour_program;
SELECT program_code, name, status FROM pr_program;

-- See all OAuth2 clients (who can call the API)
USE endeavour_identity;
SELECT client_id, scope FROM id_oauth_client;

-- See the Liquibase migration history (what schema versions have been applied)
USE endeavour_ods;
SELECT * FROM DATABASECHANGELOG ORDER BY dateexecuted DESC LIMIT 20;
```

---

### 17.5) cURL Commands (Testing the REST API Manually)

Use these to test API endpoints without needing a UI. Run from any terminal.

```bash
# Step 1: Get an OAuth2 access token (client credentials flow)
curl -X POST http://localhost:8081/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=endeavour-client&client_secret=secret"
# Response: {"access_token":"abc123...","expires_in":3600,"token_type":"bearer"}

# Save the token to a variable for reuse
TOKEN="abc123..."

# Step 2: Create a new member
curl -X POST http://localhost:8080/programs/DEMO/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Sarah",
    "lastName": "Jones",
    "gender": "FEMALE",
    "language": "en_GB",
    "tokens": [{"type": "LOYALTY_CARD", "primaryTokenValue": "4000000000001234"}],
    "addresses": [{"addressChannelName": "EMAIL", "value": "sarah@example.com"}]
  }'
# Response: 201 Created, Location: /programs/DEMO/members/123456

# Step 3: Retrieve a member
curl -X GET http://localhost:8080/programs/DEMO/members/123456 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"

# Step 4: Post an interaction (earn points)
curl -X POST http://localhost:8080/programs/DEMO/members/123456/generic-interaction \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "PURCHASE",
    "value": 5000,
    "currencyCode": "GBP",
    "source": "POS"
  }'

# Step 5: Check application health
curl http://localhost:8080/health
```

---

### 17.6) Liquibase Commands (Database Schema Management)

Liquibase tracks and applies database schema changes. ALP-E uses it to version-control all SQL.

```bash
# Apply all pending migrations (run from the module that owns the schema)
mvn liquibase:update

# Roll back the last migration
mvn liquibase:rollback -Dliquibase.rollbackCount=1

# See which migrations have been applied vs pending
mvn liquibase:status

# Generate a SQL file of what would be applied (without actually running it)
mvn liquibase:updateSQL
```
> You typically don't run these manually — `populate_mysql.sh` runs them for you. But if you add a new table to your feature, you create a new Liquibase changeset XML file and then run `mvn liquibase:update` to apply it.

---

### 17.7) Application Logs (Finding What Went Wrong)

When something breaks, these commands help you find the error.

```bash
# Follow the live application log (Jetty is running in another terminal)
# The log file is usually in the target/ or logs/ directory
tail -f target/logs/endeavour.log

# Search the log for ERROR lines
grep "ERROR" target/logs/endeavour.log

# Search for a specific member ID in the logs
grep "123456" target/logs/endeavour.log

# Search for a specific exception
grep "ValidationErrorException" target/logs/endeavour.log | tail -20

# See all logs from a specific class
grep "MemberMediator" target/logs/endeavour.log | tail -30
```

When `mvn jetty:run` is running in the foreground, the logs print directly to your terminal — no need for `tail`.

---

### 17.8) Useful One-Liners and Combos

```bash
# The "start everything and run the app" combo (do this every morning)
cd ~/aimia/infrastructure/dev-env-setup && docker compose up -d && \
cd ../endeavour-application && mvn install -DskipTests && \
cd endeavour-application-app && mvn jetty:run

# Full clean rebuild (use when something is inexplicably broken)
mvn clean install -DskipTests

# Check if the app is actually running
curl -s http://localhost:8080/health | python3 -m json.tool

# Check which port is being used (if you get "port already in use")
lsof -i :8080
lsof -i :8081

# Kill whatever is running on port 8080
kill -9 $(lsof -ti:8080)

# Check Docker is using too much memory/CPU
docker stats

# Remove ALL stopped containers and unused images (free up disk space)
docker system prune

# See how much disk Docker is using
docker system df

# Restart a single Docker container without stopping others
docker compose restart mysql8

# Connect to ActiveMQ admin UI in browser
open http://localhost:8161
# Default credentials: admin / admin
# Here you can see message queues, pending messages, dead-letter queues

# Connect to Solr admin UI in browser
open http://localhost:8983/solr
# Here you can run test queries against the search index
```

---

### 17.9) Quick Command Cheat Sheet

| Situation | Command |
|---|---|
| Start the dev environment | `docker compose up -d` (from `dev-env-setup/`) |
| Stop the dev environment | `docker compose stop` |
| Wipe everything and start fresh | `docker compose down -v` then re-run `populate_mysql.sh` |
| Build everything | `mvn clean install -DskipTests` |
| Run the application | `mvn jetty:run` (from `endeavour-application-app/`) |
| Run only one test class | `mvn test -Dtest=MyTestClass` |
| Check if app is running | `curl http://localhost:8080/health` |
| See running containers | `docker ps` |
| See container logs | `docker logs <name> -f` |
| Connect to MySQL | `docker exec -it mysql8 mysql -u root -p` |
| Clean a broken build | `mvn clean` |
| Check what's on a port | `lsof -i :8080` |
| Get an OAuth token | `curl -X POST http://localhost:8081/oauth/token ...` |
| Create a member via API | `curl -X POST http://localhost:8080/programs/DEMO/members ...` |

---

## 18) Drools Rules Engine — The Heart of Loyalty Recognition

### 18.1) What is Drools?

**Drools** is an open-source **business rules engine** (BRE) developed by Red Hat. Think of it as a specialized decision-making system where you write "if-then" rules in a declarative language, and the engine evaluates those rules against incoming data to produce outcomes.

**Simple analogy:**
```
Traditional code:
if (transaction.amount > 100 && member.tier == "GOLD") {
    awardPoints(transaction.amount * 2);
}

Drools rule (.drl file):
rule "Gold members get 2x points on purchases over £100"
when
    $txn : Transaction(amount > 100)
    $member : Member(tier == "GOLD")
then
    awardPoints($txn.amount * 2);
end
```

The difference: In traditional code, the logic is buried in Java classes. In Drools, the rules are **separate text files** (`.drl` files) that business analysts can read and modify without touching Java code.

---

### 18.2) Why ALP-E Uses Drools (Not Hard-Coded Java Logic)

In a loyalty platform, the **earning rules change constantly**:
- "This month: 3x points on groceries"
- "VIP members: bonus 500 points on first purchase"
- "Spend £50 at Partner X, get a free coffee voucher"

If these rules were hard-coded in Java, **every rule change would require**:
1. A developer to change the code
2. Recompile the application
3. Redeploy to production
4. Risk introducing bugs

With Drools, **business users can change rules** through the Configuration Web UI, and the new rules take effect immediately (or after a scheduled reload) — **no code deployment needed**.

---

### 18.3) How Drools Fits Into the ALP-E Architecture

From the Architecture Manual (lines 467-481):

> **Rules Engine (RE) is the heart of the ALP-E**, where member interactions are recognized and rewarded with points. The Rules engine is a sub-component of the Endeavour Engine, and Endeavour utilizes **Apache Camel** as a routing engine to send interactions to the Rules Engine and receives back a list of actions as outcomes.

> **Drools Rules implement the MU rules**, with necessary data access to fetch and perform the required evaluation to award loyalty currency. All REST APIs that handle incoming interactions to handle loyalty recognition calculation (points' calculation), in synchronous manner.

**The flow:**
```
1. Member makes a purchase → POS system posts interaction
                                    ↓
2. Endeavour Application receives POST /programs/ACME/members/{id}/generic-interaction
                                    ↓
3. InteractionMediator saves interaction to MySQL
                                    ↓
4. Interaction event posted to ActiveMQ
                                    ↓
5. Apache Camel route picks up the event
                                    ↓
6. Camel invokes Drools Rules Engine with:
   - The interaction (purchase amount, partner, date)
   - The member (tier, status, segments)
   - All active Marketing Units (MUs) for this programme
                                    ↓
7. Drools evaluates each MU rule:
   - MU "Grocery 3x": Does this interaction match? (partner == GROCER)
   - MU "VIP Bonus": Is member in VIP segment?
   - MU "Spend £50 Promo": Has member spent £50 this month?
                                    ↓
8. Drools returns a list of "Follow-On Actions":
   - Award 300 points (100 base + 200 bonus)
   - Send "Thank you" email
   - Increment "purchases this month" counter
                                    ↓
9. Action Handlers execute each action:
   - Create EARN transaction (300 points)
   - Fire TRANSACTION event → Event Hub, Gateway, Search
   - Fire COMMUNICATION event → Email service
```

---

### 18.4) What is a Marketing Unit (MU)?

A **Marketing Unit (MU)** is ALP-E's term for a **promotion or earning rule**. Each MU is implemented as one or more Drools rules.

**Examples of MUs:**
| MU Name | What it does | Drools rule logic |
|---|---|---|
| Base Earn | Award 1 point per £1 spent | `when Transaction(amount > 0) then award(amount * 1)` |
| Grocery 3x | Triple points at grocery partners | `when Transaction(partner.category == "GROCERY") then award(amount * 3)` |
| Birthday Bonus | 500 bonus points on your birthday | `when Member(today == dateOfBirth.dayOfYear) then award(500)` |
| Tiered Earn | Gold = 2x, Platinum = 3x | `when Member(tier == "GOLD") then multiplier = 2` |
| Spend & Get | Spend £100, get a £10 voucher | `when accumulate(Transactions over 30 days; sum(amount) > 100) then issue(voucher)` |

Each MU has:
- **Configuration** (stored in MySQL `endeavour_rules` schema): start date, end date, priority, eligibility segments
- **Rule logic** (Drools `.drl` files): the actual if-then conditions
- **Salience** (priority): if multiple MUs match, which fires first?

---

### 18.5) Where Drools Lives in the Codebase

Based on the architecture and the module structure:

**The Rules Engine is NOT in the `endeavour-application` repo you have locally.** It's a **separate service** (likely in a separate Git repo or a module you don't have yet). The official docs mention:

> "The Rules Engine is a sub-component of the Endeavour Engine"

This means it's either:
1. A separate Maven module (e.g., `endeavour-re-rules/` or `endeavour-rules-engine/`) that you'd find in the full enterprise repo
2. A separate microservice that runs alongside Endeavour Application

**What you DO have in your local repo:**
- **Apache Camel routes** in `endeavour-application` that dispatch interactions to the Rules Engine
- **MU configuration APIs** in `endeavour-application` (REST endpoints for Configuration Web to create/update MUs)
- **Action handlers** in `endeavour-application` that process the outcomes returned by Drools

**What you DON'T have locally (but exists in production):**
- The actual `.drl` rule files (Drools rule definitions)
- The Drools KieSession setup (the Java code that loads and executes rules)
- The MU instance executor (the component that runs each MU against an interaction)

---

### 18.6) How Configuration Web Manages MUs

From the Architecture Manual (line 412):
> "Manage Programme level MU configuration and interaction types"

**The workflow for creating a new promotion:**

```
1. Business user logs into Configuration Web
2. Navigate to "Marketing Units" → "Create New MU"
3. Fill in the form:
   - Name: "Summer Sale 5x Points"
   - Start Date: 2024-06-01
   - End Date: 2024-08-31
   - Interaction Type: PURCHASE
   - Partner: FASHION_RETAILER
   - Segments: ALL_MEMBERS
   - Rule Template: "Multiplier Earn"
   - Multiplier: 5
4. Configuration Web calls: POST /programs/ACME/marketing-units
5. Endeavour Application saves the MU config to MySQL (endeavour_rules schema)
6. Rules Engine picks up the new MU (either immediately or on next reload)
7. From June 1st, any purchase at FASHION_RETAILER triggers this MU → 5x points
```

**Behind the scenes:** The "Rule Template" is a pre-written Drools rule with placeholders. When you create the MU, the system fills in the placeholders (partner code, multiplier value) and generates the final `.drl` file.

---

### 18.7) Drools Rule File Example (What a .drl Looks Like)

This is what an actual Drools rule file might look like for a simple MU:

```drools
package com.ga.endeavour.rules.earn;

import com.ga.endeavour.recognition.domain.Interaction;
import com.ga.endeavour.member.domain.Member;
import com.ga.endeavour.rules.domain.MuInstance;
import com.ga.endeavour.rules.domain.FollowOnAction;

global java.util.List actions;

rule "Grocery 3x Points - MU Instance 12345"
    salience 100
    when
        $mu : MuInstance(muId == 12345, active == true)
        $interaction : Interaction(
            interactionType == "PURCHASE",
            partner.category == "GROCERY",
            amount > 0
        )
        $member : Member(
            status.code == "ACTIVE",
            segments contains "STANDARD"
        )
    then
        int basePoints = $interaction.getAmount();
        int bonusPoints = basePoints * 2;  // 3x total = base + 2x bonus
        
        FollowOnAction earnAction = new FollowOnAction();
        earnAction.setActionType("AWARD_POINTS");
        earnAction.setCurrencyCode("POINTS");
        earnAction.setAmount(basePoints + bonusPoints);
        earnAction.setDescription("Grocery 3x promotion");
        earnAction.setMuInstanceId($mu.getMuId());
        
        actions.add(earnAction);
        
        System.out.println("MU 12345 fired: awarded " + (basePoints + bonusPoints) + " points");
end
```

**What this rule says in plain English:**
- **When:** An active MU (ID 12345) exists, AND a member makes a purchase at a grocery partner, AND the member is active and in the STANDARD segment
- **Then:** Calculate 3x points (base + 2x bonus) and add an "AWARD_POINTS" action to the actions list

---

### 18.8) How Drools Executes (The KieSession Lifecycle)

```java
// Simplified version of what happens inside the Rules Engine

// 1. Load all active MU rules for this programme
KieServices kieServices = KieServices.Factory.get();
KieContainer kieContainer = kieServices.getKieClasspathContainer();
KieSession kieSession = kieContainer.newKieSession("endeavour-rules-session");

// 2. Insert facts (data) into the session
kieSession.insert(interaction);  // The purchase event
kieSession.insert(member);       // The member who made the purchase
kieSession.insert(muInstance1);  // MU "Grocery 3x"
kieSession.insert(muInstance2);  // MU "VIP Bonus"
kieSession.insert(muInstance3);  // MU "Base Earn"

// 3. Set up the global actions list
List<FollowOnAction> actions = new ArrayList<>();
kieSession.setGlobal("actions", actions);

// 4. Fire all rules (Drools evaluates every rule against the facts)
int rulesFired = kieSession.fireAllRules();
System.out.println("Fired " + rulesFired + " rules");

// 5. Dispose the session
kieSession.dispose();

// 6. Return the actions list to Endeavour Application
return actions;  // e.g., [AWARD_POINTS: 300, SEND_EMAIL: "thank_you.html"]
```

---

### 18.9) Why This Matters for PAW

If you're building PAW (the hierarchy extension), you have **two options** for how PAW outcomes integrate with the rules engine:

**Option 1: PAW bypasses Drools entirely**
- PAW calculates hierarchy bonuses (e.g., "Bob gets 5% of Sarah's earn")
- PAW posts the outcome directly as an interaction: `POST /programs/ACME/members/{bob-id}/generic-interaction`
- This interaction has `interactionType = "PAW_HIERARCHY_OUTCOME"`
- A simple Drools rule (or no rule at all) just awards the points as-is

**Option 2: PAW outcomes trigger Drools rules**
- PAW posts the same interaction
- But you create MUs that **react to** `PAW_HIERARCHY_OUTCOME` interactions
- Example MU: "If hierarchy outcome > 1000 points, also send a 'Top Performer' badge"
- This lets you layer additional logic on top of PAW's calculations

**Recommended:** Option 1 (bypass). PAW has already done the complex graph traversal. Drools would just be a pass-through. Keep it simple.

---

### 18.10) Key Drools Concepts Summary

| Concept | What it is | Example |
|---|---|---|
| **Rule** | An if-then statement | `when Member(tier == "GOLD") then award(bonus)` |
| **Fact** | Data inserted into the session | `Interaction`, `Member`, `MuInstance` |
| **KieSession** | The runtime environment where rules execute | Created per interaction, disposed after |
| **Salience** | Rule priority (higher = fires first) | MU with salience 100 fires before salience 50 |
| **Global** | A variable shared across all rules | `global List actions` — all rules add to this list |
| **Follow-On Action** | The output of a rule | `AWARD_POINTS`, `SEND_EMAIL`, `UPDATE_TIER` |
| **MU Instance** | A configured promotion | "Summer Sale 5x Points" (MU ID 12345) |
| **.drl file** | Drools rule language file | `grocery-3x-promo.drl` |

---

### 18.11) Where to Learn More About Drools

- **Official Drools docs:** https://docs.drools.org/
- **ALP-E docs you have:** `ALP-E R18 Architecture Manual.txt` (lines 467-481)
- **In the codebase (when you get the full repo):** Look for:
  - `endeavour-re-rules/` or `endeavour-rules-engine/` module
  - Files ending in `.drl`
  - Classes with `KieSession`, `KieContainer`, `KieServices`
  - The Apache Camel route that dispatches to the Rules Engine (probably in `endeavour-application-mediator` or a Camel-specific module)

---

> **Bottom line:** Drools is the "brain" that decides "should this member get points for this action?" It's separate from the core Endeavour Application, but tightly integrated via Apache Camel. Every interaction flows through Drools, which evaluates all active MUs and returns a list of actions (award points, send email, etc.). This design lets business users change earning rules without touching code.
