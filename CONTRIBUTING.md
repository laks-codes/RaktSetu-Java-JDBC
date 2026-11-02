# Contributing to RaktSetu

Welcome to the **RaktSetu — Emergency Blood Donor Search and Request System** project! This repository follows clean architecture principles with distinct frontend, backend, and database integration layers.

## Development Guidelines

### 1. Backend Standards
- **Java 21 & Spring Boot 3.x**: Ensure Java 21 is installed.
- **Layered Structure**: Follow `Controller -> Service -> Repository Interface -> Storage Implementation`.
- **DTOs**: Never return or accept persistence/domain entities directly in controllers. Always use DTOs with Bean Validation annotations.
- **Security & Password Hashing**: Passwords must be encoded using BCrypt. Never return passwords or password hashes in API responses.
- **Testing**: Write JUnit 5 and Mockito tests for all service methods, validation constraints, and authorization rules.

### 2. Frontend Standards
- **React + TypeScript + Tailwind CSS**: Use strict type definitions. Do not use `any` unless strictly justified.
- **Design Principles**: Use the designated crimson red (`#B91C1C`) healthcare palette with neutral grays and high contrast.
- **Component Hygiene**: Reusable components reside in `components/common` and `components/layout`.
- **Privacy Enforcement**: Ensure public donor search views never display private contact details (phone, email, exact address) without explicit user consent.

### 3. Database Team Handoff
- See `docs/database-integration.md` for the agreed entity mappings, SQL schema proposal, and transactional boundaries.
- Database changes must be packaged as versioned migrations without altering existing repository interfaces.

## Running Tests
- **Backend**: `./mvnw test` (or `mvn test`)
- **Frontend**: `npm test` and `npm run build`
