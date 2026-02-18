# School Management System

A full-stack School Management System built with **Spring Boot 3** (Java 17) and **React 18** (TypeScript), backed by **PostgreSQL**.

## Modules

- **Authentication** — JWT-based login with role-based access (ADMIN, TEACHER, STUDENT)
- **Student Management** — CRUD with class assignment
- **Teacher Management** — CRUD with subject assignment
- **Class Management** — Create classes, assign homeroom teacher, enroll students
- **Attendance Tracking** — Mark daily attendance, query by date/student/class
- **Grades & Exams** — Record scores, calculate averages

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3, Spring Security, Spring Data JPA |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Database | PostgreSQL |
| Auth | JWT (jjwt) |
| API Docs | SpringDoc OpenAPI (Swagger UI) |

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE school_db;"
```

### 2. Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The API will start on `http://localhost:8080`.  
Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will start on `http://localhost:5173`.

## Default Admin Setup

Register an admin user via the API:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@school.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

Then log in at `http://localhost:5173/login` with `admin@school.com` / `admin123`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard` | Dashboard stats |
| GET/POST/PUT/DELETE | `/api/students` | Student CRUD |
| GET/POST/PUT/DELETE | `/api/teachers` | Teacher CRUD |
| GET/POST/PUT/DELETE | `/api/classes` | Class CRUD |
| GET/POST/PUT/DELETE | `/api/subjects` | Subject CRUD |
| GET/POST/PUT | `/api/attendance` | Attendance management |
| GET/POST/PUT/DELETE | `/api/grades` | Grade management |

## Project Structure

```
├── backend/          # Spring Boot REST API
│   ├── src/main/java/com/school/
│   │   ├── config/       # Security, JWT, CORS
│   │   ├── controller/   # REST controllers
│   │   ├── dto/          # Data transfer objects
│   │   ├── entity/       # JPA entities
│   │   ├── exception/    # Global error handling
│   │   ├── repository/   # Spring Data repos
│   │   ├── service/      # Business logic
│   │   └── util/         # JWT utility
│   └── pom.xml
│
└── frontend/         # React + Vite app
    ├── src/
    │   ├── api/          # Axios client + API services
    │   ├── components/   # Layout, shared components
    │   ├── context/      # Auth context
    │   ├── pages/        # All page components
    │   ├── routes/       # Protected route wrapper
    │   ├── types/        # TypeScript interfaces
    │   └── lib/          # Utility functions
    └── package.json
```
