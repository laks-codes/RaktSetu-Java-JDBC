# Verification report

## Passed

- `mvn clean package` compiles the backend with Java 21 compatibility. There are no automated Maven test sources.
- `npm run build` completes TypeScript checking and the Vite production build.
- `npm audit --omit=dev` reports no production dependency advisories after the React Router update. Two remaining advisories affect development tools only.
- API smoke checks return `400` for malformed JSON, invalid donor blood groups, and fractional request units; `401` for missing or invalid authentication; `404` for an unknown route; and `204` for CORS preflight.
- End-to-end checks against a separate local MySQL instance passed donor registration, consent-aware donor search, requester registration/login/current-user, and blood request creation. Temporary test records were removed.

The local app is currently using its isolated MySQL instance on port `3307`; the existing MySQL server on port `3306` was left untouched.
