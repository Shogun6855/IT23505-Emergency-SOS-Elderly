-- Create medical_profiles table
CREATE TABLE IF NOT EXISTS medical_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    allergies TEXT,
    conditions TEXT,
    current_medications TEXT,
    blood_type VARCHAR(10),
    doctor_name VARCHAR(255),
    doctor_phone VARCHAR(20),
    doctor_email VARCHAR(255),
    insurance_provider VARCHAR(255),
    insurance_number VARCHAR(100),
    emergency_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_medical_profiles_user_id ON medical_profiles(user_id);

