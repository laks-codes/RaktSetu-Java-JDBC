# Verification report

## Passed

- `mvn clean package` compiles the backend with Java 21 compatibility. The project currently has no automated Maven test sources.
- `npm run build` completes TypeScript checking and the Vite production build.
- `npm audit --omit=dev` reports no production dependency advisories after the React Router update. Remaining advisories affect development dependencies.
- API smoke checks return `400` for malformed JSON and invalid donor blood groups, `401` for missing or invalid authentication, `404` for an unknown route, and `204` for CORS preflight.
- Request-unit parsing accepts whole JSON numbers and rejects fractional values.
- The frontend and API servers respond locally.

## Database verification blocked

Registration and login reach the JDBC driver, but MySQL rejects the configured `raktsetu_user` credentials. Those operations currently return `503` with a database configuration message. Donor search and blood request persistence therefore cannot be verified until valid MySQL credentials are configured and `schema.sql` is applied.
