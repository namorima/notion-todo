-- =====================================================
-- Supabase Schema for Holidays Table
-- =====================================================
-- Project: Notion Manager Calendar
-- Purpose: Store Malaysian public holidays by state
-- =====================================================

-- Create holiday table (singular)
CREATE TABLE IF NOT EXISTS holiday (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_holiday_year_state ON holiday(year, state);
CREATE INDEX IF NOT EXISTS idx_holiday_date ON holiday(date);

-- Add comments for documentation
COMMENT ON TABLE holiday IS 'Malaysian public holidays by state and year';
COMMENT ON COLUMN holiday.id IS 'Auto-increment primary key';
COMMENT ON COLUMN holiday.date IS 'Holiday date (YYYY-MM-DD format)';
COMMENT ON COLUMN holiday.name IS 'Holiday name in Bahasa Malaysia';
COMMENT ON COLUMN holiday.state IS 'Malaysian state name (e.g., Kelantan, Selangor)';
COMMENT ON COLUMN holiday.year IS 'Year of the holiday';
COMMENT ON COLUMN holiday.created_at IS 'Timestamp when record was created';

-- Enable Row Level Security
ALTER TABLE holiday ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
-- This is safe because holidays are public information
DROP POLICY IF EXISTS "Allow public read access" ON holiday;
CREATE POLICY "Allow public read access" ON holiday
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated insert/update (for migration script)
-- Note: This uses service_role key, not anon key
DROP POLICY IF EXISTS "Allow authenticated write access" ON holiday;
CREATE POLICY "Allow authenticated write access" ON holiday
  FOR ALL
  USING (auth.role() = 'authenticated');

-- =====================================================
-- Sample Data (Kelantan 2025)
-- =====================================================
-- Uncomment below to insert sample data
-- Or use the migrate-holidays.js script instead

/*
INSERT INTO holiday (date, name, state, year) VALUES
  ('2025-01-01', 'Tahun Baru', 'Kelantan', 2025),
  ('2025-01-25', 'Thaipusam', 'Kelantan', 2025),
  ('2025-01-29', 'Tahun Baru Cina', 'Kelantan', 2025),
  ('2025-01-30', 'Tahun Baru Cina (Hari Kedua)', 'Kelantan', 2025),
  ('2025-02-01', 'Hari Kebangsaan Persekutuan', 'Kelantan', 2025),
  ('2025-03-11', 'Hari Keputeraan Sultan Kelantan', 'Kelantan', 2025),
  ('2025-03-29', 'Awal Ramadan', 'Kelantan', 2025),
  ('2025-03-31', 'Hari Raya Aidilfitri', 'Kelantan', 2025),
  ('2025-04-01', 'Hari Raya Aidilfitri (Hari Kedua)', 'Kelantan', 2025),
  ('2025-05-01', 'Hari Pekerja', 'Kelantan', 2025),
  ('2025-05-12', 'Hari Wesak', 'Kelantan', 2025),
  ('2025-06-02', 'Hari Keputeraan Rasmi DYMM SPB Yang di-Pertuan Agong', 'Kelantan', 2025),
  ('2025-06-07', 'Hari Raya Aidiladha', 'Kelantan', 2025),
  ('2025-06-28', 'Awal Muharram', 'Kelantan', 2025),
  ('2025-08-31', 'Hari Kebangsaan', 'Kelantan', 2025),
  ('2025-09-05', 'Maulidur Rasul', 'Kelantan', 2025),
  ('2025-09-16', 'Hari Malaysia', 'Kelantan', 2025),
  ('2025-09-29', 'Keputeraan Sultan Kelantan', 'Kelantan', 2025),
  ('2025-09-30', 'Keputeraan Sultan Kelantan', 'Kelantan', 2025),
  ('2025-10-20', 'Deepavali', 'Kelantan', 2025),
  ('2025-11-11', 'Hari Keputeraan Sultan Kelantan (Cuti Gantian)', 'Kelantan', 2025),
  ('2025-12-25', 'Hari Krismas', 'Kelantan', 2025)
ON CONFLICT DO NOTHING;
*/

-- =====================================================
-- Useful Queries
-- =====================================================

-- Get all holidays for current year and state
-- SELECT * FROM holiday
-- WHERE year = EXTRACT(YEAR FROM NOW())
--   AND state = 'Kelantan'
-- ORDER BY date ASC;

-- Count holidays by state and year
-- SELECT state, year, COUNT(*) as total_holidays
-- FROM holiday
-- GROUP BY state, year
-- ORDER BY year DESC, state;

-- Find holidays in a date range
-- SELECT * FROM holiday
-- WHERE date BETWEEN '2025-01-01' AND '2025-12-31'
--   AND state = 'Kelantan'
-- ORDER BY date;

-- =====================================================
-- Maintenance Queries
-- =====================================================

-- Delete holidays for a specific year (use with caution!)
-- DELETE FROM holiday WHERE year = 2024;

-- Delete holidays for a specific state and year
-- DELETE FROM holiday WHERE state = 'Kelantan' AND year = 2025;

-- Update state name (if needed)
-- UPDATE holiday SET state = 'Kelantan' WHERE state = 'kelantan';

-- =====================================================
-- End of Schema
-- =====================================================
