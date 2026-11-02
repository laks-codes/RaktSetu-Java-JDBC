# Java + JDBC Migration Notes

The backend was changed from Spring Boot to Java 21, Java's built-in `HttpServer`, JDBC, MySQL, Gson, and BCrypt. Frontend files and API URLs remain unchanged.

The supplied ER diagram has five entities: users, donor profiles, blood requests, donor responses, and audit logs. Their relationships are captured in `backend/schema.sql` and summarized in `database-integration.md`. The handwritten diagram is not included in the repo because it shows names and IDs.

## Simple backend layout

All backend Java files are directly inside `backend/` with no package declarations or nested source folders. `Main.java` starts the server; `ApiController.java` handles HTTP paths; `AuthService.java` handles passwords and tokens; `UserDao.java` and `JdbcUserDao.java` handle user persistence; `Database.java` opens MySQL connections; `User.java` holds user data.

## API checklist

The backend keeps the methods, paths, and JSON shapes documented in `api-contract.md`: authentication, donor search/profile management, blood requests, donor responses, admin reports, user status changes, and audit logging. The frontend was compared with its original archive copy and left unchanged.

## Verification limits

Java syntax is checked with `javac --release 21` and temporary stubs for the external libraries. A full Maven build and MySQL endpoint run require Maven dependencies and a MySQL server; see `testing-report.md` for the current verification record.
