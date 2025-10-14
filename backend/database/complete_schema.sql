-- Emergency SOS System - Complete Database Schema
-- Drop existing tables if they exist (in correct order due to foreign key constraints)
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
