# Database Integration Contract & Team Handoff Specification
**Project**: RaktSetu — Emergency Blood Donor Search and Request System  
**Audience**: Database Engineering Team & Backend Integrators  
**Status**: *PROPOSED CONTRACT — Pending Database Team Review & Approval*

---

## 1. Architectural Boundary & Repository Decoupling
To ensure that backend business logic and frontend user flows remain completely independent of the concrete storage engine:

- All controllers and services interact **only** with repository interfaces located in `com.raktsetu.repository`:
  1. `UserRepository`
  2. `DonorProfileRepository`
  3. `BloodRequestRepository`
  4. `DonorResponseRepository`
  5. `AuditLogRepository`
- The application currently defaults to the `mock` profile (`com.raktsetu.repository.mock`), which runs in-memory without external dependencies.
- When the database team delivers the MySQL schema and JPA repositories, they will implement the **exact same interfaces** under `com.raktsetu.repository.jpa`, activated by `spring.profiles.active=mysql`. **No changes to services or controllers will be required.**

---

## 2. Proposed Relational Schema & Entities

> [!NOTE]
> All schema definitions below are marked as **[PENDING TEAM APPROVAL]** until reviewed and finalized by the database team.

### 2.1 Table: `users`
Represents registered system actors (Requesters, Donors, Administrators).

| Column Name | Proposed Type | Constraints | Java Field Mapping | Notes |
|---|---|---|---|---|
| `id` | `BIGINT` | `PRIMARY KEY AUTO_INCREMENT` | `Long id` | Unique user identifier |
| `email` | `VARCHAR(150)` | `NOT NULL UNIQUE` | `String email` | Login credential |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | `String passwordHash` | BCrypt encrypted hash |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | `String fullName` | User's display name |
| `phone_number` | `VARCHAR(20)` | `NULL` | `String phoneNumber` | Contact phone |
| `city` | `VARCHAR(80)` | `NOT NULL` | `String city` | Primary city |
| `role` | `VARCHAR(30)` | `NOT NULL` | `Role role` | Enum: `ROLE_REQUESTER`, `ROLE_DONOR`, `ROLE_ADMIN` |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'ACTIVE'` | `UserStatus status` | Enum: `ACTIVE`, `SUSPENDED`, `INACTIVE` |
| `created_at` | `DATETIME(6)` | `NOT NULL DEFAULT CURRENT_TIMESTAMP(6)` | `Instant createdAt` | UTC timestamp |
| `updated_at` | `DATETIME(6)` | `NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)` | `Instant updatedAt` | UTC timestamp |

### 2.2 Table: `donor_profiles`
Maintains voluntary donor availability and preferences.

| Column Name | Proposed Type | Constraints | Java Field Mapping | Notes |
|---|---|---|---|---|
| `id` | `BIGINT` | `PRIMARY KEY AUTO_INCREMENT` | `Long id` | Primary key |
| `user_id` | `BIGINT` | `NOT NULL UNIQUE, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE` | `Long userId` | 1-to-1 relationship with `users` |
| `blood_group` | `VARCHAR(15)` | `NOT NULL` | `BloodGroup bloodGroup` | Enum: `A_POSITIVE`, `A_NEGATIVE`, `B_POSITIVE`, `B_NEGATIVE`, `AB_POSITIVE`, `AB_NEGATIVE`, `O_POSITIVE`, `O_NEGATIVE` |
| `city` | `VARCHAR(80)` | `NOT NULL` | `String city` | City of availability |
| `area` | `VARCHAR(100)` | `NULL` | `String area` | Neighborhood / Suburb |
| `is_available` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | `boolean isAvailable` | Active availability flag |
| `consent_to_contact` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | `boolean consentToContact` | Explicit consent for phone sharing |
| `last_donation_date`| `DATE` | `NULL` | `LocalDate lastDonationDate` | Last voluntary donation |
| `total_donations` | `INT` | `NOT NULL DEFAULT 0` | `int totalDonations` | Count of donations |
| `notes` | `TEXT` | `NULL` | `String notes` | Availability notes |
| `created_at` | `DATETIME(6)` | `NOT NULL DEFAULT CURRENT_TIMESTAMP(6)` | `Instant createdAt` | UTC |
| `updated_at` | `DATETIME(6)` | `NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)` | `Instant updatedAt` | UTC |

### 2.3 Table: `blood_requests`
Maintains emergency blood requirement posts.

| Column Name | Proposed Type | Constraints | Java Field Mapping | Notes |
|---|---|---|---|---|
| `id` | `BIGINT` | `PRIMARY KEY AUTO_INCREMENT` | `Long id` | Primary key |
| `requester_id` | `BIGINT` | `NOT NULL, FOREIGN KEY (requester_id) REFERENCES users(id)` | `Long requesterId` | User who created request |
| `patient_name` | `VARCHAR(100)` | `NOT NULL` | `String patientName` | Recipient identifier |
| `blood_group` | `VARCHAR(15)` | `NOT NULL` | `BloodGroup bloodGroup` | Needed blood group |
| `units_requested` | `INT` | `NOT NULL CHECK (units_requested > 0)` | `int unitsRequested` | Units required |
| `hospital_name` | `VARCHAR(150)` | `NOT NULL` | `String hospitalName` | Hospital / Blood bank name |
| `hospital_address`| `VARCHAR(255)` | `NULL` | `String hospitalAddress` | Address / Landmark |
| `city` | `VARCHAR(80)` | `NOT NULL` | `String city` | City of request |
| `area` | `VARCHAR(100)` | `NULL` | `String area` | Area / Zone |
| `urgency` | `VARCHAR(20)` | `NOT NULL` | `UrgencyLevel urgency` | Enum: `CRITICAL`, `URGENT`, `NORMAL` |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'OPEN'` | `RequestStatus status` | Enum: `OPEN`, `IN_PROGRESS`, `FULFILLED`, `CANCELLED` |
| `required_by` | `DATETIME(6)` | `NOT NULL` | `Instant requiredBy` | Expiration / required-by time |
| `contact_phone` | `VARCHAR(20)` | `NOT NULL` | `String contactPhone` | Emergency point of contact |
| `notes` | `TEXT` | `NULL` | `String notes` | Special instructions |
| `created_at` | `DATETIME(6)` | `NOT NULL DEFAULT CURRENT_TIMESTAMP(6)` | `Instant createdAt` | UTC |
| `updated_at` | `DATETIME(6)` | `NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)` | `Instant updatedAt` | UTC |

