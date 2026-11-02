# RaktSetu — Emergency Blood Donor Search and Request System
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Backend](https://img.shields.io/badge/Backend-Java%20%2B%20JDBC-orange.svg)](https://docs.oracle.com/en/java/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg)](https://tailwindcss.com/)

> [!IMPORTANT]
> **Educational Project Disclaimer**:  
> RaktSetu is an educational software engineering project built to demonstrate full-stack architecture, clean code principles, and emergency resource coordination. **It does not claim to medically certify donor compatibility, donor eligibility, infectious disease status, or transfusion suitability.** Clinical screening and compatibility matching must always be performed by licensed medical professionals and certified blood transfusion centers.

---

## Overview
**RaktSetu** connects voluntary blood donors with individuals and hospitals facing blood emergencies. The system supports full request lifecycles, donor discovery by blood group and city, donor responses, role-based dashboards, and audit-logged administrative monitoring.

---

## Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Lucide React icons.
- **Backend**: Java 21, built-in `HttpServer`, JDBC, Gson, and MySQL Connector/J.
- **Storage**: MySQL database configured through environment variables.

---

## Project Structure
```
RaktSetu/
├── frontend/               # React + TypeScript + Vite application
├── backend/                # Flat Java source files, Maven config, and schema.sql
├── README.md
├── CONTRIBUTING.md
├── api-contract.md
├── architecture.md
├── database-integration.md
├── java-jdbc-migration-plan.md
├── testing-report.md
└── .gitignore
```

---

## Quickstart Guide

### Prerequisites
- **Java 21 JDK** installed (`java -version`)
- **MySQL 8**
- **Node.js** (v18+ or v20+) and **npm** (`node -v`, `npm -v`)
- Apache Maven 3.8+

---

### 1. Running the Backend

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create the database from the project schema:
   ```bash
   mysql -u root -p < schema.sql
   ```
3. Set MySQL connection values from `backend/.env.example` in your shell or deployment environment. The app reads environment variables directly.
4. Build and start:
   ```bash
   mvn clean package
   mvn exec:java
   ```
5. The REST API will be available at:
   - Base URL: `http://localhost:8080/api/v1`

---

### 2. Running the Frontend (React + Vite)

1. Open a second terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
   *(Set `VITE_API_BASE_URL=http://localhost:8080`; the frontend appends `/api/v1`.)*
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser at `http://localhost:5173`.

---

## Key Features & Business Rules
- **Privacy First**: Sensitive contact information (phone number, email, address) is masked on public donor searches unless explicit consent is recorded.
- **Request Lifecycle**: Strict transition rules (`OPEN` -> `IN_PROGRESS` -> `FULFILLED` / `CANCELLED`).
- **Duplicate Prevention**: Donors cannot submit multiple responses to the same request.
- **Tamper-Evident Admin Audit**: Administrative suspensions and request closures are written to an immutable audit trail.
- **API Compatibility**: The frontend continues to call the same `/api/v1` endpoints and expects Bearer JWT authentication.

---

## Documentation Links
- [System Architecture](architecture.md)
- [REST API Contract](api-contract.md)
- [Database Setup and Schema](database-integration.md)
- [Migration Notes](java-jdbc-migration-plan.md)
- [Verification Report](testing-report.md)
