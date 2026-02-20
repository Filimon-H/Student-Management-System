# Spring Boot & Java — Complete Beginner's Guide
## Learning Through Our School Management System Project

This guide assumes you have **zero experience** with Java or Spring Boot. We will walk through every single file in our project, explain what it does, why we created it, and how all the pieces connect together.

---

# TABLE OF CONTENTS

1. The Big Picture — What Are We Building?
2. What is Java?
3. What is Spring Boot?
4. Project Structure — Where Everything Lives
5. pom.xml — The Shopping List (Dependencies)
6. Spring Boot Starters and Auto-Configuration
7. application.yml — The Settings File
8. The Main Class — Where It All Starts
9. Entities — Defining Our Data (The Database Tables)
10. Lombok — Writing Less Code
11. JPA and Hibernate — Talking to the Database
12. Repositories — The Database Helpers
13. DTOs — Data Transfer Objects
14. Services — The Business Logic
15. Controllers — The API Endpoints
16. Security — Protecting Our Application
17. JWT — JSON Web Tokens (Login System)
18. Role-Based Access Control
19. Data Seeder — Populating Demo Data
20. Dashboard API — Computing Real Statistics
21. How the Frontend Connects to the Backend
22. The Complete Request Lifecycle
23. Glossary of Annotations

---

# 1. The Big Picture — What Are We Building?

We built a **School Management System**. It is a web application where:
- **Admins** can manage students, teachers, classes, subjects, grades, and attendance
- **Teachers** can view their students, mark attendance, and enter grades
- **Students** can view their own profile, grades, and attendance

The application has two parts:
- **Backend** (this guide focuses on this) — A Java/Spring Boot server that stores data and provides an API
- **Frontend** — A React/TypeScript app that users interact with in their browser

The backend is like a **waiter in a restaurant**. The frontend (the customer) asks for something ("give me all students"), the backend (the waiter) goes to the kitchen (the database), gets the data, and brings it back.

### How They Communicate

```
[Browser/Frontend]  <--HTTP requests-->  [Spring Boot Backend]  <--SQL queries-->  [Database]
     (React)            (JSON data)           (Java)                (JPA)            (H2)
```

The frontend sends **HTTP requests** (like GET, POST, PUT, DELETE) to URLs like `http://localhost:8080/api/students`. The backend processes the request and sends back **JSON data** (a structured text format that looks like `{"firstName": "James", "lastName": "Smith"}`).

---

# 2. What is Java?

Java is a **programming language**. Think of it like English is a language for humans — Java is a language for computers.

### Key Java Concepts You Need to Know

**Classes** — Everything in Java lives inside a "class". A class is like a blueprint. For example, a `Student` class is a blueprint that says "every student has a name, email, and date of birth."

```java
public class Student {
    private String firstName;   // a text field
    private String lastName;    // another text field
    private String email;       // another text field
}
```

**Objects** — An object is a specific instance of a class. If `Student` is the blueprint, then "James Smith" is one object, and "Elena Rodriguez" is another object.

**Packages** — Java files are organized into folders called "packages". Our code lives in `com.school` and sub-packages like `com.school.entity`, `com.school.controller`, etc. This is just organization — like putting your clothes in different drawers.

**Interfaces** — An interface is like a contract. It says "any class that implements me must have these methods." For example, `JpaRepository` is an interface that says "I promise to have methods like `findAll()`, `save()`, `deleteById()`."

**Annotations** — These are special labels that start with `@`. They tell Spring Boot what to do with a class or method. For example, `@Entity` tells Spring "this class represents a database table." We will see MANY annotations — they are the backbone of Spring Boot.

**Enums** — A special type that represents a fixed set of values. Like our `Role` enum:

```java
public enum Role {
    ADMIN,      // can only be one of these three values
    TEACHER,
    STUDENT
}
```

---

# 3. What is Spring Boot?

### First, What is Spring?

**Spring** is a massive framework (a collection of pre-written code) for building Java applications. It handles things like connecting to databases, creating web servers, managing security, and hundreds of other things.

The problem? Spring by itself requires A LOT of configuration. You had to write XML files, manually set up every single thing. It was painful.

### Enter Spring Boot

**Spring Boot** is Spring's "opinionated" version. "Opinionated" means it makes decisions for you. Instead of you configuring everything manually, Spring Boot says:

> "Oh, you added a database dependency? I'll automatically configure a database connection for you. You added a web dependency? I'll automatically start a web server on port 8080."

This magic is called **Auto-Configuration** — and it is the number one thing that makes Spring Boot special.

### The Key Idea: Convention Over Configuration

Spring Boot follows a philosophy: **if most people do it this way, let's make that the default**. You only need to configure things when you want something different from the default.

For example:
- Default port is 8080 (we kept it)
- Default database behavior is "don't create tables automatically" (we changed it to `create-drop`)
- Default security is "block everything" (we customized it to allow login without a token)

---

# 4. Project Structure — Where Everything Lives

Here is our complete backend folder structure and what each folder/file means:

```
backend/
├── pom.xml                          <-- The dependency file (like package.json in Node.js)
├── src/
│   ├── main/
│   │   ├── java/com/school/         <-- All our Java code lives here
│   │   │   ├── SchoolManagementApplication.java  <-- THE starting point of the app
│   │   │   ├── config/              <-- Configuration classes
│   │   │   │   ├── AppConfig.java           <-- General app config (password encoder)
│   │   │   │   ├── SecurityConfig.java      <-- Security rules (who can access what)
│   │   │   │   ├── JwtAuthenticationFilter.java <-- Checks JWT tokens on every request
│   │   │   │   └── DataSeeder.java          <-- Fills database with demo data on startup
│   │   │   ├── controller/          <-- API endpoints (where HTTP requests arrive)
│   │   │   │   ├── AuthController.java      <-- Login and Register endpoints
│   │   │   │   ├── StudentController.java   <-- Student CRUD endpoints
│   │   │   │   ├── TeacherController.java   <-- Teacher CRUD endpoints
│   │   │   │   ├── DashboardController.java <-- Dashboard statistics endpoint
│   │   │   │   ├── AttendanceController.java<-- Attendance endpoints
│   │   │   │   ├── GradeController.java     <-- Grade endpoints
│   │   │   │   └── ... (more controllers)
│   │   │   ├── service/             <-- Business logic (the "brain" of the app)
│   │   │   │   ├── AuthService.java         <-- Login/register logic + user loading
│   │   │   │   ├── StudentService.java      <-- Student business logic
│   │   │   │   └── ... (more services)
│   │   │   ├── repository/          <-- Database access (talks to the database)
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── StudentRepository.java
│   │   │   │   └── ... (more repositories)
│   │   │   ├── entity/              <-- Database table definitions
│   │   │   │   ├── User.java               <-- The users table
│   │   │   │   ├── Student.java            <-- The students table
│   │   │   │   ├── Teacher.java            <-- The teachers table
│   │   │   │   ├── Role.java               <-- The role enum (ADMIN/TEACHER/STUDENT)
│   │   │   │   └── ... (more entities)
│   │   │   ├── dto/                 <-- Data Transfer Objects (shapes of data sent/received)
│   │   │   │   ├── AuthRequest.java        <-- Shape of login request
│   │   │   │   ├── AuthResponse.java       <-- Shape of login response
│   │   │   │   ├── StudentDTO.java         <-- Shape of student data
│   │   │   │   └── ... (more DTOs)
│   │   │   ├── exception/           <-- Custom error classes
│   │   │   └── util/                <-- Utility classes
│   │   │       └── JwtUtil.java            <-- JWT token creation and validation
│   │   └── resources/
│   │       └── application.yml      <-- App settings (database, port, JWT secret)
│   └── test/                        <-- Test files
```

### Why This Structure? — Layered Architecture

This is called **layered architecture**. Each layer has one job:

```
[Controller]  -->  receives HTTP requests, sends HTTP responses
      |
      v
[Service]     -->  contains business logic (rules, calculations)
      |
      v
[Repository]  -->  talks to the database (save, find, delete)
      |
      v
[Entity]      -->  defines what the database tables look like
```

**Why not put everything in one file?** Because:
1. **Separation of concerns** — each file has ONE job, making it easier to understand
2. **Reusability** — the `StudentService` can be used by multiple controllers
3. **Testability** — you can test each layer independently
4. **Maintainability** — when something breaks, you know exactly where to look

---

# 5. pom.xml — The Shopping List (Dependencies)

### What is Maven?

**Maven** is a build tool. It does two things:
1. **Downloads libraries** (dependencies) that our project needs from the internet
2. **Builds** our project (compiles Java code into runnable files)

Think of Maven like `npm` in JavaScript. The `pom.xml` file is like `package.json`.

### What is pom.xml?

POM stands for **Project Object Model**. It is an XML file that tells Maven what our project is called, what version of Java we use, and what libraries we need.

Let us go through our `pom.xml` piece by piece:

### The Parent

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.2</version>
</parent>
```

**What this does:** This says "our project inherits from Spring Boot 3.2.2." The `starter-parent` provides default settings for all Spring Boot projects — like which version of Java to use, how to compile, etc. Think of it as a template that gives us sensible defaults so we do not have to configure everything ourselves.

### Properties

```xml
<properties>
    <java.version>17</java.version>
    <jjwt.version>0.12.3</jjwt.version>
</properties>
```

**What this does:** Defines variables we can reuse. `java.version` tells Maven to compile with Java 17. `jjwt.version` is the version number for our JWT library so we do not repeat "0.12.3" three times below.

### The Dependencies (Our Shopping List)

Each `<dependency>` is a library we are adding to our project. Here is what each one does and WHY we need it:

#### Dependency 1: spring-boot-starter-web

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

**What it gives us:** Everything needed to build a web API:
- An embedded **Tomcat** web server (so we do not need to install a separate server)
- The ability to create **REST endpoints** (`@RestController`, `@GetMapping`, etc.)
- Automatic **JSON conversion** (Java objects to JSON and back)
- HTTP request handling

**Why we need it:** Without this, our application cannot receive HTTP requests from the frontend. It would just be a Java program that starts and does nothing.

**Notice:** We did not specify a version number! That is because the `starter-parent` already knows which version of `spring-boot-starter-web` is compatible with Spring Boot 3.2.2. This is one of the benefits of using the parent POM.

#### Dependency 2: spring-boot-starter-data-jpa

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

**What it gives us:**
- **JPA** (Java Persistence API) — a standard way to talk to databases using Java objects instead of writing SQL
- **Hibernate** — the actual implementation that converts Java objects to SQL queries behind the scenes
- The ability to write `@Entity` classes that automatically become database tables
- `JpaRepository` — a magic interface that gives us `findAll()`, `save()`, `delete()` for free without writing any code

**Why we need it:** Without this, we would have to write raw SQL queries by hand for every database operation. JPA lets us work with Java objects and it handles the SQL for us. Instead of writing `INSERT INTO students (first_name, last_name) VALUES ('James', 'Smith')`, we just write `studentRepository.save(student)`.

#### Dependency 3: spring-boot-starter-security

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

**What it gives us:**
- Password hashing (so we never store plain text passwords in the database)
- Authentication (verifying who you are — "are you really admin@school.com?")
- Authorization (checking what you are allowed to do — "can this user delete students?")
- Security filters that intercept every HTTP request before it reaches our controllers

**Why we need it:** A school system has sensitive data. We need to make sure only logged-in users can access it, and that students cannot do admin things like deleting other students.

#### Dependency 4: spring-boot-starter-validation

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

**What it gives us:** Annotations like `@NotBlank`, `@Email`, `@Valid` that automatically check if incoming data is valid before we process it.

**Why we need it:** When someone sends a request to create a student, we need to make sure they actually provided a name and a valid email address. Without validation, bad data (empty names, invalid emails) could enter our database and cause problems later.

#### Dependency 5: H2 Database

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

**What it gives us:** An **in-memory database**. It runs entirely in your computer's RAM — no installation needed, no files on disk, no database server to manage.

**Why we need it:** During development, we do not want to install and configure a real database like PostgreSQL or MySQL. H2 is instant — it starts with our app and disappears when we stop it.

**What does `<scope>runtime</scope>` mean?** It means this library is only needed when the app is actually running, not when compiling. Our Java code never directly references H2 classes — Hibernate talks to it behind the scenes.

**Trade-off:** Since it is in-memory, ALL data is lost when you restart the app. That is exactly why we created a DataSeeder (Section 19) to re-populate demo data on every startup.

#### Dependency 6: JWT Libraries (jjwt-api, jjwt-impl, jjwt-jackson)

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>${jjwt.version}</version>
</dependency>
```

