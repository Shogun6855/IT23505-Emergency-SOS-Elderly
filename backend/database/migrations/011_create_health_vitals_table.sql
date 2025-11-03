-- Create health_vitals table
CREATE TABLE IF NOT EXISTS health_vitals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vital_type VARCHAR(50) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20),
    measured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_vitals_user_id ON health_vitals(user_id);
CREATE INDEX idx_health_vitals_type ON health_vitals(vital_type);
CREATE INDEX idx_health_vitals_measured_at ON health_vitals(measured_at);

