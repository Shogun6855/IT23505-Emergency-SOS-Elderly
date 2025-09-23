-- Insert sample users for testing
-- Note: Password is 'password123' hashed with bcrypt
INSERT INTO users (name, email, password, phone, role, address, emergency_contact) VALUES 
('John Elder', 'john.elder@example.com', '$2a$10$rOzJp5xCp9Z5Y5J5Y5J5YOM5Y5J5Y5J5Y5J5Y5J5Y5J5Y5J5Y5J5YO', '+1234567890', 'elder', '123 Main St, Anytown, USA', 'Emergency Contact: +1987654321'),
('Mary Caregiver', 'mary.caregiver@example.com', '$2a$10$rOzJp5xCp9Z5Y5J5Y5J5YOM5Y5J5Y5J5Y5J5Y5J5Y5J5Y5J5Y5J5YO', '+1987654321', 'caregiver', '456 Oak Ave, Anytown, USA', 'Emergency Contact: +1234567890'),
('Robert Smith', 'robert.smith@example.com', '$2a$10$rOzJp5xCp9Z5Y5J5Y5J5YOM5Y5J5Y5J5Y5J5Y5J5Y5J5Y5J5Y5J5YO', '+1555666777', 'elder', '789 Pine St, Anytown, USA', 'Emergency Contact: +1444555666'),
('Sarah Johnson', 'sarah.johnson@example.com', '$2a$10$rOzJp5xCp9Z5Y5J5Y5J5YOM5Y5J5Y5J5Y5J5Y5J5Y5J5Y5J5Y5J5YO', '+1444555666', 'caregiver', '321 Elm St, Anytown, USA', 'Emergency Contact: +1555666777');

-- Create sample caregiver relationships
-- Note: This assumes the UUIDs will be generated, so we'll use email-based lookup
INSERT INTO user_caregivers (elder_id, caregiver_id, relationship, is_active, created_at)
SELECT 
    (SELECT id FROM users WHERE email = 'john.elder@example.com'),
    (SELECT id FROM users WHERE email = 'mary.caregiver@example.com'),
    'Family Member',
    true,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'john.elder@example.com') 
  AND EXISTS (SELECT 1 FROM users WHERE email = 'mary.caregiver@example.com');

INSERT INTO user_caregivers (elder_id, caregiver_id, relationship, is_active, created_at)
SELECT 
    (SELECT id FROM users WHERE email = 'robert.smith@example.com'),
    (SELECT id FROM users WHERE email = 'sarah.johnson@example.com'),
    'Healthcare Provider',
    true,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'robert.smith@example.com') 
  AND EXISTS (SELECT 1 FROM users WHERE email = 'sarah.johnson@example.com');

-- Cross-relationship for testing
INSERT INTO user_caregivers (elder_id, caregiver_id, relationship, is_active, created_at)
SELECT 
    (SELECT id FROM users WHERE email = 'robert.smith@example.com'),
    (SELECT id FROM users WHERE email = 'mary.caregiver@example.com'),
    'Friend',
    true,
    CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'robert.smith@example.com') 
  AND EXISTS (SELECT 1 FROM users WHERE email = 'mary.caregiver@example.com');