# Supabase Migration Guide - Holidays Data

## 📋 Overview

Migration dari `holidays.json` file ke Supabase database untuk:
- Centralized data management
- Easier updates across environments
- Better scalability
- Real-time data sync capabilities

---

## 🗄️ Step 1: Create Supabase Table

Login ke Supabase Dashboard dan create table `holidays`:

```sql
-- Create holidays table
CREATE TABLE holidays (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_holidays_year_state ON holidays(year, state);
CREATE INDEX idx_holidays_date ON holidays(date);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON holidays
  FOR SELECT
  USING (true);
```

---

## 🔑 Step 2: Get Your Supabase Keys

1. Go to Supabase Dashboard → Project Settings → API
2. Copy **anon/public** key (safe for client-side)
3. Your project URL: `https://fgvzzeaygassjvicxgli.supabase.co`

---

## ⚙️ Step 3: Configure Environment Variables

Add to your `.env` file:

```env
# Supabase Configuration
SUPABASE_KEY=your_supabase_anon_key_here
```

**Important:** Don't commit this key to Git. It's already added to `.env.example` as template.

---

## 📤 Step 4: Run Migration Script

Migrate existing `holidays.json` data to Supabase:

```bash
# Make sure you have SUPABASE_KEY in .env
node migrate-holidays.js
```

**What the script does:**
1. ✅ Reads `public/holidays.json`
2. 🗑️ Clears old data for same state/year (prevents duplicates)
3. 📤 Inserts all holidays to Supabase
4. ✨ Shows success confirmation

**Expected output:**
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
  { id: 1, date: '2025-01-01', name: 'Tahun Baru', state: 'Kelantan', year: 2025 },
  { id: 2, date: '2025-01-25', name: 'Thaipusam', state: 'Kelantan', year: 2025 },
  { id: 3, date: '2025-01-29', name: 'Tahun Baru Cina', state: 'Kelantan', year: 2025 }
]

✨ Migration completed successfully!
```

---

## 🔄 Step 5: Verify Changes

### Test Locally

1. Restart Netlify Dev server:
```bash
npm run dev
```

2. Open app at http://localhost:8888
3. Check Calendar tab
4. Click holiday info button (!) to see holidays loaded from Supabase

### Check Server Logs

You should see in terminal:
```
✅ Loaded 27 holidays for Kelantan 2025 from Supabase
```

Instead of:
```
✅ Loaded 27 holidays for Kelantan 2025
```

---

## 📝 What Changed?

### Files Modified:

1. **`netlify/functions/get-calendar.js`**
   - ❌ Removed: `readFileSync`, `existsSync`, `join` from fs/path
   - ✅ Added: Supabase client initialization
   - ✅ Changed: Fetch holidays from database instead of JSON file

2. **`.env.example`**
   - ✅ Added: `SUPABASE_KEY` configuration

3. **`package.json`**
   - ✅ Added: `@supabase/supabase-js` dependency

### New Files Created:

1. **`migrate-holidays.js`**
   - One-time migration script
   - Can be reused for future holiday updates

2. **`SUPABASE_MIGRATION.md`**
   - This documentation file

---

## 🚀 Deployment to Netlify

When deploying to production:

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add new variable:
   - **Key:** `SUPABASE_KEY`
   - **Value:** Your Supabase anon key
3. Redeploy site

---

## 🔄 Updating Holidays for New Year

### Option 1: Manual Insert via Supabase Dashboard

1. Go to Supabase → Table Editor → holidays
2. Click "Insert" → "Insert row"
3. Fill in: date, name, state, year

### Option 2: Update JSON and Re-run Migration

1. Update `public/holidays.json` with new year data
2. Run `node fetch-holidays.js` (if using scraper)
3. Run `node migrate-holidays.js`

### Option 3: Bulk Insert via SQL

```sql
INSERT INTO holidays (date, name, state, year) VALUES
  ('2026-01-01', 'Tahun Baru', 'Kelantan', 2026),
  ('2026-01-25', 'Thaipusam', 'Kelantan', 2026),
  -- ... more holidays
ON CONFLICT DO NOTHING;
```

---

## 🔧 Troubleshooting

### Error: "SUPABASE_KEY not configured"

**Solution:** Check your `.env` file has `SUPABASE_KEY=...`

### Error: "relation 'holidays' does not exist"

**Solution:** Create the table using SQL in Step 1

### No holidays showing in app

**Checklist:**
1. ✅ Table created in Supabase
2. ✅ Data migrated successfully
3. ✅ `SUPABASE_KEY` set in `.env`
4. ✅ Server restarted after adding env var
5. ✅ Check browser console for errors
6. ✅ Check Netlify function logs

### Migration script fails

**Common issues:**
- Missing `SUPABASE_KEY` in `.env`
- Wrong table name (should be `holidays`)
- Network issues connecting to Supabase
- Insufficient permissions on API key

---

## 🎯 Benefits of Supabase

1. **No file system access needed** - Works perfectly with serverless functions
2. **Real-time updates** - Update holidays without redeploying
3. **Multi-state support** - Easy to add holidays for different states
4. **Scalable** - No performance issues with large datasets
5. **Free tier** - Generous limits for personal projects
6. **Backup & restore** - Built-in database backups

---

## 📊 Database Schema

```
holidays
├── id (BIGSERIAL) - Auto-increment primary key
├── date (DATE) - Holiday date
├── name (TEXT) - Holiday name
├── state (TEXT) - Malaysian state (e.g., "Kelantan")
├── year (INTEGER) - Year of holiday
└── created_at (TIMESTAMP) - Record creation time
```

**Indexes:**
- `idx_holidays_year_state` - Fast filtering by year and state
- `idx_holidays_date` - Fast date lookups

---

## ✅ Verification Checklist

- [ ] Supabase table created
- [ ] `SUPABASE_KEY` added to `.env`
- [ ] Migration script executed successfully
- [ ] Server restarted
- [ ] Holidays visible in app
- [ ] Console logs show "from Supabase"
- [ ] `.env.example` updated for team members

---

## 🔐 Security Notes

- ✅ Using **anon/public** key (safe for client-side)
- ✅ Row Level Security enabled
- ✅ Read-only policy for public access
- ❌ Never commit `.env` file to Git
- ✅ Keys stored in Netlify environment variables

---

## 📞 Support

Jika ada masalah:
1. Check Supabase logs in Dashboard
2. Check Netlify function logs
3. Verify environment variables
4. Test migration script output

---

**Migration completed! 🎉**

Your holidays are now stored in Supabase and fetched dynamically by the Netlify function.