**What it gives us:** The ability to create and validate **JSON Web Tokens** — the industry standard for API authentication.

**Why we need it:** When a user logs in, we give them a token (a long string). They send this token with every future request to prove they are logged in. We need a library to create these tokens and verify they are valid and not expired.

**What is `${jjwt.version}`?** This references the property we defined earlier (0.12.3). Maven replaces `${jjwt.version}` with `0.12.3` at build time. The three jjwt dependencies are: the API (interfaces/contracts), the implementation (actual working code), and the Jackson integration (for JSON parsing inside tokens).

#### Dependency 7: Springdoc OpenAPI (Swagger)

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

**What it gives us:** An automatic, interactive API documentation page at `http://localhost:8080/swagger-ui.html`. It scans all our controllers and generates a web page where you can see every endpoint and even test them by clicking buttons.

**Why we need it:** During development, it lets you test your API without needing the frontend to be running. You can send requests directly from your browser.

#### Dependency 8: Lombok

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

**What it gives us:** Annotations that auto-generate repetitive Java code (getters, setters, constructors, builders) at compile time. We cover this in detail in Section 10.

**Why we need it:** Java is verbose. Without Lombok, every entity class would be 3x longer with boilerplate code that adds no value.

**What does `<optional>true</optional>` mean?** It means if someone else depends on our project, they will not automatically get Lombok. It is only for our development use.

### The Build Section

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <excludes>
                    <exclude>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                    </exclude>
                </excludes>
            </configuration>
        </plugin>
    </plugins>
