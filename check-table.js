import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://fgvzzeaygassjvicxgli.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking available tables...\n');

  // Try to query both table names
  console.log('1️⃣ Checking table "holiday" (singular)...');
  const { data: singular, error: errorSingular } = await supabase
    .from('holiday')
    .select('*')
    .limit(1);

  if (errorSingular) {
    console.log('❌ Table "holiday" not found');
    console.log('   Error:', errorSingular.message);
  } else {
    console.log('✅ Table "holiday" exists!');
    console.log('   Sample data:', singular);
  }

  console.log('\n2️⃣ Checking table "holidays" (plural)...');
  const { data: plural, error: errorPlural } = await supabase
    .from('holidays')
    .select('*')
    .limit(1);

  if (errorPlural) {
    console.log('❌ Table "holidays" not found');
    console.log('   Error:', errorPlural.message);
  } else {
    console.log('✅ Table "holidays" exists!');
    console.log('   Sample data:', plural);
  }

  console.log('\n📋 Summary:');
  if (!errorSingular) {
    console.log('✅ Use table name: "holiday"');
  } else if (!errorPlural) {
    console.log('✅ Use table name: "holidays"');
  } else {
    console.log('❌ No holiday table found. Please create one using the SQL schema.');
    console.log('\n💡 Next step: Go to Supabase SQL Editor and run:');
    console.log('   See supabase-schema.sql for the CREATE TABLE statement');
  }
}

checkTables();
