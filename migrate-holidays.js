import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://fgvzzeaygassjvicxgli.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_KEY not found in environment variables');
  console.log('Please add SUPABASE_KEY to your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateHolidays() {
  try {
    console.log('📖 Reading holidays.json...');

    // Read holidays.json
    const holidaysPath = join(__dirname, 'public', 'holidays.json');
    const holidaysData = JSON.parse(readFileSync(holidaysPath, 'utf-8'));

    console.log(`✅ Found ${holidaysData.holidays.length} holidays for ${holidaysData.state} ${holidaysData.year}`);
    console.log(`Last updated: ${holidaysData.lastUpdated}`);

    // Prepare data for Supabase
    const holidaysToInsert = holidaysData.holidays.map(holiday => ({
      date: holiday.date,
      name: holiday.name,
      state: holidaysData.state,
      year: holidaysData.year
    }));

    console.log('\n🗑️  Clearing old data for this state and year...');

    // Delete existing holidays for this state and year
    const { error: deleteError } = await supabase
      .from('holidays')
      .delete()
      .eq('state', holidaysData.state)
      .eq('year', holidaysData.year);

    if (deleteError) {
      console.error('❌ Error deleting old data:', deleteError);
      throw deleteError;
    }

    console.log('✅ Old data cleared');
    console.log('\n📤 Inserting holidays to Supabase...');

    // Insert new holidays
    const { data, error } = await supabase
      .from('holidays')
      .insert(holidaysToInsert)
      .select();

    if (error) {
      console.error('❌ Error inserting data:', error);
      throw error;
    }

    console.log(`✅ Successfully inserted ${data.length} holidays to Supabase!`);
    console.log('\n📊 Sample inserted data:');
    console.log(data.slice(0, 3));

    console.log('\n✨ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateHolidays();
