# Contributing to RaktSetu

Welcome to the **RaktSetu — Emergency Blood Donor Search and Request System** project! The application has two folders: `frontend/` and `backend/`. Keep backend Java files directly inside `backend/` so they are easy to find.

## Development Guidelines

### 1. Backend Standards
- **Java 21 + JDBC**: Use prepared statements for SQL values.
- **Beginner-friendly Java**: Prefer clear classes, methods, loops, and exception handling. Avoid frameworks and advanced language features.
- **Security & Password Hashing**: Passwords must be encoded using BCrypt. Never return passwords or password hashes in API responses.

### 2. Frontend Standards
- **React + TypeScript + Tailwind CSS**: Use strict type definitions. Do not use `any` unless strictly justified.
- **Design Principles**: Use the designated crimson red (`#B91C1C`) healthcare palette with neutral grays and high contrast.
- **Component Hygiene**: Reusable components reside in `components/common` and `components/layout`.
- **Privacy Enforcement**: Ensure public donor search views never display private contact details (phone, email, exact address) without explicit user consent.

### 3. Database Team Handoff
- See `database-integration.md` and `backend/schema.sql` for database fields and relationships.
- Keep frontend API URLs and JSON formats compatible with `api-contract.md`.

## Running Tests
- **Backend**: `cd backend && mvn clean package`
- **Frontend**: `cd frontend && npm install && npm run build`
