-- Initial schema for medication service
-- Creates medication_plans and medication_intakes tables

-- Medication Plans Table
CREATE TABLE IF NOT EXISTS medication_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    form ENUM('TABLET', 'SYRUP', 'INJECTION', 'DROPS', 'OTHER') NOT NULL,
    frequency_per_day INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    
    INDEX idx_patient_id (patient_id),
    INDEX idx_active (active),
    INDEX idx_patient_active (patient_id, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Medication Intakes Table
CREATE TABLE IF NOT EXISTS medication_intakes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_id BIGINT NOT NULL,
    scheduled_at DATETIME NOT NULL,
    taken_at DATETIME,
    status ENUM('SCHEDULED', 'TAKEN', 'MISSED', 'SKIPPED') NOT NULL,
    notes TEXT,
    
    CONSTRAINT fk_intake_plan 
        FOREIGN KEY (plan_id) 
        REFERENCES medication_plans(id) 
        ON DELETE CASCADE,
    
    INDEX idx_plan_id (plan_id),
    INDEX idx_status (status),
    INDEX idx_plan_status (plan_id, status),
    INDEX idx_scheduled_at (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
