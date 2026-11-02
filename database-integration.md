# Database Setup and ER Diagram

`backend/schema.sql` is the MySQL schema used by the Java backend. It contains five tables: `users`, `donor_profiles`, `blood_requests`, `donor_responses`, and `audit_logs`.

## Relationships shown in the supplied ER diagram

- One user can have zero or one donor profile. `donor_profiles.user_id` is unique and references `users.id`.
- One user can create many blood requests. `blood_requests.requester_id` references `users.id`.
- One blood request can receive many donor responses. `donor_responses.request_id` references `blood_requests.id`.
- Donors submit responses. `donor_responses.donor_id` references `users.id`.
- Admins perform many audited actions. `audit_logs.admin_id` references `users.id`.

The schema also includes fields used by the existing API and frontend, such as availability, consent, request urgency, required date, and timestamps. Duplicate responses are blocked by the unique key on `(request_id, donor_id)`. Search indexes are included in `schema.sql`.

## Create the database

From the `backend/` folder, run:

```sh
mysql -u root -p < schema.sql
```

Set `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, and a private `JWT_SECRET` in the environment before starting the server. See `backend/.env.example` for the variable names. The app reads environment variables directly; it does not load `.env` files.

The diagram photo is intentionally not stored in the repo because handwritten names and IDs are visible in it.
