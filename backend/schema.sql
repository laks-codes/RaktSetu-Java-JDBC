-- ====================================================================
-- RaktSetu Database Schema Migration
-- Database: raktsetu_db
-- ====================================================================

CREATE DATABASE IF NOT EXISTS raktsetu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE raktsetu_db;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NULL,
    city VARCHAR(80) NOT NULL,
    role VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Donor Profiles table
CREATE TABLE IF NOT EXISTS donor_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    blood_group VARCHAR(15) NOT NULL,
    city VARCHAR(80) NOT NULL,
    area VARCHAR(100) NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    consent_to_contact BOOLEAN NOT NULL DEFAULT TRUE,
    last_donation_date DATE NULL,
    total_donations INT NOT NULL DEFAULT 0,
    notes TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_donor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_donor_search (blood_group, city, is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Blood Requests table
CREATE TABLE IF NOT EXISTS blood_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    requester_id BIGINT NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    blood_group VARCHAR(15) NOT NULL,
    units_requested INT NOT NULL CHECK (units_requested > 0),
    hospital_name VARCHAR(150) NOT NULL,
    hospital_address VARCHAR(255) NULL,
    city VARCHAR(80) NOT NULL,
    area VARCHAR(100) NULL,
    urgency VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    required_by DATETIME(6) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    notes TEXT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_request_requester FOREIGN KEY (requester_id) REFERENCES users(id),
    INDEX idx_request_search (blood_group, city, status, urgency),
    INDEX idx_request_requester (requester_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Donor Responses table
CREATE TABLE IF NOT EXISTS donor_responses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_id BIGINT NOT NULL,
    donor_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACCEPTED',
    message TEXT NULL,
    estimated_arrival DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_response_request FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_response_donor FOREIGN KEY (donor_id) REFERENCES users(id),
    CONSTRAINT uq_request_donor UNIQUE (request_id, donor_id),
    INDEX idx_response_request (request_id, status),
    INDEX idx_response_donor (donor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    target_entity VARCHAR(50) NOT NULL,
    target_id BIGINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    timestamp DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES users(id),
    INDEX idx_audit_target (target_entity, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