### 2.4 Table: `donor_responses`
Maintains responses by donors to blood requests.

| Column Name | Proposed Type | Constraints | Java Field Mapping | Notes |
|---|---|---|---|---|
| `id` | `BIGINT` | `PRIMARY KEY AUTO_INCREMENT` | `Long id` | Primary key |
| `request_id` | `BIGINT` | `NOT NULL, FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE` | `Long requestId` | Associated request |
| `donor_id` | `BIGINT` | `NOT NULL, FOREIGN KEY (donor_id) REFERENCES users(id)` | `Long donorId` | Responding donor |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'ACCEPTED'` | `ResponseStatus status` | Enum: `ACCEPTED`, `DECLINED`, `COMPLETED`, `CANCELLED` |
| `message` | `TEXT` | `NULL` | `String message` | Donor's message |
| `estimated_arrival`| `DATETIME(6)` | `NULL` | `Instant estimatedArrival` | Expected arrival |
| `created_at` | `DATETIME(6)` | `NOT NULL DEFAULT CURRENT_TIMESTAMP(6)` | `Instant createdAt` | UTC |
| `updated_at` | `DATETIME(6)` | `NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)` | `Instant updatedAt` | UTC |
| — | — | `UNIQUE KEY uq_request_donor (request_id, donor_id)` | — | **Prevents duplicate responses** |

### 2.5 Table: `audit_logs`
Maintains tamper-evident records of administrative actions.

| Column Name | Proposed Type | Constraints | Java Field Mapping | Notes |
|---|---|---|---|---|
| `id` | `BIGINT` | `PRIMARY KEY AUTO_INCREMENT` | `Long id` | Primary key |
| `admin_id` | `BIGINT` | `NOT NULL, FOREIGN KEY (admin_id) REFERENCES users(id)` | `Long adminId` | Admin performing action |
| `action` | `VARCHAR(50)` | `NOT NULL` | `String action` | E.g. `SUSPEND_USER`, `CLOSE_REQUEST` |
| `target_entity` | `VARCHAR(50)` | `NOT NULL` | `String targetEntity` | E.g. `User`, `BloodRequest` |
| `target_id` | `BIGINT` | `NOT NULL` | `Long targetId` | Entity ID |
| `reason` | `VARCHAR(255)` | `NOT NULL` | `String reason` | Justification |
| `timestamp` | `DATETIME(6)` | `NOT NULL DEFAULT CURRENT_TIMESTAMP(6)` | `Instant timestamp` | Audit time |

---

## 3. Recommended Indexes
To guarantee low latency on search and filtering endpoints, the following indexes are proposed:

1. `idx_donor_search`: `donor_profiles (blood_group, city, is_available)`
2. `idx_request_search`: `blood_requests (blood_group, city, status, urgency)`
3. `idx_request_requester`: `blood_requests (requester_id, status)`
4. `idx_response_request`: `donor_responses (request_id, status)`
5. `idx_response_donor`: `donor_responses (donor_id)`

---

## 4. Transaction Boundaries & Concurrency
- **Request Creation**: Single transaction.
- **Donor Response Submission**: `@Transactional(isolation = Isolation.READ_COMMITTED)`. Must check if `blood_requests.status IN ('OPEN', 'IN_PROGRESS')` and enforce uniqueness via constraint `uq_request_donor`.
- **Request Status Transition**: Updates to `status` (`OPEN` -> `IN_PROGRESS` -> `FULFILLED` or `CANCELLED`) must be atomic.

---

## 5. Enum & Timestamp Standards
- **Enums**: Persisted as `VARCHAR` (using `@Enumerated(EnumType.STRING)` in JPA). Never store ordinal numbers to ensure backward compatibility.
- **Timestamps**: All timestamps stored in UTC (`DATETIME(6)` or `TIMESTAMP(6)`).

---

## 6. Seed Data Requirements
Initial database migrations (e.g. Flyway or MySQL scripts) must provision synthetic demo accounts:
1. **Requester**: `requester@raktsetu.org` (password: `Requester@123`, role: `ROLE_REQUESTER`)
2. **Donor**: `donor@raktsetu.org` (password: `Donor@123`, role: `ROLE_DONOR`, group: `O_POSITIVE`, city: `Mumbai`)
3. **Administrator**: `admin@raktsetu.org` (password: `Admin@123`, role: `ROLE_ADMIN`)

---

## 7. MySQL Configuration Template (`application-mysql.yml`)
```yaml
spring:
  datasource:
    url: jdbc:mysql://${MYSQL_HOST:localhost}:${MYSQL_PORT:3306}/${MYSQL_DATABASE:raktsetu_db}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: ${MYSQL_USER:raktsetu_user}
    password: ${MYSQL_PASSWORD:raktsetu_secret}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
  jpa:
    hibernate:
      ddl-auto: validate # Do not auto-drop in staging/production
    show-sql: false
    properties:
      hibernate:
        format_sql: false
        dialect: org.hibernate.dialect.MySQLDialect
```

---

## 8. Handoff Guide for Database Teammates
Dear Teammate,
Here is what you need to deliver to connect your MySQL work into RaktSetu:

1. **Review & Confirm Schema**:
   Review the tables above in section 2. If you want to rename or modify columns, let us know so we can update the mapping.
2. **Deliver Migration Script**:
   Provide a SQL migration script (e.g., `V1__init_schema.sql` and `V2__seed_demo_data.sql`).
3. **Add JPA Repositories**:
   In `backend/src/main/java/com/raktsetu/repository/jpa`, create Spring Data JPA interfaces extending `JpaRepository` and implementing our domain repository interfaces. Annotate them with `@Profile("mysql")`.
4. **Verification**:
   Start your MySQL server, set `SPRING_PROFILES_ACTIVE=mysql`, and run `mvn test`. The backend test suite verifies interface contract conformance!
