# Verification report

## Verified

- Backend Java sources compile with `javac --release 21` using temporary local stubs for Gson and BCrypt. This checks Java syntax and types against the methods used by those APIs.
- `backend/schema.sql` still defines all five ER entities and their foreign-key relationships.
- Backend SQL operations use `PreparedStatement`.
- The remaining frontend routes call the implemented register, login, current-user, donor-search, and blood-request routes.
- `git diff --check` is run before commit.

## Not verified here

- A full Maven build was unavailable because Maven is not installed in this environment; temporary stubs do not verify external dependency linkage.
- The frontend build was unavailable because Node.js/npm and installed frontend dependencies are not available here.
- No MySQL server was available for schema application or end-to-end API/database testing. Therefore a live website workflow is not claimed as tested.
