# Backend setup

This backend is kept in one folder with six Java files:

- `Main.java`: starts the HTTP server.
- `ApiController.java`: handles HTTP routes and JSON.
- `AuthService.java`: handles passwords and login tokens.
- `BloodService.java`: searches donors and saves blood requests.
- `Database.java`: opens MySQL connections and reads/writes user accounts.
- `User.java`: stores user account data.

The required diagram schema is in `schema.sql`. It creates `users`, `donor_profiles`, `blood_requests`, `donor_responses`, and `audit_logs`, with the foreign keys shown by the ER diagram. Only accounts, donor search, and blood request operations are currently active in the simplified application.

## Requirements

JDK 21+, Maven 3.8+, and MySQL 8+.

## MySQL

Create the database and tables:

```sh
mysql -u root -p < schema.sql
```

Create the local app account and grant it access to this database:

```sh
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'raktsetu_user'@'localhost' IDENTIFIED BY 'raktsetu_secret'; GRANT SELECT, INSERT, UPDATE, DELETE ON raktsetu_db.* TO 'raktsetu_user'@'localhost';"
```

Set `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD` before running. The example account uses the defaults in `.env.example`; change the password there if you change it in MySQL. Copy the values into your shell or deployment configuration because the app does not load `.env` files. Set `JWT_SECRET` to a private random string of at least 32 characters.

## Build and run

```sh
mvn clean package
mvn exec:java
```

The API base is `http://localhost:8080/api/v1`. `SERVER_PORT` can change the port. The frontend setting `VITE_API_BASE_URL` should contain the server origin, for example `http://localhost:8080`.

SQL values are supplied with JDBC `PreparedStatement`s. Gson handles JSON and BCrypt hashes passwords.
