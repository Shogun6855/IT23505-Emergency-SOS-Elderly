-- Create User Caregivers relationship table
CREATE TABLE IF NOT EXISTS user_caregivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    caregiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(elder_id, caregiver_id)
);

-- Create indexes for user_caregivers table
CREATE INDEX IF NOT EXISTS idx_user_caregivers_elder_id ON user_caregivers(elder_id);
CREATE INDEX IF NOT EXISTS idx_user_caregivers_caregiver_id ON user_caregivers(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_user_caregivers_is_active ON user_caregivers(is_active);