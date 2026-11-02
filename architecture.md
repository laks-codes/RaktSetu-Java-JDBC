# RaktSetu Architecture

## System overview

RaktSetu is split into a React/Vite frontend and a plain Java backend. The frontend uses the `/api/v1` REST contract and sends JSON with a Bearer token when logged in.

## Backend

- `Main.java` starts Java's built-in `HttpServer` and registers the `/api/v1` handler.
- `ApiController.java` maps HTTP methods and paths, validates access, and encodes API responses.
- `AuthService.java` handles password hashing and signed token operations.
- `UserDao.java` and `JdbcUserDao.java` handle user persistence with JDBC.
- `Database.java` reads MySQL settings from environment variables.
- `User.java` holds user data with private fields and getters/setters.
- Gson handles request and response JSON; MySQL Connector/J provides JDBC connectivity.

All SQL values are bound through `PreparedStatement`. The schema uses `users`, `donor_profiles`, `blood_requests`, `donor_responses`, and `audit_logs`.

## API contract

The frontend services and `api-contract.md` define the URL paths, methods, request fields, and response shapes. The backend keeps the `/api/v1` prefix and applies bearer authentication, user roles, ownership checks, donor availability, request status transitions, duplicate response constraints, and administrator audit records.

## Database source

The supplied ER diagram has the same five entities and relationships as `backend/schema.sql`: users have zero or one donor profile; users create many requests; each request receives many responses; and administrators create audit records. The physical schema includes additional fields needed by the documented API contract. The handwritten diagram image is not included in the repository because names and IDs are visible in the photo.

## Educational project disclaimer

RaktSetu does not certify donor compatibility, eligibility, infection status, or transfusion suitability. Licensed medical professionals and blood banks must handle clinical screening and compatibility decisions.
