-- Emergency SOS System - Complete Database Schema
-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS health_vitals CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS medical_profiles CASCADE;
DROP TABLE IF EXISTS battery_alerts CASCADE;
DROP TABLE IF EXISTS check_ins CASCADE;
DROP TABLE IF EXISTS medication_logs CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS user_caregivers CASCADE;
DROP TABLE IF EXISTS emergencies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('elder', 'caregiver')),
    address TEXT,
    emergency_contact VARCHAR(255),
    medical_info TEXT,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create emergencies table
CREATE TABLE emergencies (
    id UUID PRIMARY KEY,
    elder_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    notes TEXT,
    priority VARCHAR(20) DEFAULT 'high' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    resolution_notes TEXT,
    resolved_by INTEGER REFERENCES users(id),
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_caregivers table (relationship between elders and caregivers)
CREATE TABLE user_caregivers (
    id SERIAL PRIMARY KEY,
    elder_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    caregiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(elder_id, caregiver_id)
);

-- Create notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emergency_id UUID REFERENCES emergencies(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create medications table
CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    time_slots TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create medication_logs table
CREATE TABLE medication_logs (
    id SERIAL PRIMARY KEY,
    medication_id INTEGER NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP NOT NULL,
    taken_at TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'missed')),
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_emergencies_elder_id ON emergencies(elder_id);
CREATE INDEX idx_emergencies_status ON emergencies(status);
CREATE INDEX idx_user_caregivers_elder_id ON user_caregivers(elder_id);
CREATE INDEX idx_user_caregivers_caregiver_id ON user_caregivers(caregiver_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_medications_is_active ON medications(is_active);
CREATE INDEX idx_medication_logs_medication_id ON medication_logs(medication_id);
CREATE INDEX idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX idx_medication_logs_status ON medication_logs(status);
CREATE INDEX idx_medication_logs_scheduled_time ON medication_logs(scheduled_time);

-- Create check_ins table for "I'm Okay" feature
CREATE TABLE check_ins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    next_reminder_time TIMESTAMP NOT NULL,
    reminder_hours INTEGER NOT NULL DEFAULT 6,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create battery_alerts table for low battery notifications
CREATE TABLE battery_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    battery_level INTEGER NOT NULL,
    device_info TEXT,
    alert_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional indexes
CREATE INDEX idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX idx_check_ins_next_reminder_time ON check_ins(next_reminder_time);
CREATE INDEX idx_battery_alerts_user_id ON battery_alerts(user_id);
CREATE INDEX idx_battery_alerts_alert_sent ON battery_alerts(alert_sent);

-- Create medical_profiles table
CREATE TABLE medical_profiles (
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

-- Create appointments table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    appointment_type VARCHAR(100),
    doctor_name VARCHAR(255),
    location TEXT,
    appointment_date TIMESTAMP NOT NULL,
    reminder_sent_24h BOOLEAN DEFAULT FALSE,
    reminder_sent_1h BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    mood VARCHAR(20),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    notes TEXT,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create health_vitals table
CREATE TABLE health_vitals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vital_type VARCHAR(50) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20),
    measured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional indexes for new tables
CREATE INDEX idx_medical_profiles_user_id ON medical_profiles(user_id);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_completed ON appointments(completed);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_date ON activities(activity_date);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_health_vitals_user_id ON health_vitals(user_id);
CREATE INDEX idx_health_vitals_type ON health_vitals(vital_type);
CREATE INDEX idx_health_vitals_measured_at ON health_vitals(measured_at);

-- Insert demo data
-- Demo users (passwords are bcrypt hashed for 'demo123')
INSERT INTO users (email, password, name, phone, role, address, medical_info) VALUES
('elder@demo.com', '$2a$10$lwdfanPUyveyssTKyeTZW.jJklOT0FRg8buI.KdB.eUvKxoP32E1G', 'John Elder', '+1234567890', 'elder', '123 Main St, City, State', 'Diabetes, High Blood Pressure'),
('caregiver@demo.com', '$2a$10$0EGil7N2xhlP0AVAU95JkutD5m8u7nSNU5QIrZFdZ/H9ulTBMIAsC', 'Jane Caregiver', '+0987654321', 'caregiver', '456 Oak Ave, City, State', NULL);

-- Link caregiver to elder
INSERT INTO user_caregivers (elder_id, caregiver_id, relationship, is_active) VALUES
(1, 2, 'Daughter', true);

-- Success message
SELECT 'Database schema created successfully!' as message;
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
