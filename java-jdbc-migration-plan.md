# Migration notes

The backend uses plain Java's built-in HTTP server, JDBC, and MySQL. The beginner-friendly backend has six Java files directly in `backend/`: `Main.java`, `ApiController.java`, `AuthService.java`, `BloodService.java`, `Database.java`, and `User.java`.

The active app is intentionally limited to registration/login, donor search, and creating blood requests. Admin screens, audit views, request browsing, and donor response flows were removed from the app. `backend/schema.sql` still contains all five tables and relationships from the supplied ER diagram, including `donor_responses` and `audit_logs`.

See `api-contract.md` for the active routes, `backend/README.md` for setup, and `testing-report.md` for checks and verification limits.
