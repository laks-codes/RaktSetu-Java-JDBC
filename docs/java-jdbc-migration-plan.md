# Java + JDBC Migration Plan

## Repository findings

- The archive contains an untouched React/Vite frontend and a Spring Boot 3 backend. The working checkout was empty, so the archive contents were copied into this checkout before migration work.
- Frontend HTTP calls use `/api/v1`; `frontend/src/services/apiClient.ts` adds that prefix, sends JSON, and attaches the `raktsetu_token` as a Bearer token. No frontend changes are part of this migration.
- The Java backend exposes authentication, donor profiles/search, blood requests/search/status, donor responses, and admin statistics/reports/user moderation/request closure. The endpoint list and method/payload shapes are also recorded in `docs/api-contract.md`.
- The ER diagram was subsequently supplied as a HEIC image. It shows five entities and these relationships: users have zero or one donor profile, users create many blood requests, requests receive many donor responses, and admins perform many audit log entries. This matches the relationships and keys in `backend/src/main/resources/schema.sql`.
- The handwritten image contains student names and IDs, so it is not copied into the repository. The schema retains additional columns documented in the API/database integration contract because the frontend workflows use them.
- Authentication currently uses BCrypt and JWT. The plain Java replacement must preserve Bearer token login behavior and role/ownership checks; this needs a small standard-library implementation plus JSON/JDBC libraries.

## Migration implementation record

1. Preserve the frontend tree exactly and use the existing endpoint contract as the compatibility checklist.
2. Replace Maven Spring dependencies and the Spring source tree with a Java 21 application using `com.sun.net.httpserver.HttpServer`, Gson for JSON, and MySQL Connector/J for JDBC.
3. Add simple `model`, `dao`, `service`, `controller`, and `config` packages, with `Main.java` registering routes under `/api/v1`.
4. Use the documented five-table schema as the source for `schema.sql`; keep prepared statements for every SQL operation, unique response constraints, and search/report indexes.
5. Implement JSON request/response mapping, error responses, CORS, Bearer authentication, role checks, validation, ownership checks, audit writes, and pagination in the plain Java layers.
6. Add environment-based MySQL settings and setup/build/run instructions. Remove Spring-specific configuration and obsolete Spring tests after the replacement is in place.
7. Verify compilation and inspect endpoint coverage. Run any available tests only if they remain meaningful for the new backend; there is no MySQL server assumed available in this workspace.

## Compatibility checklist

| Method | Path | Access/behavior |
|---|---|---|
| POST | `/api/v1/auth/register` | Public; 201 auth response |
| POST | `/api/v1/auth/login` | Public; auth response |
| GET | `/api/v1/auth/me` | Bearer token required |
| GET/POST | `/api/v1/donors` | Public search / authenticated profile creation |
| GET | `/api/v1/donors/me` | Bearer token required |
| GET/PUT | `/api/v1/donors/{id}` | Profile read/update with ownership rules |
| PATCH | `/api/v1/donors/{id}/availability` | Profile owner or admin |
| GET/POST | `/api/v1/requests` | Public search / authenticated creation |
| GET | `/api/v1/requests/mine` | Bearer token required |
| GET/PATCH | `/api/v1/requests/{id}` and `/status` | Public read / owner or admin status change |
| POST/GET | `/api/v1/requests/{id}/responses` | Donor response / owner or admin list |
| GET | `/api/v1/responses/mine` | Bearer token required |
| PATCH | `/api/v1/responses/{id}` | Responding donor or request owner |
| GET | `/api/v1/admin/dashboard`, `/reports` | Admin only |
| PATCH | `/api/v1/admin/users/{id}/status`, `/requests/{id}/close` | Admin only; audit required |

## Verification limitations

Maven was unavailable and no MySQL server was present in the workspace. Java source syntax was checked with temporary stubs for external libraries; see `docs/testing-report.md` for the exact scope.
