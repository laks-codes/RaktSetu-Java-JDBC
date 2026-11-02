# Simple project structure

The website is in `frontend/`. The backend is in `backend/` with six Java source files at its root:

```text
Main.java          starts the built-in Java HTTP server
ApiController.java reads HTTP requests and returns JSON
AuthService.java   checks passwords and creates bearer tokens
BloodService.java  searches donors and saves requests
Database.java      connects to MySQL and reads/writes users
User.java          stores account details
```

`ApiController` has the active routes for registration, login, current user, donor search, and creating a blood request. `AuthService` handles login-related work; `BloodService` handles donor search and request storage; `Database` contains user JDBC operations. SQL values use `PreparedStatement`.

## Database and ER diagram

`backend/schema.sql` retains the five ER entities and relationships: `users`, `donor_profiles`, `blood_requests`, `donor_responses`, and `audit_logs`. A user may have a donor profile and create requests; requests may have donor responses; audit records refer to users. The simplified frontend/backend actively use accounts, donor profiles, and blood requests. The other two tables remain in the schema for ER-diagram consistency.

## Active website flow

Registration/login provides a bearer token. Donor search and blood request submission require that token. Donors choose whether their contact information is shared in search results. No admin dashboard, audit screen, donor response, or request management screen is included in this simple flow.
