import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = 'https://fgvzzeaygassjvicxgli.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

console.log('🔐 Supabase URL:', supabaseUrl);
console.log('🔑 API Key (first 20 chars):', supabaseKey?.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyConnection() {
  console.log('\n🔍 Testing Supabase connection...\n');

  // Test basic query
  console.log('1️⃣ Testing SELECT query on "holidays" table...');
  const { data, error, count } = await supabase
    .from('holidays')
    .select('*', { count: 'exact' });

  if (error) {
    console.log('❌ Error:', error);
    console.log('\n💡 Possible issues:');
    console.log('   - Table "holidays" might not exist');
    console.log('   - Row Level Security might be blocking access');
    console.log('   - API key might not have permission');
    return;
  }

  console.log('✅ Connection successful!');
  console.log('📊 Total rows:', count);
  console.log('📝 Data:', data);

  if (data && data.length > 0) {
    console.log('\n📋 Table structure (from first row):');
    console.log(Object.keys(data[0]));
  }

  // Test INSERT permission
  console.log('\n2️⃣ Testing INSERT permission...');
  const testData = {
    date: '2099-12-31',
    name: 'Test Holiday',
    state: 'Test',
    year: 2099
  };

  const { data: inserted, error: insertError } = await supabase
    .from('holidays')
    .insert([testData])
    .select();

  if (insertError) {
    console.log('❌ Insert failed:', insertError.message);
    console.log('\n💡 This might be due to:');
    console.log('   - Row Level Security policy blocking INSERT');
    console.log('   - API key is "anon" key (read-only)');
    console.log('   - Need to use "service_role" key for INSERT');
  } else {
    console.log('✅ Insert successful!');
    console.log('📝 Inserted data:', inserted);

    // Clean up test data
    console.log('\n3️⃣ Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('holidays')
      .delete()
      .eq('year', 2099);

    if (deleteError) {
      console.log('⚠️  Could not delete test data:', deleteError.message);
    } else {
      console.log('✅ Test data deleted');
    }
  }

  console.log('\n✨ Verification complete!');
}

verifyConnection();
