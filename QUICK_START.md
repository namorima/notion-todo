# 🚀 Quick Start - Migrate Holidays to Supabase

## Step 1: Get Your Supabase API Key

1. Go to: https://supabase.com/dashboard/project/fgvzzeaygassjvicxgli
2. Click **Settings** (gear icon) → **API**
3. Under "Project API keys", copy the **anon/public** key
4. It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Step 2: Add Key to .env File

Open `.env` file and add this line:

```env
SUPABASE_KEY=eyJhbGc...paste_your_key_here
```

Your `.env` should look like:
```env
NOTION_API_KEY=ntn_your_notion_api_key_here
DATABASE_ID=your_todo_database_id_here
CALENDAR_DATABASE_ID=your_calendar_database_id_here
HOLIDAY_STATE=Kelantan
APP_PASSWORD=your_password_here
JWT_SECRET=your_jwt_secret_here
SUPABASE_KEY=eyJhbGc...your_supabase_key_here
```

---

## Step 3: Verify Table Structure

Your table "holiday" should have these columns:
- `id` (int8/bigint) - Primary Key, Auto-increment
- `date` (date) - Holiday date
- `name` (text) - Holiday name
- `state` (text) - State name (e.g., "Kelantan")
- `year` (int4) - Year

If you haven't created the table yet, run this SQL in Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS holiday (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_holiday_year_state ON holiday(year, state);
CREATE INDEX IF NOT EXISTS idx_holiday_date ON holiday(date);

-- Enable Row Level Security
ALTER TABLE holiday ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON holiday
  FOR SELECT
  USING (true);
```

---

## Step 4: Run Migration

```bash
node migrate-holidays.js
```

Expected output:
```
📖 Reading holidays.json...
✅ Found 27 holidays for Kelantan 2025
Last updated: 2025-01-01T00:00:00.000Z

🗑️  Clearing old data for this state and year...
✅ Old data cleared

📤 Inserting holidays to Supabase...
✅ Successfully inserted 27 holidays to Supabase!

📊 Sample inserted data:
[
  {
    id: 1,
    date: '2025-01-01',
    name: 'Tahun Baru',
    state: 'Kelantan',
    year: 2025,
    created_at: '2025-11-09T...'
  },
  ...
]

✨ Migration completed successfully!
```

---

## Step 5: Restart Server

```bash
# Ctrl+C to stop current server
npm run dev
```

Server will restart and load holidays from Supabase.

---

## Step 6: Test

1. Open http://localhost:8888
2. Login
3. Go to Calendar tab
4. Click the **!** (info) button to see holidays
5. Check terminal logs for:
   ```
   ✅ Loaded 27 holidays for Kelantan 2025 from Supabase
   ```

---

## ✅ Verification Checklist

- [ ] `SUPABASE_KEY` added to `.env`
- [ ] Table "holiday" exists in Supabase
- [ ] Migration script ran successfully
- [ ] Server restarted
- [ ] Holidays visible in app
- [ ] Terminal shows "from Supabase" message

---

## 🔧 Troubleshooting

### Error: "SUPABASE_KEY not found"
**Solution:** Check `.env` file has `SUPABASE_KEY=...` (no spaces)

### Error: "relation 'holiday' does not exist"
**Solution:** Run the SQL script in Step 3

### Error: "Failed to fetch holidays"
**Checklist:**
1. Verify API key is correct (copy again from dashboard)
2. Check table name is exactly "holiday" (singular)
3. Verify columns: date, name, state, year exist
4. Check Row Level Security policy allows SELECT

### No holidays showing
**Debug steps:**
1. Check browser console for errors
2. Check Network tab for API calls
3. Verify server logs show "from Supabase"
4. Check Supabase → Table Editor → holiday has data

---

## 🎯 What Happens Next?

After successful migration:
- ✅ App loads holidays from Supabase (not JSON file)
- ✅ You can update holidays via Supabase Dashboard
- ✅ No need to redeploy when adding new holidays
- ✅ Multi-state support ready (add different states to table)

---

## 📝 Adding New Holidays

### Via Supabase Dashboard:
1. Go to Table Editor → holiday
2. Click "Insert" → "Insert row"
3. Fill: date, name, state, year
4. Save

### Via SQL:
```sql
INSERT INTO holiday (date, name, state, year) VALUES
  ('2025-12-26', 'Boxing Day', 'Kelantan', 2025);
```

### Re-run Migration (for new year):
1. Update `public/holidays.json` with new data
2. Run `node migrate-holidays.js`

---

**Ready? Start with Step 1! 🚀**
