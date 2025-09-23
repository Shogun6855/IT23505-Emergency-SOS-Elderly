-- Create Emergencies table
CREATE TABLE IF NOT EXISTS emergencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    elder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create indexes for emergencies table
CREATE INDEX IF NOT EXISTS idx_emergencies_elder_id ON emergencies(elder_id);
CREATE INDEX IF NOT EXISTS idx_emergencies_status ON emergencies(status);
CREATE INDEX IF NOT EXISTS idx_emergencies_created_at ON emergencies(created_at);
CREATE INDEX IF NOT EXISTS idx_emergencies_resolved_by ON emergencies(resolved_by);