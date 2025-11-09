-- =====================================================
-- Create Holiday Table - Fixed Version
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create table first
CREATE TABLE IF NOT EXISTS holidays (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_holidays_year_state ON holidays(year, state);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);

-- Step 3: Add comments
COMMENT ON TABLE holidays IS 'Malaysian public holidays by state and year';
COMMENT ON COLUMN holidays.id IS 'Auto-increment primary key';
COMMENT ON COLUMN holidays.date IS 'Holiday date (YYYY-MM-DD format)';
COMMENT ON COLUMN holidays.name IS 'Holiday name in Bahasa Malaysia';
COMMENT ON COLUMN holidays.state IS 'Malaysian state name (e.g., Kelantan, Selangor)';
COMMENT ON COLUMN holidays.year IS 'Year of the holiday';
COMMENT ON COLUMN holidays.created_at IS 'Timestamp when record was created';

-- Step 4: Enable Row Level Security
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access" ON holidays;
DROP POLICY IF EXISTS "Allow public write access" ON holidays;

-- Step 6: Create policies
-- Allow everyone to read holidays (public information)
CREATE POLICY "Allow public read access" ON holidays
  FOR SELECT
  USING (true);

-- Allow everyone to insert/update/delete (for migration and updates)
-- Note: In production, you might want to restrict this
CREATE POLICY "Allow public write access" ON holidays
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Success message
SELECT 'Table "holidays" created successfully!' as status;
