# RaktSetu

RaktSetu is a small blood donor search and blood request app. A user can create a donor or requester account, sign in, search donors by blood group and city, or submit a blood request.

## Project layout

```text
RaktSetu/
├── frontend/                 React website
└── backend/                  Java files, MySQL schema and Maven file
    ├── Main.java
    ├── ApiController.java
    ├── AuthService.java
    ├── BloodService.java
    ├── Database.java
    ├── User.java
    └── schema.sql
```

The backend uses Java's built-in HTTP server, JDBC, MySQL, Gson for JSON, and BCrypt for password hashing. Its Java source files are kept directly in `backend/` for a beginner-friendly layout.

## Requirements

- JDK 21 or later
- Maven 3.8 or later
- MySQL 8 or later
- Node.js 18 or later and npm

## Configure and run the backend

1. Create the five-table database from the supplied ER diagram:

   ```sh
   cd backend
   mysql -u root -p < schema.sql
   ```

2. Set these environment values in the terminal or hosting environment. The program does not read a `.env` file automatically.

   ```sh
   export MYSQL_HOST=localhost
   export MYSQL_PORT=3306
   export MYSQL_DATABASE=raktsetu_db
   export MYSQL_USER=raktsetu_user
   export MYSQL_PASSWORD=your_mysql_password
   export JWT_SECRET=use_a_private_random_value_at_least_32_characters_long
   export SERVER_PORT=8080
   ```

3. Build and start the server:

   ```sh
   mvn clean package
   mvn exec:java
   ```

The API listens at `http://localhost:8080/api/v1`.

## Configure and run the frontend

In a second terminal:

```sh
cd frontend
npm install
```

Set `VITE_API_BASE_URL=http://localhost:8080` in `frontend/.env`, then start Vite:

```sh
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Active features

- Donor or requester registration and login
- Donor search by blood group and city
- Contact details shown only when a donor opted in to sharing them
- Blood request submission

The database keeps all five ER entities and relationships: `users`, `donor_profiles`, `blood_requests`, `donor_responses`, and `audit_logs`. Donor responses and admin/audit screens are not part of this simplified app flow.

See [backend/README.md](backend/README.md), [api-contract.md](api-contract.md), and [database-integration.md](database-integration.md) for details.
