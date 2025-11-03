-- Create battery_alerts table for low battery notifications
CREATE TABLE IF NOT EXISTS battery_alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    battery_level INTEGER NOT NULL,
    device_info TEXT,
    alert_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_battery_alerts_user_id ON battery_alerts(user_id);
CREATE INDEX idx_battery_alerts_alert_sent ON battery_alerts(alert_sent);

