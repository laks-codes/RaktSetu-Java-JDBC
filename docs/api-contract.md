# RaktSetu REST API Specification & Contract

Version: `1.0.0`  
Base URL: `/api/v1`  
All responses use `Content-Type: application/json`.

---

## Standard Error Response Schema
Whenever an error occurs (4xx or 5xx), the server returns:
```json
{
  "timestamp": "2026-10-19T05:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid request parameters or payload",
  "path": "/api/v1/requests",
  "validationErrors": [
    {
      "field": "bloodGroup",
      "rejectedValue": "Z+",
      "message": "Must be a valid blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)"
    }
  ]
}
```

---

## 1. Authentication Endpoints

### 1.1 Register
- **URL**: `POST /api/v1/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "Jane Doe",
  "phoneNumber": "+919876543210",
  "role": "ROLE_REQUESTER", 
  "city": "Mumbai",
  "bloodGroup": "O_POSITIVE" 
}
```
*(role can be `ROLE_REQUESTER` or `ROLE_DONOR`. Default if omitted: `ROLE_REQUESTER`)*
- **Response** (`201 Created`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Jane Doe",
    "role": "ROLE_REQUESTER",
    "status": "ACTIVE",
    "city": "Mumbai",
    "createdAt": "2026-10-19T05:30:00Z"
  }
}
```

### 1.2 Login
- **URL**: `POST /api/v1/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```
- **Response** (`200 OK`): Same as Register response.

### 1.3 Current User Info
- **URL**: `GET /api/v1/auth/me`
- **Access**: Bearer Token required
- **Response** (`200 OK`): `UserProfileDTO`

---

## 2. Donor Endpoints

### 2.1 Search Donors (Public)
- **URL**: `GET /api/v1/donors`
- **Access**: Public
- **Query Parameters**:
  - `bloodGroup` (optional, e.g. `O_POSITIVE`)
  - `city` (optional, e.g. `Mumbai`)
  - `availableOnly` (boolean, default: `true`)
  - `page` (integer, default: `0`)
  - `size` (integer, default: `10`)
- **Response** (`200 OK`):
```json
{
  "content": [
    {
      "id": 101,
      "userId": 5,
      "displayName": "Rahul S.",
      "bloodGroup": "O_POSITIVE",
      "city": "Mumbai",
      "area": "Andheri West",
      "isAvailable": true,
      "lastDonationDate": "2026-06-15",
      "consentToContact": true,
      "totalDonations": 4
    }
  ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```
*Note: Sensitive contact fields (`phoneNumber`, `email`) are redacted in public searches unless requester is verified or request match is approved.*

### 2.2 Get Donor Profile by ID
- **URL**: `GET /api/v1/donors/{id}`
- **Access**: Authenticated

### 2.3 Create / Register Donor Profile
- **URL**: `POST /api/v1/donors`
- **Access**: Authenticated (ROLE_DONOR)
- **Request Body**:
```json
{
  "bloodGroup": "O_POSITIVE",
  "city": "Mumbai",
  "area": "Andheri West",
  "isAvailable": true,
  "lastDonationDate": "2026-06-15",
  "consentToContact": true,
  "notes": "Available evenings and weekends"
}
```

### 2.4 Update Donor Profile
- **URL**: `PUT /api/v1/donors/{id}`
- **Access**: Authenticated (Profile Owner or ADMIN)

### 2.5 Toggle Availability
- **URL**: `PATCH /api/v1/donors/{id}/availability`
- **Access**: Authenticated (Profile Owner or ADMIN)
- **Request Body**:
```json
{
  "isAvailable": false
}
```

---

## 3. Blood Request Endpoints

### 3.1 Create Blood Request
- **URL**: `POST /api/v1/requests`
- **Access**: Authenticated (ROLE_REQUESTER or ROLE_ADMIN)
- **Request Body**:
```json
{
  "patientName": "Aarav Patel",
  "bloodGroup": "B_POSITIVE",
  "unitsRequested": 2,
  "hospitalName": "Lilavati Hospital",
  "hospitalAddress": "A-791, Bandra Reclamation, Bandra West",
  "city": "Mumbai",
  "area": "Bandra",
  "urgency": "CRITICAL", 
  "requiredBy": "2026-10-21T18:00:00Z",
  "contactPhone": "+919876543210",
  "notes": "Required urgently for emergency cardiac surgery."
}
```
*Urgency levels: `CRITICAL`, `URGENT`, `NORMAL`.*
- **Response** (`201 Created`): `BloodRequestDTO` with initial status `OPEN`.

### 3.2 List Blood Requests
- **URL**: `GET /api/v1/requests`
- **Access**: Public
- **Query Parameters**:
  - `bloodGroup` (optional)
  - `city` (optional)
  - `status` (optional, default: `OPEN`)
  - `urgency` (optional)
  - `page` (default: 0), `size` (default: 10)

### 3.3 Get Single Request Details
- **URL**: `GET /api/v1/requests/{id}`
- **Access**: Public / Authenticated

### 3.4 Get Current User's Requests
- **URL**: `GET /api/v1/requests/mine`
- **Access**: Authenticated (Requester)

### 3.5 Update Request Status
- **URL**: `PATCH /api/v1/requests/{id}/status`
- **Access**: Authenticated (Request Owner or ADMIN)
- **Request Body**:
```json
{
  "status": "FULFILLED", 
  "reason": "Units received successfully at blood bank"
}
```
*Allowed transitions: `OPEN` -> `IN_PROGRESS` -> `FULFILLED` or `CANCELLED`.*

---

## 4. Donor Response Endpoints

### 4.1 Respond to a Blood Request
- **URL**: `POST /api/v1/requests/{id}/responses`
- **Access**: Authenticated (ROLE_DONOR)
- **Request Body**:
```json
{
  "status": "ACCEPTED", 
  "message": "I can be at Lilavati Hospital by 2 PM.",
  "estimatedArrival": "2026-10-21T14:00:00Z"
}
```
*Status: `ACCEPTED` or `DECLINED`.*
*Business rules enforced:*
- Request must be in `OPEN` or `IN_PROGRESS` status.
- Cannot submit duplicate response from the same donor to the same request.

### 4.2 List Responses for a Request
- **URL**: `GET /api/v1/requests/{id}/responses`
- **Access**: Authenticated (Request Owner or ADMIN)

### 4.3 Update Donor Response
- **URL**: `PATCH /api/v1/responses/{id}`
- **Access**: Authenticated (Responding Donor or Request Owner)
- **Request Body**:
```json
{
  "status": "COMPLETED",
  "message": "Donation completed successfully."
}
```

---

## 5. Administration Endpoints

### 5.1 Admin Dashboard Stats
- **URL**: `GET /api/v1/admin/dashboard`
- **Access**: Role `ROLE_ADMIN`
- **Response** (`200 OK`):
```json
{
  "totalUsers": 128,
  "totalDonors": 85,
  "activeDonors": 64,
  "totalRequests": 42,
  "openRequests": 7,
  "fulfilledRequests": 31,
  "totalResponses": 95,
  "fulfillmentRate": 73.8
}
```

### 5.2 Audit Reports & Logs
- **URL**: `GET /api/v1/admin/reports`
- **Access**: Role `ROLE_ADMIN`
- **Response** (`200 OK`): Paged list of `AuditLogDTO` records.

### 5.3 Update User Status
- **URL**: `PATCH /api/v1/admin/users/{id}/status`
- **Access**: Role `ROLE_ADMIN`
- **Request Body**:
```json
{
  "status": "SUSPENDED",
  "reason": "Reported for inappropriate communication"
}
```
