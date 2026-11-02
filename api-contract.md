# Active API contract

Base URL: `/api/v1`. Login and registration use JSON. Authenticated routes use `Authorization: Bearer <token>`. Error responses have `status`, `error`, `message`, `path`, and `timestamp` fields.

## `POST /auth/register`

```json
{
  "email": "donor@example.com",
  "password": "secret",
  "fullName": "Example Donor",
  "phoneNumber": "+919876543210",
  "city": "Chennai",
  "role": "ROLE_DONOR",
  "bloodGroup": "O+",
  "consentToContact": false
}
```

`role` is `ROLE_DONOR` or `ROLE_REQUESTER`. Donors must provide one of `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, or `O-`. Contact sharing defaults to false for a new donor unless the donor opts in. Returns an authentication response with `token`, `type`, and `user`.

## `POST /auth/login`

```json
{"email":"donor@example.com","password":"secret"}
```

Returns `{ "token": "...", "type": "Bearer", "user": { ... } }`.

## `GET /auth/me`

Requires a bearer token. Returns the current `user` object with `id`, `email`, `fullName`, `phoneNumber`, `city`, `role`, `status`, and `createdAt`.

## `GET /donors?bloodGroup=O%2B&city=Chennai`

Requires a bearer token. Filters are optional. Returns a page-shaped object (`content`, `pageNumber`, `pageSize`, `totalElements`, `totalPages`, `last`) with donor profile details. `phoneNumber` and `email` are included only when `consentToContact` is true.

## `POST /requests`

Requires a bearer token. Creates a blood request and returns its generated `id` and a confirmation `message`.

```json
{
  "patientName": "Patient",
  "bloodGroup": "O+",
  "unitsRequested": 2,
  "hospitalName": "City Hospital",
  "hospitalAddress": "Main Road",
  "city": "Chennai",
  "area": "Central",
  "urgency": "URGENT",
  "requiredBy": "2026-11-03T09:00:00.000Z",
  "contactPhone": "+919876543210",
  "notes": "Optional details"
}
```

The simplified app does not expose admin, audit log, request browsing, or donor response endpoints. The corresponding entities remain in the schema to preserve the supplied ER diagram.
