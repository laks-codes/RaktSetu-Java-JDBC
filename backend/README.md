# RaktSetu Java + JDBC backend

This backend uses Java 21, the built-in `HttpServer`, Gson for JSON, JDBC, and MySQL Connector/J. It does not use Spring, JPA, Hibernate, streams, or lambdas.

## Requirements

- Java 21
- Maven 3.8+
- MySQL 8+

## Database setup

Create a MySQL account with permission to create/use the `raktsetu_db` database, then apply the schema:

```sh
mysql -u root -p < src/main/resources/schema.sql
```

The schema follows the five entity tables and constraints described in `../docs/database-integration.md`. The ZIP did not include the referenced ER diagram image; see `../docs/java-jdbc-migration-plan.md`.

Set the environment values shown in `.env.example`. `JWT_SECRET` must be a private random value of at least 32 characters. The application reads environment variables directly; it does not parse `.env` files.

## Build and run

```sh
mvn clean package
mvn exec:java
```

The API listens on `http://localhost:8080/api/v1`. Point the unchanged frontend at it by setting `VITE_API_BASE_URL=http://localhost:8080` in the frontend environment. The frontend appends `/api/v1` itself.

## Notes

- All database queries use `PreparedStatement`.
- Passwords use BCrypt (cost 10), matching the previous backend; bearer tokens are signed with HMAC-SHA256.
- The endpoint paths and JSON fields are intended to match `../docs/api-contract.md` and the frontend service calls.
- Create a donor profile after registering as a donor if registration did not include a blood group.
- Demo account credentials are not inserted by this schema because the old mock credentials do not have password hashes compatible with the Java password implementation.