</build>
```

**What this does:** The `spring-boot-maven-plugin` lets us run our app with `mvn spring-boot:run` and package it as a runnable JAR file. The `<excludes>` section removes Lombok from the final JAR because Lombok only works at compile time — it is not needed at runtime.

---

# 6. Spring Boot Starters and Auto-Configuration

### What Are Starters?

Notice how all our Spring dependencies start with `spring-boot-starter-`? These are called **starters**. A starter is a bundle — it pulls in multiple libraries at once so you do not have to add them individually.

For example, `spring-boot-starter-web` actually pulls in:
- `spring-web` (core web framework)
- `spring-webmvc` (MVC pattern support)
- `spring-boot-starter-tomcat` (embedded web server)
- `spring-boot-starter-json` (Jackson JSON library)
- And more...

Without starters, you would have to add each of these individually AND make sure their versions are compatible with each other. Starters save you from "dependency hell" — the nightmare of incompatible library versions.

### What is Auto-Configuration?

This is the **magic** of Spring Boot. When you add a starter, Spring Boot automatically configures everything for you. You write zero configuration code and things just work.

Here is what happens when our app starts:

1. Spring Boot sees `spring-boot-starter-data-jpa` in pom.xml
2. It sees `h2` database driver in pom.xml
3. It reads `application.yml` and finds the datasource URL
4. It **automatically**:
   - Creates a database connection pool
   - Sets up Hibernate as the JPA provider
   - Configures the H2 dialect
   - Scans for `@Entity` classes and creates database tables for each one

You did not write ANY of that configuration code. Spring Boot did it all because you added the right dependencies and a few lines in `application.yml`.

**Another example:** When Spring Boot sees `spring-boot-starter-security`:
- It automatically protects ALL endpoints (requires authentication for everything)
- It sets up a security filter chain
- It configures session management
- It creates a default login page

We then **customize** this default behavior in `SecurityConfig.java` to say "actually, let `/api/auth/**` be public so people can log in."

### How Does Auto-Configuration Work Internally?

Spring Boot has special files inside each starter JAR that list auto-configuration classes. Each class has `@Conditional` annotations that say things like:
- "Only configure a DataSource IF the H2 driver class exists on the classpath"
- "Only configure this IF no other DataSource bean has been defined by the developer"

This means: **auto-configuration only kicks in when it makes sense**, and you can always override it with your own configuration. It is smart — it does not fight with your custom code.

---

# 7. application.yml — The Settings File

This file lives at `src/main/resources/application.yml`. It is where we configure our application. Spring Boot reads this file automatically on startup.

**Why .yml and not .properties?** Spring Boot supports both formats. YAML (`.yml`) is more readable because it uses indentation instead of repeating long prefixes. Both work the same way. For example, `spring.datasource.url=...` in .properties becomes a nested structure in YAML.

Let us go through every single line:

```yaml
spring:
  main:
    allow-circular-references: true
```

**What:** Allows two beans (Spring-managed objects) to depend on each other in a circle. We needed this because our `AuthService` needs the `AuthenticationManager`, but the `AuthenticationManager` needs the `AuthService` (since it implements `UserDetailsService`). They depend on each other.

**Why:** Without this, the app would crash on startup with a "circular reference" error. This is a known issue with Spring Security setups. We also used `@Lazy` on the `AuthenticationManager` injection to help break the cycle.

```yaml
  application:
    name: school-management-system
```

**What:** Gives our application a human-readable name. Used in logs and monitoring tools.

```yaml
  datasource:
    url: jdbc:h2:mem:school_db;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
    username: sa
    password:
```

**What:** Tells Spring how to connect to our database. Let us break down the URL:
- `jdbc:` — This is a JDBC connection (Java Database Connectivity — the standard way Java talks to databases)
- `h2:` — We are using the H2 database
- `mem:` — In-memory mode (data lives in RAM, not on disk)
- `school_db` — The name of our database
- `DB_CLOSE_DELAY=-1` — Keep the database alive as long as the app runs (without this, H2 might close the database when no connections are active)
- `driver-class-name: org.h2.Driver` — Which Java class to use for connecting to H2
- `username: sa` — Default H2 username ("sa" stands for system admin)
- `password:` — Empty password (perfectly fine for development)

**Why:** Without this, Spring Boot would not know WHERE to store our data. It needs a database URL to connect to.

```yaml
  h2:
    console:
      enabled: true
      path: /h2-console
```

**What:** Enables a web-based database viewer at `http://localhost:8080/h2-console`. You can open this URL in your browser, enter the JDBC URL from above, and run SQL queries directly against the database to see what is inside your tables.

**Why:** Extremely useful for debugging. If you are not sure whether your data seeder worked correctly, you can open the H2 console and run `SELECT * FROM students` to see all rows.

```yaml
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.H2Dialect
        format_sql: true
```

**What:** This section configures JPA/Hibernate behavior:

- **`ddl-auto: create-drop`** — This is critical. DDL stands for "Data Definition Language" (SQL commands that create/alter/drop tables). This setting tells Hibernate to:
  1. **Create** all database tables when the app starts (based on our `@Entity` classes)
  2. **Drop** (delete) all tables when the app stops
  
  Other options you should know about:
  - `update` — Only add new columns/tables, never delete existing ones (good for production with a real database)
  - `validate` — Do not change anything, just check that existing tables match your entities
  - `none` — Do absolutely nothing to the database schema

- **`show-sql: false`** — If set to `true`, Hibernate prints every SQL query it generates to the console. Useful for debugging but very noisy. Set to `true` temporarily if you want to see what SQL Hibernate is running.

- **`dialect: H2Dialect`** — Tells Hibernate which "flavor" of SQL to generate. Different databases have slightly different SQL syntax. H2Dialect generates SQL that H2 understands.

- **`format_sql: true`** — If `show-sql` is true, this makes the SQL output nicely formatted instead of all on one line.

**Why `create-drop`?** Because we are using an in-memory database that is completely empty on every restart. We WANT fresh tables every time. Our `DataSeeder` (Section 19) then fills them with demo data automatically.

```yaml
server:
  port: 8080
```

**What:** The port number our web server listens on. When the frontend sends a request to `http://localhost:8080/api/students`, the `8080` is this port.

**Why 8080?** It is the default for Spring Boot and a common convention for development servers. The frontend runs on port 5173 (Vite's default), so they do not conflict.

```yaml
app:
  jwt:
    secret: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
    expiration: 86400000
```

**What:** These are **custom properties** that we invented ourselves. Spring Boot does not have built-in JWT support, so we created our own configuration:
- `secret` — A long random hex string used as the cryptographic key to sign JWT tokens. Think of it as a password that only the server knows. If someone does not know this secret, they cannot create valid tokens.
- `expiration` — How long a token is valid, in milliseconds. 86400000 ms = 86400 seconds = 1440 minutes = 24 hours.

**How do we read these in Java?** In our `JwtUtil.java` class, we use:
```java
@Value("${app.jwt.secret}")
private String secretKey;

@Value("${app.jwt.expiration}")
private long jwtExpiration;
```

The `@Value` annotation tells Spring: "Read this value from application.yml and inject it into this field." The `${}` syntax is Spring's way of referencing configuration properties.

---

# 8. The Main Class — Where It All Starts

**File:** `SchoolManagementApplication.java`

```java
package com.school;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SchoolManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(SchoolManagementApplication.class, args);
    }
}
```

This tiny file is the **entry point** of our entire application. When you run `mvn spring-boot:run` in the terminal, Java looks for the `main` method and executes it.

### What Does @SpringBootApplication Do?

This single annotation is actually **three annotations combined** into one for convenience:

**1. @SpringBootConfiguration** — Marks this class as a configuration source. It tells Spring "this class can define beans and settings."

**2. @EnableAutoConfiguration** — This is the magic switch. It tells Spring Boot: "Look at all the dependencies in pom.xml and automatically configure everything you can." This is WHY adding `spring-boot-starter-data-jpa` + `h2` automatically sets up a database connection — this annotation triggers all that auto-configuration logic we discussed in Section 6.

**3. @ComponentScan** — Tells Spring: "Scan the `com.school` package and ALL sub-packages (`com.school.controller`, `com.school.service`, `com.school.repository`, etc.). Find every class that has annotations like `@Controller`, `@Service`, `@Repository`, `@Component`, `@Configuration`, and register them as Spring beans."

### What is a "Bean"?

A **bean** is simply an object that Spring creates and manages for you. Instead of you writing `new StudentService()` and `new StudentRepository()` and wiring them together manually, Spring does it all automatically. This is called **Dependency Injection** (DI) — one of the most important concepts in Spring.

Here is how it works:

1. Spring sees `@Service` on `StudentService` and creates an instance of it
2. Spring sees that `StudentService` has a constructor that needs a `StudentRepository`
3. Spring sees `@Repository` (or just `JpaRepository`) on `StudentRepository` and creates an instance of it
4. Spring passes the `StudentRepository` instance into the `StudentService` constructor
5. Now `StudentService` can use `StudentRepository` without ever calling `new`

**Why is this useful?** Because you never have to worry about creating objects or managing their lifecycle. Spring handles it all. And if you want to swap out an implementation (like replacing H2 with PostgreSQL), you change one configuration — not every file that uses the database.

### What Does SpringApplication.run() Do?

When this single line executes, here is what happens in order:

1. Creates the Spring **Application Context** (a container that holds all beans)
2. Performs **component scanning** (finds all `@Controller`, `@Service`, `@Repository`, `@Component`, `@Configuration` classes)
3. Runs **auto-configuration** (sets up database, web server, security, etc. based on dependencies)
4. Creates all **beans** and wires them together via dependency injection
5. Starts the **embedded Tomcat** web server on port 8080
6. Runs any **CommandLineRunner** beans (like our `DataSeeder` which fills the database with demo data)
7. Prints "Started SchoolManagementApplication" to the console
8. The application is now ready to receive HTTP requests from the frontend!

All of this happens in just a few seconds. That is the power of Spring Boot.

---

# 9. Entities — Defining Our Data (The Database Tables)

An **entity** is a Java class that represents a **database table**. Each instance (object) of that class represents one **row** in that table. Each field in the class represents one **column** in that table.

### The User Entity — Our Most Important Entity

**File:** `entity/User.java`

```java
@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}
```

Let us break down every single annotation and line:

**`@Entity`** — Tells JPA/Hibernate: "This class is a database table." Without this annotation, Hibernate would completely ignore this class and no table would be created.

**`@Table(name = "users")`** — Specifies the actual table name in the database. Without this, the table would be named "user" (the class name in lowercase). But "user" is a reserved keyword in many databases (including H2), so we explicitly name it "users" to avoid conflicts.

**`@Id`** — Marks this field as the **primary key** of the table. Every database table needs a primary key — a column that uniquely identifies each row. No two rows can have the same ID.

**`@GeneratedValue(strategy = GenerationType.IDENTITY)`** — Tells the database to **auto-generate** the ID value. The first user saved gets id=1, the second gets id=2, and so on. You never set this value manually — the database handles it. `IDENTITY` means the database uses its built-in auto-increment feature.

**`@Column(nullable = false, unique = true)`** — Configures the database column:
- `nullable = false` — This column CANNOT be empty/null. If you try to save a User without an email, the database will reject it with an error.
- `unique = true` — No two rows can have the same value in this column. If you try to register with an email that already exists, the database will reject it.

**`@Column(nullable = false)`** — Same as above but without `unique`. The password, firstName, and lastName are required but do not need to be unique (two people can have the same first name).

**`@Enumerated(EnumType.STRING)`** — Tells Hibernate how to store the `Role` enum in the database. `EnumType.STRING` means store it as text: the column will contain "ADMIN", "TEACHER", or "STUDENT". Without this annotation (or with `EnumType.ORDINAL`), it would store numbers (0, 1, 2), which is much harder to read and debug.

**`implements UserDetails`** — This is required by Spring Security. It tells Spring: "This class represents a user that can log in." The `UserDetails` interface is a contract that requires you to implement several methods:

- **`getAuthorities()`** — Returns the user's permissions/roles. We convert our `Role` enum to Spring Security's format:
  ```java
  return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
  // If role is ADMIN, this returns "ROLE_ADMIN"
  // If role is STUDENT, this returns "ROLE_STUDENT"
  ```
  The `ROLE_` prefix is a Spring Security convention. When we later write `@PreAuthorize("hasRole('ADMIN')")`, Spring automatically looks for `ROLE_ADMIN` in the authorities.

- **`getUsername()`** — Returns the unique identifier used for login. We use email, not a username.

- **`isAccountNonExpired()`, `isAccountNonLocked()`, `isCredentialsNonExpired()`, `isEnabled()`** — These all return `true` because we do not implement account locking or expiration in our system. In a production app, you might set `isEnabled()` to `false` for deactivated accounts.

### The Student Entity

**File:** `entity/Student.java`

```java
@Entity
@Table(name = "students")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private LocalDate dateOfBirth;
    private String address;
    private String guardianName;
    private String guardianPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private SchoolClass schoolClass;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
```

Notice that `dateOfBirth`, `address`, `guardianName`, and `guardianPhone` have NO `@Column` annotation. That is fine — Hibernate uses sensible defaults. Without `@Column`, the column is nullable (optional) and not unique. The column name is derived from the field name (e.g., `dateOfBirth` becomes `date_of_birth` in the database).

### Database Relationships — How Entities Connect

This is where it gets really interesting. Real-world data is connected — a student belongs to a class, a class has many students, etc. JPA lets us express these relationships:

**`@ManyToOne` — Many Students belong to One Class**

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "class_id")
private SchoolClass schoolClass;
```

This creates a **foreign key** column called `class_id` in the students table that points to the school_classes table. Here is what the tables look like:

```
students table:
| id | first_name | last_name | email              | class_id |
|----|------------|-----------|---------------------|----------|
| 1  | James      | Smith     | j.smith@school.com  | 1        |  <-- points to class 1
| 2  | Elena      | Rodriguez | e.rod@school.com    | 2        |  <-- points to class 2
| 3  | Alex       | Chen      | a.chen@school.com   | 1        |  <-- also in class 1

school_classes table:
| id | name       |
|----|------------|
| 1  | Grade 10A  |
| 2  | Grade 9A   |
```

James and Alex are both in Grade 10A (class_id = 1). Elena is in Grade 9A (class_id = 2). This is a "many-to-one" relationship: MANY students belong to ONE class.

**`@OneToOne` — One Student has One User Account**

```java
@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id")
private User user;
```

This means each Student record is linked to exactly one User record (their login account). James Smith the student has a login account with email j.smith@school.com and password student123.

**`@JoinColumn(name = "class_id")`** — Specifies the exact name of the foreign key column in the database. Without this, Hibernate would generate a default name.

**`fetch = FetchType.LAZY`** — This is a performance optimization. "LAZY" means: "Do NOT load the related object from the database until someone actually asks for it." 

Without LAZY loading, every time you load a Student, Hibernate would also load the SchoolClass, which might load all its students, which would load their classes... causing a chain reaction of unnecessary database queries. LAZY loading says "only fetch the SchoolClass when I call `student.getSchoolClass()`."

### All Our Entities

Here is every entity in our project and what database table it creates:

| Entity | Table Name | Purpose |
|--------|-----------|---------|
| `User` | users | Login accounts (email, hashed password, role) |
| `Student` | students | Student profiles (name, DOB, guardian info) |
| `Teacher` | teachers | Teacher profiles (name, qualification, hire date) |
| `SchoolClass` | school_classes | Classes like "Grade 10A", "Grade 9A" |
| `Subject` | subjects | Subjects like "Mathematics", "English" |
| `Term` | terms | Academic terms/semesters with start and end dates |
| `Enrollment` | enrollments | Links a student to a class for a specific term |
| `TeacherAssignment` | teacher_assignments | Links a teacher to a class + subject |
| `Assessment` | assessments | Exams, quizzes, projects (with weight and max score) |
| `GradeEntry` | grade_entries | A student's actual score on a specific assessment |
| `Attendance` | attendance | Daily attendance records (present/absent/late/excused) |

And our enums (these are NOT tables, they are just fixed sets of values):

| Enum | Values | Used By |
|------|--------|---------|
| `Role` | ADMIN, TEACHER, STUDENT | User entity |
| `AttendanceStatus` | PRESENT, ABSENT, LATE, EXCUSED | Attendance entity |
| `AssessmentType` | MIDTERM, FINAL, QUIZ, PROJECT, HOMEWORK, LAB | Assessment entity |

---

# 10. Lombok — Writing Less Code

### The Problem Lombok Solves

In standard Java, for a class with 5 fields, you would need to manually write:
- 5 getter methods (like `getFirstName()`, `getLastName()`, etc.)
- 5 setter methods (like `setFirstName(String name)`, etc.)
- A no-args constructor (a constructor with no parameters)
- An all-args constructor (a constructor with all fields as parameters)
- A `toString()` method (for printing the object)
- `equals()` and `hashCode()` methods (for comparing objects)
- Optionally, a builder pattern

That is easily **100+ lines** of boring, repetitive code for a simple class with 5 fields! And if you add a new field, you have to update ALL of those methods.

### How Lombok Works

Lombok is a **compile-time annotation processor**. This means:
1. You write annotations like `@Getter` on your class
2. When Java compiles your code, Lombok intercepts the compilation
3. Lombok generates the getter methods automatically and adds them to the compiled code
4. The final compiled class has all the methods, even though you never wrote them

You never see the generated code in your source files — it only exists in the compiled output.

### Lombok Annotations We Use

**`@Getter`** — Generates a `getXxx()` method for every field in the class:
```java
// You write:
@Getter
private String firstName;

// Lombok generates (you never see this, but it exists):
public String getFirstName() {
    return this.firstName;
}
```

**`@Setter`** — Generates a `setXxx()` method for every field:
```java
// Lombok generates:
public void setFirstName(String firstName) {
    this.firstName = firstName;
}
```

**`@NoArgsConstructor`** — Generates a constructor with no parameters:
```java
// Lombok generates:
public Student() { }
```
JPA/Hibernate **requires** a no-args constructor to create entity objects when loading data from the database. Hibernate calls `new Student()` and then uses setters to fill in the fields.

**`@AllArgsConstructor`** — Generates a constructor with ALL fields as parameters:
```java
// Lombok generates:
public Student(Long id, String firstName, String lastName, String email, ...) {
    this.id = id;
    this.firstName = firstName;
    // ... etc
}
```

**`@Builder`** — This is one of the most useful annotations. It generates the **Builder pattern**, which lets you create objects like this:
```java
Student student = Student.builder()
    .firstName("James")
    .lastName("Smith")
    .email("j.smith@school.com")
    .dateOfBirth(LocalDate.of(2008, 3, 15))
    .build();
```

Compare this to using a constructor with 10 parameters:
```java
// Without builder — which parameter is which?? Very confusing!
Student student = new Student(null, "James", "Smith", "j.smith@school.com", 
    LocalDate.of(2008, 3, 15), "123 Main St", "Robert Smith", "555-0101", null, null);
```

The builder pattern is much more readable because every value is labeled.

**`@Data`** — A shortcut annotation that combines `@Getter`, `@Setter`, `@ToString`, `@EqualsAndHashCode`, and `@RequiredArgsConstructor` all in one. We use this on our DTO classes because they need all of these.

**`@RequiredArgsConstructor`** — Generates a constructor for all `final` fields only. This is how we do **dependency injection** in our services and controllers:

```java
@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;    // final field
    private final SchoolClassRepository schoolClassRepository;  // final field
    
    // Lombok generates this constructor:
    // public StudentService(StudentRepository studentRepository, 
    //                       SchoolClassRepository schoolClassRepository) {
    //     this.studentRepository = studentRepository;
    //     this.schoolClassRepository = schoolClassRepository;
    // }
    
    // Spring sees this constructor and automatically passes in the beans!
}
```

When Spring creates the `StudentService` bean, it sees the constructor needs a `StudentRepository` and a `SchoolClassRepository`. Spring already has those beans (because they extend `JpaRepository`), so it passes them in automatically. This is **constructor injection** — the recommended way to do dependency injection in Spring.

---

# 11. JPA and Hibernate — Talking to the Database

### What is JPA?

**JPA (Java Persistence API)** is a specification — a set of rules written on paper that says "this is how Java applications should interact with databases." It defines annotations like `@Entity`, `@Table`, `@Column`, `@Id`, etc.

But JPA itself does NOT contain any working code. It is just a set of interfaces and rules. Think of it like a recipe — it tells you what to do, but it does not cook the food.

### What is Hibernate?

**Hibernate** is the actual implementation of JPA. It is the real code that:
1. Reads your `@Entity` classes
2. Creates database tables from them (the `CREATE TABLE` SQL statements)
3. Converts Java objects to SQL `INSERT`, `UPDATE`, `DELETE` statements when you save/modify data
4. Converts SQL query results back into Java objects when you read data

This conversion process is called **ORM (Object-Relational Mapping)** — mapping Java objects to relational database rows and back.

### How It Works in Practice

When you write this Java code:
```java
studentRepository.save(student);
```

Hibernate translates it to this SQL:
```sql
INSERT INTO students (first_name, last_name, email, class_id) 
VALUES ('James', 'Smith', 'j.smith@school.com', 1);
```

When you write:
```java
studentRepository.findAll();
```

Hibernate translates it to:
```sql
SELECT * FROM students;
```

And then converts each row from the result into a `Student` Java object, setting all the fields (firstName, lastName, email, etc.) automatically.

When you write:
```java
studentRepository.deleteById(5L);
```

Hibernate translates it to:
```sql
DELETE FROM students WHERE id = 5;
```

You **never write SQL** in our project. Hibernate does it all for you based on the method you call and the entity annotations you wrote.

### The Persistence Context

Hibernate maintains something called a **persistence context** — a cache of entities it is currently tracking. When you load a Student from the database, Hibernate keeps that object in its cache. If you modify the object (like `student.setFirstName("NewName")`), Hibernate knows it changed and will automatically generate an `UPDATE` SQL statement when the transaction commits. This is called **dirty checking**.

---

# 12. Repositories — The Database Helpers

A **repository** is an interface that provides methods to interact with the database for a specific entity. This is where Spring Data JPA becomes truly magical.

### The StudentRepository

**File:** `repository/StudentRepository.java`

```java
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);
    Optional<Student> findByUserId(Long userId);
    boolean existsByEmail(String email);
    List<Student> findBySchoolClassId(Long classId);
    List<Student> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
        String firstName, String lastName);
}
```

### Wait — This is Just an Interface! Where is the Code?

This is the most magical part of Spring Data JPA. You write an **interface** (just method signatures, no implementation code), and Spring **automatically generates the full implementation** at runtime. You never write a single line of database code.

### Free Methods from JpaRepository

By extending `JpaRepository<Student, Long>`, you get all these methods **completely for free** (no code needed):

| Method | What It Does | SQL Equivalent |
|--------|-------------|----------------|
| `findAll()` | Get all students | `SELECT * FROM students` |
| `findById(Long id)` | Get one student by ID | `SELECT * FROM students WHERE id = ?` |
| `save(Student s)` | Insert or update a student | `INSERT INTO...` or `UPDATE...` |
| `deleteById(Long id)` | Delete a student | `DELETE FROM students WHERE id = ?` |
| `count()` | Count all students | `SELECT COUNT(*) FROM students` |
| `existsById(Long id)` | Check if a student exists | `SELECT COUNT(*) > 0 FROM students WHERE id = ?` |
| `findAll(Sort sort)` | Get all students, sorted | `SELECT * FROM students ORDER BY ...` |

The `<Student, Long>` part tells Spring: "This repository manages `Student` entities, and their primary key (ID) type is `Long`."

### Derived Query Methods — The Real Magic

The custom methods we added follow a **naming convention** that Spring understands. Spring reads the method name, parses it, and generates the correct SQL query automatically:

**`findByEmail(String email)`** — Spring reads: "find" + "By" + "Email"
```sql
SELECT * FROM students WHERE email = ?
```

**`findByUserId(Long userId)`** — Spring reads: "find" + "By" + "User" + "Id". It navigates the `@OneToOne` relationship to the User entity and matches on User's id field.
```sql
SELECT * FROM students WHERE user_id = ?
```

**`existsByEmail(String email)`** — Spring reads: "exists" + "By" + "Email"
```sql
SELECT COUNT(*) > 0 FROM students WHERE email = ?
```
Returns `true` or `false`.

**`findBySchoolClassId(Long classId)`** — Spring reads: "find" + "By" + "SchoolClass" + "Id". It navigates the `@ManyToOne` relationship to SchoolClass and matches on its id.
```sql
SELECT * FROM students WHERE class_id = ?
```

**`findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName)`** — This long name means:
- "find" — return results
- "By" — start the WHERE clause
- "FirstName" — look at the firstName column
- "Containing" — use LIKE with wildcards (partial match)
- "IgnoreCase" — case-insensitive comparison
- "Or" — OR condition
- "LastName" — also look at lastName column
- "ContainingIgnoreCase" — same partial, case-insensitive match

```sql
SELECT * FROM students 
WHERE LOWER(first_name) LIKE LOWER('%search%') 
   OR LOWER(last_name) LIKE LOWER('%search%')
```

This is used for the search feature — when you type "jam" in the search box, it finds "James" because "jam" is contained in "James" (case-insensitive).

### Why Optional?

`Optional<Student>` is a Java container that may or may not contain a value. It forces you to handle the case where the student does not exist:

```java
Optional<Student> student = studentRepository.findByEmail("j.smith@school.com");

if (student.isPresent()) {
    Student s = student.get();  // the student exists
} else {
    // student not found — handle the error
}

// Or more elegantly:
Student s = studentRepository.findByEmail("j.smith@school.com")
    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
```

Without `Optional`, the method would return `null` if the student does not exist, and you might forget to check for null — causing a `NullPointerException` (one of the most common bugs in Java). `Optional` makes it impossible to forget.

---

# 13. DTOs — Data Transfer Objects

### What is a DTO?

A **DTO (Data Transfer Object)** is a simple Java class that defines the **shape** of data sent between the frontend and backend. It is separate from the Entity class.

### Why Not Just Send the Entity Directly?

This is a great question that many beginners ask. Here are the reasons:

**1. Security** — The `User` entity has a `password` field. If we sent the entity directly as JSON to the frontend, we would be exposing password hashes! The DTO only includes safe fields — no password.

**2. Different shapes** — The `Student` entity has a `SchoolClass schoolClass` field (a full Java object with all its fields). The frontend does not need the entire class object — it just needs `classId` (a number) and `className` (a string) for display. The DTO **flattens** the relationship.

**3. Validation** — DTOs have validation annotations (`@NotBlank`, `@Email`) that check incoming data from the frontend. Entities should not have these because entities represent database structure, not input validation rules.

**4. Decoupling** — If we change the database structure (add a column, rename a field), we do not have to change the API that the frontend uses. The DTO stays the same, and we just update the conversion logic.

**5. Avoiding infinite loops** — If Student has a reference to SchoolClass, and SchoolClass has a list of Students, converting to JSON would cause an infinite loop (Student -> SchoolClass -> Students -> SchoolClass -> ...). DTOs break this cycle by only including simple fields.

### Example: StudentDTO

**File:** `dto/StudentDTO.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDTO {
    private Long id;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private LocalDate dateOfBirth;
    private String address;
    private String guardianName;
    private String guardianPhone;
    private Long classId;       // just the ID number, not the whole SchoolClass object
    private String className;   // just the name string, for display purposes
}
```

Compare this to the `Student` entity:
- Entity has `SchoolClass schoolClass` (a full object with all its fields) -> DTO has `Long classId` + `String className` (just two simple values)
- Entity has `User user` (the login account with password) -> DTO does not expose this at all
- DTO has `@NotBlank` and `@Email` validation -> Entity does not have these

### Validation Annotations on DTOs

**`@NotBlank(message = "First name is required")`** — The field cannot be null, empty, or just whitespace. If someone sends `{"firstName": ""}`, the validation fails and Spring returns a 400 Bad Request error with the message "First name is required."

**`@Email(message = "Invalid email format")`** — The field must be a valid email format (contains @, has a domain, etc.). If someone sends `{"email": "notanemail"}`, validation fails.

These validations are triggered when we use `@Valid` on the controller parameter (we will see this in Section 15).

### The Conversion: Entity to DTO and Back

In our service classes, we have methods that convert between entities and DTOs:

```java
// In StudentService.java — converting Entity -> DTO (for sending to frontend)
private StudentDTO toDTO(Student student) {
    return StudentDTO.builder()
        .id(student.getId())
        .firstName(student.getFirstName())
        .lastName(student.getLastName())
        .email(student.getEmail())
        .dateOfBirth(student.getDateOfBirth())
        .address(student.getAddress())
        .guardianName(student.getGuardianName())
        .guardianPhone(student.getGuardianPhone())
        .classId(student.getSchoolClass() != null ? student.getSchoolClass().getId() : null)
        .className(student.getSchoolClass() != null ? student.getSchoolClass().getName() : null)
        .build();
}
```

This takes a `Student` entity (from the database) and creates a `StudentDTO` (to send to the frontend). Notice how it extracts `classId` and `className` from the `SchoolClass` relationship object and puts them as flat fields in the DTO.

The `student.getSchoolClass() != null ?` check is important because a student might not be assigned to any class yet. If `schoolClass` is null, we set `classId` and `className` to null instead of crashing with a NullPointerException.

### Key DTOs in Our Project

| DTO | Purpose | When It Is Used |
|-----|---------|----------------|
| `AuthRequest` | Login request body | Frontend sends email + password |
| `AuthResponse` | Login response | Backend sends token + user info + studentId/teacherId |
| `RegisterRequest` | Registration request | Frontend sends name + email + password + role |
| `StudentDTO` | Student data | CRUD operations on students |
| `TeacherDTO` | Teacher data | CRUD operations on teachers |
| `SchoolClassDTO` | Class data | CRUD operations on classes |
| `SubjectDTO` | Subject data | CRUD operations on subjects |
| `DashboardDTO` | Dashboard statistics | Dashboard page loads stats, charts, recent students |
| `AttendanceDTO` | Attendance record | Marking and viewing attendance |
| `AttendanceSummaryDTO` | Monthly attendance summary | Monthly attendance report with rates and alerts |
| `GradeDTO` | Grade data | Viewing student grades |
| `GradeEntryDTO` | Individual grade entry | Recording a score for an assessment |
| `AssessmentDTO` | Assessment/exam data | Creating and viewing assessments |

---

# 14. Services — The Business Logic

A **service** is where the "brain" of the application lives. It contains the business rules, calculations, and logic that make the application actually DO things.

### Why Not Put Logic Directly in the Controller?

Controllers should ONLY handle HTTP concerns — receiving requests and sending responses. Business logic belongs in services because:

1. **Reusability** — Multiple controllers (or other services) can use the same service. For example, `StudentService.getStudentCount()` is used by both the `StudentController` and the `DashboardController`.

2. **Testability** — You can test business logic without dealing with HTTP requests. You just call the service method directly in a test.

3. **Separation of concerns** — The controller does not need to know HOW students are stored or validated. It just asks the service "give me all students" and gets the result.

4. **Transaction management** — Services are where we put `@Transactional` to ensure database operations are atomic (all succeed or all fail).

### The StudentService — A Complete Example

**File:** `service/StudentService.java`

```java
@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final SchoolClassRepository schoolClassRepository;

    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return toDTO(student);
    }

    @Transactional
    public StudentDTO createStudent(StudentDTO dto) {
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        Student student = Student.builder()
            .firstName(dto.getFirstName())
            .lastName(dto.getLastName())
            .email(dto.getEmail())
            .dateOfBirth(dto.getDateOfBirth())
            .address(dto.getAddress())
            .guardianName(dto.getGuardianName())
            .guardianPhone(dto.getGuardianPhone())
            .build();

        if (dto.getClassId() != null) {
            SchoolClass schoolClass = schoolClassRepository.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
            student.setSchoolClass(schoolClass);
        }

        return toDTO(studentRepository.save(student));
    }

    @Transactional
    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        student.setFirstName(dto.getFirstName());
        student.setLastName(dto.getLastName());
        student.setEmail(dto.getEmail());
        student.setDateOfBirth(dto.getDateOfBirth());
        student.setAddress(dto.getAddress());
        student.setGuardianName(dto.getGuardianName());
        student.setGuardianPhone(dto.getGuardianPhone());

        if (dto.getClassId() != null) {
            SchoolClass schoolClass = schoolClassRepository.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
            student.setSchoolClass(schoolClass);
        } else {
            student.setSchoolClass(null);
        }

        return toDTO(studentRepository.save(student));
    }

    @Transactional
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    public long getStudentCount() {
        return studentRepository.count();
    }
}
```

### Key Annotations Explained

**`@Service`** — Tells Spring: "This is a service bean. Create an instance of it and make it available for dependency injection." It is functionally identical to `@Component`, but it communicates intent — this class contains business logic, not database access or HTTP handling.

**`@RequiredArgsConstructor`** — Lombok generates a constructor for the `final` fields (`studentRepository` and `schoolClassRepository`). Spring sees this constructor and automatically injects the repository beans. This is constructor injection.

**`@Transactional`** — This is very important. It wraps the entire method in a **database transaction**. A transaction means: either ALL database operations in this method succeed, or NONE of them happen. If an exception is thrown halfway through, all changes are **rolled back** (undone).

For example, in `createStudent()`:
1. Check if email exists (database read)
2. Save the student (database write)

If step 2 fails for some reason, the transaction ensures no partial data is left in the database. This prevents data corruption.

### Walking Through Each Method

**`getAllStudents()`:**
1. `studentRepository.findAll()` — Asks the database for ALL student rows
2. `.stream()` — Converts the Java List to a Stream (enables functional-style processing)
3. `.map(this::toDTO)` — For each Student entity, call the `toDTO()` method to convert it to a StudentDTO. `this::toDTO` is a method reference — a shorthand for `student -> toDTO(student)`
4. `.collect(Collectors.toList())` — Collects all the DTOs back into a List
5. Returns the list of DTOs to the controller

**`getStudentById(Long id)`:**
1. `studentRepository.findById(id)` — Asks the database for the student with this ID. Returns an `Optional<Student>`.
2. `.orElseThrow(...)` — If the student exists, unwrap it from the Optional. If not, throw a `ResourceNotFoundException` with a helpful error message. This exception is caught by Spring and converted to a 404 Not Found HTTP response.
3. `toDTO(student)` — Convert the entity to a DTO and return it.

**`createStudent(StudentDTO dto)`:**
1. Check if the email already exists in the database. If yes, throw an error (business rule: no duplicate emails).
2. Build a new `Student` entity from the DTO data using the builder pattern.
3. If a `classId` was provided in the DTO, look up the `SchoolClass` by that ID and link it to the student. If the class does not exist, throw an error.
4. `studentRepository.save(student)` — Save the student to the database. Hibernate generates an INSERT SQL statement. The database assigns an auto-generated ID.
5. Convert the saved entity (which now has an ID) back to a DTO and return it.

**`updateStudent(Long id, StudentDTO dto)`:**
1. Find the existing student by ID. If not found, throw 404.
2. Update all fields on the existing entity with values from the DTO.
3. Handle the class assignment (set it or clear it).
4. Save the updated entity. Hibernate generates an UPDATE SQL statement.
5. Return the updated DTO.

**`deleteStudent(Long id)`:**
1. Check if the student exists. If not, throw 404.
2. Delete the student by ID. Hibernate generates a DELETE SQL statement.
3. Return nothing (void).

### The AuthService — A Special Service

**File:** `service/AuthService.java`

This service is special because it implements `UserDetailsService` — a Spring Security interface that Spring calls when it needs to load a user during authentication:

```java
@Service
public class AuthService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public AuthResponse login(AuthRequest request) {
        // Step 1: Verify the email/password combination
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        // If we get here, the password was correct (otherwise an exception was thrown)

        // Step 2: Load the user from the database
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Step 3: Generate a JWT token for this user
        String token = jwtUtil.generateToken(user);

        // Step 4: Build the response with token + user info
        return buildAuthResponse(user, token);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        AuthResponse.AuthResponseBuilder builder = AuthResponse.builder()
            .token(token)
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .role(user.getRole());

        // If the user is a STUDENT, find their student profile and include the studentId
        if (user.getRole() == Role.STUDENT) {
            studentRepository.findByUserId(user.getId())
                .ifPresent(s -> builder.studentId(s.getId()));
        }
        // If the user is a TEACHER, find their teacher profile and include the teacherId
        else if (user.getRole() == Role.TEACHER) {
            teacherRepository.findByUserId(user.getId())
                .ifPresent(t -> builder.teacherId(t.getId()));
        }

        return builder.build();
    }
}
```

**`loadUserByUsername(String email)`** — Spring Security calls this method automatically when it needs to verify a user's credentials. Despite the name saying "username", we use email as the username (because our `User.getUsername()` returns email).

**`buildAuthResponse()`** — This method builds the login response. Notice how it includes `studentId` or `teacherId` depending on the user's role. This is important because the frontend needs to know which student or teacher profile is linked to the logged-in user, so it can show "My Profile" or auto-select the student in the Grades page.

---

# 15. Controllers — The API Endpoints

A **controller** is the entry point for HTTP requests. It defines the URLs (endpoints) that the frontend can call and maps them to Java methods.

### The StudentController — A Complete Example

**File:** `controller/StudentController.java`

```java
@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final StudentRepository studentRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentDTO> getMyProfile(@AuthenticationPrincipal User user) {
        Optional<Student> student = studentRepository.findByUserId(user.getId());
        if (student.isEmpty()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(studentService.getStudentById(student.get().getId()));
    }

    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<StudentDTO>> searchStudents(@RequestParam String query) {
        return ResponseEntity.ok(studentService.searchStudents(query));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDTO> createStudent(@Valid @RequestBody StudentDTO dto) {
        return new ResponseEntity<>(studentService.createStudent(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDTO> updateStudent(@PathVariable Long id, 
                                                     @Valid @RequestBody StudentDTO dto) {
        return ResponseEntity.ok(studentService.updateStudent(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
```

### Every Annotation Explained

**`@RestController`** — This combines two annotations:
1. `@Controller` — Marks this class as a web controller that handles HTTP requests
2. `@ResponseBody` — Tells Spring to automatically convert the return value of every method to JSON

Without `@RestController`, you would have to manually convert Java objects to JSON strings. With it, Spring uses the Jackson library (included in `spring-boot-starter-web`) to do this automatically.

**`@RequestMapping("/api/students")`** — Sets the **base URL** for all endpoints in this controller. Every method's URL is relative to this base. So `@GetMapping("/{id}")` becomes `/api/students/{id}`.

**`@GetMapping`** — Handles HTTP **GET** requests. GET is used for reading/fetching data. It does not change anything on the server.
- `@GetMapping` with no path maps to the base URL: `GET /api/students`
- `@GetMapping("/{id}")` maps to: `GET /api/students/1`, `GET /api/students/2`, etc.
- `@GetMapping("/me")` maps to: `GET /api/students/me`
- `@GetMapping("/search")` maps to: `GET /api/students/search?query=james`

**`@PostMapping`** — Handles HTTP **POST** requests. POST is used for creating new data. The data to create is sent in the request body as JSON.

**`@PutMapping("/{id}")`** — Handles HTTP **PUT** requests. PUT is used for updating existing data. The ID in the URL identifies WHICH record to update, and the request body contains the new data.

**`@DeleteMapping("/{id}")`** — Handles HTTP **DELETE** requests. DELETE is used for removing data.

### Parameter Annotations

**`@PathVariable Long id`** — Extracts a value from the URL path. If the URL is `/api/students/5`, then `id` will be `5`. The `{id}` in the mapping and the parameter name must match.

**`@RequestParam String query`** — Extracts a value from the URL query string. If the URL is `/api/students/search?query=james`, then `query` will be `"james"`.

**`@RequestBody StudentDTO dto`** — Takes the JSON body of the HTTP request and converts it into a Java object. For example, if the frontend sends:
```json
POST /api/students
Content-Type: application/json

{
    "firstName": "James",
    "lastName": "Smith",
    "email": "j.smith@school.com",
    "classId": 1
}
```
Spring automatically creates a `StudentDTO` object with `firstName="James"`, `lastName="Smith"`, etc. This is called **deserialization** — converting JSON text into a Java object.

**`@Valid`** — Triggers the validation annotations on the DTO (`@NotBlank`, `@Email`, etc.). If any validation fails, Spring immediately returns a **400 Bad Request** response with error details. The controller method is never even called.

**`@AuthenticationPrincipal User user`** — This is a Spring Security annotation. It extracts the currently logged-in user from the security context (which was set by the JWT filter). You get the full `User` entity object, so you can check their role, get their ID, etc.

### ResponseEntity — Controlling the HTTP Response

`ResponseEntity<T>` is a wrapper that gives you full control over the HTTP response:

```java
// 200 OK with data in the body
ResponseEntity.ok(data)

// 201 Created with data (used after creating a new resource)
new ResponseEntity<>(data, HttpStatus.CREATED)

// 404 Not Found with no body
ResponseEntity.notFound().build()

// 204 No Content (used after deleting — success but nothing to return)
ResponseEntity.noContent().build()
```

The number (200, 201, 404, 204) is the **HTTP status code**. The frontend checks this code to know if the request succeeded or failed:
- **2xx** = Success (200 OK, 201 Created, 204 No Content)
- **4xx** = Client error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found)
- **5xx** = Server error (500 Internal Server Error)

### The AuthController — Login and Register

**File:** `controller/AuthController.java`

```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
```

This controller is simple — just two endpoints. Notice that these endpoints are under `/api/auth/**`, which we configured as `permitAll()` in `SecurityConfig.java`. This means anyone can call them without a JWT token (because you need to log in BEFORE you have a token).

### The Complete URL Map

Here is every endpoint in our application and who can access it:

| Method | URL | Access | Purpose |
|--------|-----|--------|---------|
| POST | `/api/auth/register` | Public | Create a new account |
| POST | `/api/auth/login` | Public | Log in and get a JWT token |
| GET | `/api/dashboard` | Any authenticated user | Get dashboard statistics |
| GET | `/api/students` | Any authenticated user | List all students |
| GET | `/api/students/{id}` | Any authenticated user | Get one student by ID |
| GET | `/api/students/me` | STUDENT only | Get my own student profile |
| GET | `/api/students/search?query=x` | Any authenticated user | Search students by name |
| GET | `/api/students/class/{classId}` | Any authenticated user | Get students in a class |
| POST | `/api/students` | ADMIN only | Create a new student |
| PUT | `/api/students/{id}` | ADMIN only | Update a student |
| DELETE | `/api/students/{id}` | ADMIN only | Delete a student |
| GET | `/api/teachers` | Any authenticated user | List all teachers |
| GET | `/api/teachers/me` | TEACHER only | Get my own teacher profile |
| POST | `/api/teachers` | ADMIN only | Create a new teacher |
| GET | `/api/classes` | Any authenticated user | List all classes |
| POST | `/api/classes` | ADMIN only | Create a new class |
| GET | `/api/subjects` | Any authenticated user | List all subjects |
| GET | `/api/attendance/class/{id}/date/{date}` | Any authenticated user | Get attendance for a class on a date |
| POST | `/api/attendance/bulk` | ADMIN or TEACHER | Mark attendance for multiple students |
| GET | `/api/grades/student/{id}` | Any authenticated user | Get grades for a student |
| POST | `/api/grades` | ADMIN or TEACHER | Record a new grade |

---

# 16. Security — Protecting Our Application

Security is one of the most important parts of any web application. Our security system has multiple layers.

### The Security Config

**File:** `config/SecurityConfig.java`

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

### Line by Line Explanation

**`@Configuration`** — Tells Spring: "This class contains bean definitions." Any method annotated with `@Bean` inside will have its return value registered as a Spring-managed bean.

**`@EnableWebSecurity`** — Activates Spring Security's web security support. Without this, none of the security configuration would take effect.

**`@EnableMethodSecurity`** — Enables the `@PreAuthorize` annotation on individual controller methods. Without this, `@PreAuthorize("hasRole('ADMIN')")` would be silently ignored and anyone could access admin endpoints.

**`.csrf(AbstractHttpConfigurer::disable)`** — Disables CSRF (Cross-Site Request Forgery) protection. CSRF protection is designed for traditional web apps that use cookies and HTML forms. Since we use JWT tokens sent in the Authorization header (not cookies), CSRF attacks are not possible against our API. If we left CSRF enabled, all our POST, PUT, and DELETE requests would be rejected with a 403 Forbidden error.

**`.cors(cors -> cors.configurationSource(corsConfigurationSource()))`** — Configures CORS (Cross-Origin Resource Sharing). Our frontend runs on `http://localhost:5173` and our backend on `http://localhost:8080`. These are different "origins" (different ports). By default, web browsers block requests between different origins for security. Our CORS configuration tells the browser: "It is safe to allow requests from localhost:5173 to localhost:8080."

The CORS configuration specifies:
```java
configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174"));
configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
configuration.setAllowedHeaders(List.of("*"));
configuration.setAllowCredentials(true);
```
- Only our frontend URLs are allowed
- Only specific HTTP methods are allowed
- Any headers are allowed (including our `Authorization` header)
- Credentials (auth headers) are allowed to be sent

**`.requestMatchers("/api/auth/**").permitAll()`** — These URL patterns are **public** — anyone can access them without authentication. The `**` wildcard means "anything after this path." So `/api/auth/login` and `/api/auth/register` are both public. We also allow Swagger documentation URLs.

**Why must auth endpoints be public?** Because you cannot require a JWT token to log in — you do not have a token yet! The login endpoint is where you GET a token.

**`.anyRequest().authenticated()`** — Every other URL requires authentication. If a request does not have a valid JWT token, Spring returns a **401 Unauthorized** response.

**`.sessionCreationPolicy(SessionCreationPolicy.STATELESS)`** — Tells Spring: "Do NOT create HTTP sessions." In traditional web apps, the server stores session data (who is logged in) in memory. With JWT, the token itself contains all the information needed, so we do not need server-side sessions. This makes our API **stateless** — each request is completely independent. This is important for scalability because any server instance can handle any request.

**`.authenticationProvider(authenticationProvider())`** — Registers our authentication provider, which knows how to verify username/password combinations using our `UserDetailsService` and `PasswordEncoder`.

**`.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)`** — Inserts our custom `JwtAuthenticationFilter` into the security filter chain, BEFORE Spring's default authentication filter. This means every incoming HTTP request passes through our JWT filter first, which checks for and validates the JWT token.

### The Password Encoder

**File:** `config/AppConfig.java`

```java
@Configuration
public class AppConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

**Why do we need this?** We NEVER store passwords as plain text in the database. If someone hacks the database, they would see all passwords. Instead, we use **BCrypt hashing**.

When a user registers with password "admin123":
1. BCrypt generates a random "salt" (random data added to the password)
2. It hashes the password + salt together
3. The result looks like: `$2a$10$X7.3kG8dN2qFJKmE...` (60 characters)
4. We store THIS hash in the database, not "admin123"

When the user logs in:
1. They send "admin123"
2. BCrypt hashes it with the same algorithm
3. Compares the new hash with the stored hash
4. If they match, the password is correct

The key point: you CANNOT reverse a hash back to the original password. Even if someone steals the database, they cannot figure out that the hash means "admin123".

**`@Bean`** — This annotation tells Spring: "Call this method, take the returned object (`BCryptPasswordEncoder`), and register it as a bean. Whenever any class needs a `PasswordEncoder`, give them this instance." This is how the `AuthService` and `SecurityConfig` both get access to the same password encoder.

---

# 17. JWT — JSON Web Tokens (Login System)

### What is a JWT?

A **JWT (JSON Web Token)** is a compact, URL-safe string that represents a set of claims (pieces of information). It is the industry standard for API authentication.

A JWT looks like this:
```
eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBzY2hvb2wuY29tIiwiaWF0IjoxNzA5MTIzNDU2LCJleHAiOjE3MDkyMDk4NTZ9.abc123signature
```

It has three parts separated by dots:

**1. Header** (first part) — Contains the algorithm used to sign the token. Decoded, it looks like:
```json
{ "alg": "HS384" }
```

**2. Payload** (second part) — Contains the actual data (called "claims"). Decoded:
```json
{
    "sub": "admin@school.com",    // subject (who this token belongs to)
    "iat": 1709123456,            // issued at (when the token was created)
    "exp": 1709209856             // expiration (when the token expires)
}
```

**3. Signature** (third part) — A cryptographic hash that proves the token was not tampered with. It is created using the header, payload, and our secret key from `application.yml`.

**Important:** The header and payload are just Base64-encoded (not encrypted). Anyone can decode them and read the email. But they CANNOT modify the payload because the signature would become invalid — they do not know our secret key. This is why we never put sensitive data (like passwords) in the JWT payload.

### The Complete Authentication Flow

Here is exactly what happens step by step when a user logs in:

```
STEP 1: Frontend sends login request
--> POST /api/auth/login
--> Body: { "email": "admin@school.com", "password": "admin123" }

STEP 2: Request arrives at AuthController.login()
--> Spring deserializes the JSON body into an AuthRequest object

STEP 3: AuthController calls authService.login(request)

STEP 4: AuthService calls authenticationManager.authenticate()
--> This internally calls loadUserByUsername("admin@school.com")
--> Loads the User entity from the database
--> Compares BCrypt hash of "admin123" with the stored password hash
--> If wrong password --> throws BadCredentialsException --> 401 Unauthorized
--> If correct --> authentication succeeds

STEP 5: AuthService calls jwtUtil.generateToken(user)
--> Creates a JWT with the user's email as the subject
--> Signs it with our secret key
--> Sets expiration to 24 hours from now
--> Returns the token string

STEP 6: AuthService calls buildAuthResponse(user, token)
--> Creates an AuthResponse with: token, email, firstName, lastName, role
--> If STUDENT: also includes studentId
--> If TEACHER: also includes teacherId

STEP 7: Response sent back to frontend
--> { "token": "eyJ...", "email": "admin@school.com", "firstName": "Admin",
      "lastName": "User", "role": "ADMIN" }

STEP 8: Frontend stores the token
--> localStorage.setItem('token', response.token)
--> localStorage.setItem('user', JSON.stringify(response))
```

### What Happens on Every Subsequent Request

After login, the frontend includes the token in every request:

```
STEP 1: Frontend sends a request
--> GET /api/students
--> Headers: { "Authorization": "Bearer eyJhbGciOiJIUzM4NCJ9..." }

STEP 2: JwtAuthenticationFilter.doFilterInternal() intercepts the request
--> Reads the "Authorization" header
--> Sees it starts with "Bearer " --> extracts the token string

STEP 3: Filter calls jwtUtil.extractUsername(token)
--> Decodes the JWT payload
--> Extracts the "sub" claim --> "admin@school.com"

STEP 4: Filter calls userDetailsService.loadUserByUsername("admin@school.com")
--> Loads the User entity from the database

STEP 5: Filter calls jwtUtil.isTokenValid(token, userDetails)
--> Verifies the signature (was this token created with our secret key?)
--> Checks if the token has expired
--> Checks if the username in the token matches the loaded user
--> Returns true if everything checks out

STEP 6: If valid, set the user in the SecurityContext
--> SecurityContextHolder.getContext().setAuthentication(authToken)
--> Now Spring knows who is making this request

STEP 7: Request continues to the controller
--> StudentController.getAllStudents() is called
--> The controller can access the current user via @AuthenticationPrincipal

STEP 8: Response sent back to frontend
--> JSON array of students
```

### The JWT Filter

**File:** `config/JwtAuthenticationFilter.java`

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        // Step 1: Get the Authorization header
        final String authHeader = request.getHeader("Authorization");

        // Step 2: If no token, skip this filter (let the request continue)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Step 3: Extract the token (remove "Bearer " prefix)
        final String jwt = authHeader.substring(7);
        final String userEmail = jwtUtil.extractUsername(jwt);

        // Step 4: If we got an email and no one is authenticated yet
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Step 5: Load the user from the database
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            
            // Step 6: Validate the token
            if (jwtUtil.isTokenValid(jwt, userDetails)) {
                // Step 7: Create an authentication token and set it in the context
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                    );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        // Step 8: Continue the filter chain (pass request to the next filter/controller)
        filterChain.doFilter(request, response);
    }
}
```

**`extends OncePerRequestFilter`** — Guarantees this filter runs exactly once per HTTP request. Without this, the filter might run multiple times for a single request (due to internal forwards/redirects).

**`filterChain.doFilter(request, response)`** — This is critical. It passes the request to the next filter in the chain. If we do NOT call this, the request stops here and the controller never receives it. Think of it like a relay race — you must pass the baton.

**`SecurityContextHolder`** — A thread-local storage where Spring Security keeps the current user's authentication information. "Thread-local" means each HTTP request (which runs on its own thread) has its own security context. After we set the authentication here, any code downstream (controllers, services) can access the current user.

---

# 18. Role-Based Access Control

### How Roles Work in Our System

Every user has exactly one `Role`: `ADMIN`, `TEACHER`, or `STUDENT`.

When the user logs in, their role is part of the JWT response. The `User` entity's `getAuthorities()` method converts the role to Spring Security's format (`ROLE_ADMIN`, `ROLE_TEACHER`, `ROLE_STUDENT`).

We enforce roles at TWO levels for defense in depth:

### Level 1: Backend — @PreAuthorize

We protect individual controller methods using `@PreAuthorize`:

```java
// Only ADMIN can create students
@PostMapping
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<StudentDTO> createStudent(@Valid @RequestBody StudentDTO dto) { ... }

// Only STUDENT can access their own profile
@GetMapping("/me")
@PreAuthorize("hasRole('STUDENT')")
public ResponseEntity<StudentDTO> getMyProfile(@AuthenticationPrincipal User user) { ... }
```

If a TEACHER tries to call `POST /api/students`, Spring Security checks their authorities, finds `ROLE_TEACHER` (not `ROLE_ADMIN`), and returns a **403 Forbidden** error. The controller method is never even called.

You can also allow multiple roles:
```java
@PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
```

### Level 2: Frontend — Route Protection and UI Hiding

On the frontend, we also enforce roles for a better user experience:

**1. Navigation filtering** — Students only see relevant menu items (Dashboard, My Profile, Attendance, Grades). They do NOT see Students, Teachers, Classes, Subjects, etc.

**2. Route protection** — If a student manually types `/teachers` in the browser URL bar, the `ProtectedRoute` component checks their role and redirects them to `/dashboard`.

**3. UI element hiding** — On the Grades page, students do not see the student picker dropdown (they automatically see their own grades). On the Attendance page, students see "My Attendance" instead of the class-based view.

### Why Both Levels?

Frontend protection is for **user experience** — hiding things the user should not see. But a clever user could bypass the frontend (using browser dev tools or a tool like Postman to send direct HTTP requests).

Backend protection is for **real security** — even if someone bypasses the frontend, the backend still blocks unauthorized requests. This is called **defense in depth** — multiple layers of security so that if one layer fails, the others still protect you.

---

# 19. Data Seeder — Populating Demo Data

### The Problem

We use an in-memory database (H2) with `ddl-auto: create-drop`. This means every time we restart the app, the database is completely empty — all tables are dropped and recreated with zero rows. We need demo data to test with.

### The Solution: CommandLineRunner

**File:** `config/DataSeeder.java`

```java
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final PasswordEncoder passwordEncoder;
    // ... more repositories

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) return;  // Don't seed if data already exists

        // 1. Create admin user
        User adminUser = userRepository.save(User.builder()
            .firstName("Admin").lastName("User")
            .email("admin@school.com")
            .password(passwordEncoder.encode("admin123"))
            .role(Role.ADMIN).build());

        // 2. Create teacher users + teacher profiles
        // 3. Create student users + student profiles
        // 4. Create classes, subjects, terms
        // 5. Create enrollments, assessments, grades, attendance
    }
}
```

### How It Works

**`@Component`** — Tells Spring to create an instance of this class as a bean. Spring will manage it.

**`implements CommandLineRunner`** — This interface has one method: `run(String... args)`. Spring Boot automatically calls this `run()` method AFTER the application has fully started (after all beans are created, the web server is running, and the database tables are created). It is the perfect place for initialization tasks.

**`if (userRepository.count() > 0) return;`** — Safety check. If the database already has users (for example, if we later switch to a persistent database like PostgreSQL), do not insert duplicate data. This makes the seeder **idempotent** — safe to run multiple times.

**`passwordEncoder.encode("admin123")`** — We MUST hash the password before storing it. The database never sees the plain text "admin123" — it stores the BCrypt hash like `$2a$10$X7.3kG...`. If we stored "admin123" directly, the login would fail because Spring Security always compares hashes, not plain text.

### What Data We Seed

Our seeder creates a complete, realistic school environment:

**Users and Profiles:**

| Email | Password | Role | Linked Profile |
|-------|----------|------|---------------|
| admin@school.com | admin123 | ADMIN | (none) |
| t.johnson@school.com | teacher123 | TEACHER | Thomas Johnson |
| s.williams@school.com | teacher123 | TEACHER | Sarah Williams |
| m.davis@school.com | teacher123 | TEACHER | Michael Davis |
| j.smith@school.com | student123 | STUDENT | James Smith |
| e.rodriguez@school.com | student123 | STUDENT | Elena Rodriguez |
| a.chen@school.com | student123 | STUDENT | Alex Chen |
| k.okafor@school.com | student123 | STUDENT | Kemi Okafor |
| l.martinez@school.com | student123 | STUDENT | Lucas Martinez |

**School Structure:**
- 3 Classes: Grade 10A, Grade 9A, Grade 8A
- 5 Subjects: Mathematics, English, Physics, Chemistry, Biology
- 1 Term: 2024-2025 Academic Year (September to June)

**Academic Data:**
- Enrollments linking each student to their class for the current term
- Teacher assignments linking teachers to specific classes and subjects
- 13 Assessments across different subjects (midterms, finals, quizzes, projects)
- Grade entries — each student has scores for their assessments
- 14 days of attendance records with realistic patterns (mostly present, some absent/late)

### Why This Matters

Without the seeder, every time you restart the backend you would have to:
1. Register users manually through the API
2. Create classes, subjects, terms manually
3. Enroll students, assign teachers manually
4. Enter grades and attendance manually

That would take 30+ minutes of manual work every single restart. The seeder does it all in under 1 second.

---

# 20. Dashboard API — Computing Real Statistics

The Dashboard is the first page users see after logging in. It shows real-time statistics computed from the actual data in the database.

### The DashboardController

**File:** `controller/DashboardController.java`

This controller is interesting because it does not follow the typical CRUD pattern. Instead, it **aggregates** data from multiple sources:

```java
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final StudentService studentService;
    private final TeacherService teacherService;
    private final SchoolClassService schoolClassService;
    private final SubjectService subjectService;
    private final AttendanceRepository attendanceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssessmentRepository assessmentRepository;
    private final StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboardStats() {
        // Step 1: Count everything
        long totalStudents = studentService.getStudentCount();
        long totalTeachers = teacherService.getTeacherCount();
        long totalClasses = schoolClassService.getClassCount();
        long totalSubjects = subjectService.getSubjectCount();

        // Step 2: Calculate attendance rate (last 30 days)
        LocalDate now = LocalDate.now();
        LocalDate thirtyDaysAgo = now.minusDays(30);
        long totalRecords = attendanceRepository.countByDateRange(thirtyDaysAgo, now);
        long presentRecords = attendanceRepository.countByStatusAndDateRange(
            AttendanceStatus.PRESENT, thirtyDaysAgo, now);
        double attendanceRate = totalRecords > 0
            ? Math.round((presentRecords * 1000.0 / totalRecords)) / 10.0
            : 0.0;

        // Step 3: Weekly attendance chart data (Mon-Sun)
        LocalDate monday = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<Double> weeklyAttendance = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate day = monday.plusDays(i);
            long dayTotal = attendanceRepository.countByDate(day);
            long dayPresent = attendanceRepository.countByDateAndStatus(
                day, AttendanceStatus.PRESENT);
            double dayRate = dayTotal > 0
                ? Math.round((dayPresent * 1000.0 / dayTotal)) / 10.0
                : 0.0;
            weeklyAttendance.add(dayRate);
        }

        // Step 4: Recent students (last 5 added)
        List<RecentStudentDTO> recentStudents = studentRepository.findAll().stream()
            .sorted((a, b) -> Long.compare(b.getId(), a.getId()))  // newest first
            .limit(5)
            .map(s -> RecentStudentDTO.builder()
                .id(s.getId())
                .name(s.getFirstName() + " " + s.getLastName())
                .className(s.getSchoolClass() != null
                    ? s.getSchoolClass().getName() : "Unassigned")
                .email(s.getEmail())
                .build())
            .collect(Collectors.toList());

        // Step 5: Build and return the complete dashboard
        return ResponseEntity.ok(DashboardDTO.builder()
            .totalStudents(totalStudents)
            .totalTeachers(totalTeachers)
            .totalClasses(totalClasses)
            .totalSubjects(totalSubjects)
            .attendanceRate(attendanceRate)
            .recentStudents(recentStudents)
            .weeklyAttendance(weeklyAttendance)
            .build());
    }
}
```

### What Each Step Does

**Step 1 — Counting:** Simple counts using each service's `getXxxCount()` method, which internally calls `repository.count()`. This generates `SELECT COUNT(*) FROM students`, etc.

**Step 2 — Attendance Rate:** Calculates the overall attendance rate for the last 30 days. It counts total attendance records and how many were "PRESENT", then divides to get a percentage. The `Math.round(... * 1000.0) / 10.0` trick rounds to one decimal place (e.g., 87.5%).

**Step 3 — Weekly Chart:** Loops through each day of the current week (Monday to Sunday) and calculates the attendance rate for each day. This data powers the bar chart on the frontend dashboard.

**Step 4 — Recent Students:** Gets all students, sorts by ID descending (newest first), takes the top 5, and converts them to a simple DTO with just name, class, and email.

**Step 5 — Build Response:** Assembles all the computed data into a single `DashboardDTO` and returns it.

### The DashboardDTO

This DTO has a nested class for recent students:

```java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardDTO {
    private long totalStudents;
    private long totalTeachers;
    private long totalClasses;
    private long totalSubjects;
    private double attendanceRate;
    private long totalEnrollments;
    private long totalAssessments;
    private List<RecentStudentDTO> recentStudents;
    private List<Double> weeklyAttendance;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RecentStudentDTO {
        private Long id;
        private String name;
        private String className;
        private String email;
    }
}
```

The frontend receives this as a single JSON object and uses it to populate all the dashboard cards, charts, and tables.

---

# 21. How the Frontend Connects to the Backend

### The API Client (Axios)

The frontend uses **Axios**, a JavaScript HTTP library, to make requests to our Spring Boot backend:

```typescript
// frontend/src/api/axios.ts
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Interceptor: automatically attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

**`baseURL: 'http://localhost:8080/api'`** — All requests will be prefixed with this URL. So `api.get('/students')` actually sends a request to `http://localhost:8080/api/students`.

**`interceptors.request.use(...)`** — An interceptor runs before EVERY request. Ours reads the JWT token from localStorage and adds it to the `Authorization` header. This is why the frontend does not have to manually add the token to each request — the interceptor does it automatically.

### API Service Functions

```typescript
// frontend/src/api/services.ts
export const studentApi = {
    getAll: () => api.get<Student[]>('/students'),
    getById: (id: number) => api.get<Student>(`/students/${id}`),
    getMe: () => api.get<Student>('/students/me'),
    create: (data: Partial<Student>) => api.post<Student>('/students', data),
    update: (id: number, data: Partial<Student>) => api.put<Student>(`/students/${id}`, data),
    delete: (id: number) => api.delete(`/students/${id}`),
};
```

Each function maps to one of our backend endpoints. The frontend calls these functions, and Axios handles the HTTP communication.

### The Complete Data Flow — From Click to Screen

Here is what happens when an admin clicks "Students" in the sidebar:

```
1. React Router navigates to /students
   --> The Students component mounts

2. useEffect() runs --> calls studentApi.getAll()

3. Axios sends: GET http://localhost:8080/api/students
   Headers: { Authorization: "Bearer eyJ..." }

4. Request hits Spring Boot's embedded Tomcat server on port 8080

5. Security Filter Chain processes the request:
   a. JwtAuthenticationFilter reads the token
   b. Validates the token signature and expiration
   c. Loads the User from the database
   d. Sets the user in SecurityContext

6. DispatcherServlet routes the request:
   - URL: /api/students, Method: GET
   - Matches: StudentController.getAllStudents()

7. Controller calls studentService.getAllStudents()

8. Service calls studentRepository.findAll()

9. Spring Data JPA generates: SELECT * FROM students

10. H2 database executes the query and returns rows

11. Hibernate converts each row into a Student entity object

12. Service converts each entity into a StudentDTO using toDTO()

13. Controller wraps the list in ResponseEntity.ok()

14. Spring (Jackson library) converts the List<StudentDTO> to JSON:
    [
      {"id": 1, "firstName": "James", "lastName": "Smith", ...},
      {"id": 2, "firstName": "Elena", "lastName": "Rodriguez", ...},
      ...
    ]

15. JSON response sent back over HTTP to the frontend

16. Axios receives the response --> resolves the Promise

17. React component receives the data --> calls setStudents(response.data)

18. React re-renders the component with the new data --> table appears on screen
```

This entire flow happens in **milliseconds**. The user just sees the student list appear.

---

# 22. The Complete Request Lifecycle

Let us trace a more complex request — a student logging in and viewing their grades:

### Phase 1: Login

```
User types: j.smith@school.com / student123 and clicks "Login"

Frontend:
  1. Login component calls authApi.login({ email, password })
  2. Axios sends POST /api/auth/login with JSON body

Backend:
  3. No JWT filter check needed (/api/auth/** is permitAll)
  4. AuthController.login() receives the request
  5. AuthService.login() is called
  6. authenticationManager.authenticate() verifies the password
     - loadUserByUsername("j.smith@school.com") loads the User
     - BCrypt compares password hashes -- they match!
  7. jwtUtil.generateToken(user) creates a JWT
  8. buildAuthResponse() creates response with:
     - token, email, firstName: "James", lastName: "Smith"
     - role: STUDENT
     - studentId: 1 (found via studentRepository.findByUserId)

Frontend:
  9. Receives the response
  10. Stores token and user in localStorage
  11. AuthContext updates -- user is now logged in
  12. React Router redirects to /dashboard
```

### Phase 2: Viewing Grades

```
Student clicks "Grades" in the sidebar

Frontend:
  1. React Router navigates to /grades
  2. Grades component mounts
  3. useEffect detects user.role === 'STUDENT'
  4. Auto-sets selectedStudent to user.studentId (1)
  5. Calls gradeApi.getByStudent(1)
  6. Axios sends GET /api/grades/student/1
     Headers: { Authorization: "Bearer eyJ..." }

Backend:
  7. JwtAuthenticationFilter validates the token
     - Extracts email: j.smith@school.com
     - Loads User from database
     - Token is valid -- sets authentication
  8. Request reaches GradeController.getStudentGrades(1)
  9. GradeService fetches grades from database
  10. Converts to DTOs and returns

Frontend:
  11. Receives grade data
  12. Renders the grades table
  13. Student sees "My Grades" (not the student picker dropdown)
```

### What Makes This Secure

- The student CANNOT see other students' grades because the frontend auto-selects their own ID and hides the picker
- Even if they manually called `/api/grades/student/2` (another student), the backend would return the data (we could add more restrictions here in a production app)
- The student CANNOT create, update, or delete grades because those endpoints have `@PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")`
- The student CANNOT access admin pages like `/students` or `/teachers` because the frontend `ProtectedRoute` blocks it AND the backend would still require authentication

---

# 23. Glossary of Annotations

Here is every annotation used in our project, what it does, and where we use it:

### Spring Core Annotations

| Annotation | What It Does | Where Used |
|-----------|-------------|-----------|
| `@SpringBootApplication` | Combines @Configuration + @EnableAutoConfiguration + @ComponentScan. The main entry point. | Main class |
| `@Component` | Marks a class as a Spring bean (Spring creates and manages an instance) | DataSeeder |
| `@Configuration` | Marks a class that defines @Bean methods | SecurityConfig, AppConfig |
| `@Bean` | Marks a method whose return value becomes a Spring-managed bean | SecurityConfig, AppConfig |
| `@Value("${...}")` | Injects a value from application.yml into a field | JwtUtil |
| `@Lazy` | Delays bean creation until it is first needed (breaks circular dependencies) | AuthService |

### Web/REST Annotations

| Annotation | What It Does | Where Used |
|-----------|-------------|-----------|
| `@RestController` | Marks a class as a REST API controller (handles HTTP, returns JSON) | All controllers |
| `@RequestMapping("/path")` | Sets the base URL path for a controller | All controllers |
| `@GetMapping` | Maps HTTP GET requests to a method | Read operations |
| `@PostMapping` | Maps HTTP POST requests to a method | Create operations |
| `@PutMapping` | Maps HTTP PUT requests to a method | Update operations |
| `@DeleteMapping` | Maps HTTP DELETE requests to a method | Delete operations |
| `@PathVariable` | Extracts a value from the URL path (e.g., /students/{id}) | Controllers |
| `@RequestParam` | Extracts a value from the query string (e.g., ?query=james) | Search endpoints |
| `@RequestBody` | Converts the JSON request body into a Java object | Create/Update endpoints |
| `@Valid` | Triggers validation on the annotated parameter | Create/Update endpoints |

### JPA/Database Annotations

| Annotation | What It Does | Where Used |
|-----------|-------------|-----------|
| `@Entity` | Marks a class as a database table | All entity classes |
| `@Table(name = "...")` | Specifies the database table name | All entity classes |
| `@Id` | Marks a field as the primary key | All entity classes |
| `@GeneratedValue` | Auto-generates the primary key value | All entity classes |
| `@Column` | Configures a database column (nullable, unique, etc.) | Entity fields |
| `@Enumerated(EnumType.STRING)` | Stores an enum as a string in the database | Role, Status fields |
| `@ManyToOne` | Defines a many-to-one relationship (many students to one class) | Student, Attendance, etc. |
| `@OneToOne` | Defines a one-to-one relationship (one student to one user) | Student, Teacher |
| `@JoinColumn` | Specifies the foreign key column name | Relationship fields |
| `@Transactional` | Wraps a method in a database transaction (all-or-nothing) | Service methods |

### Lombok Annotations

| Annotation | What It Does | Where Used |
|-----------|-------------|-----------|
| `@Getter` | Generates getter methods for all fields | Entity classes |
| `@Setter` | Generates setter methods for all fields | Entity classes |
| `@NoArgsConstructor` | Generates a no-argument constructor | Entity and DTO classes |
| `@AllArgsConstructor` | Generates a constructor with all fields | Entity and DTO classes |
| `@Builder` | Generates the Builder pattern for object creation | Entity and DTO classes |
| `@Data` | Combines @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor | DTO classes |
| `@RequiredArgsConstructor` | Generates a constructor for final fields (used for dependency injection) | Services, Controllers |

### Security Annotations

| Annotation | What It Does | Where Used |
|-----------|-------------|-----------|
| `@EnableWebSecurity` | Activates Spring Security's web security | SecurityConfig |
| `@EnableMethodSecurity` | Enables @PreAuthorize on methods | SecurityConfig |
| `@PreAuthorize("hasRole('...')")` | Restricts a method to specific roles | Controller methods |
| `@AuthenticationPrincipal` | Injects the currently logged-in user | Controller parameters |

### Validation Annotations

| Annotation | What It Does | Where Used |
|-----------|-------------|-----------|
| `@NotBlank` | Field cannot be null, empty, or whitespace | DTO fields |
| `@Email` | Field must be a valid email format | DTO email fields |

---

# Congratulations!

You have now learned the complete architecture of a Spring Boot application by walking through every file in our School Management System. Here is a summary of the key concepts:

1. **Spring Boot** auto-configures your application based on dependencies
2. **Entities** define database tables using `@Entity` and JPA annotations
3. **Repositories** provide database access with zero implementation code
4. **Services** contain business logic and transaction management
5. **Controllers** expose REST API endpoints for the frontend
6. **DTOs** define the shape of data exchanged between frontend and backend
7. **Spring Security + JWT** protects the API with token-based authentication
8. **Role-Based Access Control** restricts features based on user roles
9. **Dependency Injection** lets Spring wire everything together automatically
10. **Auto-Configuration** means you write minimal configuration code

The beauty of Spring Boot is that all these pieces work together seamlessly. You add a dependency, write a few annotations, and Spring Boot handles the rest. As you build more projects, these patterns will become second nature.


Section	Topic
1-3	Big picture, Java basics, Spring Boot intro
4	Project structure (layered architecture)
5-6	pom.xml dependencies, Starters & Auto-Configuration
7	application.yml (every line explained)
8	Main class (@SpringBootApplication breakdown)
9	Entities (User, Student, relationships like @ManyToOne, @OneToOne)
10	Lombok (@Getter, @Builder, @Data, @RequiredArgsConstructor)
11	JPA & Hibernate (ORM, how Java objects become SQL)
12	Repositories (derived queries, JpaRepository magic)
13	DTOs (why we need them, validation, entity-to-DTO conversion)
14	Services (business logic, @Transactional, AuthService walkthrough)
15	Controllers (every annotation, HTTP methods, ResponseEntity, full URL map)
16	Security (SecurityConfig line-by-line, CORS, CSRF, password hashing)
17	JWT (token structure, complete login flow, JWT filter step-by-step)
18	Role-Based Access Control (backend + frontend, defense in depth)
19	DataSeeder (CommandLineRunner, demo credentials table)
20	Dashboard API (aggregation, real-time stats computation)
21	Frontend connection (Axios, interceptors, 18-step data flow)
22	Complete request lifecycle (login + grades viewing traced end-to-end)
23	Glossary of all annotations used in the project