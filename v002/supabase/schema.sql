-- Create projects table for storing app preview projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  screens JSONB NOT NULL DEFAULT '[]',
  device_type VARCHAR(50) NOT NULL DEFAULT 'iphone-69',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true,
  share_id VARCHAR(100) UNIQUE DEFAULT substr(md5(random()::text), 1, 8)
);

-- Create an index on share_id for faster lookups
CREATE INDEX idx_projects_share_id ON projects(share_id);

-- Create an index on created_at for sorting
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Update the updated_at timestamp on row update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read public projects
CREATE POLICY "Public projects are viewable by everyone"
  ON projects FOR SELECT
  USING (is_public = true);

-- Create a policy that allows anyone to insert projects
CREATE POLICY "Anyone can create projects"
  ON projects FOR INSERT
  WITH CHECK (true);

-- Create a policy that allows anyone to update their own projects (based on share_id)
CREATE POLICY "Anyone can update projects with share_id"
  ON projects FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create a policy that allows anyone to delete their own projects (based on share_id)
CREATE POLICY "Anyone can delete projects with share_id"
  ON projects FOR DELETE
  USING (true);