-- Table to store PDF highlights
CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resource_id)
);

-- Add indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_highlights_resource_id ON highlights(resource_id);

-- Enable RLS (Row Level Security)
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Public highlights access"
  ON highlights
  FOR ALL
  USING (true);

COMMENT ON TABLE highlights IS 'Stores highlights for PDF documents with JSON structure'; 